(function () {
  "use strict";

  const SYNC_CREDS_KEY = "atlas_physio_sync_creds_v1";
  const GIST_FILENAME = "atlas-physio-state.json";

  let creds = loadCreds();
  let callbacks = {
    getState: null,
    applyMergedState: null,
    showToast: null
  };
  let pushTimer = null;
  let isSyncing = false;
  let pendingPush = false;
  let lastSyncAt = 0;
  let listenersBound = false;
  const AUTO_PULL_MIN_GAP_MS = 5000;
  const AUTO_PULL_INTERVAL_MS = 60000;

  function loadCreds() {
    try {
      const raw = localStorage.getItem(SYNC_CREDS_KEY);
      if (!raw) return { token: "", gistId: "" };
      const parsed = JSON.parse(raw);
      return { token: String(parsed.token || "").trim(), gistId: String(parsed.gistId || "").trim() };
    } catch (e) {
      return { token: "", gistId: "" };
    }
  }

  function saveCreds() {
    try {
      localStorage.setItem(SYNC_CREDS_KEY, JSON.stringify(creds));
    } catch (e) {
      // ignore storage errors
    }
  }

  function hasCreds() {
    return Boolean(creds.token);
  }

  function setStatus(stateKind, text) {
    const btn = document.getElementById("syncStatusBtn");
    const modalText = document.getElementById("syncModalStatusText");
    if (btn) {
      btn.textContent = text;
      btn.className = "pill " + (stateKind === "ok" ? "green" : stateKind === "busy" ? "yellow" : "accent");
    }
    if (modalText) {
      modalText.textContent = text;
    }
  }

  function mergeStates(local, remote) {
    if (!remote || typeof remote !== "object") return local;
    const merged = Object.assign({}, local);

    merged.currentStageId = Math.max(Number(local.currentStageId) || 1, Number(remote.currentStageId) || 1);

    // Prefer whichever payload was modified more recently for UI settings
    const localTs = Number(local.updatedAt) || 0;
    const remoteTs = Number(remote.updatedAt) || 0;
    if (remoteTs > localTs) {
      merged.mode = remote.mode || local.mode;
      merged.snackIndex = typeof remote.snackIndex === "number" ? remote.snackIndex : local.snackIndex;
      merged.restSec = Number(remote.restSec) || local.restSec || 25;
      merged.updatedAt = remoteTs;
    }

    // Union testChecks
    const tc = Object.assign({}, remote.testChecks || {});
    for (const stId of Object.keys(local.testChecks || {})) {
      tc[stId] = Object.assign({}, tc[stId] || {}, local.testChecks[stId] || {});
    }
    merged.testChecks = tc;

    // Union doneByDate
    const dbd = Object.assign({}, remote.doneByDate || {});
    for (const day of Object.keys(local.doneByDate || {})) {
      dbd[day] = Object.assign({}, dbd[day] || {}, local.doneByDate[day] || {});
    }
    merged.doneByDate = dbd;

    // Deduplicated union of logs by entry id or signature
    const seen = new Set();
    const combined = [];
    const pushLog = (entry) => {
      if (!entry || typeof entry !== "object") return;
      const sig = entry.id || `${entry.date}|${entry.session}|${entry.mode}|${entry.notes || ""}`;
      if (seen.has(sig)) return;
      seen.add(sig);
      combined.push(entry);
    };
    (local.logs || []).forEach(pushLog);
    (remote.logs || []).forEach(pushLog);
    combined.sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
    merged.logs = combined;

    return merged;
  }

  async function apiFetch(url, options) {
    const res = await fetch(url, Object.assign({}, options, {
      headers: Object.assign({
        "Accept": "application/vnd.github+json",
        "Authorization": "Bearer " + creds.token,
        "Content-Type": "application/json"
      }, (options && options.headers) || {})
    }));
    if (!res.ok) {
      const errText = await res.text().catch(() => String(res.status));
      throw new Error("GitHub API " + res.status + ": " + errText.slice(0, 120));
    }
    return res.json();
  }

  async function findExistingGist() {
    const list = await apiFetch("https://api.github.com/gists?per_page=30", { method: "GET" });
    const match = list.find((g) => g.files && g.files[GIST_FILENAME]);
    return match ? match.id : "";
  }

  async function syncNow(silent) {
    if (!hasCreds() || isSyncing || !callbacks.getState) return;
    isSyncing = true;
    setStatus("busy", "☁️ מסנכרן...");

    try {
      if (!creds.gistId) {
        creds.gistId = await findExistingGist();
        saveCreds();
      }

      const localState = callbacks.getState();

      if (!creds.gistId) {
        // Create new private Gist storing current local state
        const created = await apiFetch("https://api.github.com/gists", {
          method: "POST",
          body: JSON.stringify({
            description: "Atlas-Physio Phone & PC Sync Data",
            public: false,
            files: {
              [GIST_FILENAME]: { content: JSON.stringify(localState, null, 2) }
            }
          })
        });
        creds.gistId = created.id;
        saveCreds();
        lastSyncAt = Date.now();
        setStatus("ok", "☁️ מסונכרן (חדש נוצר)");
        refreshModalUI();
        if (!silent && callbacks.showToast) callbacks.showToast("☁️ נוצר סנכרון ענן פרטי בהצלחה!");
        return;
      }

      const gist = await apiFetch("https://api.github.com/gists/" + creds.gistId, { method: "GET" });
      const fileObj = gist.files && gist.files[GIST_FILENAME];
      let remoteState = null;
      if (fileObj && fileObj.content) {
        remoteState = JSON.parse(fileObj.content);
      }

      const localStr = JSON.stringify(localState, null, 2);
      const merged = mergeStates(localState, remoteState);
      const mergedStr = JSON.stringify(merged, null, 2);
      if (mergedStr !== localStr && callbacks.applyMergedState) {
        callbacks.applyMergedState(merged);
      }

      // Push merged state back if different from remote
      const remoteStr = remoteState ? JSON.stringify(remoteState, null, 2) : "";
      if (mergedStr !== remoteStr) {
        await apiFetch("https://api.github.com/gists/" + creds.gistId, {
          method: "PATCH",
          body: JSON.stringify({
            files: { [GIST_FILENAME]: { content: mergedStr } }
          })
        });
      }

      lastSyncAt = Date.now();
      const timeStr = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      setStatus("ok", "☁️ מסונכרן (" + timeStr + ")");
      refreshModalUI();
      if (!silent && callbacks.showToast) callbacks.showToast("☁️ הנתונים מסונכרנים בין הטלפון למחשב!");
    } catch (err) {
      setStatus("err", "☁️ שגיאת סנכרון");
      if (!silent && callbacks.showToast) callbacks.showToast("❌ שגיאת סנכרון: בדוק טוקן או חיבור אינטרנט");
    } finally {
      isSyncing = false;
      if (pendingPush && hasCreds()) {
        pendingPush = false;
        schedulePush();
      }
    }
  }

  function schedulePush() {
    if (!hasCreds()) return;
    if (isSyncing) {
      pendingPush = true;
      return;
    }
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      syncNow(true);
    }, 1200);
  }

  function autoPull() {
    if (!hasCreds() || isSyncing || document.hidden) return;
    if (Date.now() - lastSyncAt < AUTO_PULL_MIN_GAP_MS) return;
    syncNow(true);
  }

  function checkPairingHash() {
    const hash = window.location.hash || "";
    if (!hash.startsWith("#sync=")) return false;
    try {
      const encoded = hash.slice(6);
      const jsonStr = decodeURIComponent(escape(atob(encoded)));
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.token) {
        creds = { token: String(parsed.token).trim(), gistId: String(parsed.gistId || "").trim() };
        saveCreds();
        // Immediately scrub secret token from browser URL bar & history
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
          window.location.hash = "";
        }
        return true;
      }
    } catch (e) {
      // ignore malformed hash
    }
    return false;
  }

  function buildPairingUrl() {
    if (!creds.token) return "";
    const payload = btoa(unescape(encodeURIComponent(JSON.stringify(creds))));
    const base = window.location.origin + window.location.pathname;
    return base + "#sync=" + payload;
  }

  function refreshModalUI() {
    const tokenIn = document.getElementById("syncTokenInput");
    const gistIn = document.getElementById("syncGistIdInput");
    const pairBox = document.getElementById("syncPairingLinkBox");
    const pairOut = document.getElementById("syncPairingUrlOutput");

    if (tokenIn && creds.token && !tokenIn.value) tokenIn.value = creds.token;
    if (gistIn) gistIn.value = creds.gistId || "";

    if (pairBox && pairOut) {
      if (creds.token && creds.gistId) {
        pairBox.style.display = "block";
        pairOut.value = buildPairingUrl();
      } else {
        pairBox.style.display = "none";
      }
    }
  }

  function init(opts) {
    callbacks = Object.assign(callbacks, opts || {});
    const pairedFromUrl = checkPairingHash();

    const btn = document.getElementById("syncStatusBtn");
    const modal = document.getElementById("syncModal");
    const closeBtn = document.getElementById("syncCloseBtn");
    const connectBtn = document.getElementById("syncConnectBtn");
    const nowBtn = document.getElementById("syncNowBtn");
    const discBtn = document.getElementById("syncDisconnectBtn");
    const copyBtn = document.getElementById("syncCopyPairBtn");

    if (btn && modal) {
      btn.addEventListener("click", () => {
        refreshModalUI();
        modal.classList.add("open");
      });
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => modal.classList.remove("open"));
    }
    if (connectBtn) {
      connectBtn.addEventListener("click", () => {
        const tok = (document.getElementById("syncTokenInput").value || "").trim();
        const gid = (document.getElementById("syncGistIdInput").value || "").trim();
        if (!tok) {
          if (callbacks.showToast) callbacks.showToast("⚠️ הדבק GitHub Token עם הרשאת gist");
          return;
        }
        creds = { token: tok, gistId: gid };
        saveCreds();
        syncNow(false);
      });
    }
    if (nowBtn) {
      nowBtn.addEventListener("click", () => syncNow(false));
    }
    if (discBtn) {
      discBtn.addEventListener("click", () => {
        creds = { token: "", gistId: "" };
        saveCreds();
        document.getElementById("syncTokenInput").value = "";
        document.getElementById("syncGistIdInput").value = "";
        refreshModalUI();
        setStatus("off", "☁️ חיבור לסלולרי");
        if (callbacks.showToast) callbacks.showToast("סנכרון הענן נותק ממכשיר זה");
      });
    }
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const val = document.getElementById("syncPairingUrlOutput").value;
        if (navigator.clipboard && val) {
          navigator.clipboard.writeText(val).then(() => {
            if (callbacks.showToast) callbacks.showToast("📋 קישור הצימוד לסלולרי הועתק! שלח אותו לעצמך בוואטסאפ");
          });
        }
      });
    }

    if (hasCreds()) {
      setStatus("ok", "☁️ מחובר");
      syncNow(!pairedFromUrl);
    } else {
      setStatus("off", "☁️ סנכרון טלפון-מחשב");
    }

    if (!listenersBound) {
      listenersBound = true;
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) autoPull();
      });
      window.addEventListener("focus", autoPull);
      window.addEventListener("online", () => {
        if (hasCreds()) syncNow(true);
      });
      setInterval(autoPull, AUTO_PULL_INTERVAL_MS);
    }
  }

  window.AtlasSync = {
    init,
    schedulePush,
    syncNow,
    mergeStates
  };
})();
