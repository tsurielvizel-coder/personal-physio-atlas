(function () {
  "use strict";
  if (!window.AtlasStudio3D || !window.AtlasStudio3D.registerExercises) return;

  function mergeBones(base, overrides) {
    const out = Object.assign({}, base);
    if (overrides) {
      Object.keys(overrides).forEach((k) => {
        out[k] = overrides[k];
      });
    }
    return out;
  }

  function loopKF(aHip, aBones, bHip, bBones, holdPeak) {
    if (holdPeak) {
      return [
        { t: 0.0, hipPos: aHip, bones: aBones },
        { t: 0.36, hipPos: bHip, bones: bBones },
        { t: 0.64, hipPos: bHip, bones: bBones },
        { t: 1.0, hipPos: aHip, bones: aBones }
      ];
    }
    return [
      { t: 0.0, hipPos: aHip, bones: aBones },
      { t: 0.5, hipPos: bHip, bones: bBones },
      { t: 1.0, hipPos: aHip, bones: aBones }
    ];
  }

  const CAM_FLOOR = {
    side: { pos: [2.75, 0.72, -0.04], target: [0, 0.34, -0.04], fov: 36 },
    angle45: { pos: [2.10, 1.05, 1.75], target: [0, 0.34, -0.04], fov: 36 },
    front: { pos: [0.02, 0.68, 2.55], target: [0, 0.34, 0.0], fov: 36 },
    top: { pos: [0.02, 2.60, -0.04], target: [0, 0.30, -0.04], fov: 38 }
  };

  const CAM_STAND = {
    side: { pos: [2.85, 1.04, 0.0], target: [0, 0.88, 0.0], fov: 38 },
    angle45: { pos: [2.15, 1.22, 2.05], target: [0, 0.88, 0.0], fov: 38 },
    front: { pos: [0.0, 1.04, 2.82], target: [0, 0.88, 0.0], fov: 38 },
    top: { pos: [0.02, 3.10, 0.06], target: [0, 0.85, 0.0], fov: 40 }
  };

  const CAM_HIGH = {
    front: { pos: [0.0, 1.38, 3.15], target: [0, 1.22, 0.0], fov: 40 },
    angle45: { pos: [2.35, 1.48, 2.35], target: [0, 1.22, 0.0], fov: 40 },
    side: { pos: [3.10, 1.38, 0.0], target: [0, 1.22, 0.0], fov: 40 },
    top: { pos: [0.02, 3.45, 0.10], target: [0, 1.20, 0.0], fov: 42 }
  };

  const CAM_SIDEPLANK = {
    front: { pos: [0.0, 0.78, 2.75], target: [0, 0.38, 0.0], fov: 36 },
    angle45: { pos: [1.95, 1.02, 2.05], target: [0, 0.38, 0.0], fov: 36 },
    side: { pos: [2.68, 0.72, 0.02], target: [0, 0.38, 0.0], fov: 36 },
    top: { pos: [0.02, 2.65, 0.02], target: [0, 0.35, 0.0], fov: 38 }
  };

  // --- BASE POSE TEMPLATES ---
  const BASE_STAND = {
    "mixamorig:Hips": [0, 0, 0],
    "mixamorig:Spine": [0, 0, 0],
    "mixamorig:Spine1": [0, 0, 0],
    "mixamorig:Spine2": [0, 0, 0],
    "mixamorig:Neck": [0, 0, 0],
    "mixamorig:Head": [0, 0, 0],
    "mixamorig:LeftShoulder": [0, 0, -0.05],
    "mixamorig:LeftArm": [0, 0.06, -1.36],
    "mixamorig:LeftForeArm": [0, -0.15, 0],
    "mixamorig:LeftHand": [0, 0, 0],
    "mixamorig:RightShoulder": [0, 0, 0.05],
    "mixamorig:RightArm": [0, -0.06, 1.36],
    "mixamorig:RightForeArm": [0, 0.15, 0],
    "mixamorig:RightHand": [0, 0, 0],
    "mixamorig:LeftUpLeg": [0, 0, -0.04],
    "mixamorig:LeftLeg": [0.04, 0, 0],
    "mixamorig:LeftFoot": [0, 0, 0],
    "mixamorig:RightUpLeg": [0, 0, 0.04],
    "mixamorig:RightLeg": [0.04, 0, 0],
    "mixamorig:RightFoot": [0, 0, 0]
  };

  const BASE_PRONE_PLANK = {
    "mixamorig:Hips": [1.38, 0, 0],
    "mixamorig:Spine": [0.02, 0, 0],
    "mixamorig:Spine1": [0.02, 0, 0],
    "mixamorig:Spine2": [0.02, 0, 0],
    "mixamorig:Neck": [-0.30, 0, 0],
    "mixamorig:Head": [-0.10, 0, 0],
    "mixamorig:LeftShoulder": [0, 0, 0.05],
    "mixamorig:LeftArm": [0, -1.52, 0.08],
    "mixamorig:LeftForeArm": [0, -0.10, 0],
    "mixamorig:LeftHand": [0, 0, 1.30],
    "mixamorig:RightShoulder": [0, 0, -0.05],
    "mixamorig:RightArm": [0, 1.52, -0.08],
    "mixamorig:RightForeArm": [0, 0.10, 0],
    "mixamorig:RightHand": [0, 0, -1.30],
    "mixamorig:LeftUpLeg": [0.02, 0, -0.05],
    "mixamorig:LeftLeg": [0.04, 0, 0],
    "mixamorig:LeftFoot": [-0.82, 0, 0],
    "mixamorig:RightUpLeg": [0.02, 0, 0.05],
    "mixamorig:RightLeg": [0.04, 0, 0],
    "mixamorig:RightFoot": [-0.82, 0, 0]
  };

  const BASE_FOREARM_PLANK = mergeBones(BASE_PRONE_PLANK, {
    "mixamorig:Hips": [1.46, 0, 0],
    "mixamorig:LeftArm": [0.04, -1.50, 0.08],
    "mixamorig:LeftForeArm": [0, 0.08, 1.48],
    "mixamorig:LeftHand": [0, 0, 0],
    "mixamorig:RightArm": [0.04, 1.50, -0.08],
    "mixamorig:RightForeArm": [0, -0.08, -1.48],
    "mixamorig:RightHand": [0, 0, 0]
  });

  const BASE_SUPINE = {
    "mixamorig:Hips": [-1.57, 0, 0],
    "mixamorig:Spine": [0, 0, 0],
    "mixamorig:Spine1": [0, 0, 0],
    "mixamorig:Spine2": [0, 0, 0],
    "mixamorig:Neck": [-0.05, 0, 0],
    "mixamorig:Head": [-0.04, 0, 0],
    "mixamorig:LeftShoulder": [0, 0, -0.05],
    "mixamorig:LeftArm": [0, 0.12, -1.42],
    "mixamorig:LeftForeArm": [0, -0.12, 0],
    "mixamorig:LeftHand": [0, 0, 0],
    "mixamorig:RightShoulder": [0, 0, 0.05],
    "mixamorig:RightArm": [0, -0.12, 1.42],
    "mixamorig:RightForeArm": [0, 0.12, 0],
    "mixamorig:RightHand": [0, 0, 0],
    "mixamorig:LeftUpLeg": [0, 0, -0.04],
    "mixamorig:LeftLeg": [0.04, 0, 0],
    "mixamorig:LeftFoot": [0.15, 0, 0],
    "mixamorig:RightUpLeg": [0, 0, 0.04],
    "mixamorig:RightLeg": [0.04, 0, 0],
    "mixamorig:RightFoot": [0.15, 0, 0]
  };

  const BASE_SIDE_PLANK = {
    "mixamorig:Hips": [0, 0, 1.42],
    "mixamorig:Spine": [0, 0, 0],
    "mixamorig:Spine1": [0, 0, 0],
    "mixamorig:Spine2": [0, 0, 0],
    "mixamorig:Neck": [0, 0, 0],
    "mixamorig:Head": [0, 0, 0],
    "mixamorig:LeftShoulder": [0, 0, -0.05],
    "mixamorig:LeftArm": [0, 0.05, -1.35],
    "mixamorig:LeftForeArm": [0, -0.25, 0],
    "mixamorig:LeftHand": [0, 0, 0],
    "mixamorig:RightShoulder": [0, 0, 0.05],
    "mixamorig:RightArm": [0, 0.05, 0.12],
    "mixamorig:RightForeArm": [0, 1.48, 0],
    "mixamorig:RightHand": [0, 0, 0],
    "mixamorig:LeftUpLeg": [0, 0, -0.04],
    "mixamorig:LeftLeg": [0.04, 0, 0],
    "mixamorig:LeftFoot": [0.10, 0, 0],
    "mixamorig:RightUpLeg": [0, 0, 0.04],
    "mixamorig:RightLeg": [0.04, 0, 0],
    "mixamorig:RightFoot": [0.10, 0, 0]
  };

  const BASE_ALL_FOURS = {
    "mixamorig:Hips": [1.49, 0, 0],
    "mixamorig:Spine": [0.03, 0, 0],
    "mixamorig:Spine1": [0.02, 0, 0],
    "mixamorig:Spine2": [0.02, 0, 0],
    "mixamorig:Neck": [-0.36, 0, 0],
    "mixamorig:Head": [-0.14, 0, 0],
    "mixamorig:LeftShoulder": [0, 0, 0.06],
    "mixamorig:LeftArm": [0, -1.52, 0.08],
    "mixamorig:LeftForeArm": [0, -0.08, 0],
    "mixamorig:LeftHand": [0, 0, 1.35],
    "mixamorig:RightShoulder": [0, 0, -0.06],
    "mixamorig:RightArm": [0, 1.52, -0.08],
    "mixamorig:RightForeArm": [0, 0.08, 0],
    "mixamorig:RightHand": [0, 0, -1.35],
    "mixamorig:LeftUpLeg": [-1.49, 0, 0],
    "mixamorig:LeftLeg": [1.56, 0, 0],
    "mixamorig:LeftFoot": [0.35, 0, 0],
    "mixamorig:RightUpLeg": [-1.49, 0, 0],
    "mixamorig:RightLeg": [1.56, 0, 0],
    "mixamorig:RightFoot": [0.35, 0, 0]
  };

  const CATALOG = {
    // 1. BEAR BIRD-DOG
    bear_bird_dog: {
      title: "סופרמן בעמידת דוב (Bear Bird-Dog)",
      periodMs: 3600,
      prop: "mat",
      targetBone: "mixamorig:Hips",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.11,
      staticCue: "דגש: ברכיים מרחפות 2–3 ס\"מ מהמזרון, אגן פלס לגמרי בהושטה נגדית",
      cues: [
        "1/3 עמידת דוב — ברכיים מרחפות 2–3 ס\"מ מעל המזרון, ידיים דוחפות חזק.",
        "2/3 הושט יד ימין קדימה ורגל שמאל לאחור מבלי שהאגן יסתובב.",
        "3/3 החזר לאט למרכז בלי להניח את הברכיים והחלף צד."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.59, -0.16],
        mergeBones(BASE_ALL_FOURS, { "mixamorig:LeftFoot": [-0.85, 0, 0], "mixamorig:RightFoot": [-0.85, 0, 0] }),
        [0, 0.59, -0.16],
        mergeBones(BASE_ALL_FOURS, {
          "mixamorig:RightArm": [3.05, 0.04, -1.52],
          "mixamorig:RightHand": [0, 0, 0],
          "mixamorig:LeftUpLeg": [-0.02, 0, 0],
          "mixamorig:LeftLeg": [0.06, 0, 0],
          "mixamorig:LeftFoot": [-0.35, 0, 0],
          "mixamorig:RightFoot": [-0.85, 0, 0]
        }),
        true
      )
    },

    // 2. PLANK (RKC)
    plank: {
      title: "בטן סטטית (Plank RKC)",
      periodMs: 3200,
      prop: "mat",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.11,
      staticCue: "דגש: ישבן מכווץ (סיבוב אגן קל לאחור), משיכת מרפקים לבהונות, 0 שקיעה במותן",
      cues: [
        "1/3 אמות על המזרון מתחת לכתפיים; רגליים ישרות וכפות רגליים צמודות.",
        "2/3 כווץ ישבן ובטן חזק (סיבוב אגן קל לאחור נגד הקשתה) ומשוך מרפקים לכיוון הבהונות.",
        "3/3 נשום רגוע ונמוך תוך שמירה על קו ישר מאוזן עד עקב."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.34, -0.08],
        BASE_FOREARM_PLANK,
        [0, 0.355, -0.08],
        mergeBones(BASE_FOREARM_PLANK, { "mixamorig:Spine": [0.05, 0, 0], "mixamorig:Spine1": [0.04, 0, 0] }),
        false
      )
    },

    // 3. PLANK SHOULDER TAPS
    plank_taps: {
      title: "נגיעות כתף בפלאנק (Shoulder Taps)",
      periodMs: 2800,
      prop: "mat",
      targetBone: "mixamorig:Hips",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.11,
      staticCue: "דגש: רגליים מעט רחבות ליציבות, נגיעה איטית בכתף הנגדית עם 0 נדנוד אגן",
      cues: [
        "1/3 פלאנק גבוה על כפות ידיים, פיסוק קל ברגליים ונעילת בטן וישבן.",
        "2/3 נתק יד ימין לאט וגע בכתף שמאל מבלי שהאגן ייטה או יסתובב.",
        "3/3 הורד בשליטה והחלף ליד שמאל."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "angle45",
      keyframes: [
        { t: 0.0, hipPos: [0, 0.44, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:LeftUpLeg": [0.02, 0, -0.14], "mixamorig:RightUpLeg": [0.02, 0, 0.14] }) },
        { t: 0.25, hipPos: [0, 0.44, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:LeftUpLeg": [0.02, 0, -0.14], "mixamorig:RightUpLeg": [0.02, 0, 0.14], "mixamorig:RightArm": [0.2, 0.85, 0.55], "mixamorig:RightForeArm": [0, 1.75, 0] }) },
        { t: 0.5, hipPos: [0, 0.44, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:LeftUpLeg": [0.02, 0, -0.14], "mixamorig:RightUpLeg": [0.02, 0, 0.14] }) },
        { t: 0.75, hipPos: [0, 0.44, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:LeftUpLeg": [0.02, 0, -0.14], "mixamorig:RightUpLeg": [0.02, 0, 0.14], "mixamorig:LeftArm": [0.2, -0.85, -0.55], "mixamorig:LeftForeArm": [0, -1.75, 0] }) },
        { t: 1.0, hipPos: [0, 0.44, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:LeftUpLeg": [0.02, 0, -0.14], "mixamorig:RightUpLeg": [0.02, 0, 0.14] }) }
      ]
    },

    // 4. BODY SAW
    body_saw: {
      title: "ניסור גוף בפלאנק (Body Saw)",
      periodMs: 3400,
      prop: "mat",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.11,
      staticCue: "דגש: דחיפה איטית אחורה על האמות בלי שום שקיעה בגב התחתון",
      cues: [
        "1/3 התחל מפלאנק RKC הדוק על האמות — ישבן ובטן נעולים.",
        "2/3 דחוף את הגוף 10–15 ס\"מ לאחור דרך הכתפיים והקרסוליים תוך הגברת מתח בבטן.",
        "3/3 משוך חזרה קדימה מעל המרפקים בשליטה מלאה."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.34, 0.04],
        BASE_FOREARM_PLANK,
        [0, 0.32, -0.14],
        mergeBones(BASE_FOREARM_PLANK, { "mixamorig:LeftArm": [0.04, -1.78, 0.08], "mixamorig:RightArm": [0.04, 1.78, -0.08] }),
        false
      )
    },

    // 5. MINI-COBRA
    cobra: {
      title: "מיני-קוברה עדינה (Mini-Cobra)",
      periodMs: 4000,
      prop: "mat",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, 0.06, 0.04],
      targetRadius: 0.11,
      staticCue: "דגש: הרמת חזה עדינה בלבד על האמות, אגן נשאר על המזרון, ללא צביטה במותן",
      cues: [
        "1/3 שכיבה על הבטן, מרפקים מתחת לכתפיים וישבן רפוי.",
        "2/3 הרם בעדינות את בית החזה והראש קדימה ומעלה לפתיחת עמוד שדרה עליון.",
        "3/3 עצור 10 שנ׳ בנשימה רגועה ורד לאט — ללא דחיסה או כאב במותן."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.12, -0.10],
        mergeBones(BASE_FOREARM_PLANK, {
          "mixamorig:Hips": [1.57, 0, 0],
          "mixamorig:Spine": [-0.04, 0, 0],
          "mixamorig:Spine1": [-0.05, 0, 0],
          "mixamorig:Spine2": [-0.06, 0, 0],
          "mixamorig:LeftFoot": [0.45, 0, 0],
          "mixamorig:RightFoot": [0.45, 0, 0]
        }),
        [0, 0.12, -0.10],
        mergeBones(BASE_FOREARM_PLANK, {
          "mixamorig:Hips": [1.57, 0, 0],
          "mixamorig:Spine": [-0.14, 0, 0],
          "mixamorig:Spine1": [-0.22, 0, 0],
          "mixamorig:Spine2": [-0.24, 0, 0],
          "mixamorig:Neck": [-0.18, 0, 0],
          "mixamorig:LeftArm": [0.05, -1.15, 0.08],
          "mixamorig:RightArm": [0.05, 1.15, -0.08],
          "mixamorig:LeftFoot": [0.45, 0, 0],
          "mixamorig:RightFoot": [0.45, 0, 0]
        }),
        true
      )
    },

    // 6. SIDE HIP RAISE
    side_hip_raise: {
      title: "הרמות אגן בפלאנק צידי (Side Hip Raise)",
      periodMs: 3000,
      prop: "mat",
      targetBone: "mixamorig:Hips",
      targetOffset: [0, 0.05, 0],
      targetRadius: 0.11,
      staticCue: "דגש: ירידה איטית של האגן לכמעט נגיעה ועלייה יציבה בקו ישר ללא נפילה קדימה",
      cues: [
        "1/3 פלאנק צידי על אמה ימין, כתף יציבה ורגליים ישרות בקו הגוף.",
        "2/3 הורד את האגן לאט למטה עד כמעט נגיעה במזרון.",
        "3/3 דחוף את המותן למעלה בעוצמה דרך האלכסונים וצד הירך."
      ],
      cameras: CAM_SIDEPLANK,
      defaultAngle: "front",
      keyframes: loopKF(
        [0, 0.42, 0],
        BASE_SIDE_PLANK,
        [0, 0.20, 0],
        mergeBones(BASE_SIDE_PLANK, { "mixamorig:Hips": [0, 0, 1.56], "mixamorig:Spine": [0, 0, -0.18] }),
        false
      )
    },

    // 7. SIDE PLANK
    side_plank: {
      title: "פלאנק צידי (Side Plank — אחד לכל צד)",
      periodMs: 3200,
      prop: "mat",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.04, 0],
      targetRadius: 0.11,
      staticCue: "דגש: קו ישר מאוזן-כתף-אגן-קרסול, מרפק בדיוק מתחת לכתף, נשימה רגועה",
      cues: [
        "1/3 אמה על המזרון בדיוק מתחת לכתף, כפות רגליים אחת על השנייה או מדורגות.",
        "2/3 הרם אגן לקו ישר (אוזן-כתף-אגן-עקב) ודחוף את המזרון עם האמה.",
        "3/3 החזק יציב ובצע זמן זהה גם בצד השני לאיזון מושלם."
      ],
      cameras: CAM_SIDEPLANK,
      defaultAngle: "front",
      keyframes: loopKF(
        [0, 0.41, 0],
        BASE_SIDE_PLANK,
        [0, 0.43, 0],
        mergeBones(BASE_SIDE_PLANK, { "mixamorig:LeftArm": [0, 0.05, -0.05] }),
        false
      )
    },

    // 8. SIDE PLANK STAR
    side_plank_star: {
      title: "פלאנק צידי כוכב (Star Side Plank)",
      periodMs: 3400,
      prop: "mat",
      targetBone: "mixamorig:LeftUpLeg",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.12,
      staticCue: "דגש: הרמת הרגל והיד העליונות בשליטה בלי שהאגן התחתון שוקע",
      cues: [
        "1/3 פלאנק צידי יציב על האמה, אגן גבוה וכתף דוחפת.",
        "2/3 הרם את הרגל העליונה ואת היד העליונה לצורת כוכב.",
        "3/3 החזק בשליטה והורד לאט בלי קריסת אגן."
      ],
      cameras: CAM_SIDEPLANK,
      defaultAngle: "front",
      keyframes: loopKF(
        [0, 0.42, 0],
        BASE_SIDE_PLANK,
        [0, 0.44, 0],
        mergeBones(BASE_SIDE_PLANK, {
          "mixamorig:LeftArm": [0, 0, 0.10],
          "mixamorig:LeftUpLeg": [0, 0, 0.52]
        }),
        true
      )
    },

    // 9. COPENHAGEN PLANK
    copenhagen: {
      title: "פלאנק קופנהגן על ספה (Copenhagen)",
      periodMs: 3400,
      prop: "sofa_back",
      targetBone: "mixamorig:LeftUpLeg",
      targetOffset: [0, 0.04, 0],
      targetRadius: 0.12,
      staticCue: "דגש: רגל עליונה מונחת על הספה, לחיצה חזקה של מקרבי הירך והחזקת קו ישר",
      cues: [
        "1/3 הנח את פנים הברך או הקרסול של הרגל העליונה על הספה; אמה תחתונה מתחת לכתף.",
        "2/3 הרם אגן ואת הרגל התחתונה באוויר דרך שרירי מקרבי הירך והאלכסונים.",
        "3/3 החזק קו ישר ונשום רגוע; בצע בשני הצדדים."
      ],
      cameras: CAM_SIDEPLANK,
      defaultAngle: "front",
      keyframes: loopKF(
        [0, 0.46, -0.42],
        mergeBones(BASE_SIDE_PLANK, { "mixamorig:LeftUpLeg": [0, 0, -0.14], "mixamorig:RightUpLeg": [0, 0, 0.14] }),
        [0, 0.48, -0.42],
        mergeBones(BASE_SIDE_PLANK, { "mixamorig:LeftUpLeg": [0, 0, -0.10], "mixamorig:RightUpLeg": [0, 0, 0.04] }),
        true
      )
    },

    // 10. DEAD BUG
    dead_bug: {
      title: "דד-באג (Dead Bug)",
      periodMs: 3800,
      prop: "mat",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.11,
      staticCue: "דגש: גב תחתון צמוד למזרון לאורך כל התנועה, נשיפה איטית בהושטת יד ורגל נגדית",
      cues: [
        "1/3 שכיבה על הגב, ידיים לתקרה, ברכיים ב־90° מעל האגן וגב תחתון לחוץ למזרון.",
        "2/3 נשוף לאט והושט יד ימין לאחור ורגל שמאל קדימה כמעט עד הרצפה.",
        "3/3 חזור למרכז בלי שהמותן תתרומם מהמזרון והחלף צד."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.13, -0.04],
        mergeBones(BASE_SUPINE, {
          "mixamorig:LeftArm": [0, -1.52, 0],
          "mixamorig:RightArm": [0, 1.52, 0],
          "mixamorig:LeftUpLeg": [-1.52, 0, 0],
          "mixamorig:LeftLeg": [1.52, 0, 0],
          "mixamorig:RightUpLeg": [-1.52, 0, 0],
          "mixamorig:RightLeg": [1.52, 0, 0]
        }),
        [0, 0.13, -0.04],
        mergeBones(BASE_SUPINE, {
          "mixamorig:LeftArm": [0, -1.52, 0],
          "mixamorig:RightArm": [0, 0.10, -1.42],
          "mixamorig:LeftUpLeg": [-0.22, 0, 0],
          "mixamorig:LeftLeg": [0.06, 0, 0],
          "mixamorig:RightUpLeg": [-1.52, 0, 0],
          "mixamorig:RightLeg": [1.52, 0, 0]
        }),
        true
      )
    },

    // 11. HOLLOW BODY HOLD
    hollow_body: {
      title: "הולו-בודי (Hollow Body Hold)",
      periodMs: 3600,
      prop: "mat",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.11,
      staticCue: "דגש: גב תחתון מהודק 100% למזרון, שכמות ורגליים מורמות — נגד היפר-לורדוזיס",
      cues: [
        "1/3 הדק את הגב התחתון חזק למזרון (סיבוב אגן לאחור).",
        "2/3 נתק שכמות ורגליים ישרות לצורת בננה ארוכה וידיים לאחור.",
        "3/3 אם המותן מתנתקת — הרם מעט את הרגליים או כפוף ברך אחת."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.13, -0.04],
        mergeBones(BASE_SUPINE, {
          "mixamorig:Spine": [0.10, 0, 0],
          "mixamorig:Spine1": [0.16, 0, 0],
          "mixamorig:Spine2": [0.18, 0, 0],
          "mixamorig:Neck": [0.22, 0, 0],
          "mixamorig:LeftArm": [0, 0, 1.48],
          "mixamorig:RightArm": [0, 0, -1.48],
          "mixamorig:LeftUpLeg": [-0.36, 0, 0],
          "mixamorig:RightUpLeg": [-0.36, 0, 0]
        }),
        [0, 0.13, -0.04],
        mergeBones(BASE_SUPINE, {
          "mixamorig:Spine": [0.12, 0, 0],
          "mixamorig:Spine1": [0.18, 0, 0],
          "mixamorig:Spine2": [0.20, 0, 0],
          "mixamorig:Neck": [0.24, 0, 0],
          "mixamorig:LeftArm": [0, 0, 1.50],
          "mixamorig:RightArm": [0, 0, -1.50],
          "mixamorig:LeftUpLeg": [-0.28, 0, 0],
          "mixamorig:RightUpLeg": [-0.28, 0, 0]
        }),
        false
      )
    },

    // 12. GLUTE BRIDGE
    glute_bridge: {
      title: "גשר עכוז (Glute Bridge)",
      periodMs: 3200,
      prop: "mat",
      targetBone: "mixamorig:Hips",
      targetOffset: [0, 0.05, 0],
      targetRadius: 0.12,
      staticCue: "דגש: דחיפה דרך העקבים, כיווץ חזק בישבן למעלה בלי הקשתת יתר במותן",
      cues: [
        "1/3 שכיבה על הגב, ברכיים כפופות וכפות רגליים ברוחב אגן.",
        "2/3 כווץ ישבן ודחוף עקבים למזרון עד קו ישר מכתפיים לברכיים.",
        "3/3 עצור 2 שנ׳ למעלה עם צלעות אסופות ורד לאט."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.14, 0.0],
        mergeBones(BASE_SUPINE, {
          "mixamorig:LeftUpLeg": [-1.25, 0, 0],
          "mixamorig:LeftLeg": [1.95, 0, 0],
          "mixamorig:RightUpLeg": [-1.25, 0, 0],
          "mixamorig:RightLeg": [1.95, 0, 0]
        }),
        [0, 0.36, 0.0],
        mergeBones(BASE_SUPINE, {
          "mixamorig:Hips": [-1.96, 0, 0],
          "mixamorig:Neck": [0.22, 0, 0],
          "mixamorig:LeftUpLeg": [0.18, 0, 0],
          "mixamorig:LeftLeg": [1.45, 0, 0],
          "mixamorig:RightUpLeg": [0.18, 0, 0],
          "mixamorig:RightLeg": [1.45, 0, 0]
        }),
        true
      )
    },

    // 13. SINGLE-LEG GLUTE BRIDGE
    sl_glute_bridge: {
      title: "גשר עכוז על רגל אחת (Single-Leg Bridge)",
      periodMs: 3200,
      prop: "mat",
      targetBone: "mixamorig:Hips",
      targetOffset: [0, 0.05, 0],
      targetRadius: 0.12,
      staticCue: "דגש: רגל אחת מורמת, אגן נשאר פלס לגמרי בעלייה דרך עקב הרגל התומכת",
      cues: [
        "1/3 שכיבה על הגב — רגל ימין על המזרון ורגל שמאל מורמת ישרה.",
        "2/3 דחוף דרך עקב ימין והרם אגן ישר בלי שצד שמאל ייפול.",
        "3/3 רד בשליטה והשלם חזרות זהות בכל רגל."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.14, 0.0],
        mergeBones(BASE_SUPINE, {
          "mixamorig:RightUpLeg": [-1.25, 0, 0],
          "mixamorig:RightLeg": [1.95, 0, 0],
          "mixamorig:LeftUpLeg": [-1.35, 0, 0],
          "mixamorig:LeftLeg": [0.10, 0, 0]
        }),
        [0, 0.36, 0.0],
        mergeBones(BASE_SUPINE, {
          "mixamorig:Hips": [-1.96, 0, 0],
          "mixamorig:Neck": [0.22, 0, 0],
          "mixamorig:RightUpLeg": [0.18, 0, 0],
          "mixamorig:RightLeg": [1.45, 0, 0],
          "mixamorig:LeftUpLeg": [0.10, 0, 0],
          "mixamorig:LeftLeg": [0.06, 0, 0]
        }),
        true
      )
    },

    // 14. PUSH-UP
    pushup: {
      title: "שכיבות סמיכה מלאות (Push-Ups)",
      periodMs: 2800,
      prop: "mat",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, 0.04, 0.04],
      targetRadius: 0.12,
      staticCue: "דגש: מרפקים בזווית ~45° מהגוף, חזה יורד עד קרוב למזרון, בטן וישבן נעולים",
      cues: [
        "1/3 ידיים מעט רחבות מכתפיים, גוף בקו ישר כמו פלאנק.",
        "2/3 ירידה מבוקרת (2 שנ׳) עם מרפקים ב־45° לאחור עד שחזה כמעט נוגע.",
        "3/3 דחיפה חזקה למעלה בלי שקיעה בגב התחתון."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "angle45",
      keyframes: loopKF(
        [0, 0.43, -0.06],
        BASE_PRONE_PLANK,
        [0, 0.28, -0.06],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [1.44, 0, 0],
          "mixamorig:LeftArm": [0.15, -0.75, -0.58],
          "mixamorig:LeftForeArm": [0, -1.42, 0],
          "mixamorig:RightArm": [0.15, 0.75, 0.58],
          "mixamorig:RightForeArm": [0, 1.42, 0]
        }),
        false
      )
    },

    // 15. DECLINE PUSH-UP
    decline_pushup: {
      title: "שכיבות סמיכה בשיפוע שלילי (רגליים על ספה)",
      periodMs: 2900,
      prop: "sofa_back",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, 0.04, 0.04],
      targetRadius: 0.12,
      staticCue: "דגש: רגליים על הספה, בטן מהודקת נגד הקשתת גב, דחיפה לחזה עליון וכתפיים",
      cues: [
        "1/3 הנח קצות אצבעות הרגליים על הספה וכפות ידיים על הרצפה מתחת לכתפיים.",
        "2/3 כווץ בטן וישבן בחוזקה כדי שהמותן לא תשקע, ורד בשליטה.",
        "3/3 דחוף חזק למעלה דרך החזה העליון והכתפיים."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.54, -0.04],
        mergeBones(BASE_PRONE_PLANK, { "mixamorig:Hips": [1.66, 0, 0] }),
        [0, 0.39, -0.04],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [1.74, 0, 0],
          "mixamorig:LeftArm": [0.15, -0.75, -0.58],
          "mixamorig:LeftForeArm": [0, -1.42, 0],
          "mixamorig:RightArm": [0.15, 0.75, 0.58],
          "mixamorig:RightForeArm": [0, 1.42, 0]
        }),
        false
      )
    },

    // 16. PSEUDO-PLANCHE PUSH-UP
    pseudo_planche: {
      title: "שכיבות סמיכה פסאודו-פלאנש (Pseudo-Planche)",
      periodMs: 3200,
      prop: "mat",
      targetBone: "mixamorig:LeftArm",
      targetOffset: [0, 0.05, 0],
      targetRadius: 0.11,
      staticCue: "דגש: כפות ידיים מופנות מעט החוצה ליד המותניים, כתפיים רוכנות קדימה מעבר לידיים",
      cues: [
        "1/3 ידיים מונחות נמוך יותר לכיוון המותן, כתפיים רוכנות קדימה מעבר לפרקי הידיים.",
        "2/3 שמור על הישענות קדימה לאורך כל הירידה לעומס אדיר על הכתף הקדמית.",
        "3/3 דחוף למעלה ושמור על גב עליון מעוגל מעט (Protraction)."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.43, 0.06],
        mergeBones(BASE_PRONE_PLANK, { "mixamorig:LeftArm": [0, -1.18, 0.08], "mixamorig:RightArm": [0, 1.18, -0.08] }),
        [0, 0.28, 0.10],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [1.44, 0, 0],
          "mixamorig:LeftArm": [0.10, -0.55, -0.65],
          "mixamorig:LeftForeArm": [0, -1.52, 0],
          "mixamorig:RightArm": [0.10, 0.55, 0.65],
          "mixamorig:RightForeArm": [0, 1.52, 0]
        }),
        false
      )
    },

    // 17. ONE-ARM INCLINE PUSH-UP
    one_arm_incline: {
      title: "שכיבת סמיכה ביד אחת בשיפוע (על ספה/שולחן)",
      periodMs: 3200,
      prop: "sofa_front",
      targetBone: "mixamorig:RightArm",
      targetOffset: [0, 0.04, 0],
      targetRadius: 0.12,
      staticCue: "דגש: יד אחת על משטח מוגבה, פיסוק רחב ברגליים, אגן מקביל לרצפה בלי פיתול",
      cues: [
        "1/3 יד ימין על שפת הספה/שולחן יציב, יד שמאל מאחורי הגב ופיסוק רחב.",
        "2/3 רד לאט עם מרפק צמוד יחסית לגוף מבלי לסובב את האגן.",
        "3/3 דחוף בעוצמה למעלה והחלף ליד שמאל."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "angle45",
      keyframes: loopKF(
        [0, 0.56, -0.16],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [0.96, 0, 0],
          "mixamorig:LeftArm": [0, 0.35, -1.42],
          "mixamorig:LeftForeArm": [0, -1.45, 0],
          "mixamorig:LeftUpLeg": [0.02, 0, -0.18],
          "mixamorig:RightUpLeg": [0.02, 0, 0.18]
        }),
        [0, 0.46, -0.04],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [1.12, 0, 0],
          "mixamorig:LeftArm": [0, 0.35, -1.42],
          "mixamorig:LeftForeArm": [0, -1.45, 0],
          "mixamorig:RightArm": [0.15, 0.72, 0.62],
          "mixamorig:RightForeArm": [0, 1.48, 0],
          "mixamorig:LeftUpLeg": [0.02, 0, -0.18],
          "mixamorig:RightUpLeg": [0.02, 0, 0.18]
        }),
        false
      )
    },

    // 18. INCLINE PUSH-UP
    incline_pushup: {
      title: "שכיבות סמיכה בשיפוע חיובי (ידיים על ספה)",
      periodMs: 2800,
      prop: "sofa_front",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, 0.04, 0.04],
      targetRadius: 0.12,
      staticCue: "דגש: ידיים על שפת הספה, גוף ישר לגמרי, חזה יורד אל שפת הספה",
      cues: [
        "1/3 ידיים על שפת הספה ברוחב כתפיים, גוף ישר מעקבים עד ראש.",
        "2/3 רד לאט עם מרפקים ב־45° עד שהחזה נוגע קלות בשפת הספה.",
        "3/3 דחוף חזרה למעלה בשליטה מלאה."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.56, -0.10],
        mergeBones(BASE_PRONE_PLANK, { "mixamorig:Hips": [0.95, 0, 0] }),
        [0, 0.46, 0.02],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [1.12, 0, 0],
          "mixamorig:LeftArm": [0.15, -0.72, -0.58],
          "mixamorig:LeftForeArm": [0, -1.42, 0],
          "mixamorig:RightArm": [0.15, 0.72, 0.58],
          "mixamorig:RightForeArm": [0, 1.42, 0]
        }),
        false
      )
    },

    // 19. PIKE PUSH-UP
    pike_pushup: {
      title: "שכיבות סמיכה פייק לכתפיים (Pike Push-Up)",
      periodMs: 3000,
      prop: "mat",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, 0.08, 0],
      targetRadius: 0.12,
      staticCue: "דגש: אגן גבוה בצורת V הפוכה, הראש יורד קדימה מול קו הידיים (משולש!)",
      cues: [
        "1/3 הרם את האגן גבוה לתנוחת V הפוכה (כלב מביט מטה).",
        "2/3 הורד את קודקוד הראש קדימה מעבר לקו הידיים (לא ביניהן).",
        "3/3 דחוף חזק למעלה והחזר את הראש בין הזרועות."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.72, -0.10],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [2.15, 0, 0],
          "mixamorig:LeftArm": [0, -0.25, 1.38],
          "mixamorig:RightArm": [0, 0.25, -1.38],
          "mixamorig:LeftUpLeg": [-1.32, 0, 0],
          "mixamorig:RightUpLeg": [-1.32, 0, 0]
        }),
        [0, 0.62, 0.02],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [2.18, 0, 0],
          "mixamorig:LeftArm": [0.15, -0.78, 0.72],
          "mixamorig:LeftForeArm": [0, -1.42, 0],
          "mixamorig:RightArm": [0.15, 0.78, -0.72],
          "mixamorig:RightForeArm": [0, 1.42, 0],
          "mixamorig:LeftUpLeg": [-1.42, 0, 0],
          "mixamorig:RightUpLeg": [-1.42, 0, 0]
        }),
        false
      )
    },

    // 20. ARCHER PUSH-UP
    archer_pushup: {
      title: "שכיבות סמיכה קשת (Archer Push-Up)",
      periodMs: 3400,
      prop: "mat",
      targetBone: "mixamorig:RightArm",
      targetOffset: [0, 0.04, 0],
      targetRadius: 0.12,
      staticCue: "דגש: פיסוק רחב בידיים — יורדים לצד יד אחת בעוד היד השנייה נשארת ישרה",
      cues: [
        "1/3 ידיים רחבות משמעותית מכתפיים, אצבעות מופנות מעט החוצה.",
        "2/3 העבר משקל לצד יד ימין ורד עמוק תוך שיד שמאל נשארת ישרה.",
        "3/3 דחוף חזרה למרכז והחלף לצד שמאל."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "front",
      keyframes: [
        { t: 0.0, hipPos: [0, 0.42, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:LeftArm": [0, -1.45, -0.35], "mixamorig:RightArm": [0, 1.45, 0.35] }) },
        { t: 0.25, hipPos: [-0.22, 0.28, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:Hips": [1.44, 0, 0], "mixamorig:LeftArm": [0, -1.15, -0.05], "mixamorig:RightArm": [0.15, 0.72, 0.65], "mixamorig:RightForeArm": [0, 1.45, 0] }) },
        { t: 0.5, hipPos: [0, 0.42, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:LeftArm": [0, -1.45, -0.35], "mixamorig:RightArm": [0, 1.45, 0.35] }) },
        { t: 0.75, hipPos: [0.22, 0.28, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:Hips": [1.44, 0, 0], "mixamorig:RightArm": [0, 1.15, 0.05], "mixamorig:LeftArm": [0.15, -0.72, -0.65], "mixamorig:LeftForeArm": [0, -1.45, 0] }) },
        { t: 1.0, hipPos: [0, 0.42, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:LeftArm": [0, -1.45, -0.35], "mixamorig:RightArm": [0, 1.45, 0.35] }) }
      ]
    },

    // 21. WALL HANDSTAND
    handstand: {
      title: "עמידת ידיים מול קיר (Wall Handstand)",
      periodMs: 3400,
      prop: "wall_back",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, -0.05, 0],
      targetRadius: 0.13,
      staticCue: "דגש: דחיפה חזקה דרך הכתפיים לתקרה, בטן ב-Hollow ורגליים ישרות צמודות",
      cues: [
        "1/3 כפות ידיים ברוחב כתפיים, אצבעות פרוסות אוחזות את הרצפה.",
        "2/3 דחוף כתפיים גבוה (לסגור רווח לאוזניים) ואסוף צלעות-אגן (Hollow).",
        "3/3 נשום רגוע ורד בשליטה לפני עייפות מלאה."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 1.18, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0, 0, Math.PI],
          "mixamorig:LeftArm": [0, 0, 1.50],
          "mixamorig:RightArm": [0, 0, -1.50],
          "mixamorig:LeftHand": [0, 0, -1.35],
          "mixamorig:RightHand": [0, 0, 1.35],
          "mixamorig:LeftFoot": [0.35, 0, 0],
          "mixamorig:RightFoot": [0.35, 0, 0]
        }),
        [0, 1.21, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0, 0, Math.PI],
          "mixamorig:LeftArm": [0, 0, 1.54],
          "mixamorig:RightArm": [0, 0, -1.54],
          "mixamorig:LeftHand": [0, 0, -1.35],
          "mixamorig:RightHand": [0, 0, 1.35],
          "mixamorig:LeftFoot": [0.35, 0, 0],
          "mixamorig:RightFoot": [0.35, 0, 0]
        }),
        false
      )
    },

    // 22. WALL HSPU
    hspu: {
      title: "שכיבות סמיכה בעמידת ידיים (Wall HSPU)",
      periodMs: 3200,
      prop: "wall_back",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, -0.05, 0],
      targetRadius: 0.13,
      staticCue: "דגש: ירידה מבוקרת עד קודקוד הראש (או כרית), מרפקים פנימה ב-45°, דחיפה אנכית",
      cues: [
        "1/3 עמידת ידיים יציבה מול קיר, ליבה הדוקה ב־Hollow.",
        "2/3 כפוף מרפקים ב־45° ורד בשליטה עד שהראש מתקרב למזרון.",
        "3/3 דחוף בעוצמה חזרה לנעילת כתפיים מלאה."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 1.18, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0, 0, Math.PI],
          "mixamorig:LeftArm": [0, 0, 1.50],
          "mixamorig:RightArm": [0, 0, -1.50],
          "mixamorig:LeftHand": [0, 0, -1.35],
          "mixamorig:RightHand": [0, 0, 1.35]
        }),
        [0, 0.90, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0, 0, Math.PI],
          "mixamorig:LeftArm": [0, -0.55, 0.55],
          "mixamorig:LeftForeArm": [0, -1.55, 0],
          "mixamorig:RightArm": [0, 0.55, -0.55],
          "mixamorig:RightForeArm": [0, 1.55, 0]
        }),
        false
      )
    },

    // 23. INVERTED ROW (UNDER TABLE)
    row: {
      title: "חתירה אופקית מתחת לשולחן (Inverted Row)",
      periodMs: 3000,
      prop: "table_row",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, 0.04, 0],
      targetRadius: 0.12,
      staticCue: "דגש: אחיזה בשפת שולחן יציב, משיכת חזה לשולחן וכיווץ שכמות חזק",
      cues: [
        "1/3 שכב מתחת לשולחן חזק, אחוז בשפתו ברוחב כתפיים והחזק גוף ישר.",
        "2/3 משוך את החזה אל שפת השולחן תוך קירוב שכמות לאחור.",
        "3/3 רד לאט בשליטה (2 שנ׳) בלי להפיל את האגן."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.20, 0.12],
        mergeBones(BASE_SUPINE, {
          "mixamorig:Hips": [-1.36, 0, 0],
          "mixamorig:LeftArm": [0, -1.48, 0],
          "mixamorig:RightArm": [0, 1.48, 0]
        }),
        [0, 0.38, 0.12],
        mergeBones(BASE_SUPINE, {
          "mixamorig:Hips": [-1.22, 0, 0],
          "mixamorig:LeftArm": [0, -0.58, -0.68],
          "mixamorig:LeftForeArm": [0, -1.52, 0],
          "mixamorig:RightArm": [0, 0.58, 0.68],
          "mixamorig:RightForeArm": [0, 1.52, 0]
        }),
        true
      )
    },

    // 24. PULL-UP (OUTDOOR BAR)
    pullup: {
      title: "מתח מלא (Pull-Ups — מתקן חיצוני)",
      periodMs: 3200,
      prop: "pullup_bar",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, 0.06, -0.05],
      targetRadius: 0.14,
      staticCue: "דגש: התחלה ממשיכת שכמות מטה, עלייה עד סנטר מעל המוט וירידה איטית בלי תנופה",
      cues: [
        "1/3 אחיזה רחבה מעט מכתפיים, תלייה אקטיבית עם בטן אסופה (Hollow).",
        "2/3 הורד שכמות ומשוך חזה לכיוון המוט עד שהסנטר עובר מעליו.",
        "3/3 רד בשליטה מלאה (2–3 שנ׳) עד יישור מלא של הידיים."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "front",
      keyframes: loopKF(
        [0, 1.15, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, 0, 1.46],
          "mixamorig:RightArm": [0, 0, -1.46],
          "mixamorig:LeftLeg": [0.16, 0, 0],
          "mixamorig:RightLeg": [0.16, 0, 0]
        }),
        [0, 1.66, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0.25, -0.42, 0.25],
          "mixamorig:LeftForeArm": [0, -1.68, 0],
          "mixamorig:RightArm": [0.25, 0.42, -0.25],
          "mixamorig:RightForeArm": [0, 1.68, 0],
          "mixamorig:LeftLeg": [0.24, 0, 0],
          "mixamorig:RightLeg": [0.24, 0, 0]
        }),
        true
      )
    },

    // 25. DEAD HANG (SPINAL DECOMPRESSION)
    hang: {
      title: "תלייה לשחרור גב וכתפיים (Dead Hang)",
      periodMs: 4000,
      prop: "pullup_bar",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.04, 0],
      targetRadius: 0.14,
      staticCue: "דגש: נשימות עמוקות לשחרור דחיסה מהמותן, מעבר עדין בין תלייה רפויה לאקטיבית",
      cues: [
        "1/3 אחוז את המוט ברוחב כתפיים ותן לכוח המשיכה להאריך את הגב התחתון.",
        "2/3 נשום עמוק ורגוע — מושלם אחרי ישיבה ממושכת לשחרור חוליות המותן.",
        "3/3 בסוף הסט הפעל בעדינות את השכמות לפני הירידה."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "front",
      keyframes: loopKF(
        [0, 1.12, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, 0, 1.50],
          "mixamorig:RightArm": [0, 0, -1.50]
        }),
        [0, 1.16, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftShoulder": [0, 0, -0.14],
          "mixamorig:RightShoulder": [0, 0, 0.14],
          "mixamorig:LeftArm": [0, 0, 1.48],
          "mixamorig:RightArm": [0, 0, -1.48]
        }),
        false
      )
    },

    // 26. BODYWEIGHT SQUAT
    squat: {
      title: "סקוואט עמוק בשליטה (Bodyweight Squat)",
      periodMs: 3200,
      prop: "none",
      targetBone: "mixamorig:RightUpLeg",
      targetOffset: [0, 0.04, 0],
      targetRadius: 0.13,
      staticCue: "דגש: עקבים דבוקים לרצפה, ברכיים נפתחות בקו האצבעות, חזה פתוח וגב ניטרלי",
      cues: [
        "1/3 עמידה ברוחב כתפיים, כפות רגליים מופנות מעט החוצה.",
        "2/3 שלח אגן לאחור ורד עמוק עם ידיים קדימה לאיזון וגב ישר.",
        "3/3 דחוף דרך מרכז כף הרגל והעקב חזרה למעלה."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "angle45",
      keyframes: loopKF(
        [0, 0.99, 0],
        BASE_STAND,
        [0, 0.56, -0.12],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0.34, 0, 0],
          "mixamorig:LeftArm": [0, -1.35, 0],
          "mixamorig:RightArm": [0, 1.35, 0],
          "mixamorig:LeftUpLeg": [-1.88, 0, -0.16],
          "mixamorig:LeftLeg": [2.02, 0, 0],
          "mixamorig:LeftFoot": [-0.45, 0, 0],
          "mixamorig:RightUpLeg": [-1.88, 0, 0.16],
          "mixamorig:RightLeg": [2.02, 0, 0],
          "mixamorig:RightFoot": [-0.45, 0, 0]
        }),
        false
      )
    },

    // 27. SPLIT SQUAT
    split_squat: {
      title: "ספליט סקוואט (Split Squat)",
      periodMs: 3200,
      prop: "none",
      targetBone: "mixamorig:RightUpLeg",
      targetOffset: [0, 0.05, 0],
      targetRadius: 0.13,
      staticCue: "דגש: ירידה אנכית ומבוקרת עד שהברך האחורית כמעט נוגעת, גו זקוף ודחיפה מהעקב הקדמי",
      cues: [
        "1/3 פסיעה ארוכה קדימה, עקב אחורי מורם וגב זקוף.",
        "2/3 רד ישר למטה עד ל־90° בשתי הברכיים (מותח גם את הפסואס האחורי).",
        "3/3 דחוף בעוצמה מהעקב הקדמי למעלה והחלף רגל."
      ],
      cameras: CAM_STAND,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.96, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:RightUpLeg": [-0.36, 0, 0],
          "mixamorig:RightLeg": [0.22, 0, 0],
          "mixamorig:LeftUpLeg": [0.34, 0, 0],
          "mixamorig:LeftLeg": [0.20, 0, 0],
          "mixamorig:LeftFoot": [-0.55, 0, 0]
        }),
        [0, 0.62, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0.14, 0, 0],
          "mixamorig:RightUpLeg": [-1.45, 0, 0],
          "mixamorig:RightLeg": [1.45, 0, 0],
          "mixamorig:LeftUpLeg": [0.12, 0, 0],
          "mixamorig:LeftLeg": [1.55, 0, 0],
          "mixamorig:LeftFoot": [-0.95, 0, 0]
        }),
        false
      )
    },

    // 28. PISTOL SQUAT
    pistol: {
      title: "סקוואט אקדח על רגל אחת (Pistol Squat)",
      periodMs: 3600,
      prop: "none",
      targetBone: "mixamorig:RightUpLeg",
      targetOffset: [0, 0.05, 0],
      targetRadius: 0.13,
      staticCue: "דגש: רגל חופשית ישרה קדימה באוויר, עקב הרגל התומכת נשאר על הרצפה",
      cues: [
        "1/3 עמידה על רגל ימין, רגל שמאל וידיים מושטות קדימה לאיזון.",
        "2/3 רד לאט ובשליטה עמוק על רגל ימין בלי להרים את העקב.",
        "3/3 דחוף בעוצמה חזרה לעמידה והחלף רגל."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "angle45",
      keyframes: loopKF(
        [0, 0.99, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, -1.42, 0],
          "mixamorig:RightArm": [0, 1.42, 0],
          "mixamorig:LeftUpLeg": [-0.55, 0, 0]
        }),
        [0, 0.48, -0.10],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0.42, 0, 0],
          "mixamorig:LeftArm": [0, -1.45, 0],
          "mixamorig:RightArm": [0, 1.45, 0],
          "mixamorig:RightUpLeg": [-2.05, 0, 0],
          "mixamorig:RightLeg": [2.25, 0, 0],
          "mixamorig:RightFoot": [-0.55, 0, 0],
          "mixamorig:LeftUpLeg": [-1.82, 0, 0],
          "mixamorig:LeftLeg": [0.05, 0, 0]
        }),
        true
      )
    },

    // 29. COSSACK SQUAT
    cossack: {
      title: "סקוואט קוזאקי צידי (Cossack Squat)",
      periodMs: 3800,
      prop: "none",
      targetBone: "mixamorig:LeftUpLeg",
      targetOffset: [0, 0.05, 0],
      targetRadius: 0.13,
      staticCue: "דגש: פיסוק רחב, ירידה לצד אחד בעוד הרגל הנגדית ישרה עם אצבעות לתקרה",
      cues: [
        "1/3 עמידה בפיסוק רחב מאוד, ידיים קדימה לאיזון וחזה פתוח.",
        "2/3 העבר משקל ורד עמוק על רגל ימין בזמן שרגל שמאל נמתחת ישרה.",
        "3/3 עלה למרכז ועבור לצד שמאל בשליטה."
      ],
      cameras: CAM_STAND,
      defaultAngle: "front",
      keyframes: [
        { t: 0.0, hipPos: [0, 0.94, 0], bones: mergeBones(BASE_STAND, { "mixamorig:LeftUpLeg": [0, 0, 0.42], "mixamorig:RightUpLeg": [0, 0, -0.42] }) },
        { t: 0.25, hipPos: [-0.36, 0.56, -0.06], bones: mergeBones(BASE_STAND, { "mixamorig:Hips": [0.28, 0, 0], "mixamorig:LeftArm": [0, -1.35, 0], "mixamorig:RightArm": [0, 1.35, 0], "mixamorig:RightUpLeg": [-1.68, 0, -0.25], "mixamorig:RightLeg": [1.85, 0, 0], "mixamorig:LeftUpLeg": [-0.30, 0, 0.88], "mixamorig:LeftLeg": [0.05, 0, 0] }) },
        { t: 0.5, hipPos: [0, 0.94, 0], bones: mergeBones(BASE_STAND, { "mixamorig:LeftUpLeg": [0, 0, 0.42], "mixamorig:RightUpLeg": [0, 0, -0.42] }) },
        { t: 0.75, hipPos: [0.36, 0.56, -0.06], bones: mergeBones(BASE_STAND, { "mixamorig:Hips": [0.28, 0, 0], "mixamorig:LeftArm": [0, -1.35, 0], "mixamorig:RightArm": [0, 1.35, 0], "mixamorig:LeftUpLeg": [-1.68, 0, 0.25], "mixamorig:LeftLeg": [1.85, 0, 0], "mixamorig:RightUpLeg": [-0.30, 0, -0.88], "mixamorig:RightLeg": [0.05, 0, 0] }) },
        { t: 1.0, hipPos: [0, 0.94, 0], bones: mergeBones(BASE_STAND, { "mixamorig:LeftUpLeg": [0, 0, 0.42], "mixamorig:RightUpLeg": [0, 0, -0.42] }) }
      ]
    },

    // 30. RDL (HIP HINGE WITH BACKPACK)
    rdl: {
      title: "דדליפט רומני / הינג׳ ירך (RDL)",
      periodMs: 3400,
      prop: "backpack_back",
      targetBone: "mixamorig:Hips",
      targetOffset: [0, 0.04, -0.06],
      targetRadius: 0.13,
      staticCue: "דגש: שליחת אגן לאחור כמו סגירת דלת, ברכיים רכות וגב ישר פלס 100%",
      cues: [
        "1/3 עמידה ברוחב אגן עם תיק מים, ברכיים רכות (כפיפה קלה 10°–15°).",
        "2/3 שלח את הישבן אחורה עם גב ישר לחלוטין עד מתיחה עמוקה בהמסטרינגס.",
        "3/3 דחוף עקבים ודחוף אגן קדימה חזרה לעמידה זקופה (בלי הקשתת יתר)."
      ],
      cameras: CAM_STAND,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.99, 0],
        BASE_STAND,
        [0, 0.88, -0.22],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [1.22, 0, 0],
          "mixamorig:Neck": [-0.25, 0, 0],
          "mixamorig:LeftArm": [0, -1.22, 0.05],
          "mixamorig:RightArm": [0, 1.22, -0.05],
          "mixamorig:LeftUpLeg": [-1.36, 0, 0],
          "mixamorig:LeftLeg": [0.24, 0, 0],
          "mixamorig:RightUpLeg": [-1.36, 0, 0],
          "mixamorig:RightLeg": [0.24, 0, 0]
        }),
        false
      )
    },

    // 31. SINGLE-LEG RDL
    sl_rdl: {
      title: "דדליפט רומני על רגל אחת (Single-Leg RDL)",
      periodMs: 3600,
      prop: "none",
      targetBone: "mixamorig:RightUpLeg",
      targetOffset: [0, 0.06, -0.05],
      targetRadius: 0.13,
      staticCue: "דגש: אגן סגור ומקביל לרצפה (בלי לפתוח ירך החוצה!), רגל אחורית עולה בקו הגב",
      cues: [
        "1/3 עמידה על רגל ימין עם ברך רכה ובטן אסופה.",
        "2/3 הטה גו קדימה והרם רגל שמאל אחורה בקו אחד ישר לצורת T.",
        "3/3 שמור על אגן סגור וחזור לעמידה דרך כיווץ הישבן הימני."
      ],
      cameras: CAM_STAND,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.99, 0],
        BASE_STAND,
        [0, 0.92, -0.08],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [1.34, 0, 0],
          "mixamorig:Neck": [-0.30, 0, 0],
          "mixamorig:LeftArm": [0, -1.35, 0.06],
          "mixamorig:RightArm": [0, 1.35, -0.06],
          "mixamorig:RightUpLeg": [-1.42, 0, 0],
          "mixamorig:RightLeg": [0.16, 0, 0],
          "mixamorig:LeftUpLeg": [0.04, 0, 0],
          "mixamorig:LeftLeg": [0.06, 0, 0]
        }),
        true
      )
    },

    // 32. NORDIC HAMSTRING CURL
    nordic: {
      title: "נורדיק המסטרינג (עקבים מעוגנים תחת ספה)",
      periodMs: 3800,
      prop: "sofa_back",
      targetBone: "mixamorig:RightUpLeg",
      targetOffset: [0, -0.04, -0.08],
      targetRadius: 0.13,
      staticCue: "דגש: ירידה אקסצנטרית איטית מאוד (3–5 שנ׳) בקו ישר מברך לכתף, ידיים מוכנות לבלימה",
      cues: [
        "1/3 כריעה על מזרון עם קרסוליים מעוגנים מתחת לספה כבדה; ישבן מכווץ.",
        "2/3 רד קדימה לאט ככל האפשר (3–5 שנ׳) תוך בלימה מלאה בהמסטרינגס.",
        "3/3 בלום בעדינות על הידיים ודחוף חזרה למעלה."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.56, -0.18],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftUpLeg": [0.05, 0, 0],
          "mixamorig:LeftLeg": [1.56, 0, 0],
          "mixamorig:RightUpLeg": [0.05, 0, 0],
          "mixamorig:RightLeg": [1.56, 0, 0],
          "mixamorig:LeftArm": [0, -0.65, -0.95],
          "mixamorig:RightArm": [0, 0.65, 0.95]
        }),
        [0, 0.42, 0.22],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0.95, 0, 0],
          "mixamorig:LeftUpLeg": [0.05, 0, 0],
          "mixamorig:LeftLeg": [0.62, 0, 0],
          "mixamorig:RightUpLeg": [0.05, 0, 0],
          "mixamorig:RightLeg": [0.62, 0, 0],
          "mixamorig:LeftArm": [0, -1.45, 0],
          "mixamorig:RightArm": [0, 1.45, 0]
        }),
        false
      )
    },

    // 33. COMBO CARRY (SUITCASE + OVERHEAD BOTTLE)
    combo_carry: {
      title: "נשיאה משולבת (תיק ביד + בקבוק מעל הראש)",
      periodMs: 2400,
      prop: "combo_bottles_pack",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.13,
      staticCue: "דגש: בקבוק 1.5L מעל הראש ביד שמאל + תיק ביד ימין — צלעות אסופות ו־0 נטייה!",
      cues: [
        "1/3 יד ימין אוחזת תיק מים למטה; יד שמאל מחזיקה בקבוק 1.5L ישר מעל הראש.",
        "2/3 לך צעדים יציבים לאורך הקו הירוק בלי להקשית מותן ובלי לנטות הצידה.",
        "3/3 החלף ידיים בסוף הטיימר לאיזון מלא בין הצדדים."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "front",
      keyframes: loopKF(
        [0, 0.99, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, 0, 1.52],
          "mixamorig:RightArm": [0, 0.02, 1.38],
          "mixamorig:LeftUpLeg": [-0.28, 0, 0],
          "mixamorig:LeftLeg": [0.34, 0, 0],
          "mixamorig:RightUpLeg": [0.22, 0, 0],
          "mixamorig:RightLeg": [0.16, 0, 0]
        }),
        [0, 0.99, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, 0, 1.52],
          "mixamorig:RightArm": [0, 0.02, 1.38],
          "mixamorig:LeftUpLeg": [0.22, 0, 0],
          "mixamorig:LeftLeg": [0.16, 0, 0],
          "mixamorig:RightUpLeg": [-0.28, 0, 0],
          "mixamorig:RightLeg": [0.34, 0, 0]
        }),
        false
      )
    },

    // 34. RUCK WALK (LOADED BACKPACK)
    ruck_walk: {
      title: "הליכת משקל / מילואים (Ruck Walk)",
      periodMs: 2000,
      prop: "backpack_back",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.04, 0],
      targetRadius: 0.13,
      staticCue: "דגש: תיק גב צמוד גבוה לגב העליון, צעדים זריזים ומדודים, גב זקוף ונשימה סדירה",
      cues: [
        "1/3 הדק את רצועות התיק גבוה וצמוד לגב העליון (עומס קרוב למרכז הכובד).",
        "2/3 צעד בקצב אחיד, גו זקוף (ללא קריסה קדימה) וכתפיים משוחררות.",
        "3/3 בונה סיבולת גב ורגליים מושלמת למילואים ללא פגיעה בברכיים."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "angle45",
      keyframes: loopKF(
        [0, 0.99, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, -0.35, -1.32],
          "mixamorig:RightArm": [0, 0.35, 1.32],
          "mixamorig:LeftUpLeg": [-0.34, 0, 0],
          "mixamorig:LeftLeg": [0.38, 0, 0],
          "mixamorig:RightUpLeg": [0.26, 0, 0],
          "mixamorig:RightLeg": [0.18, 0, 0]
        }),
        [0, 0.99, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, 0.35, -1.32],
          "mixamorig:RightArm": [0, -0.35, 1.32],
          "mixamorig:LeftUpLeg": [0.26, 0, 0],
          "mixamorig:LeftLeg": [0.18, 0, 0],
          "mixamorig:RightUpLeg": [-0.34, 0, 0],
          "mixamorig:RightLeg": [0.38, 0, 0]
        }),
        false
      )
    },

    // 35. BIERING-SORENSEN HOLD
    sorensen: {
      title: "החזקת סורנסן על ספה (Biering-Sorensen)",
      periodMs: 3600,
      prop: "sofa_back",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.12,
      staticCue: "דגש: אגן ורגליים על הספה, פלג גוף עליון מוחזק אופקי ישר (0 הקשתת יתר!)",
      cues: [
        "1/3 שכב על הבטן על הספה כך שהמותן והגוף העליון בולטים מעבר לקצה.",
        "2/3 החזק את הגוף אופקי לגמרי בקו ישר עם ידיים שלובות על החזה.",
        "3/3 אל תעלה מעל קו האופק — יעד הזהב של מקגיל לבריאות גב!"
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.48, -0.45],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [1.57, 0, 0],
          "mixamorig:LeftArm": [0, -1.15, -0.55],
          "mixamorig:LeftForeArm": [0, 0, 1.75],
          "mixamorig:RightArm": [0, 1.15, 0.55],
          "mixamorig:RightForeArm": [0, 0, -1.75],
          "mixamorig:LeftFoot": [0.35, 0, 0],
          "mixamorig:RightFoot": [0.35, 0, 0]
        }),
        [0, 0.49, -0.45],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [1.55, 0, 0],
          "mixamorig:LeftArm": [0, -1.15, -0.55],
          "mixamorig:LeftForeArm": [0, 0, 1.75],
          "mixamorig:RightArm": [0, 1.15, 0.55],
          "mixamorig:RightForeArm": [0, 0, -1.75],
          "mixamorig:LeftFoot": [0.35, 0, 0],
          "mixamorig:RightFoot": [0.35, 0, 0]
        }),
        false
      )
    },

    // 36. PRONE Y-T-W
    prone_ytw: {
      title: "Y-T-W בשכיבה על הבטן (חיזוק שכמות)",
      periodMs: 4200,
      prop: "mat",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.12,
      staticCue: "דגש: מצח נח קרוב למזרון, אגודלים מופנים לתקרה, כיווץ שכמות עדין ומבוקר",
      cues: [
        "1/3 שכב על הבטן, בטן אסופה קלות כדי שהמותן לא תתכווץ.",
        "2/3 הרם ידיים לאות Y (אגודלים למעלה), עבור לאות T ולאות W.",
        "3/3 עצור 2 שנ׳ בכל צורה עם כתפיים רחוקות מהאוזניים."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "top",
      keyframes: [
        { t: 0.0, hipPos: [0, 0.12, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:Hips": [1.57, 0, 0], "mixamorig:LeftArm": [0, 0.35, 0.95], "mixamorig:RightArm": [0, -0.35, -0.95], "mixamorig:LeftFoot": [0.4, 0, 0], "mixamorig:RightFoot": [0.4, 0, 0] }) },
        { t: 0.33, hipPos: [0, 0.12, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:Hips": [1.57, 0, 0], "mixamorig:LeftArm": [0, 0.38, 0.0], "mixamorig:RightArm": [0, -0.38, 0.0], "mixamorig:LeftFoot": [0.4, 0, 0], "mixamorig:RightFoot": [0.4, 0, 0] }) },
        { t: 0.66, hipPos: [0, 0.12, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:Hips": [1.57, 0, 0], "mixamorig:LeftArm": [0, 0.38, -0.65], "mixamorig:LeftForeArm": [0, -1.55, 0], "mixamorig:RightArm": [0, -0.38, 0.65], "mixamorig:RightForeArm": [0, 1.55, 0], "mixamorig:LeftFoot": [0.4, 0, 0], "mixamorig:RightFoot": [0.4, 0, 0] }) },
        { t: 1.0, hipPos: [0, 0.12, -0.06], bones: mergeBones(BASE_PRONE_PLANK, { "mixamorig:Hips": [1.57, 0, 0], "mixamorig:LeftArm": [0, 0.35, 0.95], "mixamorig:RightArm": [0, -0.35, -0.95], "mixamorig:LeftFoot": [0.4, 0, 0], "mixamorig:RightFoot": [0.4, 0, 0] }) }
      ]
    },

    // 37. L-SIT ON CHAIRS
    lsit: {
      title: "ישיבת L בין שני כיסאות (L-Sit)",
      periodMs: 3400,
      prop: "chairs_dips",
      targetBone: "mixamorig:Hips",
      targetOffset: [0, 0.05, 0.06],
      targetRadius: 0.12,
      staticCue: "דגש: דחיפת כתפיים חזקה למטה (לצאת מהאוזניים), רגליים מורמות ל-90° בישר או בברכיים כפופות",
      cues: [
        "1/3 ידיים על שני כיסאות יציבים, דחוף כתפיים מטה ונעל מרפקים.",
        "2/3 הרם את האגן והרגליים קדימה לצורת האות L (או עם ברכיים כפופות).",
        "3/3 החזק בנשימה קצרה ומבוקרת ורד לאט."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "angle45",
      keyframes: loopKF(
        [0, 0.54, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, 0, -1.32],
          "mixamorig:RightArm": [0, 0, 1.32],
          "mixamorig:LeftUpLeg": [-1.52, 0, 0],
          "mixamorig:RightUpLeg": [-1.52, 0, 0],
          "mixamorig:LeftFoot": [0.35, 0, 0],
          "mixamorig:RightFoot": [0.35, 0, 0]
        }),
        [0, 0.56, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, 0, -1.36],
          "mixamorig:RightArm": [0, 0, 1.36],
          "mixamorig:LeftUpLeg": [-1.58, 0, 0],
          "mixamorig:RightUpLeg": [-1.58, 0, 0],
          "mixamorig:LeftFoot": [0.35, 0, 0],
          "mixamorig:RightFoot": [0.35, 0, 0]
        }),
        false
      )
    },

    // 38. CHAIR DIPS
    dips: {
      title: "מקבילים בין שני כיסאות (Chair Dips)",
      periodMs: 3000,
      prop: "chairs_dips",
      targetBone: "mixamorig:RightArm",
      targetOffset: [0, 0.04, 0],
      targetRadius: 0.12,
      staticCue: "דגש: כתפיים למטה ולאחור, ירידה מבוקרת עד 90° במרפקים ודחיפה אנכית",
      cues: [
        "1/3 אחוז בשני כיסאות יציבים משני הצדדים, כתפיים דחופות מטה.",
        "2/3 רד לאט תוך הטיית חזה קלה קדימה עד ~90° במרפקים.",
        "3/3 דחוף בעוצמה למעלה לנעילה מלאה."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "angle45",
      keyframes: loopKF(
        [0, 0.68, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0.12, 0, 0],
          "mixamorig:LeftArm": [0, 0, -1.28],
          "mixamorig:RightArm": [0, 0, 1.28],
          "mixamorig:LeftLeg": [1.35, 0, 0],
          "mixamorig:RightLeg": [1.35, 0, 0]
        }),
        [0, 0.52, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0.18, 0, 0],
          "mixamorig:LeftArm": [0.16, 0.55, -0.68],
          "mixamorig:LeftForeArm": [0, -1.35, 0],
          "mixamorig:RightArm": [0.16, -0.55, 0.68],
          "mixamorig:RightForeArm": [0, 1.35, 0],
          "mixamorig:LeftLeg": [1.45, 0, 0],
          "mixamorig:RightLeg": [1.45, 0, 0]
        }),
        false
      )
    },

    // 39. HANGING LEG / KNEE RAISE
    hanging_raise: {
      title: "הרמות ברכיים/רגליים בתלייה (Hanging Raise)",
      periodMs: 3400,
      prop: "pullup_bar",
      targetBone: "mixamorig:Hips",
      targetOffset: [0, 0.06, 0.06],
      targetRadius: 0.13,
      staticCue: "דגש: אפס תנופה! גלגול קל של האגן למעלה בסוף העלייה וירידה איטית",
      cues: [
        "1/3 תלייה יציבה על המוט, כתפיים פעילות ללא נדנוד.",
        "2/3 הרם רגליים ישרות (או ברכיים) למעלה תוך סיבוב אגן קל לאחור.",
        "3/3 הורד לאט בשליטה מלאה ועצור לרגע לפני החזרה הבאה."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "angle45",
      keyframes: loopKF(
        [0, 1.14, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, 0, 1.48],
          "mixamorig:RightArm": [0, 0, -1.48]
        }),
        [0, 1.14, 0.04],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [-0.20, 0, 0],
          "mixamorig:LeftArm": [0, 0, 1.48],
          "mixamorig:RightArm": [0, 0, -1.48],
          "mixamorig:LeftUpLeg": [-1.62, 0, 0],
          "mixamorig:RightUpLeg": [-1.62, 0, 0]
        }),
        true
      )
    },

    // 40. HALF-KNEELING HIP FLEXOR STRETCH
    hip_flexor: {
      title: "מתיחת מכופפי ירך / פסואס בכריעה (Hip Flexor)",
      periodMs: 4200,
      prop: "mat",
      targetBone: "mixamorig:LeftUpLeg",
      targetOffset: [0, 0.08, 0.04],
      targetRadius: 0.12,
      staticCue: "דגש: כיווץ ישבן אחורי (סיבוב אגן לאחור) קודם — ורק אז תנועה זעירה קדימה בלי הקשתת גב!",
      cues: [
        "1/3 כריעה על ברך שמאל (על כרית/מזרון), רגל ימין קדימה ב־90°.",
        "2/3 כווץ את הישבן השמאלי וסובב אגן לאחור — תרגיש מתיחה מיידית בקדמת הירך!",
        "3/3 הרם יד שמאל למעלה והחזק 30 שנ׳ בנשימה עמוקה (0 הקשתה במותן)."
      ],
      cameras: CAM_STAND,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.56, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:RightUpLeg": [-1.52, 0, 0],
          "mixamorig:RightLeg": [1.52, 0, 0],
          "mixamorig:LeftUpLeg": [0.12, 0, 0],
          "mixamorig:LeftLeg": [1.48, 0, 0],
          "mixamorig:LeftArm": [0, 0, 1.48]
        }),
        [0, 0.54, 0.10],
        mergeBones(BASE_STAND, {
          "mixamorig:RightUpLeg": [-1.62, 0, 0],
          "mixamorig:RightLeg": [1.62, 0, 0],
          "mixamorig:LeftUpLeg": [0.30, 0, 0],
          "mixamorig:LeftLeg": [1.32, 0, 0],
          "mixamorig:LeftArm": [0, 0, 1.52]
        }),
        true
      )
    },

    // 41. WALL ANGELS
    wall_angels: {
      title: "מלאכי קיר לפתיחת כתפיים (Wall Angels)",
      periodMs: 3800,
      prop: "wall_back",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.13,
      staticCue: "דגש: מותן וצלעות צמודות לקיר, גב כפות הידיים מחליקות מעלה ומטה לאורך הקיר",
      cues: [
        "1/3 עמוד עם גב לקיר, ברכיים מעט כפופות וגב תחתון לחוץ לקיר.",
        "2/3 הצמד מרפקים וגב כפות ידיים לקיר והחלק לאט למעלה (צורת Y).",
        "3/3 החלק חזרה למטה (צורת W) מבלי שהצלעות יתנתקו מהקיר."
      ],
      cameras: CAM_STAND,
      defaultAngle: "front",
      keyframes: loopKF(
        [0, 0.96, -0.08],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, 0, -0.15],
          "mixamorig:LeftForeArm": [0, 0, 1.55],
          "mixamorig:RightArm": [0, 0, 0.15],
          "mixamorig:RightForeArm": [0, 0, -1.55],
          "mixamorig:LeftUpLeg": [-0.24, 0, 0],
          "mixamorig:LeftLeg": [0.24, 0, 0],
          "mixamorig:RightUpLeg": [-0.24, 0, 0],
          "mixamorig:RightLeg": [0.24, 0, 0]
        }),
        [0, 0.96, -0.08],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, 0, 1.15],
          "mixamorig:LeftForeArm": [0, 0, 0.25],
          "mixamorig:RightArm": [0, 0, -1.15],
          "mixamorig:RightForeArm": [0, 0, -0.25],
          "mixamorig:LeftUpLeg": [-0.24, 0, 0],
          "mixamorig:LeftLeg": [0.24, 0, 0],
          "mixamorig:RightUpLeg": [-0.24, 0, 0],
          "mixamorig:RightLeg": [0.24, 0, 0]
        }),
        false
      )
    },

    // 42. CAT-CAMEL
    cat_camel: {
      title: "חתול-גמל עדין (Cat-Camel)",
      periodMs: 4000,
      prop: "mat",
      targetBone: "mixamorig:Spine1",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.12,
      staticCue: "דגש: תנועתיות עדינה וחלקה של החוליות בלי לדחוף לקצה כאב",
      cues: [
        "1/3 עמידת 6 רגועה — ידיים מתחת לכתפיים וברכיים מתחת לאגן.",
        "2/3 נשוף ועגל את הגב בעדינות כלפי התקרה (חתול) תוך הורדת ראש.",
        "3/3 שאף ורד בעדינות לקשת קלה ונוחה בלבד — ללא צביטה במותן."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.545, -0.18],
        mergeBones(BASE_ALL_FOURS, {
          "mixamorig:Spine": [0.26, 0, 0],
          "mixamorig:Spine1": [0.28, 0, 0],
          "mixamorig:Spine2": [0.22, 0, 0],
          "mixamorig:Neck": [0.25, 0, 0]
        }),
        [0, 0.545, -0.18],
        mergeBones(BASE_ALL_FOURS, {
          "mixamorig:Spine": [-0.14, 0, 0],
          "mixamorig:Spine1": [-0.16, 0, 0],
          "mixamorig:Spine2": [-0.14, 0, 0],
          "mixamorig:Neck": [-0.42, 0, 0]
        }),
        false
      )
    },

    // 43. PALLOF PRESS
    pallof: {
      title: "לחיצת פאלוף נגד סיבוב (Pallof Press)",
      periodMs: 3200,
      prop: "wall_side",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.06, 0.06],
      targetRadius: 0.12,
      staticCue: "דגש: הושטת ידיים ישר קדימה ממרכז החזה תוך התנגדות מוחלטת למשיכה הצידית",
      cues: [
        "1/3 עמוד הצידה לנקודת עגינה (גומייה/מגבת בדלת), ברכיים רכות ואגן נעול.",
        "2/3 נשוף ולחץ את הידיים ישר קדימה ממרכז החזה — 0 סיבוב בכתפיים!",
        "3/3 עצור 2 שנ׳ בקצה, החזר לחזה והחלף צד."
      ],
      cameras: CAM_STAND,
      defaultAngle: "front",
      keyframes: loopKF(
        [0, 0.96, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, -0.65, -0.85],
          "mixamorig:LeftForeArm": [0, -1.65, 0],
          "mixamorig:RightArm": [0, 0.65, 0.85],
          "mixamorig:RightForeArm": [0, 1.65, 0],
          "mixamorig:LeftUpLeg": [-0.20, 0, -0.08],
          "mixamorig:LeftLeg": [0.22, 0, 0],
          "mixamorig:RightUpLeg": [-0.20, 0, 0.08],
          "mixamorig:RightLeg": [0.22, 0, 0]
        }),
        [0, 0.96, 0],
        mergeBones(BASE_STAND, {
          "mixamorig:LeftArm": [0, -1.52, -0.18],
          "mixamorig:LeftForeArm": [0, -0.15, 0],
          "mixamorig:RightArm": [0, 1.52, 0.18],
          "mixamorig:RightForeArm": [0, 0.15, 0],
          "mixamorig:LeftUpLeg": [-0.20, 0, -0.08],
          "mixamorig:LeftLeg": [0.22, 0, 0],
          "mixamorig:RightUpLeg": [-0.20, 0, 0.08],
          "mixamorig:RightLeg": [0.22, 0, 0]
        }),
        true
      )
    },

    // 44. INCHWORM
    inchworm: {
      title: "הליכת זחל לפלאנק (Inchworm)",
      periodMs: 4200,
      prop: "mat",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.12,
      staticCue: "דגש: ירידה למתיחת המסטרינגס, צעידה עם הידיים לפלאנק יציב וחזרה בשליטה",
      cues: [
        "1/3 מעמידה — התכופף והנח ידיים על המזרון (אפשר ברכיים רכות).",
        "2/3 צעד קדימה עם הידיים עד למנח פלאנק ישר ויציב (עצירה 2 שנ׳).",
        "3/3 צעד חזרה עם הידיים אל הרגליים ועלה לאט לעמידה."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "side",
      keyframes: loopKF(
        [0, 0.88, -0.35],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [1.85, 0, 0],
          "mixamorig:LeftArm": [0, -0.35, 1.25],
          "mixamorig:RightArm": [0, 0.35, -1.25],
          "mixamorig:LeftUpLeg": [-1.80, 0, 0],
          "mixamorig:LeftLeg": [0.18, 0, 0],
          "mixamorig:RightUpLeg": [-1.80, 0, 0],
          "mixamorig:RightLeg": [0.18, 0, 0]
        }),
        [0, 0.43, 0.02],
        BASE_PRONE_PLANK,
        true
      )
    },

    // 45. STAIRS CLIMB (OFFICE SNACK)
    stairs: {
      title: "עלייה במדרגות (חטיף תנועה ואירובי)",
      periodMs: 1800,
      prop: "stairs_prop",
      targetBone: "mixamorig:RightUpLeg",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.13,
      staticCue: "דגש: כף רגל מלאה על המדרגה, דחיפה דרך הישבן והעקב, גו זקוף וקצב נמרץ",
      cues: [
        "1/3 הנח כף רגל מלאה על המדרגה ודחוף למעלה דרך הישבן והעקב.",
        "2/3 שמור על גב זקוף ותנועת ידיים טבעית להזרמת דם למוח ולרגליים.",
        "3/3 מעולה כחטיף תנועה של 90 שניות בין משימות בעבודה."
      ],
      cameras: CAM_HIGH,
      defaultAngle: "angle45",
      keyframes: loopKF(
        [0, 1.06, 0.02],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0.16, 0, 0],
          "mixamorig:LeftArm": [0, -0.65, -1.15],
          "mixamorig:LeftForeArm": [0, -1.10, 0],
          "mixamorig:RightArm": [0, 0.45, 1.15],
          "mixamorig:RightForeArm": [0, 0.90, 0],
          "mixamorig:RightUpLeg": [-1.10, 0, 0],
          "mixamorig:RightLeg": [1.15, 0, 0],
          "mixamorig:LeftUpLeg": [0.22, 0, 0],
          "mixamorig:LeftLeg": [0.18, 0, 0]
        }),
        [0, 1.16, 0.24],
        mergeBones(BASE_STAND, {
          "mixamorig:Hips": [0.16, 0, 0],
          "mixamorig:LeftArm": [0, 0.45, -1.15],
          "mixamorig:LeftForeArm": [0, -0.90, 0],
          "mixamorig:RightArm": [0, -0.65, 1.15],
          "mixamorig:RightForeArm": [0, 1.10, 0],
          "mixamorig:LeftUpLeg": [-1.10, 0, 0],
          "mixamorig:LeftLeg": [1.15, 0, 0],
          "mixamorig:RightUpLeg": [0.22, 0, 0],
          "mixamorig:RightLeg": [0.18, 0, 0]
        }),
        false
      )
    },

    // 46. FREESTYLE SWIMMING
    swim: {
      title: "שחייה חתירה (30 דק׳ שבועיות)",
      periodMs: 2400,
      prop: "water_pool",
      targetBone: "mixamorig:Spine2",
      targetOffset: [0, 0.06, 0],
      targetRadius: 0.14,
      staticCue: "דגש: הארכת גוף אופקית במים, גריפה חלקה ורגועה, עבודת רגליים קלה לשחרור הגב",
      cues: [
        "1/3 שמור על גוף ארוך ומאוזן במים, מבט למטה (צוואר ניטרלי).",
        "2/3 שלח יד רחוק קדימה וגרוף לאחור בתנועה חלקה עם גלגול כתפיים קל.",
        "3/3 עבודת רגליים קלה מהירך — מושלם להורדת עומס מעמוד השדרה."
      ],
      cameras: CAM_FLOOR,
      defaultAngle: "angle45",
      keyframes: loopKF(
        [0, 0.40, 0],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [1.57, 0.12, 0],
          "mixamorig:LeftArm": [0, 0.10, 1.48],
          "mixamorig:RightArm": [0, 0.25, 1.32],
          "mixamorig:LeftUpLeg": [0.18, 0, 0],
          "mixamorig:RightUpLeg": [-0.18, 0, 0],
          "mixamorig:LeftFoot": [0.55, 0, 0],
          "mixamorig:RightFoot": [0.55, 0, 0]
        }),
        [0, 0.40, 0],
        mergeBones(BASE_PRONE_PLANK, {
          "mixamorig:Hips": [1.57, -0.12, 0],
          "mixamorig:LeftArm": [0, -0.25, -1.32],
          "mixamorig:RightArm": [0, -0.10, -1.48],
          "mixamorig:LeftUpLeg": [-0.18, 0, 0],
          "mixamorig:RightUpLeg": [0.18, 0, 0],
          "mixamorig:LeftFoot": [0.55, 0, 0],
          "mixamorig:RightFoot": [0.55, 0, 0]
        }),
        false
      )
    }
  };

  window.AtlasStudio3D.registerExercises(CATALOG);
})();
