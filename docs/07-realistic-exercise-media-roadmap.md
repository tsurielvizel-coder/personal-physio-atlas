# 07. מפת דרכים הנדסית: הדמיה ריאליסטית של גבר אמיתי ברמת אפליקציית Google Play

מטרת מסמך זה היא להגדיר במדויק כיצד לשדרג את מנוע הוויזואליזציה הנוכחי ([tracker/animator.js](../tracker/animator.js) — SVG אנטומי 2.5D) להדמיה **ריאליסטית ברמת חנות אפליקציות מסחרית** (כמו *Home Workout*, *Freeletics*, *MuscleWiki* או *Fitbod*), שבה רואים **גבר אתלטי אמיתי (בצילום אמיתי או בדמות סטודיו 3D ריאליסטית)** מדגים כל אחד מ־51 התרגילים בזמן אמת — תוך שמירה על מהירות גבוהה בטלפון ועבודה מלאה ב־GitHub Pages.

---

## 1. התפקיד האמיתי של ספריות Python בפרויקט כזה

חשוב להבחין בין **זמן הרצה בדפדפן (Runtime)** לבין **זמן בניית מדיה אופליין (Offline Asset Pipeline)**:

1. **GitHub Pages מריץ קוד צד־לקוח בלבד (HTML / CSS / JS):** אי־אפשר להריץ בו שרת Python (כמו Flask/FastAPI). אמנם קיימים פתרונות Pyodide/PyScript בדפדפן, אך הם דורשים הורדה של 10–30MB זמן טעינה מיותר ולא מייצרים גרפיקה של אדם אמיתי.
2. **ספריות שרטוט ב־Python (`matplotlib`, `pygame`, `manim`, `OpenCV` שרטוט 2D):** מצוינות לגרפים ולדיאגרמות, אך בסופו של דבר הן עדיין ייראו כמו איור וקטורי/קווים — לא כמו גבר אמיתי או אפליקציה מלוטשת ב־Google Play.
3. **איפה Python כן נותן כוח־על?** בתור **צינור ייצור ואופטימיזציה של קובצי מדיה (Offline Pipeline)** שמכין פעם אחת את כל 51 הקבצים ושומר אותם כנכסים סטטיים קלילים בתיקיית המדיה של האתר:
   - **`Blender Python API (bpy)`** — סקריפט Python שמריץ את Blender ב־headless mode, מלביש דמות גבר אתלטית תלת־ממדית עם הצללות סטודיו, תאורה מקצועית והדגשת קבוצת שריר אדומה־זוהרת, ומייצא 51 סרטוני לופ קצרים ואחידים.
   - **`requests` + `Pillow` + `ffmpeg-python`** — משיכת תמונות שלבי־ביצוע של מתאמנים אמיתיים ממאגרי קוד פתוח (למשל `yuhonas/free-exercise-db` ברישיון Unlicense / נחלת הכלל), חיתוך יחס אחיד, העלמת רקע (`rembg`), והמרה ל־WebP / MP4 H.264 קלילים.
   - **`MediaPipe Pose` / `SMPL-X` + `pyrender`** — הפקת מיקום שלד 3D מסרטוני ייחוס ורינדור גוף 3D אנטומי אחיד מתוך שלד אמיתי.

---

## 2. השוואת 4 הגישות המובילות למראה "Google Play"

