// Set the callback for the install step

var targetCache = [
    "./",
    "./config.json",
    "./dist/bundle.js",
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css",
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap-theme.min.css",
    "./service-worker.js"
];
self.addEventListener('install', function (event) {
    console.log('Service Worker installed');
    event.waitUntil(
        caches
        .open('v1::fundamentals')
        .then(function (cache) {
            console.log("Prefilling cache");
            cache.addAll(targetCache);
        })
        .then(function (e) {
        	console.log('Done filling cache');
        })
    );
});
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
            // Cache hit - return response
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});