const CACHE_NAME = "yonaha-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./Images/logo.png",
    "./Images/login-bg.png",
    "./Images/default-avatar.png"
];

/* INSTALL */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => cache.addAll(FILES_TO_CACHE))

    );

});

/* FETCH */

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)

        .then(response => {

            return response || fetch(event.request);

        })

    );

});