| גישה | איך זה נראה בפועל | משקל לדפדפן (51 תרגילים) | רלוונטיות ל־Python | התאמה למצב המאמן (`0.7x/1x/1.3x` והשהיה) | יתרונות וחסרונות |
|---|---|---|---|---|---|
| **א. רנדור סטודיו 3D דרך Blender + Python (`bpy`) → לופי MP4 / WebP** *(סטייל Home Workout / MuscleWiki)* | גבר שרירי בתאורת סטודיו כהה נקייה, שריר מטרה מואר, לופ חלק לחלוטין | ~150–250KB לתרגיל (~8–12MB סה"כ, נטען בעצלנות לפי צורך) | **מלאה** (אוטומציה ב־Python + `ffmpeg`) | **מצוינת:** שליטה ישירה על `video.playbackRate`, עצירה מיידית, ו־`poster` לטעינה בשבריר שנייה | מראה אחיד ומסחרי בכל 51 התרגילים כולל מתקדמים (`pseudo_planche`, `dragon/hollow`, `copenhagen`, `one_arm_incline`); דורש קובצי אנימציה (FBX/BVH מ־Mixamo או תנוחות מפתח) |
| **ב. מאגר צילומי אדם אמיתי (`free-exercise-db` Unlicense) + `Pillow`/`ffmpeg`** | צילומים אמיתיים של מתאמן (2 פריימים/קרוס־פייד חלק או קליפ אמיתי) + השלמת סטודיו לתרגילי נישה | ~60–140KB לתרגיל (~4–7MB סה"כ) | **מלאה** (הורדה, חיתוך והמרות ב־Python) | **טובה:** 2–3 פריימים בתנועה מתמשכת + `poster` מיידי, פחות חלק מווידאו 30fps | דמות אנושית אמיתית ב־100%; לא לכל 51 התרגילים שלנו יש התאמה מדויקת במאגר ציבורי אחד ולכן נדרשת השלמה |
| **ג. תלת־ממד חי בדפדפן (`Three.js` / `<model-viewer>` + Mixamo GLB)** | דמות גבר תלת־ממדית אינטראקטיבית שאפשר **לסובב ב־360° באצבע** | מודל גבר יחיד (~3MB) + 51 קובצי תנועה שלד (~20KB כ"א = ~1MB) | חלקית (המרות GLB/אופטימיזציה) | **גבוהה מאוד:** שליטה מתמטית מלאה בזמן, זווית, מהירות ועצירה | הכי אינטראקטיבי ומרשים בטכנולוגיה; פתיחה ראשונה של כרטיס מרובה שלבים דורשת ניהול Canvas יחיד / טעינה חכמה כדי לא להעמיס על מעבד חלש בסלולרי |
| **ד. וידאו AI של מאמן גבר אמיתי אחיד → דחיסה ב־Python (`ffmpeg`)** | סרטון פוטוריאליסטי של מאמן בחדר ביתי מואר על מזרן | ~200–300KB לתרגיל (~10–15MB סה"כ) | **מלאה** (דחיסה, חיתוך ולופים ב־Python) | **מצוינת:** `playbackRate` ו־`pause()` טבעיים | הכי דומה ל"גל מאמן כושר"; נדרשת הקפדה על עקביות דמות ועל דיוק ביומכני (שבמצב תחתון הידיים מתחת לטוסיק, מותן צמודה וכו') |

**המלצה הנדסית מובילה:** שילוב היברידי של **שכבת נגן מדיה אחידה (`<video>` H.264 / WebP + קדימון `poster`)** המנוהלת מאחורי הממשק הקיים של `window.AtlasAnimator`. כך אפשר להתחיל מ־**Blender Studio 3D Loops** או **צילומים/סרטונים אמיתיים מעובדים ב־Python**, ולשדרג תרגיל־אחר־תרגיל בלי לשבור אף מסך באפליקציה.

---

## 3. ארכיטקטורה מומלצת ללא שבירת קוד קיים (`Zero-Breakage Contract`)

### א. החוזה של `window.AtlasAnimator` (אסור לשנות חתימות)

הלוגיקה ב־[tracker/app.js](../tracker/app.js) קוראת ל־`window.AtlasAnimator` במקומות הבאים:
- כרטיסי תרגיל ראשיים: `Animator.mount(thumb, ex.anim || "plank", { compact: true })`
- ניקוי תלושים בעת רענון: `Animator.clearDetached()`
- תצוגת חטיף תנועה יומי: `Animator.mount(preview, sn.anim || "hip_flexor", { compact: false })`
- כרטיסי עידוד/כללים: `Animator.mount(thumb, rule.anim || "plank", { compact: true })`
- מסך מאמן מודרך: `Animator.setPaused(false)` ו־`Animator.mount(canvas, ex.anim || "plank", { compact: false })`
- סגירת מאמן / Pause / Speed: `Animator.unmount(canvas)`, `Animator.isPaused()`, `Animator.setPaused(nextPaused)`, `Animator.setSpeed(mult)`

לכן שומרים בדיוק על אותם 6 מתודות ציבוריות:
1. `mount(containerEl, animKey, options)` (`options.compact === true` בכרטיסים קטנים, `false` במצב המאמן)
2. `unmount(containerEl)`
3. `clearDetached()`
4. `setSpeed(mult)` (`0.7`, `1.0`, `1.3` — במדיית וידאו מעדכן `videoEl.playbackRate = mult`)
5. `setPaused(paused)` (במדיית וידאו מפעיל `.pause()` / `.play()`)
6. `isPaused()`

### ב. שכבת מניפסט ונפילה בטוחה ל־SVG (`Graceful Fallback`)

מומלץ לבנות:
1. תיקיית נכסים: `tracker/assets/exercises/` עם קובץ לכל תרגיל (`<animKey>.mp4` / `<animKey>.webp` + `<animKey>.poster.webp`).
2. קובץ מניפסט טעינה כפול (לתמיכה גם ב־GitHub Pages וגם בפתיחת `file://` ללא שרת):
   - `tracker/assets/exercises/manifest.json`
   - `tracker/media-manifest.js` (`window.ATLAS_MEDIA_MANIFEST = { bird_dog: { type: "video", src: "...", poster: "...", license: "..." }, ... }`)
3. מודול `tracker/media-engine.js` (או שילוב ישיר בתוך `animator.js`):
   - אם `animKey` קיים במניפסט והקובץ נטען בהצלחה — מציג `<video autoplay loop muted playsinline preload="metadata" poster="...">` (עם חוויית טעינה חלקה ו־`object-fit: cover`).
   - במקרה של שגיאת טעינה או תרגיל שעדיין לא הופק לו וידאו — **נופל אוטומטית באפס מאמץ אל מנוע ה־SVG הקיים** של `animator.js`.

### ג. ביצועים בנייד (PWA / מובייל)

1. **`IntersectionObserver` לכרטיסים:** מריץ `.play()` רק כשכרטיס התרגיל גלוי על המסך ומעביר ל־`.pause()` כשהוא נגלל החוצה — חוסך סוללה ומונע תקיעות כשיש 10–15 כרטיסים פתוחים בו־זמנית.
2. **משקל קבצים קשיח:** יעד של עד `250KB` ללופ (`480px–720px`, ללא פס קול עם `-an` ב־`ffmpeg`), כדי שכל ה־51 יתאחסנו בקלות בגיטהאב ויטענו מיד ברשת סלולרית.
3. **`playsinline muted autoplay loop`:** חובה מלאה עבור iOS Safari ו־Android Chrome כדי שווידאו יתחיל לנגן אוטומטית בלי לפתוח נגן מסך מלא.

---

## 4. רשימת כל 51 מפתחות התרגילים (`animKey`) הדורשים הדמיה

מתוך [tracker/exercise-guides.js](../tracker/exercise-guides.js) ו־[data/stages.json](../data/stages.json):

### א. תרגילי הבסיס והשחייה (8 מפתחות)
`bird_dog`, `plank`, `cobra`, `dead_bug`, `side_plank`, `side_hip_raise`, `lying_leg_raise`, `swim`

### ב. 43 תרגילי השלבים, החיזוק, המוביליות וחטיפי התנועה
`diamond_pushup`, `decline_pushup`, `pseudo_planche`, `one_arm_incline`, `archer_pushup`, `pike_pushup`, `handstand`, `hspu`, `glute_bridge`, `sl_glute_bridge`, `split_squat`, `bulgarian`, `pistol`, `cossack`, `rdl`, `sl_rdl`, `row`, `pullup`, `hang`, `suitcase_carry`, `combo_carry`, `ruck_walk`, `sorensen`, `prone_ytw`, `lsit`, `hanging_raise`, `nordic`, `hip_flexor`, `wall_angels`, `cat_camel`, `stairs`, `bear_bird_dog`, `plank_taps`, `body_saw`, `side_plank_star`, `copenhagen`, `hollow_body`, `pushup`, `incline_pushup`, `dips`, `pallof`, `inchworm`, `squat`

---

## 5. צ'ק־ליסט איכות לפני העלאה של גרסת המדיה החדשה

1. הדגמה ברורה בזווית הנכונה לכל אחד מ־51 התרגילים (בפרט דיוק ב־`lying_leg_raise` עם ידיים מתחת לישבן, `pseudo_planche` עם אצבעות מופנות החוצה/אחורה והטיית כתפיים קדימה, `one_arm_incline` על ספה/שולחן, `ruck_walk` ו־`suitcase_carry` עם תיק גב ממולא בקבוקי מים).
2. עובד חלק הן בפתיחה ישירה מ־`file://` (ללא CORS error) והן ב־https://tsurielvizel-coder.github.io/personal-physio-atlas/tracker/.
3. מצב מאמן מודרך שומר על כפתורי השהייה, מהירות `0.7x / 1x / 1.3x`, טיימר מנוחה אוטומטי והדרכה טכנית מלאה מתחת לבמה.
4. אין תלות חיצונית שבורה או קבצים כבדים מדי ב־Git (ללא שגיאות `node --check`, תקינות קישורי Markdown, ודחיפה תקינה עם `git -c http.version=HTTP/1.1 push origin main`).
