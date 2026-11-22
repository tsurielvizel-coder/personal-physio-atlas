(function () {
  "use strict";

  function decodeBase64ToArrayBuffer(b64) {
    const bin = atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function easeCos(t) {
    return 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, t)));
  }

  function sampleKeyframes(keyframes, phase) {
    const p = ((phase % 1) + 1) % 1;
    for (let i = 0; i < keyframes.length - 1; i++) {
      const a = keyframes[i];
      const b = keyframes[i + 1];
      if (p >= a.t && p <= b.t) {
        const span = b.t - a.t || 1;
        const k = easeCos((p - a.t) / span);
        return { a, b, k };
      }
    }
    return { a: keyframes[0], b: keyframes[0], k: 0 };
  }

  const EXERCISES = {
    bird_dog: {
      title: "סופרמן בעמידת 6 (Bird-Dog)",
      periodMs: 3800,
      prop: "mat",
      targetBone: "mixamorig:Hips",
      targetOffset: [0, 0.06, -0.03],
      targetRadius: 0.105,
      staticCue: "דגש: אגרוף קמוץ עם אגודל למעלה, עקב דוחף אחורה, מותן פלס בלי הקשתה",
      cues: [
        "1/4 עמידת 6 — ידיים מתחת לכתפיים, ברכיים מתחת לאגן, גב ישר ובטן אסופה.",
        "2/4 הושט יד קדימה באגרוף קמוץ (אגודל לתקרה) ודחוף עקב נגדי לאחור.",
        "3/4 עצירה יציבה 3–5 שנ׳ בקצה — מותן פלס, 0 הקשתה ו־0 סיבוב אגן.",
        "4/4 חזרה איטית למרכז בשליטה מלאה והחלפת צד."
      ],
      cameras: {
        side: { pos: [2.72, 0.68, -0.08], target: [0, 0.34, -0.08], fov: 35 },
        angle45: { pos: [2.10, 1.05, 1.72], target: [0, 0.33, -0.06], fov: 36 },
        front: { pos: [0.02, 0.66, 2.55], target: [0, 0.35, 0.0], fov: 36 },
        top: { pos: [0.02, 2.55, -0.06], target: [0, 0.32, -0.06], fov: 38 }
      },
      defaultAngle: "side",
      keyframes: [
        {
          t: 0.0,
          hipPos: [0, 0.545, -0.18],
          bones: {
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
            "mixamorig:RightHandIndex1": [0, 0, 0],
            "mixamorig:RightHandIndex2": [0, 0, 0],
            "mixamorig:RightHandIndex3": [0, 0, 0],
            "mixamorig:RightHandMiddle1": [0, 0, 0],
            "mixamorig:RightHandMiddle2": [0, 0, 0],
            "mixamorig:RightHandMiddle3": [0, 0, 0],
            "mixamorig:RightHandRing1": [0, 0, 0],
            "mixamorig:RightHandRing2": [0, 0, 0],
            "mixamorig:RightHandRing3": [0, 0, 0],
            "mixamorig:RightHandPinky1": [0, 0, 0],
            "mixamorig:RightHandPinky2": [0, 0, 0],
            "mixamorig:RightHandPinky3": [0, 0, 0],
            "mixamorig:RightHandThumb1": [0, 0, 0],
            "mixamorig:RightHandThumb2": [0, 0, 0],
            "mixamorig:RightHandThumb3": [0, 0, 0],
            "mixamorig:LeftUpLeg": [-1.49, 0, 0],
            "mixamorig:LeftLeg": [1.56, 0, 0],
            "mixamorig:LeftFoot": [0.35, 0, 0],
            "mixamorig:RightUpLeg": [-1.49, 0, 0],
            "mixamorig:RightLeg": [1.56, 0, 0],
            "mixamorig:RightFoot": [0.35, 0, 0]
          }
        },
        {
          t: 0.38,
          hipPos: [0, 0.545, -0.18],
          bones: {
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
            "mixamorig:RightShoulder": [0, 0, -0.18],
            "mixamorig:RightArm": [3.05, 0.04, -1.52],
            "mixamorig:RightForeArm": [0, 0, -0.05],
            "mixamorig:RightHand": [0, 0, 0],
            "mixamorig:RightHandIndex1": [0, 0, 1.45],
            "mixamorig:RightHandIndex2": [0, 0, 1.55],
            "mixamorig:RightHandIndex3": [0, 0, 1.25],
            "mixamorig:RightHandMiddle1": [0, 0, 1.45],
            "mixamorig:RightHandMiddle2": [0, 0, 1.55],
            "mixamorig:RightHandMiddle3": [0, 0, 1.25],
            "mixamorig:RightHandRing1": [0, 0, 1.45],
            "mixamorig:RightHandRing2": [0, 0, 1.55],
            "mixamorig:RightHandRing3": [0, 0, 1.25],
            "mixamorig:RightHandPinky1": [0, 0, 1.45],
            "mixamorig:RightHandPinky2": [0, 0, 1.55],
            "mixamorig:RightHandPinky3": [0, 0, 1.25],
            "mixamorig:RightHandThumb1": [0, -0.25, 0.25],
            "mixamorig:RightHandThumb2": [0, -0.35, 0.35],
            "mixamorig:RightHandThumb3": [0, -0.25, 0.25],
            "mixamorig:LeftUpLeg": [-0.02, 0, 0],
            "mixamorig:LeftLeg": [0.05, 0, 0],
            "mixamorig:LeftFoot": [-0.35, 0, 0],
            "mixamorig:RightUpLeg": [-1.49, 0, 0],
            "mixamorig:RightLeg": [1.56, 0, 0],
            "mixamorig:RightFoot": [0.35, 0, 0]
          }
        },
        {
          t: 0.62,
          hipPos: [0, 0.545, -0.18],
          bones: {
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
            "mixamorig:RightShoulder": [0, 0, -0.18],
            "mixamorig:RightArm": [3.05, 0.04, -1.52],
            "mixamorig:RightForeArm": [0, 0, -0.05],
            "mixamorig:RightHand": [0, 0, 0],
            "mixamorig:RightHandIndex1": [0, 0, 1.45],
            "mixamorig:RightHandIndex2": [0, 0, 1.55],
            "mixamorig:RightHandIndex3": [0, 0, 1.25],
            "mixamorig:RightHandMiddle1": [0, 0, 1.45],
            "mixamorig:RightHandMiddle2": [0, 0, 1.55],
            "mixamorig:RightHandMiddle3": [0, 0, 1.25],
            "mixamorig:RightHandRing1": [0, 0, 1.45],
            "mixamorig:RightHandRing2": [0, 0, 1.55],
            "mixamorig:RightHandRing3": [0, 0, 1.25],
            "mixamorig:RightHandPinky1": [0, 0, 1.45],
            "mixamorig:RightHandPinky2": [0, 0, 1.55],
            "mixamorig:RightHandPinky3": [0, 0, 1.25],
            "mixamorig:RightHandThumb1": [0, -0.25, 0.25],
            "mixamorig:RightHandThumb2": [0, -0.35, 0.35],
            "mixamorig:RightHandThumb3": [0, -0.25, 0.25],
            "mixamorig:LeftUpLeg": [-0.02, 0, 0],
            "mixamorig:LeftLeg": [0.05, 0, 0],
            "mixamorig:LeftFoot": [-0.35, 0, 0],
            "mixamorig:RightUpLeg": [-1.49, 0, 0],
            "mixamorig:RightLeg": [1.56, 0, 0],
            "mixamorig:RightFoot": [0.35, 0, 0]
          }
        },
        {
          t: 1.0,
          hipPos: [0, 0.545, -0.18],
          bones: {
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
            "mixamorig:RightHandIndex1": [0, 0, 0],
            "mixamorig:RightHandIndex2": [0, 0, 0],
            "mixamorig:RightHandIndex3": [0, 0, 0],
            "mixamorig:RightHandMiddle1": [0, 0, 0],
            "mixamorig:RightHandMiddle2": [0, 0, 0],
            "mixamorig:RightHandMiddle3": [0, 0, 0],
            "mixamorig:RightHandRing1": [0, 0, 0],
            "mixamorig:RightHandRing2": [0, 0, 0],
            "mixamorig:RightHandRing3": [0, 0, 0],
            "mixamorig:RightHandPinky1": [0, 0, 0],
            "mixamorig:RightHandPinky2": [0, 0, 0],
            "mixamorig:RightHandPinky3": [0, 0, 0],
            "mixamorig:RightHandThumb1": [0, 0, 0],
            "mixamorig:RightHandThumb2": [0, 0, 0],
            "mixamorig:RightHandThumb3": [0, 0, 0],
            "mixamorig:LeftUpLeg": [-1.49, 0, 0],
            "mixamorig:LeftLeg": [1.56, 0, 0],
            "mixamorig:LeftFoot": [0.35, 0, 0],
            "mixamorig:RightUpLeg": [-1.49, 0, 0],
            "mixamorig:RightLeg": [1.56, 0, 0],
            "mixamorig:RightFoot": [0.35, 0, 0]
          }
        }
      ]
    },

    lying_leg_raise: {
      title: "הרמות רגליים בשכיבה (ידיים מתחת לטוסיק)",
      periodMs: 3600,
      prop: "mat",
      targetBone: "mixamorig:Spine",
      targetOffset: [0, 0.05, 0.0],
      targetRadius: 0.10,
      staticCue: "דגש: שתי הידיים מתחת לטוסיק לתמיכה, מותן צמודה לידיים, רגליים עולות עד ~85°",
      cues: [
        "1/3 ידיים מתחת לטוסיק — מותן לחוצה בעדינות על כפות הידיים (סיבוב אגן קל לאחור).",
        "2/3 הרמת רגליים ישרות למעלה עד ~85° בשליטה מלאה ובלי תנופה.",
        "3/3 ירידה איטית ומבוקרת — עצור מעט גבוה יותר אם הגב התחתון מתחיל להתנתק."
      ],
      cameras: {
        side: { pos: [2.85, 0.78, 0.02], target: [0, 0.48, 0.02], fov: 38 },
        angle45: { pos: [2.25, 1.15, 1.92], target: [0, 0.45, 0.02], fov: 38 },
        front: { pos: [0.0, 0.86, 2.72], target: [0, 0.46, 0.02], fov: 38 },
        top: { pos: [0.02, 2.75, 0.02], target: [0, 0.35, 0.02], fov: 40 }
      },
      defaultAngle: "side",
      keyframes: [
        {
          t: 0.0,
          hipPos: [0, 0.132, -0.08],
          bones: {
            "mixamorig:Hips": [-1.57, 0, 0],
            "mixamorig:Spine": [0, 0, 0],
            "mixamorig:Spine1": [0, 0, 0],
            "mixamorig:Spine2": [0, 0, 0],
            "mixamorig:Neck": [-0.04, 0, 0],
            "mixamorig:Head": [-0.04, 0, 0],
            "mixamorig:LeftShoulder": [0, 0.12, -0.10],
            "mixamorig:LeftArm": [0.09, 0.18, -1.64],
            "mixamorig:LeftForeArm": [0.05, 0.10, -0.22],
            "mixamorig:LeftHand": [0, 0, 0],
            "mixamorig:RightShoulder": [0, -0.12, 0.10],
            "mixamorig:RightArm": [0.09, -0.18, 1.64],
            "mixamorig:RightForeArm": [0.05, -0.10, 0.22],
            "mixamorig:RightHand": [0, 0, 0],
            "mixamorig:LeftUpLeg": [-0.26, 0, 0.04],
            "mixamorig:LeftLeg": [0.04, 0, 0],
            "mixamorig:LeftFoot": [0.22, 0, 0],
            "mixamorig:RightUpLeg": [-0.26, 0, -0.04],
            "mixamorig:RightLeg": [0.04, 0, 0],
            "mixamorig:RightFoot": [0.22, 0, 0]
          }
        },
        {
          t: 0.45,
          hipPos: [0, 0.132, -0.08],
          bones: {
            "mixamorig:Hips": [-1.57, 0, 0],
            "mixamorig:Spine": [0, 0, 0],
            "mixamorig:Spine1": [0, 0, 0],
            "mixamorig:Spine2": [0, 0, 0],
            "mixamorig:Neck": [-0.04, 0, 0],
            "mixamorig:Head": [-0.04, 0, 0],
            "mixamorig:LeftShoulder": [0, 0.12, -0.10],
            "mixamorig:LeftArm": [0.09, 0.18, -1.64],
            "mixamorig:LeftForeArm": [0.05, 0.10, -0.22],
            "mixamorig:LeftHand": [0, 0, 0],
            "mixamorig:RightShoulder": [0, -0.12, 0.10],
            "mixamorig:RightArm": [0.09, -0.18, 1.64],
            "mixamorig:RightForeArm": [0.05, -0.10, 0.22],
            "mixamorig:RightHand": [0, 0, 0],
            "mixamorig:LeftUpLeg": [-1.48, 0, 0.04],
            "mixamorig:LeftLeg": [0.04, 0, 0],
            "mixamorig:LeftFoot": [0.22, 0, 0],
            "mixamorig:RightUpLeg": [-1.48, 0, -0.04],
            "mixamorig:RightLeg": [0.04, 0, 0],
            "mixamorig:RightFoot": [0.22, 0, 0]
          }
        },
        {
          t: 0.55,
          hipPos: [0, 0.132, -0.08],
          bones: {
            "mixamorig:Hips": [-1.57, 0, 0],
            "mixamorig:Spine": [0, 0, 0],
            "mixamorig:Spine1": [0, 0, 0],
            "mixamorig:Spine2": [0, 0, 0],
            "mixamorig:Neck": [-0.04, 0, 0],
            "mixamorig:Head": [-0.04, 0, 0],
            "mixamorig:LeftShoulder": [0, 0.12, -0.10],
            "mixamorig:LeftArm": [0.09, 0.18, -1.64],
            "mixamorig:LeftForeArm": [0.05, 0.10, -0.22],
            "mixamorig:LeftHand": [0, 0, 0],
            "mixamorig:RightShoulder": [0, -0.12, 0.10],
            "mixamorig:RightArm": [0.09, -0.18, 1.64],
            "mixamorig:RightForeArm": [0.05, -0.10, 0.22],
            "mixamorig:RightHand": [0, 0, 0],
            "mixamorig:LeftUpLeg": [-1.48, 0, 0.04],
            "mixamorig:LeftLeg": [0.04, 0, 0],
            "mixamorig:LeftFoot": [0.22, 0, 0],
            "mixamorig:RightUpLeg": [-1.48, 0, -0.04],
            "mixamorig:RightLeg": [0.04, 0, 0],
            "mixamorig:RightFoot": [0.22, 0, 0]
          }
        },
        {
          t: 1.0,
          hipPos: [0, 0.132, -0.08],
          bones: {
            "mixamorig:Hips": [-1.57, 0, 0],
            "mixamorig:Spine": [0, 0, 0],
            "mixamorig:Spine1": [0, 0, 0],
            "mixamorig:Spine2": [0, 0, 0],
            "mixamorig:Neck": [-0.04, 0, 0],
            "mixamorig:Head": [-0.04, 0, 0],
            "mixamorig:LeftShoulder": [0, 0.12, -0.10],
            "mixamorig:LeftArm": [0.09, 0.18, -1.64],
            "mixamorig:LeftForeArm": [0.05, 0.10, -0.22],
            "mixamorig:LeftHand": [0, 0, 0],
            "mixamorig:RightShoulder": [0, -0.12, 0.10],
            "mixamorig:RightArm": [0.09, -0.18, 1.64],
            "mixamorig:RightForeArm": [0.05, -0.10, 0.22],
            "mixamorig:RightHand": [0, 0, 0],
            "mixamorig:LeftUpLeg": [-0.26, 0, 0.04],
            "mixamorig:LeftLeg": [0.04, 0, 0],
            "mixamorig:LeftFoot": [0.22, 0, 0],
            "mixamorig:RightUpLeg": [-0.26, 0, -0.04],
            "mixamorig:RightLeg": [0.04, 0, 0],
            "mixamorig:RightFoot": [0.22, 0, 0]
          }
        }
      ]
    },

    diamond_pushup: {
      title: "שכיבות סמיכה יהלום (Diamond Push-Ups)",
      periodMs: 3000,
      prop: "mat",
      targetBone: "mixamorig:RightArm",
      targetOffset: [0, 0.0, 0.0],
      targetRadius: 0.11,
      staticCue: "דגש: אגודלים ואצבעות יוצרים משולש מתחת למרכז החזה, מרפקים ב-45°, גוף ישר",
      cues: [
        "1/3 ידיים צמודות בצורת יהלום/משולש בדיוק מתחת למרכז החזה; ישבן ובטן נעולים.",
        "2/3 ירידה מבוקרת עם מרפקים פונים ב־45° לאחור (לא החוצה) עד שמרכז החזה קרוב לידיים.",
        "3/3 דחיפה חזקה למעלה דרך הטרייספס ומרכז החזה בלי שקיעת מותן."
      ],
      cameras: {
        angle45: { pos: [1.95, 0.92, 1.72], target: [0, 0.28, 0.02], fov: 36 },
        side: { pos: [2.62, 0.56, 0.0], target: [0, 0.28, 0.0], fov: 35 },
        front: { pos: [0.02, 0.56, 2.38], target: [0, 0.28, 0.12], fov: 36 },
        top: { pos: [0.02, 2.45, 0.0], target: [0, 0.25, 0.0], fov: 38 }
      },
      defaultAngle: "angle45",
      keyframes: [
        // Top plank with narrow diamond hands under chest
        {
          t: 0.0,
          hipPos: [0, 0.42, -0.08],
          bones: {
            "mixamorig:Hips": [1.24, 0, 0],
            "mixamorig:Spine": [0.02, 0, 0],
            "mixamorig:Spine1": [0.02, 0, 0],
            "mixamorig:Spine2": [0.02, 0, 0],
            "mixamorig:Neck": [-0.28, 0, 0],
            "mixamorig:Head": [-0.12, 0, 0],
            "mixamorig:LeftShoulder": [0, -0.15, 0.05],
            "mixamorig:LeftArm": [0.15, -1.62, -0.25],
            "mixamorig:LeftForeArm": [0, -0.24, 0],
            "mixamorig:LeftHand": [0, 0.25, 1.30],
            "mixamorig:RightShoulder": [0, 0.15, -0.05],
            "mixamorig:RightArm": [0.15, 1.62, 0.25],
            "mixamorig:RightForeArm": [0, 0.24, 0],
            "mixamorig:RightHand": [0, -0.25, -1.30],
            "mixamorig:LeftUpLeg": [0.02, 0, -0.04],
            "mixamorig:LeftLeg": [0.03, 0, 0],
            "mixamorig:LeftFoot": [-0.72, 0, 0],
            "mixamorig:RightUpLeg": [0.02, 0, 0.04],
            "mixamorig:RightLeg": [0.03, 0, 0],
            "mixamorig:RightFoot": [-0.72, 0, 0]
          }
        },
        // Bottom position: chest close to diamond hands, elbows ~45 deg back
        {
          t: 0.48,
          hipPos: [0, 0.325, -0.08],
          bones: {
            "mixamorig:Hips": [1.36, 0, 0],
            "mixamorig:Spine": [0.02, 0, 0],
            "mixamorig:Spine1": [0.02, 0, 0],
            "mixamorig:Spine2": [0.02, 0, 0],
            "mixamorig:Neck": [-0.30, 0, 0],
            "mixamorig:Head": [-0.12, 0, 0],
            "mixamorig:LeftShoulder": [0, 0.04, 0.06],
            "mixamorig:LeftArm": [0.16, -0.88, -0.62],
            "mixamorig:LeftForeArm": [0.10, -1.35, -0.15],
            "mixamorig:LeftHand": [0, 0.30, 1.25],
            "mixamorig:RightShoulder": [0, -0.04, -0.06],
            "mixamorig:RightArm": [0.16, 0.88, 0.62],
            "mixamorig:RightForeArm": [0.10, 1.35, 0.15],
            "mixamorig:RightHand": [0, -0.30, -1.25],
            "mixamorig:LeftUpLeg": [0.02, 0, -0.04],
            "mixamorig:LeftLeg": [0.03, 0, 0],
            "mixamorig:LeftFoot": [-0.88, 0, 0],
            "mixamorig:RightUpLeg": [0.02, 0, 0.04],
            "mixamorig:RightLeg": [0.03, 0, 0],
            "mixamorig:RightFoot": [-0.88, 0, 0]
          }
        },
        // Return to top
        {
          t: 1.0,
          hipPos: [0, 0.42, -0.08],
          bones: {
            "mixamorig:Hips": [1.24, 0, 0],
            "mixamorig:Spine": [0.02, 0, 0],
            "mixamorig:Spine1": [0.02, 0, 0],
            "mixamorig:Spine2": [0.02, 0, 0],
            "mixamorig:Neck": [-0.28, 0, 0],
            "mixamorig:Head": [-0.12, 0, 0],
            "mixamorig:LeftShoulder": [0, -0.15, 0.05],
            "mixamorig:LeftArm": [0.15, -1.62, -0.25],
            "mixamorig:LeftForeArm": [0, -0.24, 0],
            "mixamorig:LeftHand": [0, 0.25, 1.30],
            "mixamorig:RightShoulder": [0, 0.15, -0.05],
            "mixamorig:RightArm": [0.15, 1.62, 0.25],
            "mixamorig:RightForeArm": [0, 0.24, 0],
            "mixamorig:RightHand": [0, -0.25, -1.30],
            "mixamorig:LeftUpLeg": [0.02, 0, -0.04],
            "mixamorig:LeftLeg": [0.03, 0, 0],
            "mixamorig:LeftFoot": [-0.72, 0, 0],
            "mixamorig:RightUpLeg": [0.02, 0, 0.04],
            "mixamorig:RightLeg": [0.03, 0, 0],
            "mixamorig:RightFoot": [-0.72, 0, 0]
          }
        }
      ]
    },

    bulgarian: {
      title: "בולגריאן ספליט סקוואט (רגל אחורית על ספה)",
      periodMs: 3400,
      prop: "sofa_back",
      targetBone: "mixamorig:RightUpLeg",
      targetOffset: [0, 0.06, -0.04],
      targetRadius: 0.13,
      staticCue: "דגש: רגל אחורית על שפת הספה, הטיה קלה של הגו (10°–15°), דחיפה מהעקב הקדמי",
      cues: [
        "1/3 הנח את גב כף הרגל האחורית על שפת הספה, והטה גו מעט קדימה (10°–15°) עם גב ישר.",
        "2/3 רד עמוק ומבוקר על הרגל הקדמית עד שהירך מקבילה לרצפה (מותח גם את הפסואס האחורי).",
        "3/3 דחוף בעוצמה דרך העקב הקדמי חזרה למעלה בלי קריסת ברך פנימה."
      ],
      cameras: {
        side: { pos: [2.85, 1.02, -0.05], target: [0, 0.78, -0.05], fov: 38 },
        angle45: { pos: [2.25, 1.25, 1.95], target: [0, 0.76, -0.05], fov: 38 },
        front: { pos: [0.0, 1.02, 2.75], target: [0, 0.78, 0.0], fov: 38 },
        top: { pos: [0.02, 3.05, 0.05], target: [0, 0.65, -0.05], fov: 40 }
      },
      defaultAngle: "side",
      keyframes: [
        // Top split stance with rear (left) foot on sofa behind
        {
          t: 0.0,
          hipPos: [0, 1.00, 0.16],
          bones: {
            "mixamorig:Hips": [0.16, 0, 0],
            "mixamorig:Spine": [0.02, 0, 0],
            "mixamorig:Spine1": [0.02, 0, 0],
            "mixamorig:Spine2": [0.02, 0, 0],
            "mixamorig:Neck": [-0.10, 0, 0],
            "mixamorig:Head": [-0.06, 0, 0],
            "mixamorig:LeftShoulder": [0, 0, -0.06],
            "mixamorig:LeftArm": [0, 0.18, -1.32],
            "mixamorig:LeftForeArm": [0, -0.45, 0],
            "mixamorig:RightShoulder": [0, 0, 0.06],
            "mixamorig:RightArm": [0, -0.18, 1.32],
            "mixamorig:RightForeArm": [0, 0.45, 0],
            "mixamorig:RightUpLeg": [-0.34, 0, 0],
            "mixamorig:RightLeg": [0.22, 0, 0],
            "mixamorig:RightFoot": [-0.04, 0, 0],
            "mixamorig:LeftUpLeg": [0.34, 0, 0],
            "mixamorig:LeftLeg": [0.80, 0, 0],
            "mixamorig:LeftFoot": [0.62, 0, 0]
          }
        },
        // Bottom deep lunge: front thigh parallel, rear foot rests cleanly on sofa top
        {
          t: 0.48,
          hipPos: [0, 0.72, 0.14],
          bones: {
            "mixamorig:Hips": [0.22, 0, 0],
            "mixamorig:Spine": [0.02, 0, 0],
            "mixamorig:Spine1": [0.02, 0, 0],
            "mixamorig:Spine2": [0.02, 0, 0],
            "mixamorig:Neck": [-0.14, 0, 0],
            "mixamorig:Head": [-0.08, 0, 0],
            "mixamorig:LeftShoulder": [0, 0, -0.06],
            "mixamorig:LeftArm": [0, 0.25, -1.25],
            "mixamorig:LeftForeArm": [0, -0.75, 0],
            "mixamorig:RightShoulder": [0, 0, 0.06],
            "mixamorig:RightArm": [0, -0.25, 1.25],
            "mixamorig:RightForeArm": [0, 0.75, 0],
            "mixamorig:RightUpLeg": [-1.32, 0, 0],
            "mixamorig:RightLeg": [1.34, 0, 0],
            "mixamorig:RightFoot": [-0.08, 0, 0],
            "mixamorig:LeftUpLeg": [0.36, 0, 0],
            "mixamorig:LeftLeg": [1.62, 0, 0],
            "mixamorig:LeftFoot": [0.58, 0, 0]
          }
        },
        // Return to top
        {
          t: 1.0,
          hipPos: [0, 1.00, 0.16],
          bones: {
            "mixamorig:Hips": [0.16, 0, 0],
            "mixamorig:Spine": [0.02, 0, 0],
            "mixamorig:Spine1": [0.02, 0, 0],
            "mixamorig:Spine2": [0.02, 0, 0],
            "mixamorig:Neck": [-0.10, 0, 0],
            "mixamorig:Head": [-0.06, 0, 0],
            "mixamorig:LeftShoulder": [0, 0, -0.06],
            "mixamorig:LeftArm": [0, 0.18, -1.32],
            "mixamorig:LeftForeArm": [0, -0.45, 0],
            "mixamorig:RightShoulder": [0, 0, 0.06],
            "mixamorig:RightArm": [0, -0.18, 1.32],
            "mixamorig:RightForeArm": [0, 0.45, 0],
            "mixamorig:RightUpLeg": [-0.34, 0, 0],
            "mixamorig:RightLeg": [0.22, 0, 0],
            "mixamorig:RightFoot": [-0.04, 0, 0],
            "mixamorig:LeftUpLeg": [0.34, 0, 0],
            "mixamorig:LeftLeg": [0.80, 0, 0],
            "mixamorig:LeftFoot": [0.62, 0, 0]
          }
        }
      ]
    },

    suitcase_carry: {
      title: "נשיאת מזוודה ביד אחת (Suitcase Carry)",
      periodMs: 2200,
      prop: "suitcase_pack",
      targetBone: "mixamorig:Spine",
      targetOffset: [0.10, 0.04, 0.0],
      targetRadius: 0.12,
      staticCue: "דגש: תיק מים ביד אחת בלבד, כתפיים פלס וציר עמוד שדרה זקוף לחלוטין (0 נטייה!)",
      cues: [
        "1/3 אחוז תיק גב עמוס בקבוקי מים ביד אחת בלבד; הזדקף למלוא הגובה וכתפיים פלס.",
        "2/3 לך צעדים מדודים בלי לנטות לצד התיק — הצד הנגדי (QL ואלכסונים) עובד לייצב את המותן.",
        "3/3 נשום רגוע והחלף יד בסוף הזמן לאיזון מלא בין ימין לשמאל."
      ],
      cameras: {
        front: { pos: [0.0, 1.02, 2.75], target: [0, 0.88, 0.0], fov: 38 },
        angle45: { pos: [1.95, 1.15, 2.05], target: [0, 0.88, 0.0], fov: 38 },
        side: { pos: [2.72, 1.02, 0.0], target: [0, 0.88, 0.0], fov: 38 },
        top: { pos: [0.02, 3.05, 0.08], target: [0, 0.88, 0.0], fov: 40 }
      },
      defaultAngle: "front",
      keyframes: [
        // Step 1: Left foot forward
        {
          t: 0.0,
          hipPos: [0, 0.99, 0],
          bones: {
            "mixamorig:Hips": [0, 0, 0],
            "mixamorig:Spine": [0, 0, 0],
            "mixamorig:Spine1": [0, 0, 0],
            "mixamorig:Spine2": [0, 0, 0],
            "mixamorig:Neck": [0, 0, 0],
            "mixamorig:Head": [0, 0, 0],
            "mixamorig:LeftShoulder": [0, 0, -0.05],
            "mixamorig:LeftArm": [0, 0.10, -1.32],
            "mixamorig:LeftForeArm": [0, -0.22, 0],
            "mixamorig:RightShoulder": [0, 0, 0.05],
            "mixamorig:RightArm": [0, 0.02, 1.38],
            "mixamorig:RightForeArm": [0, 0.05, 0],
            "mixamorig:RightHand": [0, 0, 0.15],
            "mixamorig:LeftUpLeg": [-0.30, 0, 0],
            "mixamorig:LeftLeg": [0.36, 0, 0],
            "mixamorig:LeftFoot": [-0.08, 0, 0],
            "mixamorig:RightUpLeg": [0.22, 0, 0],
            "mixamorig:RightLeg": [0.16, 0, 0],
            "mixamorig:RightFoot": [0.10, 0, 0]
          }
        },
        // Step 2: Right foot forward
        {
          t: 0.5,
          hipPos: [0, 0.99, 0],
          bones: {
            "mixamorig:Hips": [0, 0, 0],
            "mixamorig:Spine": [0, 0, 0],
            "mixamorig:Spine1": [0, 0, 0],
            "mixamorig:Spine2": [0, 0, 0],
            "mixamorig:Neck": [0, 0, 0],
            "mixamorig:Head": [0, 0, 0],
            "mixamorig:LeftShoulder": [0, 0, -0.05],
            "mixamorig:LeftArm": [0, -0.08, -1.32],
            "mixamorig:LeftForeArm": [0, -0.18, 0],
            "mixamorig:RightShoulder": [0, 0, 0.05],
            "mixamorig:RightArm": [0, 0.02, 1.38],
            "mixamorig:RightForeArm": [0, 0.05, 0],
            "mixamorig:RightHand": [0, 0, 0.15],
            "mixamorig:LeftUpLeg": [0.22, 0, 0],
            "mixamorig:LeftLeg": [0.16, 0, 0],
            "mixamorig:LeftFoot": [0.10, 0, 0],
            "mixamorig:RightUpLeg": [-0.30, 0, 0],
            "mixamorig:RightLeg": [0.36, 0, 0],
            "mixamorig:RightFoot": [-0.08, 0, 0]
          }
        },
        // Return to step 1
        {
          t: 1.0,
          hipPos: [0, 0.99, 0],
          bones: {
            "mixamorig:Hips": [0, 0, 0],
            "mixamorig:Spine": [0, 0, 0],
            "mixamorig:Spine1": [0, 0, 0],
            "mixamorig:Spine2": [0, 0, 0],
            "mixamorig:Neck": [0, 0, 0],
            "mixamorig:Head": [0, 0, 0],
            "mixamorig:LeftShoulder": [0, 0, -0.05],
            "mixamorig:LeftArm": [0, 0.10, -1.32],
            "mixamorig:LeftForeArm": [0, -0.22, 0],
            "mixamorig:RightShoulder": [0, 0, 0.05],
            "mixamorig:RightArm": [0, 0.02, 1.38],
            "mixamorig:RightForeArm": [0, 0.05, 0],
            "mixamorig:RightHand": [0, 0, 0.15],
            "mixamorig:LeftUpLeg": [-0.30, 0, 0],
            "mixamorig:LeftLeg": [0.36, 0, 0],
            "mixamorig:LeftFoot": [-0.08, 0, 0],
            "mixamorig:RightUpLeg": [0.22, 0, 0],
            "mixamorig:RightLeg": [0.16, 0, 0],
            "mixamorig:RightFoot": [0.10, 0, 0]
          }
        }
      ]
    }
  };

  let cachedBuffer = null;
  function getModelBuffer() {
    if (!cachedBuffer && window.ATLAS_XBOT_GLB_B64) {
      cachedBuffer = decodeBase64ToArrayBuffer(window.ATLAS_XBOT_GLB_B64);
    }
    return cachedBuffer;
  }

  function buildPropMeshes(THREE, scene, propType) {
    const props = {};
    if (propType === "mat") {
      const matGeo = new THREE.BoxGeometry(0.76, 0.018, 2.04);
      const matMat = new THREE.MeshStandardMaterial({ color: 0x09172b, roughness: 0.9, metalness: 0.04 });
      const mat = new THREE.Mesh(matGeo, matMat);
      mat.position.set(0, 0.009, 0.0);
      mat.receiveShadow = true;
      scene.add(mat);

      const borderGeo = new THREE.BoxGeometry(0.775, 0.004, 2.055);
      const borderMat = new THREE.MeshBasicMaterial({ color: 0x1a385c, transparent: true, opacity: 0.75 });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.set(0, 0.017, 0.0);
      scene.add(border);
    } else if (propType === "sofa_back") {
      const sofaGroup = new THREE.Group();
      const fabricMat = new THREE.MeshStandardMaterial({ color: 0x132036, roughness: 0.92, metalness: 0.02 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.05 });

      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.16, 0.56), fabricMat);
      seat.position.set(0, 0.32, -0.74);
      seat.castShadow = true;
      seat.receiveShadow = true;
      sofaGroup.add(seat);

      const back = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.44, 0.14), fabricMat);
      back.position.set(0, 0.58, -0.96);
      back.castShadow = true;
      sofaGroup.add(back);

      [[-0.50, -0.52], [0.50, -0.52], [-0.50, -0.94], [0.50, -0.94]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.06), woodMat);
        leg.position.set(lx, 0.12, lz);
        sofaGroup.add(leg);
      });
      scene.add(sofaGroup);
    } else if (propType === "suitcase_pack") {
      // Green vertical plumb line showing 0 lateral lean
      const lineMat = new THREE.LineDashedMaterial({ color: 0x22c55e, dashSize: 0.07, gapSize: 0.05, transparent: true, opacity: 0.78 });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(0, 1.92, 0)
      ]);
      const plumbLine = new THREE.Line(lineGeo, lineMat);
      plumbLine.computeLineDistances();
      scene.add(plumbLine);

      // Loaded water-bottle backpack held in right hand (offset slightly outward to clear thigh)
      const packGroup = new THREE.Group();
      const packMat = new THREE.MeshStandardMaterial({ color: 0x0f5132, roughness: 0.82, metalness: 0.06 });
      const pocketMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85, metalness: 0.05 });
      const strapMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.88, metalness: 0.05 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.36, 0.27), packMat);
      body.position.set(-0.085, -0.24, 0);
      body.castShadow = true;
      packGroup.add(body);
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.21), pocketMat);
      pocket.position.set(-0.18, -0.30, 0);
      packGroup.add(pocket);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 8, 16, Math.PI), strapMat);
      handle.position.set(-0.055, -0.05, 0);
      packGroup.add(handle);
      scene.add(packGroup);
      props.suitcasePack = packGroup;
    } else if (propType === "combo_bottles_pack") {
      // Green vertical plumb line
      const lineMat = new THREE.LineDashedMaterial({ color: 0x22c55e, dashSize: 0.07, gapSize: 0.05, transparent: true, opacity: 0.78 });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(0, 2.25, 0)
      ]);
      const plumbLine = new THREE.Line(lineGeo, lineMat);
      plumbLine.computeLineDistances();
      scene.add(plumbLine);

      // Right hand backpack
      const packGroup = new THREE.Group();
      const packMat = new THREE.MeshStandardMaterial({ color: 0x0f5132, roughness: 0.82, metalness: 0.06 });
      const strapMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.88, metalness: 0.05 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.36, 0.27), packMat);
      body.position.set(-0.085, -0.24, 0);
      body.castShadow = true;
      packGroup.add(body);
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 8, 16, Math.PI), strapMat);
      handle.position.set(-0.055, -0.05, 0);
      packGroup.add(handle);
      scene.add(packGroup);
      props.suitcasePack = packGroup;

      // Left hand overhead 1.5L water bottle
      const bottleGroup = new THREE.Group();
      const bottleMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.88 });
      const capMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 });
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.05, 0.27, 16), bottleMat);
      cyl.position.set(0, 0.13, 0);
      cyl.castShadow = true;
      bottleGroup.add(cyl);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.04, 12), capMat);
      cap.position.set(0, 0.28, 0);
      bottleGroup.add(cap);
      scene.add(bottleGroup);
      props.overheadBottle = bottleGroup;
    } else if (propType === "backpack_back") {
      // Loaded water-bottle backpack worn on back (attached to Spine2)
      const packGroup = new THREE.Group();
      const packMat = new THREE.MeshStandardMaterial({ color: 0x0f5132, roughness: 0.82, metalness: 0.06 });
      const pocketMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85, metalness: 0.05 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.42, 0.18), packMat);
      body.position.set(0, 0.04, -0.18);
      body.castShadow = true;
      packGroup.add(body);
      const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.05), pocketMat);
      pocket.position.set(0, -0.04, -0.28);
      packGroup.add(pocket);
      scene.add(packGroup);
      props.backPack = packGroup;
    } else if (propType === "sofa_front") {
      const mat = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.018, 2.04), new THREE.MeshStandardMaterial({ color: 0x09172b, roughness: 0.9 }));
      mat.position.set(0, 0.009, -0.15);
      mat.receiveShadow = true;
      scene.add(mat);
      const fabricMat = new THREE.MeshStandardMaterial({ color: 0x132036, roughness: 0.92, metalness: 0.02 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.05 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.16, 0.56), fabricMat);
      seat.position.set(0, 0.42, 0.72);
      seat.castShadow = true;
      seat.receiveShadow = true;
      scene.add(seat);
      [[-0.50, 0.50], [0.50, 0.50], [-0.50, 0.94], [0.50, 0.94]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.06), woodMat);
        leg.position.set(lx, 0.17, lz);
        scene.add(leg);
      });
    } else if (propType === "table_row") {
      const mat = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.018, 2.04), new THREE.MeshStandardMaterial({ color: 0x09172b, roughness: 0.9 }));
      mat.position.set(0, 0.009, 0.0);
      mat.receiveShadow = true;
      scene.add(mat);
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x26354d, roughness: 0.75, metalness: 0.08 });
      const top = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.05, 0.75), woodMat);
      top.position.set(0, 0.90, 0.18);
      top.castShadow = true;
      scene.add(top);
      [[-0.56, -0.14], [0.56, -0.14], [-0.56, 0.50], [0.56, 0.50]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.88, 0.055), woodMat);
        leg.position.set(lx, 0.44, lz);
        scene.add(leg);
      });
    } else if (propType === "chairs_dips") {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x24344d, roughness: 0.8, metalness: 0.06 });
      const seatMat = new THREE.MeshStandardMaterial({ color: 0x16253e, roughness: 0.88 });
      [-0.46, 0.46].forEach((cx) => {
        const g = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.05, 0.42), seatMat);
        seat.position.set(cx, 0.48, 0);
        g.add(seat);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.42), woodMat);
        back.position.set(cx + (cx > 0 ? 0.15 : -0.15), 0.72, 0);
        g.add(back);
        [[-0.14, -0.16], [0.14, -0.16], [-0.14, 0.16], [0.14, 0.16]].forEach(([lx, lz]) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.48, 0.04), woodMat);
          leg.position.set(cx + lx, 0.24, lz);
          g.add(leg);
        });
        scene.add(g);
      });
    } else if (propType === "pullup_bar") {
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.42, metalness: 0.65 });
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.35, 16), metalMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 2.20, 0.04);
      bar.castShadow = true;
      scene.add(bar);
      [-0.65, 0.65].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 2.28, 12), metalMat);
        post.position.set(px, 1.14, 0.04);
        scene.add(post);
      });
    } else if (propType === "wall_back") {
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x132036, roughness: 0.92, metalness: 0.02 });
      const wall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 0.08), wallMat);
      wall.position.set(0, 1.25, -0.26);
      wall.receiveShadow = true;
      scene.add(wall);
    } else if (propType === "wall_side") {
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x132036, roughness: 0.92 });
      const wall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 1.6), wallMat);
      wall.position.set(-0.95, 1.15, 0);
      scene.add(wall);
      const bandGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.91, 1.18, 0.02),
        new THREE.Vector3(0.0, 1.18, 0.42)
      ]);
      const band = new THREE.Line(bandGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8 }));
      scene.add(band);
      props.pallofBand = band;
    } else if (propType === "stairs_prop") {
      const stepMat = new THREE.MeshStandardMaterial({ color: 0x1a2a44, roughness: 0.88, metalness: 0.04 });
      for (let i = 0; i < 3; i++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.18, 0.34), stepMat);
        step.position.set(0, 0.09 + i * 0.18, 0.12 + i * 0.32);
        step.receiveShadow = true;
        step.castShadow = true;
        scene.add(step);
      }
    } else if (propType === "water_pool") {
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x0c4a6e,
        roughness: 0.18,
        metalness: 0.12,
        transparent: true,
        opacity: 0.42
      });
      const water = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.24, 3.0), waterMat);
      water.position.set(0, 0.26, 0);
      scene.add(water);
    }
    return props;
  }

  function createViewer(containerEl, exKey, options) {
    if (!window.THREE || !window.THREE.GLTFLoader) {
      throw new Error("Three.js or GLTFLoader is not loaded");
    }
    const THREE = window.THREE;
    const def = EXERCISES[exKey];
    if (!def) throw new Error("No 3D definition for " + exKey);
    const opts = options || {};
    const width = opts.width || containerEl.clientWidth || 420;
    const height = opts.height || containerEl.clientHeight || 260;
    const interactive = opts.interactive !== false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x09101d);
    scene.fog = new THREE.Fog(0x09101d, 4.0, 9.0);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.05, 30);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: Boolean(opts.preserveDrawingBuffer),
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(opts.pixelRatio || Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    containerEl.innerHTML = "";
    containerEl.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xcbd5e1, 0x0a101d, 0.45);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 0.86);
    keyLight.position.set(2.2, 3.6, 2.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 10;
    keyLight.shadow.camera.left = -1.8;
    keyLight.shadow.camera.right = 1.8;
    keyLight.shadow.camera.top = 1.8;
    keyLight.shadow.camera.bottom = -1.8;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.32);
    rimLight.position.set(-2.0, 1.8, -2.2);
    scene.add(rimLight);

    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x040812, roughness: 0.96, metalness: 0.02, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(6, 12, 0x0d1a30, 0x091324);
    grid.position.y = 0.001;
    scene.add(grid);

    const props = buildPropMeshes(THREE, scene, def.prop);

    const haloGeo = new THREE.SphereGeometry(def.targetRadius || 0.11, 24, 18);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);

    let controls = null;
    if (interactive && window.THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.minDistance = 1.15;
      controls.maxDistance = 4.2;
      controls.minPolarAngle = 0.04;
      controls.maxPolarAngle = Math.PI * 0.82;
    }

    const viewerState = {
      exKey,
      def,
      speed: Number(opts.speed) || 1.0,
      paused: Boolean(opts.paused),
      phase: typeof opts.initialPhase === "number" ? opts.initialPhase : 0.0,
      angle: opts.angle || def.defaultAngle || "side",
      disposed: false,
      ready: false,
      modelRoot: null,
      bones: {},
      rafId: null,
      lastTs: null,
      qA: new THREE.Quaternion(),
      qB: new THREE.Quaternion(),
      eA: new THREE.Euler(0, 0, 0, "ZYX"),
      eB: new THREE.Euler(0, 0, 0, "ZYX"),
      tempVec: new THREE.Vector3(),
      handVec: new THREE.Vector3()
    };

    function setAngle(angleName) {
      viewerState.angle = angleName;
      const camCfg = def.cameras[angleName] || def.cameras[def.defaultAngle] || def.cameras.side;
      camera.fov = camCfg.fov || 36;
      camera.position.set(camCfg.pos[0], camCfg.pos[1], camCfg.pos[2]);
      camera.updateProjectionMatrix();
      if (controls) {
        controls.target.set(camCfg.target[0], camCfg.target[1], camCfg.target[2]);
        controls.update();
      } else {
        camera.lookAt(camCfg.target[0], camCfg.target[1], camCfg.target[2]);
      }
    }
    setAngle(viewerState.angle);

    function applyPoseAtPhase(phase01) {
      if (!viewerState.ready) return;
      const { a, b, k } = sampleKeyframes(def.keyframes, phase01);
      const hips = viewerState.bones["mixamorig:Hips"];
      if (hips && a.hipPos && b.hipPos) {
        const hx = a.hipPos[0] + (b.hipPos[0] - a.hipPos[0]) * k;
        const hy = a.hipPos[1] + (b.hipPos[1] - a.hipPos[1]) * k;
        const hz = a.hipPos[2] + (b.hipPos[2] - a.hipPos[2]) * k;
        hips.position.set(hx * 100, hy * 100, hz * 100);
      }

      const boneNames = Object.keys(a.bones);
      for (let i = 0; i < boneNames.length; i++) {
        const bName = boneNames[i];
        const bone = viewerState.bones[bName];
        if (!bone) continue;
        const rA = a.bones[bName];
        const rB = b.bones[bName] || rA;
        viewerState.eA.set(rA[0], rA[1], rA[2], "ZYX");
        viewerState.eB.set(rB[0], rB[1], rB[2], "ZYX");
        viewerState.qA.setFromEuler(viewerState.eA);
        viewerState.qB.setFromEuler(viewerState.eB);
        bone.quaternion.slerpQuaternions(viewerState.qA, viewerState.qB, k);
      }

      viewerState.modelRoot.updateMatrixWorld(true);
      const targetBone = viewerState.bones[def.targetBone] || hips;
      if (targetBone) {
        targetBone.getWorldPosition(viewerState.tempVec);
        haloMesh.position.set(
          viewerState.tempVec.x + def.targetOffset[0],
          viewerState.tempVec.y + def.targetOffset[1],
          viewerState.tempVec.z + def.targetOffset[2]
        );
        haloMat.opacity = 0.14 + 0.08 * (0.5 - 0.5 * Math.cos(phase01 * Math.PI * 2));
      }

      if (props.suitcasePack && viewerState.bones["mixamorig:RightHand"]) {
        viewerState.bones["mixamorig:RightHand"].getWorldPosition(viewerState.handVec);
        props.suitcasePack.position.copy(viewerState.handVec);
      }
      if (props.overheadBottle && viewerState.bones["mixamorig:LeftHand"]) {
        viewerState.bones["mixamorig:LeftHand"].getWorldPosition(viewerState.handVec);
        props.overheadBottle.position.copy(viewerState.handVec);
      }
      if (props.backPack && viewerState.bones["mixamorig:Spine2"]) {
        viewerState.bones["mixamorig:Spine2"].getWorldPosition(viewerState.handVec);
        props.backPack.position.copy(viewerState.handVec);
        viewerState.bones["mixamorig:Spine2"].getWorldQuaternion(props.backPack.quaternion);
      }
      if (props.pallofBand && viewerState.bones["mixamorig:RightHand"]) {
        viewerState.bones["mixamorig:RightHand"].getWorldPosition(viewerState.handVec);
        const posArr = props.pallofBand.geometry.attributes.position.array;
        posArr[3] = viewerState.handVec.x;
        posArr[4] = viewerState.handVec.y;
        posArr[5] = viewerState.handVec.z;
        props.pallofBand.geometry.attributes.position.needsUpdate = true;
      }
    }

    function renderFrame() {
      if (viewerState.disposed) return;
      if (controls) controls.update();
      renderer.render(scene, camera);
    }

    function tick(ts) {
      if (viewerState.disposed) return;
      if (viewerState.lastTs === null) viewerState.lastTs = ts;
      const dt = Math.min(80, ts - viewerState.lastTs);
      viewerState.lastTs = ts;
      if (!viewerState.paused && viewerState.ready) {
        viewerState.phase = (viewerState.phase + (dt * viewerState.speed) / def.periodMs) % 1;
        applyPoseAtPhase(viewerState.phase);
      }
      renderFrame();
      viewerState.rafId = requestAnimationFrame(tick);
    }

    const readyPromise = new Promise((resolve, reject) => {
      const buf = getModelBuffer();
      if (!buf) {
        reject(new Error("Missing window.ATLAS_XBOT_GLB_B64"));
        return;
      }
      const loader = new THREE.GLTFLoader();
      loader.parse(
        buf,
        "",
        (gltf) => {
          if (viewerState.disposed) return;
          const root = gltf.scene;
          const shellMat = new THREE.MeshStandardMaterial({
            color: 0x9aa8bc,
            roughness: 0.66,
            metalness: 0.06
          });
          const jointMat = new THREE.MeshStandardMaterial({
            color: 0x10192b,
            roughness: 0.78,
            metalness: 0.08
          });

          root.traverse((obj) => {
            if (obj.isMesh) {
              obj.castShadow = true;
              obj.receiveShadow = true;
              obj.frustumCulled = false;
              const matName = (obj.material && obj.material.name) || "";
              obj.material = matName.includes("Joints") ? jointMat : shellMat;
            }
            if (obj.isBone) {
              viewerState.bones[obj.name] = obj;
              if (obj.name.startsWith("mixamorig") && !obj.name.includes(":")) {
                viewerState.bones["mixamorig:" + obj.name.slice("mixamorig".length)] = obj;
              }
            }
          });

          scene.add(root);
          viewerState.modelRoot = root;
          viewerState.ready = true;
          applyPoseAtPhase(viewerState.phase);
          renderFrame();
          if (!opts.manualRenderOnly) {
            viewerState.rafId = requestAnimationFrame(tick);
          }
          resolve();
        },
        (err) => reject(err)
      );
    });

    return {
      ready: readyPromise,
      setAngle(name) {
        setAngle(name);
        renderFrame();
      },
      setSpeed(mult) {
        viewerState.speed = Number(mult) || 1.0;
      },
      setPaused(p) {
        viewerState.paused = Boolean(p);
      },
      isPaused() {
        return viewerState.paused;
      },
      renderAtPhase(phase01) {
        viewerState.phase = phase01;
        applyPoseAtPhase(phase01);
        renderFrame();
      },
      resize(w, h) {
        if (viewerState.disposed || !w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        renderFrame();
      },
      dispose() {
        viewerState.disposed = true;
        if (viewerState.rafId) cancelAnimationFrame(viewerState.rafId);
        if (controls) controls.dispose();
        renderer.dispose();
        containerEl.innerHTML = "";
      }
    };
  }

  window.AtlasStudio3D = {
    exercises: EXERCISES,
    hasExercise(key) {
      return Object.prototype.hasOwnProperty.call(EXERCISES, key);
    },
    registerExercises(map) {
      if (!map || typeof map !== "object") return;
      Object.keys(map).forEach((k) => {
        EXERCISES[k] = map[k];
      });
    },
    createViewer
  };
})();
