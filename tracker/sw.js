const CACHE_NAME = "atlas-physio-offline-v2";
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./stages-data.js",
  "./animator.js",
  "./exercise-guides.js",
  "./music-player.js",
  "./cloud-sync.js",
  "./media-manifest.js",
  "./studio-3d.js",
  "./studio-3d-catalog.js",
  "./manifest.json",
  "./icon.svg",
  "./vendor/three.min.js",
  "./vendor/GLTFLoader.js",
  "./vendor/OrbitControls.js",
  "./vendor/xbot-model.js",
  "./assets/exercises/manifest.json",
  "./assets/exercises/bird_dog.poster.webp",
  "./assets/exercises/bear_bird_dog.poster.webp",
  "./assets/exercises/plank.poster.webp",
  "./assets/exercises/plank_taps.poster.webp",
  "./assets/exercises/body_saw.poster.webp",
  "./assets/exercises/cobra.poster.webp",
  "./assets/exercises/lying_leg_raise.poster.webp",
  "./assets/exercises/side_hip_raise.poster.webp",
  "./assets/exercises/side_plank.poster.webp",
  "./assets/exercises/side_plank_star.poster.webp",
  "./assets/exercises/copenhagen.poster.webp",
  "./assets/exercises/dead_bug.poster.webp",
  "./assets/exercises/hollow_body.poster.webp",
  "./assets/exercises/glute_bridge.poster.webp",
  "./assets/exercises/sl_glute_bridge.poster.webp",
  "./assets/exercises/pushup.poster.webp",
  "./assets/exercises/diamond_pushup.poster.webp",
  "./assets/exercises/decline_pushup.poster.webp",
  "./assets/exercises/pseudo_planche.poster.webp",
  "./assets/exercises/one_arm_incline.poster.webp",
  "./assets/exercises/incline_pushup.poster.webp",
  "./assets/exercises/pike_pushup.poster.webp",
  "./assets/exercises/archer_pushup.poster.webp",
  "./assets/exercises/handstand.poster.webp",
  "./assets/exercises/hspu.poster.webp",
  "./assets/exercises/row.poster.webp",
  "./assets/exercises/pullup.poster.webp",
  "./assets/exercises/hang.poster.webp",
  "./assets/exercises/squat.poster.webp",
  "./assets/exercises/split_squat.poster.webp",
  "./assets/exercises/bulgarian.poster.webp",
  "./assets/exercises/pistol.poster.webp",
  "./assets/exercises/cossack.poster.webp",
  "./assets/exercises/rdl.poster.webp",
  "./assets/exercises/sl_rdl.poster.webp",
  "./assets/exercises/nordic.poster.webp",
  "./assets/exercises/suitcase_carry.poster.webp",
  "./assets/exercises/combo_carry.poster.webp",
  "./assets/exercises/ruck_walk.poster.webp",
  "./assets/exercises/sorensen.poster.webp",
  "./assets/exercises/prone_ytw.poster.webp",
  "./assets/exercises/lsit.poster.webp",
  "./assets/exercises/dips.poster.webp",
  "./assets/exercises/hanging_raise.poster.webp",
  "./assets/exercises/hip_flexor.poster.webp",
  "./assets/exercises/wall_angels.poster.webp",
  "./assets/exercises/cat_camel.poster.webp",
  "./assets/exercises/pallof.poster.webp",
  "./assets/exercises/inchworm.poster.webp",
  "./assets/exercises/stairs.poster.webp",
  "./assets/exercises/swim.poster.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return res;
      });
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "ATLAS_CACHE_ALL") {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => {
        if (event.source) event.source.postMessage({ type: "ATLAS_CACHE_DONE" });
      })
    );
  }
});
