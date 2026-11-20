(function () {
  "use strict";

  const DATA = window.ATLAS_STAGES_DATA;
  if (!DATA || !Array.isArray(DATA.stages)) {
    document.body.innerHTML = "<div style='padding:40px;color:#fff;'>שגיאה בטעינת קובץ הנתונים stages-data.js</div>";
    return;
  }

  const Animator = window.AtlasAnimator;
  const Music = window.AtlasMusic;
  const Sync = window.AtlasSync;

  const STORAGE_KEY = "atlas_physio_state_v2";
  const LEGACY_KEY = "atlas_physio_state_v1";

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function makeEntryId() {
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  const defaultState = {
    currentStageId: 1,
    mode: "mode30",
    snackIndex: 0,
    restSec: 25,
    updatedAt: 0,
    testChecks: {},
    doneByDate: {},
    logs: []
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
      if (!raw) return Object.assign({}, defaultState);
      const parsed = JSON.parse(raw);
      return Object.assign({}, defaultState, parsed);
    } catch (e) {
      return Object.assign({}, defaultState);
    }
  }

  let state = loadState();
  function saveState(skipSyncPush) {
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore storage quota errors
    }
    if (!skipSyncPush && Sync) {
      Sync.schedulePush();
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(msg) {
    const el = document.getElementById("toastEl");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.classList.remove("show"), 2700);
  }

  function getCurrentStage() {
    return DATA.stages.find((s) => s.id === Number(state.currentStageId)) || DATA.stages[0];
  }

  function getTodayMap() {
    const d = todayISO();
    if (!state.doneByDate[d]) state.doneByDate[d] = {};
    return state.doneByDate[d];
  }

  function isDoneToday(key) {
    return Boolean(getTodayMap()[key]);
  }

  function toggleDoneToday(key, forceVal) {
    const map = getTodayMap();
    const next = typeof forceVal === "boolean" ? forceVal : !map[key];
    if (next) map[key] = true;
    else delete map[key];
    saveState();
  }

  function countTodayChecked() {
    return Object.keys(getTodayMap()).length;
  }

  function playBeep(times) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const count = times || 2;
      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = i % 2 === 0 ? 587.33 : 783.99;
        gain.gain.setValueAtTime(0.11, ctx.currentTime + i * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.16 + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.16);
        osc.stop(ctx.currentTime + i * 0.16 + 0.24);
      }
    } catch (e) {
      // ignore audio context restrictions
    }
  }

  // Populate stage dropdown
  const stageSelect = document.getElementById("stageSelect");
  DATA.stages.forEach((st) => {
    const opt = document.createElement("option");
    opt.value = st.id;
    opt.textContent = st.title;
    stageSelect.appendChild(opt);
  });

  function renderHeader() {
    const st = getCurrentStage();
    stageSelect.value = st.id;
    const stagePct = Math.round((st.id / DATA.stages.length) * 100);
    document.getElementById("activeStageBadge").textContent = "שלב נוכחי: " + st.id + " / " + DATA.stages.length;
    document.getElementById("stagePctLabel").textContent = stagePct + "%";
    document.getElementById("stageProgressFill").style.width = stagePct + "%";
    document.getElementById("miluimPctLabel").textContent = st.miluimReadinessPct + "%";
    document.getElementById("miluimProgressFill").style.width = st.miluimReadinessPct + "%";
    document.getElementById("totalLogsBadge").textContent = 'סה"כ אימונים: ' + state.logs.length;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const recent = state.logs.filter((l) => {
      const d = new Date(l.date);
      return !isNaN(d.getTime()) && d >= weekAgo;
    }).length;
    const streakEl = document.getElementById("streakBadge");
    if (recent >= 3) {
      streakEl.textContent = "🔥 שבוע חזק! " + recent + " פעילויות ב-7 ימים";
    } else if (recent >= 1) {
      streakEl.textContent = "💪 " + recent + " השבוע (לא מפספסים פעמיים)";
    } else {
      streakEl.textContent = "⚡ סמן אימון בקליק או פתח מצב מאמן";
    }

    const todayLabel = document.getElementById("todayDoneCountLabel");
    if (todayLabel) {
      todayLabel.textContent = "סומנו היום: " + countTodayChecked() + " תרגילים";
    }
  }

  function renderModeButtons() {
    document.querySelectorAll("[data-mode]").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-mode") === state.mode);
    });
  }

  function createExerciseCard(ex, uniqueKey, onSingleCoach) {
    const done = isDoneToday(uniqueKey);
    const card = document.createElement("div");
    card.className = "exercise-card" + (done ? " done-today" : "");

    const thumb = document.createElement("div");
    thumb.className = "anim-thumb";
    thumb.title = "לחץ לפתיחת הדגמה מוגדלת עם המאמן";
    thumb.addEventListener("click", () => onSingleCoach(ex, uniqueKey));

    const body = document.createElement("div");
    body.className = "ex-body";
    body.innerHTML =
      "<div class='ex-top'><span>" + escapeHtml(ex.name) + "</span><span class='ex-dose'>" + escapeHtml(ex.setsReps) + "</span></div>" +
      "<div class='ex-cue'>" + escapeHtml(ex.cue) + "</div>";

    const actions = document.createElement("div");
    actions.className = "ex-actions";

    const doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.className = "btn small done-toggle" + (done ? " checked" : "");
    doneBtn.textContent = done ? "✓ בוצע היום" : "○ סמן בוצע";
    doneBtn.addEventListener("click", () => {
      toggleDoneToday(uniqueKey);
      renderHeader();
      renderBaselinePhysio();
      renderWorkouts();
      if (isDoneToday(uniqueKey)) showToast("✓ סומן בוצע: " + ex.name);
    });

    const zoomBtn = document.createElement("button");
    zoomBtn.type = "button";
    zoomBtn.className = "btn small";
    zoomBtn.textContent = "👁️ הדגמה וטיימר";
    zoomBtn.addEventListener("click", () => onSingleCoach(ex, uniqueKey));

    actions.appendChild(doneBtn);
    actions.appendChild(zoomBtn);
    body.appendChild(actions);

    card.appendChild(thumb);
    card.appendChild(body);

    if (Animator) Animator.mount(thumb, ex.anim || "plank", { compact: true });
    return card;
  }

  function renderBaselinePhysio() {
    const container = document.getElementById("baselinePhysioContainer");
    if (!container) return;
    container.innerHTML = "";
    const baseList = DATA.baselinePhysio || [];
    let doneCount = 0;

    baseList.forEach((ex) => {
      const key = "base:" + ex.id;
      if (isDoneToday(key)) doneCount++;
      container.appendChild(
        createExerciseCard(ex, key, (exercise, k) => {
          openCoachWithQueue([Object.assign({ _key: k }, exercise)], "הדגמת תרגיל בסיס");
        })
      );
    });

    const badge = document.getElementById("baselineProgressBadge");
    if (badge) {
      badge.textContent = doneCount + " / " + baseList.length + " בוצעו היום";
      badge.className = "pill " + (doneCount === baseList.length ? "green" : "accent");
    }
  }

  function renderWorkouts() {
    const st = getCurrentStage();
    document.getElementById("stageTitle").textContent = st.title;
    document.getElementById("stageSubtitle").textContent = st.subtitle;
    document.getElementById("stageDurationPill").textContent = "⏱️ זמן משוער: " + st.estimatedWeeks;
    document.getElementById("stageUnlockPill").textContent = "🏆 יעד כיף: " + st.funUnlock;
    document.getElementById("stageFocus").textContent = st.focus;

    const coreList = document.getElementById("coreIntegrationList");
    coreList.innerHTML = "";
    const ci = st.coreIntegration || {};
    const coreLabels = [
      ["1. סופרמן (בירד-דוג)", ci.birdDog],
      ["2. בטן סטטית (פלאנק)", ci.plank],
      ["3. מיני-קוברה", ci.cobra],
      ["4. דד-באג (Dead Bug)", ci.deadBug],
      ["5. פלאנק צידי (אחד לכל צד)", ci.sideHipRaises],
      ["6. הרמות רגליים בשכיבה (ידיים מתחת לטוסיק)", ci.lyingLegRaises]
    ];
    coreLabels.forEach(([k, v]) => {
      if (!v) return;
      const li = document.createElement("li");
      li.innerHTML = "<strong>" + escapeHtml(k) + ":</strong> " + escapeHtml(v);
      coreList.appendChild(li);
    });

    const container = document.getElementById("workoutsContainer");
    container.innerHTML = "";

    if (state.mode === "mode5") {
      const em = DATA.emergencyMode;
      const div = document.createElement("div");
      div.className = "workout-day";
      div.style.borderColor = "var(--yellow)";

      const head = document.createElement("div");
      head.className = "workout-day-head";
      head.innerHTML = "<h4>⚡ " + escapeHtml(em.title) + "</h4>";
      const coachBtn = document.createElement("button");
      coachBtn.className = "btn small warning";
      coachBtn.textContent = "🎬 אימון חירום מודרך";
      coachBtn.addEventListener("click", () => launchCoachPreset("emergency"));
      head.appendChild(coachBtn);

      const sub = document.createElement("p");
      sub.className = "muted";
      sub.style.marginTop = "0";
      sub.textContent = em.subtitle;

      div.appendChild(head);
      div.appendChild(sub);
      em.exercises.forEach((ex, idx) => {
        const key = "em:" + idx + ":" + ex.name;
        div.appendChild(
          createExerciseCard(ex, key, (exercise, k) => {
            openCoachWithQueue([Object.assign({ _key: k }, exercise)], "מוד חירום 5 דק'");
          })
        );
      });
      container.appendChild(div);
      return;
    }

    const modeKey = state.mode === "mode60" ? "mode60" : "mode30";
    const modeLabel = state.mode === "mode60" ? "+20 דק' לאימון" : "+10 דק' לאימון";

    ["dayA", "dayB", "dayC"].forEach((dayKey) => {
      const day = st.workouts[dayKey];
      const dayBox = document.createElement("div");
      dayBox.className = "workout-day";

      const head = document.createElement("div");
      head.className = "workout-day-head";
      const titleEl = document.createElement("h4");
      titleEl.textContent = day.title;

      const btnGroup = document.createElement("div");
      btnGroup.className = "control-group";

      const pill = document.createElement("span");
      pill.className = "pill accent";
      pill.textContent = modeLabel;

      const locPill = document.createElement("span");
      locPill.className = "pill purple";
      locPill.textContent = day.locationBadge || "🏠 בבית";

      const coachBtn = document.createElement("button");
      coachBtn.type = "button";
      coachBtn.className = "btn small primary";
      coachBtn.textContent = "🎬 מצב מאמן ליום זה";
      coachBtn.addEventListener("click", () => launchCoachPreset(dayKey));

      btnGroup.appendChild(locPill);
      btnGroup.appendChild(pill);
      btnGroup.appendChild(coachBtn);
      head.appendChild(titleEl);
      head.appendChild(btnGroup);
      dayBox.appendChild(head);

      (day[modeKey] || []).forEach((ex, idx) => {
        const key = "st" + st.id + ":" + dayKey + ":" + modeKey + ":" + idx;
        dayBox.appendChild(
          createExerciseCard(ex, key, (exercise, k) => {
            openCoachWithQueue([Object.assign({ _key: k }, exercise)], day.title);
          })
        );
      });

      container.appendChild(dayBox);
    });

    if (Animator) Animator.clearDetached();
  }

  function renderSnack() {
    const snacks = DATA.officeSnacks;
    const idx = Math.abs(state.snackIndex) % snacks.length;
    const sn = snacks[idx];
    document.getElementById("snackTitle").textContent = (idx + 1) + "/" + snacks.length + ": " + sn.title;
    const ol = document.getElementById("snackSteps");
    ol.innerHTML = "";
    sn.steps.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      ol.appendChild(li);
    });
    document.getElementById("snackBenefit").textContent = "למה זה עובד: " + sn.benefit;

    const preview = document.getElementById("snackAnimPreview");
    if (preview && Animator) Animator.mount(preview, sn.anim || "hip_flexor", { compact: false });
  }

  function renderPlacementAndTraffic() {
    const pt = DATA.placementTest;
    document.getElementById("placementTitle").textContent = pt.title;
    document.getElementById("placementDesc").textContent = pt.description;
    const pContainer = document.getElementById("placementRulesContainer");
    pContainer.innerHTML = "";
    pt.rules.forEach((rule, idx) => {
      const card = document.createElement("div");
      card.className = "exercise-card";
      card.style.marginBottom = "10px";

      const thumb = document.createElement("div");
      thumb.className = "anim-thumb";
      if (Animator) Animator.mount(thumb, rule.anim || "plank", { compact: true });

      const body = document.createElement("div");
      body.className = "ex-body";
      body.innerHTML =
        "<div class='ex-top'><span>בדיקה " + (idx + 1) + ": " + escapeHtml(rule.check) + "</span></div>" +
        "<div class='ex-cue' style='color:#fde047;'>המלצה: " + escapeHtml(rule.failAction) + "</div>";

      card.appendChild(thumb);
      card.appendChild(body);
      pContainer.appendChild(card);
    });

    const tContainer = document.getElementById("trafficLightsContainer");
    tContainer.innerHTML = "";
    const tl = DATA.trafficLightRules;
    [["green", "status-green"], ["yellow", "status-yellow"], ["red", "status-red"]].forEach(([key, cls]) => {
      const item = tl[key];
      const div = document.createElement("div");
      div.className = "sym-result " + cls;
      div.style.marginBottom = "10px";
      div.innerHTML = "<div>" + escapeHtml(item.label) + "</div><div style='font-weight:400; margin-top:4px;'>" + escapeHtml(item.action) + "</div>";
      tContainer.appendChild(div);
    });
  }

  function renderLevelUpTest() {
    const st = getCurrentStage();
    document.getElementById("testStageHeading").textContent = "מבחן מעבר שלב " + st.id + " → " + Math.min(10, st.id + 1);
    document.getElementById("symLimitDisplay").textContent = st.symmetryLimitPct + "%";

    const list = document.getElementById("levelUpChecklist");
    list.innerHTML = "";
    const savedMap = state.testChecks[st.id] || {};

    st.levelUpTest.forEach((itemText, i) => {
      const label = document.createElement("label");
      label.className = "check-row";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = Boolean(savedMap[i]);
      cb.addEventListener("change", () => {
        if (!state.testChecks[st.id]) state.testChecks[st.id] = {};
        state.testChecks[st.id][i] = cb.checked;
        saveState();
      });
      const span = document.createElement("span");
      span.textContent = itemText;
      label.appendChild(cb);
      label.appendChild(span);
      list.appendChild(label);
    });

    const pain24h = document.getElementById("test24hPainCheck");
    pain24h.checked = Boolean(savedMap["pain24h"]);
    pain24h.onchange = () => {
      if (!state.testChecks[st.id]) state.testChecks[st.id] = {};
      state.testChecks[st.id]["pain24h"] = pain24h.checked;
      saveState();
    };

    const hint = document.getElementById("graduateHint");
    hint.textContent = st.id === 10 ? "זהו שלב הגמר! סיום מוצלח מעניק תעודת מאסטר 'אטלס גב-ברזל'." : "";
    updateSymmetry();
  }

  function updateSymmetry() {
    const st = getCurrentStage();
    const r = parseFloat(document.getElementById("symRightInput").value) || 0;
    const l = parseFloat(document.getElementById("symLeftInput").value) || 0;
    const box = document.getElementById("symResultBox");
    if (r <= 0 || l <= 0) {
      box.className = "sym-result status-yellow";
      box.textContent = "הזן מספרים חיוביים משני הצדדים.";
      return false;
    }
    const maxVal = Math.max(r, l);
    const diffPct = ((maxVal - Math.min(r, l)) / maxVal) * 100;
    const rounded = diffPct.toFixed(1);
    if (diffPct <= st.symmetryLimitPct) {
      box.className = "sym-result status-green";
      box.textContent = "פער נוכחי: " + rounded + "% (מותר עד " + st.symmetryLimitPct + "%) — מאוזן ועובר!";
      return true;
    } else {
      box.className = "sym-result status-red";
      const weaker = r < l ? "ימין" : "שמאל";
      box.textContent = "פער נוכחי: " + rounded + "% (חורג מהמותר " + st.symmetryLimitPct + "%). תעדף תמיד להתחיל מצד " + weaker + "!";
      return false;
    }
  }

  function renderStatsAndLogs() {
    const physioCount = state.logs.filter((l) => (l.mode || "").includes("פיזיו") || (l.session || "").includes("פיזיו")).length;
    const swimCount = state.logs.filter((l) => (l.mode || "").includes("שחייה") || (l.session || "").includes("שחייה")).length;
    const stageCount = state.logs.filter((l) => ["A", "B", "C", "מבחן שלב"].includes(l.session) || (l.mode || "").includes("+")).length;
    const exTotal = state.logs.reduce((acc, l) => acc + (Array.isArray(l.exercises) ? l.exercises.length : 1), 0);

    document.getElementById("statPhysioCount").textContent = physioCount;
    document.getElementById("statSwimCount").textContent = swimCount;
    document.getElementById("statStageCount").textContent = stageCount;
    document.getElementById("statExercisesCount").textContent = exTotal;

    const tbody = document.getElementById("logsTableBody");
    tbody.innerHTML = "";
    if (!state.logs.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = "<td colspan='9' class='muted' style='text-align:center; padding:18px;'>עדיין אין פעילות מתועדת. לחץ למעלה על 'ביצעתי פיזיו רגיל' או 'ביצעתי שחייה' בקליק אחד!</td>";
      tbody.appendChild(tr);
      return;
    }
    state.logs.slice().reverse().forEach((entry, revIdx) => {
      const origIdx = state.logs.length - 1 - revIdx;
      const tr = document.createElement("tr");
      const nextCls = entry.nextDay === "אדום" ? "color:#fca5a5" : entry.nextDay === "צהוב" ? "color:#fde047" : "color:#86efac";
      const exText = Array.isArray(entry.exercises) && entry.exercises.length
        ? entry.exercises.join(", ")
        : (entry.notes || "-");
      tr.innerHTML =
        "<td>" + escapeHtml(entry.date) + "</td>" +
        "<td>" + escapeHtml(String(entry.stage)) + "</td>" +
        "<td>" + escapeHtml(entry.mode) + "</td>" +
        "<td>" + escapeHtml(entry.session) + "</td>" +
        "<td>" + escapeHtml(String(entry.pain)) + "/10</td>" +
        "<td style='font-weight:700;" + nextCls + "'>" + escapeHtml(entry.nextDay) + "</td>" +
        "<td>" + escapeHtml(String(entry.energy)) + "/5</td>" +
        "<td style='max-width:260px;'>" + escapeHtml(exText) + "</td>" +
        "<td><button class='btn small danger-outline' data-del-idx='" + origIdx + "'>מחק</button></td>";
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("[data-del-idx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-del-idx"));
        state.logs.splice(idx, 1);
        saveState();
        renderHeader();
        renderStatsAndLogs();
      });
    });
  }

  // 1-Click Quick Log Actions
  function logClassicPhysio() {
    const baseList = DATA.baselinePhysio || [];
    baseList.forEach((ex) => toggleDoneToday("base:" + ex.id, true));
    state.logs.push({
      id: makeEntryId(),
      date: todayISO(),
      stage: state.currentStageId,
      mode: "פיזיו רגיל",
      session: "שישיית הבסיס",
      pain: 1,
      nextDay: "ירוק",
      energy: 4,
      exercises: baseList.map((e) => e.name),
      notes: "ביצוע שישיית הפיזיותרפיה הרגילה (סופרמן, בטן סטטית, קוברה, דד-באג, פלאנק צידי, הרמת רגליים)"
    });
    saveState();
    renderAll();
    playBeep(2);
    showToast("✅ נרשמו כל 6 תרגילי הפיזיותרפיה הרגילים להיום!");
  }

  function logSwimming() {
    state.logs.push({
      id: makeEntryId(),
      date: todayISO(),
      stage: state.currentStageId,
      mode: "שחייה 30 דק'",
      session: "שחייה חתירה",
      pain: 0,
      nextDay: "ירוק",
      energy: 5,
      exercises: ["שחייה חתירה — 30 דקות"],
      notes: "אימון שחייה שבועי להורדת עומס וחיוניות"
    });
    saveState();
    renderAll();
    playBeep(2);
    showToast("🏊 אימון השחייה נשמר ביומן! כל הכבוד!");
  }

  function logEmergency5() {
    const em = DATA.emergencyMode;
    em.exercises.forEach((ex, idx) => toggleDoneToday("em:" + idx + ":" + ex.name, true));
    state.logs.push({
      id: makeEntryId(),
      date: todayISO(),
      stage: state.currentStageId,
      mode: "חירום 5 דק'",
      session: "חירום 5 דק'",
      pain: 1,
      nextDay: "ירוק",
      energy: 4,
      exercises: em.exercises.map((e) => e.name),
      notes: "מציל רצף: מוד חירום 5 דק' ('לא מפספסים פעמיים')"
    });
    saveState();
    renderAll();
    playBeep(2);
    showToast("⚡ מוד חירום 5 דק' נשמר — הרצף נשמר!");
  }

  function resolveKeyToExerciseName(key) {
    if (key.startsWith("base:")) {
      const id = key.slice(5);
      const found = (DATA.baselinePhysio || []).find((e) => e.id === id);
      return found ? found.name : key;
    }
    if (key.startsWith("em:")) {
      return key.split(":").slice(2).join(":");
    }
    const m = key.match(/^st(\d+):(day[ABC]):(mode\d+):(\d+)$/);
    if (m) {
      const st = DATA.stages.find((s) => s.id === Number(m[1]));
      const list = st && st.workouts[m[2]] && st.workouts[m[2]][m[3]];
      if (list && list[Number(m[4])]) return list[Number(m[4])].name;
    }
    return key;
  }

  function saveTodayCheckedToLog() {
    const map = getTodayMap();
    const keys = Object.keys(map);
    if (!keys.length) {
      showToast("⚠️ סמן קודם לפחות תרגיל אחד ('✓ סמן בוצע')");
      return;
    }
    const names = keys.map(resolveKeyToExerciseName);
    state.logs.push({
      id: makeEntryId(),
      date: todayISO(),
      stage: state.currentStageId,
      mode: state.mode === "mode60" ? "+60 דק'" : state.mode === "mode5" ? "חירום 5 דק'" : "+30 דק'",
      session: "אימון משולב (" + names.length + " תרגילים)",
      pain: Number(document.getElementById("quickPainInput").value) || 1,
      nextDay: "ירוק",
      energy: Number(document.getElementById("quickEnergyInput").value) || 4,
      exercises: names,
      notes: "נשמר מסימון תרגילים יומי"
    });
    saveState();
    renderAll();
    playBeep(2);
    showToast("💾 נשמרו " + names.length + " תרגילים שביצעת ליומן!");
  }

  // Standalone Sidebar Timer
  let timerSeconds = 35;
  let timerInterval = null;
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }
  function updateTimerUI() {
    document.getElementById("timerDisplay").textContent = formatTime(timerSeconds);
  }
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    document.getElementById("timerStartPauseBtn").textContent = "התחל";
  }
  function startTimer() {
    if (timerInterval) return;
    if (timerSeconds <= 0) {
      timerSeconds = Math.max(5, parseInt(document.getElementById("customSecondsInput").value, 10) || 35);
      updateTimerUI();
    }
    document.getElementById("timerStartPauseBtn").textContent = "השהה";
    timerInterval = setInterval(() => {
      timerSeconds -= 1;
      updateTimerUI();
      if (timerSeconds <= 0) {
        stopTimer();
        playBeep(2);
        showToast("⏱️ הסט הסתיים! כל הכבוד!");
      }
    }, 1000);
  }

  // Guided Follow-Along Coach Mode with 3-Phase State Machine:
  // "exercise" -> (auto starts) "rest" -> (stops & waits for manual click) "ready_next"
  let coachQueue = [];
  let coachIndex = 0;
  let coachTitleLabel = "";
  let coachTimerSec = 0;
  let coachTimerHandle = null;
  let coachPhase = "exercise"; // "exercise" | "rest" | "ready_next"

  function stopCoachTimer() {
    if (coachTimerHandle) {
      clearInterval(coachTimerHandle);
      coachTimerHandle = null;
    }
  }

  function updateCoachPhaseUI() {
    const ex = coachQueue[coachIndex];
    const nextEx = coachQueue[coachIndex + 1];
    const isLast = coachIndex >= coachQueue.length - 1;

    const phaseBadge = document.getElementById("coachPhaseBadge");
    const timerBox = document.getElementById("coachTimerBox");
    const statusLabel = document.getElementById("coachTimerStatusLabel");
    const startBtn = document.getElementById("coachStartTimerBtn");
    const doneBtn = document.getElementById("coachDoneNextBtn");

    timerBox.className = "coach-timer-box phase-" + coachPhase;

    if (coachPhase === "exercise") {
      phaseBadge.className = "pill green";
      phaseBadge.textContent = "🏋️ זמן תרגיל";
      statusLabel.textContent = coachTimerHandle
        ? "⏱️ עובדים! כשיסתיים הטיימר תתחיל מנוחה אוטומטית"
        : "⏱️ טיימר תרגיל — לחץ להפעלה (אחרי 00:00 מתחילה מנוחה אוטומטית)";
      startBtn.style.display = "inline-flex";
      startBtn.textContent = coachTimerHandle ? "⏸️ השהה טיימר" : "▶️ הפעל טיימר";
      doneBtn.className = "btn success";
      doneBtn.textContent = isLast ? "🏁 סיימתי את כל האימון — שמור ביומן!" : "✓ סיימתי סט — התחל מנוחה";
    } else if (coachPhase === "rest") {
      phaseBadge.className = "pill yellow";
      phaseBadge.textContent = "😮‍💨 מנוחה אוטומטית";
      statusLabel.textContent = "😮‍💨 מנוחה אוטומטית בין תרגילים — בסיומה ממתינים ללחיצה שלך!";
      startBtn.style.display = "inline-flex";
      startBtn.textContent = coachTimerHandle ? "⏸️ השהה מנוחה" : "▶️ המשך מנוחה";
      doneBtn.className = "btn warning";
      doneBtn.textContent = nextEx ? ("⏭️ דלג מנוחה ועבור אל: " + nextEx.name) : "⏭️ המשך";
    } else {
      // "ready_next" — never auto-advances! Waits explicitly for user click
      phaseBadge.className = "pill accent";
      phaseBadge.textContent = "✅ מוכן לתרגיל הבא";
      statusLabel.textContent = "✅ המנוחה הסתיימה! לחץ למטה כשתרצה להתחיל את התרגיל הבא";
      startBtn.style.display = "none";
      doneBtn.className = "btn success";
      doneBtn.textContent = nextEx ? ("➡️ עבור לתרגיל הבא: " + nextEx.name) : "➡️ לתרגיל הבא";
    }
  }

  function finishWorkoutAndSave() {
    const names = coachQueue.map((item) => item.name);
    state.logs.push({
      id: makeEntryId(),
      date: todayISO(),
      stage: state.currentStageId,
      mode: state.mode === "mode60" ? "+60 דק'" : state.mode === "mode5" ? "חירום 5 דק'" : "+30 דק'",
      session: "מאמן מודרך (" + coachTitleLabel + ")",
      pain: 1,
      nextDay: "ירוק",
      energy: 5,
      exercises: names,
      notes: "סיום אימון מודרך עם הדמיה חיה"
    });
    saveState();
    renderAll();
    closeCoachModal();
    playBeep(3);
    showToast("🎉 כל האימון המודרך הסתיים ונשמר בהיסטוריה!");
  }

  function startAutomaticRest() {
    const ex = coachQueue[coachIndex];
    if (ex && ex._key) toggleDoneToday(ex._key, true);
    renderHeader();
    renderBaselinePhysio();
    renderWorkouts();

    if (coachIndex >= coachQueue.length - 1) {
      finishWorkoutAndSave();
      return;
    }

    stopCoachTimer();
    coachPhase = "rest";
    coachTimerSec = Number(state.restSec) || 25;
    document.getElementById("coachTimerDisplay").textContent = formatTime(coachTimerSec);
    updateCoachPhaseUI();
    showToast("😮‍💨 התרגיל הושלם! מנוחה אוטומטית של " + coachTimerSec + " שנ'");

    coachTimerHandle = setInterval(() => {
      coachTimerSec -= 1;
      document.getElementById("coachTimerDisplay").textContent = formatTime(Math.max(0, coachTimerSec));
      if (coachTimerSec <= 0) {
        stopCoachTimer();
        playBeep(2);
        // Rest finished: pause and wait for explicit user click!
        coachPhase = "ready_next";
        updateCoachPhaseUI();
        showToast("✅ המנוחה הסתיימה — לחץ כשתהיה מוכן לתרגיל הבא!");
      }
    }, 1000);
    updateCoachPhaseUI();
  }

  function startExerciseTimer() {
    if (coachPhase === "rest") {
      if (coachTimerHandle) {
        stopCoachTimer();
        updateCoachPhaseUI();
        return;
      }
      // Resume paused rest
      coachTimerHandle = setInterval(() => {
        coachTimerSec -= 1;
        document.getElementById("coachTimerDisplay").textContent = formatTime(Math.max(0, coachTimerSec));
        if (coachTimerSec <= 0) {
          stopCoachTimer();
          playBeep(2);
          coachPhase = "ready_next";
          updateCoachPhaseUI();
        }
      }, 1000);
      updateCoachPhaseUI();
      return;
    }

    if (coachTimerHandle) {
      stopCoachTimer();
      updateCoachPhaseUI();
      return;
    }

    coachTimerHandle = setInterval(() => {
      coachTimerSec -= 1;
      document.getElementById("coachTimerDisplay").textContent = formatTime(Math.max(0, coachTimerSec));
      if (coachTimerSec <= 3 && coachTimerSec > 0) playBeep(1);
      if (coachTimerSec <= 0) {
        stopCoachTimer();
        playBeep(2);
        startAutomaticRest();
      }
    }, 1000);
    updateCoachPhaseUI();
  }

  function renderCoachStep() {
    const ex = coachQueue[coachIndex];
    if (!ex) return;
    stopCoachTimer();
    coachPhase = "exercise";

    document.getElementById("coachTitle").textContent = "🎬 מצב מאמן מודרך — " + coachTitleLabel;
    document.getElementById("coachStepBadge").textContent = "תרגיל " + (coachIndex + 1) + " מתוך " + coachQueue.length;
    document.getElementById("coachExerciseName").textContent = ex.name;
    document.getElementById("coachExerciseDose").textContent = ex.setsReps;
    document.getElementById("coachCueText").textContent = ex.cue;
    coachTimerSec = Number(ex.durationSec) || 40;
    document.getElementById("coachTimerDisplay").textContent = formatTime(coachTimerSec);

    const nextEx = coachQueue[coachIndex + 1];
    document.getElementById("coachNextPreview").textContent = nextEx
      ? "התרגיל הבא בתור: " + nextEx.name + " (" + nextEx.setsReps + ")"
      : "זהו התרגיל האחרון בסשן — בסיום האימון נשמר אוטומטית ביומן!";

    const canvas = document.getElementById("coachCanvas");
    if (Animator) {
      Animator.setPaused(false);
      Animator.mount(canvas, ex.anim || "plank", { compact: false });
    }
    const animPauseBtn = document.getElementById("coachPlayPauseAnimBtn");
    if (animPauseBtn) animPauseBtn.textContent = "⏸️ עצור הדגמה";
    updateCoachPhaseUI();
  }

  function openCoachWithQueue(queue, label) {
    if (!queue || !queue.length) return;
    coachQueue = queue;
    coachIndex = 0;
    coachTitleLabel = label;
    document.getElementById("coachRestSecSelect").value = String(state.restSec || 25);
    document.getElementById("coachModal").classList.add("open");
    renderCoachStep();
    if (Music) Music.playIfAutoEnabled();
  }

  function launchCoachPreset(preset) {
    const st = getCurrentStage();
    const baseQueue = (DATA.baselinePhysio || []).map((e) => Object.assign({ _key: "base:" + e.id }, e));
    const modeKey = state.mode === "mode60" ? "mode60" : "mode30";

    if (preset === "baseline") {
      openCoachWithQueue(baseQueue, "שישיית הפיזיותרפיה הבסיסית");
      return;
    }
    if (preset === "emergency") {
      const emQueue = DATA.emergencyMode.exercises.map((e, i) => Object.assign({ _key: "em:" + i + ":" + e.name }, e));
      openCoachWithQueue(emQueue, "מצב חירום 5 דק'");
      return;
    }
    if (preset === "dayA" || preset === "dayB" || preset === "dayC") {
      const day = st.workouts[preset];
      const dayQueue = (day[modeKey] || []).map((e, i) => Object.assign({ _key: "st" + st.id + ":" + preset + ":" + modeKey + ":" + i }, e));
      openCoachWithQueue(dayQueue, day.title);
      return;
    }
    const dayA = st.workouts.dayA;
    const dayAQueue = (dayA[modeKey] || []).map((e, i) => Object.assign({ _key: "st" + st.id + ":dayA:" + modeKey + ":" + i }, e));
    openCoachWithQueue(baseQueue.concat(dayAQueue), "בסיס + " + dayA.title);
  }

  function closeCoachModal() {
    stopCoachTimer();
    document.getElementById("coachModal").classList.remove("open");
    const canvas = document.getElementById("coachCanvas");
    if (Animator && canvas) Animator.unmount(canvas);
  }

  // Event Bindings
  document.getElementById("quickStartCoachBtn").addEventListener("click", () => launchCoachPreset("full"));
  document.getElementById("quickLogPhysioBtn").addEventListener("click", logClassicPhysio);
  document.getElementById("quickLogSwimBtn").addEventListener("click", logSwimming);
  document.getElementById("quickLogEmergencyBtn").addEventListener("click", logEmergency5);
  document.getElementById("startBaselineCoachBtn").addEventListener("click", () => launchCoachPreset("baseline"));
  document.getElementById("markAllBaselineBtn").addEventListener("click", logClassicPhysio);
  document.getElementById("saveTodayCheckedBtn").addEventListener("click", saveTodayCheckedToLog);

  document.getElementById("coachCloseBtn").addEventListener("click", closeCoachModal);
  document.getElementById("coachRoutineSelect").addEventListener("change", (e) => launchCoachPreset(e.target.value));
  document.getElementById("coachRestSecSelect").addEventListener("change", (e) => {
    state.restSec = Number(e.target.value) || 25;
    saveState();
  });
  document.getElementById("coachStartTimerBtn").addEventListener("click", startExerciseTimer);

  document.getElementById("coachPlayPauseAnimBtn").addEventListener("click", (e) => {
    if (!Animator) return;
    const nextPaused = !Animator.isPaused();
    Animator.setPaused(nextPaused);
    e.target.textContent = nextPaused ? "▶️ המשך הדגמה" : "⏸️ עצור הדגמה";
  });

  document.querySelectorAll("[data-coach-speed]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-coach-speed]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (Animator) Animator.setSpeed(btn.getAttribute("data-coach-speed"));
    });
  });

  document.getElementById("coachPrevBtn").addEventListener("click", () => {
    if (coachIndex > 0) {
      coachIndex--;
      renderCoachStep();
    }
  });

  document.getElementById("coachDoneNextBtn").addEventListener("click", () => {
    if (coachPhase === "exercise") {
      startAutomaticRest();
    } else {
      // Currently in "rest" or "ready_next": explicit click advances to next exercise
      if (coachIndex < coachQueue.length - 1) {
        coachIndex++;
        renderCoachStep();
      } else {
        finishWorkoutAndSave();
      }
    }
  });

  // Sidebar timer bindings
  document.querySelectorAll("[data-sec]").forEach((btn) => {
    btn.addEventListener("click", () => {
      stopTimer();
      timerSeconds = Number(btn.getAttribute("data-sec"));
      document.getElementById("customSecondsInput").value = timerSeconds;
      updateTimerUI();
    });
  });

  document.getElementById("timerStartPauseBtn").addEventListener("click", () => {
    if (timerInterval) stopTimer();
    else startTimer();
  });

  document.getElementById("timerResetBtn").addEventListener("click", () => {
    stopTimer();
    timerSeconds = Math.max(5, parseInt(document.getElementById("customSecondsInput").value, 10) || 35);
    updateTimerUI();
  });

  document.getElementById("customSecondsInput").addEventListener("change", (e) => {
    stopTimer();
    timerSeconds = Math.max(5, parseInt(e.target.value, 10) || 35);
    updateTimerUI();
  });

  // Office snacks
  document.getElementById("nextSnackBtn").addEventListener("click", () => {
    state.snackIndex = (state.snackIndex + 1) % DATA.officeSnacks.length;
    saveState();
    renderSnack();
  });

  document.getElementById("startSnackTimerBtn").addEventListener("click", () => {
    stopTimer();
    timerSeconds = 90;
    document.getElementById("customSecondsInput").value = 90;
    updateTimerUI();
    startTimer();
    showToast("⚡ טיימר 90 שנ' לחטיף תנועה הופעל!");
  });

  // Stage & Mode selectors
  stageSelect.addEventListener("change", (e) => {
    state.currentStageId = Number(e.target.value);
    document.getElementById("logStageInput").value = state.currentStageId;
    saveState();
    renderAll();
  });

  document.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.mode = btn.getAttribute("data-mode");
      saveState();
      renderModeButtons();
      renderWorkouts();
    });
  });

  // Tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === target));
    });
  });

  // Symmetry & Graduate
  document.getElementById("symRightInput").addEventListener("input", updateSymmetry);
  document.getElementById("symLeftInput").addEventListener("input", updateSymmetry);

  document.getElementById("graduateStageBtn").addEventListener("click", () => {
    const st = getCurrentStage();
    const savedMap = state.testChecks[st.id] || {};
    const allChecked = st.levelUpTest.every((_, i) => Boolean(savedMap[i]));
    if (!allChecked) {
      showToast("⚠️ סמן את כל סעיפי הבדיקה לפני מעבר שלב");
      return;
    }
    if (!savedMap["pain24h"]) {
      showToast("⚠️ ודא תנאי רמזור 24 שעות (גב ירוק למחרת)");
      return;
    }
    if (!updateSymmetry()) {
      showToast("⚠️ הפער בין ימין לשמאל גדול מהסף המותר לשלב");
      return;
    }
    state.logs.push({
      id: makeEntryId(),
      date: todayISO(),
      stage: st.id,
      mode: state.mode === "mode60" ? "+60 דק'" : state.mode === "mode5" ? "חירום 5 דק'" : "+30 דק'",
      session: "מבחן שלב",
      pain: 1,
      nextDay: "ירוק",
      energy: 5,
      exercises: ["מעבר שלב " + st.id],
      notes: "מעבר מוצלח של שלב " + st.id + "!"
    });
    if (st.id < 10) {
      state.currentStageId = st.id + 1;
      saveState();
      renderAll();
      showToast("🎉 כל הכבוד! עלית לשלב " + state.currentStageId + "!");
    } else {
      saveState();
      renderAll();
      showToast("🏆 מאסטר אטלס גב-ברזל! השלמת את כל 10 השלבים!");
    }
  });

  // Detailed log + Backup + Markdown copy
  document.getElementById("logDateInput").value = todayISO();
  document.getElementById("logStageInput").value = state.currentStageId;

  document.getElementById("addDetailedLogBtn").addEventListener("click", () => {
    const note = document.getElementById("logNotesInput").value.trim();
    state.logs.push({
      id: makeEntryId(),
      date: document.getElementById("logDateInput").value || todayISO(),
      stage: Number(document.getElementById("logStageInput").value) || state.currentStageId,
      mode: document.getElementById("logModeSelect").value,
      session: document.getElementById("logSessionSelect").value,
      pain: Number(document.getElementById("logPainInput").value) || 0,
      nextDay: document.getElementById("logNextDaySelect").value,
      energy: Number(document.getElementById("logEnergyInput").value) || 4,
      exercises: note ? [note] : [],
      notes: note
    });
    document.getElementById("logNotesInput").value = "";
    saveState();
    renderAll();
    showToast("✅ הרשומה נוספה ליומן");
  });

  document.getElementById("exportJsonBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atlas-physio-backup-" + todayISO() + ".json";
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importJsonInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        state = Object.assign({}, defaultState, imported);
        saveState();
        renderAll();
        showToast("⬆️ הגיבוי שוחזר בהצלחה!");
      } catch (err) {
        showToast("❌ קובץ גיבוי לא תקין");
      }
    };
    reader.readAsText(file);
  });

  document.getElementById("copyMdLogsBtn").addEventListener("click", () => {
    const rows = state.logs.map((l) => {
      const exStr = Array.isArray(l.exercises) && l.exercises.length ? l.exercises.join(", ") : (l.notes || "-");
      return `| ${l.date} | ${l.stage} | ${l.mode} | ${exStr} | ${l.pain} | ${l.nextDay} | ${l.energy} | ${l.notes || ""} |`;
    }).join("\n");
    if (navigator.clipboard && rows) {
      navigator.clipboard.writeText(rows).then(() => showToast("📋 השורות הועתקו בפורמט Markdown לקליפבורד!"));
    } else {
      showToast("ℹ️ אין רשומות להעתקה או הדפדפן חסם גישה לקליפבורד");
    }
  });

  document.getElementById("clearLogsBtn").addEventListener("click", () => {
    if (!confirm("למחוק את כל היסטוריית האימונים המקומית?")) return;
    state.logs = [];
    saveState();
    renderAll();
  });

  function renderAll() {
    renderHeader();
    renderModeButtons();
    renderBaselinePhysio();
    renderWorkouts();
    renderSnack();
    renderLevelUpTest();
    renderPlacementAndTraffic();
    renderStatsAndLogs();
  }

  if (Music) Music.init();
  renderAll();
  updateTimerUI();

  if (Sync) {
    Sync.init({
      getState: () => state,
      applyMergedState: (merged) => {
        state = Object.assign({}, defaultState, merged);
        saveState(true);
        renderAll();
      },
      showToast
    });
  }
})();
