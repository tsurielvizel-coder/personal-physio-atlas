(function () {
  "use strict";

  const PLAYLIST_STORAGE_KEY = "atlas_physio_music_prefs_v1";

  // Cheerful Hasidic / Niggun style offline sequences (MIDI notes + beats)
  // Using authentic Jewish minor/Ahava Rabbah (Freygish) & lively Niggun intervals
  const NIGGUN_TRACKS = [
    {
      id: "niggun_simcha",
      title: "ניגון שמחה קליל (אופליין • 118 BPM)",
      bpm: 118,
      notes: [
        [62, 0.5], [65, 0.5], [69, 1], [69, 0.5], [70, 0.5], [69, 1],
        [67, 0.5], [65, 0.5], [64, 0.5], [65, 0.5], [67, 1], [62, 1],
        [69, 0.5], [70, 0.5], [72, 1], [70, 0.5], [69, 0.5], [67, 1],
        [65, 0.5], [64, 0.5], [62, 0.5], [61, 0.5], [62, 2],
        [74, 1], [72, 0.5], [70, 0.5], [69, 1], [67, 1],
        [65, 0.5], [67, 0.5], [69, 0.5], [67, 0.5], [65, 1], [64, 1],
        [62, 0.5], [65, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], [64, 0.5], [62, 1],
        [62, 0.5], [69, 0.5], [67, 0.5], [65, 0.5], [62, 2]
      ]
    },
    {
      id: "niggun_march",
      title: "ניגון צעידה ומילואים (אופליין • 124 BPM)",
      bpm: 124,
      notes: [
        [64, 1], [67, 0.5], [69, 0.5], [71, 1], [71, 1],
        [72, 0.5], [71, 0.5], [69, 0.5], [67, 0.5], [69, 1], [64, 1],
        [64, 0.5], [67, 0.5], [71, 1], [74, 1], [72, 1],
        [71, 0.5], [69, 0.5], [67, 0.5], [66, 0.5], [64, 2],
        [76, 1], [74, 0.5], [72, 0.5], [71, 1], [69, 1],
        [71, 0.5], [72, 0.5], [71, 0.5], [69, 0.5], [67, 1], [64, 1],
        [67, 0.5], [69, 0.5], [71, 0.5], [72, 0.5], [71, 1], [69, 1],
        [67, 0.5], [66, 0.5], [64, 1], [64, 2]
      ]
    },
    {
      id: "niggun_calm",
      title: "ניגון הרב קוק / התוועדות רגועה (אופליין • 84 BPM)",
      bpm: 84,
      notes: [
        [62, 1.5], [65, 0.5], [69, 2],
        [70, 1], [69, 1], [67, 1.5], [65, 0.5],
        [64, 1], [65, 1], [67, 1], [65, 1],
        [64, 1.5], [62, 0.5], [62, 2],
        [69, 1.5], [70, 0.5], [72, 2],
        [74, 1], [72, 1], [70, 1], [69, 1],
        [67, 1.5], [65, 0.5], [64, 1], [65, 1],
        [64, 1], [62, 1], [62, 2]
      ]
    }
  ];

  const YOUTUBE_LINKS = [
    {
      label: 'פרויקט "צמאה" (יוטיוב)',
      url: "https://www.youtube.com/results?search_query=%D7%A6%D7%9E%D7%90%D7%94+%D7%A0%D7%99%D7%92%D7%95%D7%A0%D7%99+%D7%97%D7%91%22%D7%93"
    },
    {
      label: "ניגוני הרב קוק / צמאה נפשי",
      url: "https://www.youtube.com/results?search_query=%D7%A6%D7%9E%D7%90%D7%94+%D7%A0%D7%A4%D7%A9%D7%99+%D7%A0%D7%99%D7%92%D7%95%D7%A0%D7%99+%D7%94%D7%A8%D7%91+%D7%A7%D7%95%D7%A7"
    },
    {
      label: "מחרוזת חסידית קצבית",
      url: "https://www.youtube.com/results?search_query=%D7%9E%D7%97%D7%A8%D7%95%D7%96%D7%AA+%D7%A0%D7%99%D7%92%D7%95%D7%A0%D7%99%D7%9D+%D7%97%D7%A1%D7%99%D7%93%D7%99%D7%AA+%D7%A7%D7%A6%D7%91%D7%99%D7%AA"
    }
  ];

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  let audioCtx = null;
  let masterGain = null;
  let schedulerTimer = null;
  let noteIndex = 0;
  let nextNoteTime = 0;
  let isPlayingSynth = false;

  const htmlAudio = new Audio();
  let localFiles = [];
  let localIndex = 0;
  let mode = "synth"; // "synth" or "local"

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(PLAYLIST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  const prefs = Object.assign({
    trackId: NIGGUN_TRACKS[0].id,
    volume: 0.45,
    autoPlayCoach: true,
    customUrl: ""
  }, loadPrefs());

  function savePrefs() {
    try {
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      // ignore storage quota errors
    }
  }

  function ensureAudioCtx() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) {
      audioCtx = new Ctx();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = prefs.volume * 0.4;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSynthNote(midi, durSec, startTime) {
    if (!audioCtx || !masterGain) return;
    const freq = midiToFreq(midi);

    // Warm clarinet/acoustic-plucked blend
    const osc = audioCtx.createOscillator();
    const oscSub = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const env = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, startTime);

    oscSub.type = "sine";
    oscSub.frequency.setValueAtTime(freq * 0.5, startTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1650, startTime);

    env.gain.setValueAtTime(0.001, startTime);
    env.gain.linearRampToValueAtTime(0.28, startTime + 0.03);
    env.gain.exponentialRampToValueAtTime(0.08, startTime + durSec * 0.72);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + Math.max(0.08, durSec - 0.02));

    osc.connect(filter);
    oscSub.connect(filter);
    filter.connect(env);
    env.connect(masterGain);

    osc.start(startTime);
    oscSub.start(startTime);
    osc.stop(startTime + durSec);
    oscSub.stop(startTime + durSec);

    // Soft rhythmic acoustic pulse on strong beats
    if (noteIndex % 2 === 0) {
      const bassOsc = audioCtx.createOscillator();
      const bassEnv = audioCtx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(midiToFreq(midi - 24), startTime);
      bassEnv.gain.setValueAtTime(0.001, startTime);
      bassEnv.gain.linearRampToValueAtTime(0.14, startTime + 0.015);
      bassEnv.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(0.28, durSec));
      bassOsc.connect(bassEnv);
      bassEnv.connect(masterGain);
      bassOsc.start(startTime);
      bassOsc.stop(startTime + Math.min(0.3, durSec));
    }
  }

  function scheduleSynth() {
    if (!isPlayingSynth || !audioCtx) return;
    const track = NIGGUN_TRACKS.find((t) => t.id === prefs.trackId) || NIGGUN_TRACKS[0];
    const secPerBeat = 60 / track.bpm;
    while (nextNoteTime < audioCtx.currentTime + 0.25) {
      const [midi, beats] = track.notes[noteIndex % track.notes.length];
      const dur = beats * secPerBeat;
      playSynthNote(midi, dur, nextNoteTime);
      nextNoteTime += dur;
      noteIndex = (noteIndex + 1) % track.notes.length;
    }
    schedulerTimer = setTimeout(scheduleSynth, 70);
  }

  function startSynth() {
    stopAllAudio();
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    mode = "synth";
    isPlayingSynth = true;
    noteIndex = 0;
    nextNoteTime = ctx.currentTime + 0.04;
    scheduleSynth();
    updateUI();
  }

  function startLocalAt(idx) {
    if (!localFiles.length) return;
    stopAllAudio();
    mode = "local";
    localIndex = ((idx % localFiles.length) + localFiles.length) % localFiles.length;
    htmlAudio.src = localFiles[localIndex].url;
    htmlAudio.volume = prefs.volume;
    htmlAudio.play().catch(() => {});
    updateUI();
  }

  function stopAllAudio() {
    isPlayingSynth = false;
    if (schedulerTimer) {
      clearTimeout(schedulerTimer);
      schedulerTimer = null;
    }
    if (!htmlAudio.paused) {
      htmlAudio.pause();
    }
    updateUI();
  }

  function isCurrentlyPlaying() {
    return isPlayingSynth || (mode === "local" && !htmlAudio.paused);
  }

  htmlAudio.addEventListener("ended", () => {
    if (localFiles.length > 0) {
      startLocalAt(localIndex + 1);
    }
  });

  function updateUI() {
    const playBtn = document.getElementById("musicPlayPauseBtn");
    const statusLabel = document.getElementById("musicNowPlayingLabel");
    if (!playBtn || !statusLabel) return;

    const playing = isCurrentlyPlaying();
    playBtn.textContent = playing ? "⏸️ עצור מוזיקה" : "▶️ נגן ניגון";
    playBtn.classList.toggle("active", playing);

    if (mode === "local" && localFiles.length) {
      const f = localFiles[localIndex];
      statusLabel.textContent = (playing ? "🎵 מנגן MP3: " : "MP3 מוכן: ") + f.name;
    } else {
      const tr = NIGGUN_TRACKS.find((t) => t.id === prefs.trackId) || NIGGUN_TRACKS[0];
      statusLabel.textContent = (playing ? "🎶 מנגן: " : "ניגון נבחר: ") + tr.title;
    }
  }

  function init() {
    const select = document.getElementById("musicTrackSelect");
    if (select) {
      select.innerHTML = "";
      NIGGUN_TRACKS.forEach((tr) => {
        const opt = document.createElement("option");
        opt.value = tr.id;
        opt.textContent = tr.title;
        select.appendChild(opt);
      });
      select.value = prefs.trackId;
      select.addEventListener("change", (e) => {
        prefs.trackId = e.target.value;
        savePrefs();
        mode = "synth";
        if (isCurrentlyPlaying()) startSynth();
        else updateUI();
      });
    }

    const vol = document.getElementById("musicVolumeInput");
    if (vol) {
      vol.value = Math.round(prefs.volume * 100);
      vol.addEventListener("input", (e) => {
        prefs.volume = Math.max(0, Math.min(1, Number(e.target.value) / 100));
        if (masterGain && audioCtx) {
          masterGain.gain.setValueAtTime(prefs.volume * 0.4, audioCtx.currentTime);
        }
        htmlAudio.volume = prefs.volume;
        savePrefs();
      });
    }

    const playBtn = document.getElementById("musicPlayPauseBtn");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (isCurrentlyPlaying()) {
          stopAllAudio();
        } else if (mode === "local" && localFiles.length) {
          startLocalAt(localIndex);
        } else {
          startSynth();
        }
      });
    }

    const moreBtn = document.getElementById("musicMoreBtn");
    const drawer = document.getElementById("musicDrawer");
    if (moreBtn && drawer) {
      moreBtn.addEventListener("click", () => {
        drawer.classList.toggle("open");
      });
    }

    const mp3Input = document.getElementById("localMp3Input");
    if (mp3Input) {
      mp3Input.addEventListener("change", (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        localFiles.forEach((f) => URL.revokeObjectURL(f.url));
        localFiles = files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
        startLocalAt(0);
      });
    }

    const prevMp3 = document.getElementById("musicPrevBtn");
    const nextMp3 = document.getElementById("musicNextBtn");
    if (prevMp3) prevMp3.addEventListener("click", () => startLocalAt(localIndex - 1));
    if (nextMp3) nextMp3.addEventListener("click", () => startLocalAt(localIndex + 1));

    const ytBox = document.getElementById("youtubeQuickLinks");
    if (ytBox) {
      ytBox.innerHTML = "";
      YOUTUBE_LINKS.forEach((item) => {
        const a = document.createElement("a");
        a.href = item.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.className = "btn small";
        a.textContent = "📺 " + item.label;
        ytBox.appendChild(a);
      });
    }

    const customInput = document.getElementById("customPlaylistUrlInput");
    const customOpenBtn = document.getElementById("openCustomPlaylistBtn");
    if (customInput) {
      customInput.value = prefs.customUrl || "";
      customInput.addEventListener("change", (e) => {
        prefs.customUrl = e.target.value.trim();
        savePrefs();
      });
    }
    if (customOpenBtn) {
      customOpenBtn.addEventListener("click", () => {
        const url = (customInput ? customInput.value.trim() : "") || prefs.customUrl;
        if (!url) return;
        prefs.customUrl = url;
        savePrefs();
        window.open(url, "_blank", "noopener,noreferrer");
      });
    }

    const autoCheck = document.getElementById("autoMusicCoachCheck");
    if (autoCheck) {
      autoCheck.checked = Boolean(prefs.autoPlayCoach);
      autoCheck.addEventListener("change", (e) => {
        prefs.autoPlayCoach = e.target.checked;
        savePrefs();
      });
    }

    updateUI();
  }

  window.AtlasMusic = {
    init,
    playIfAutoEnabled() {
      if (!prefs.autoPlayCoach || isCurrentlyPlaying()) return;
      if (mode === "local" && localFiles.length) startLocalAt(localIndex);
      else startSynth();
    },
    stop: stopAllAudio
  };
})();
