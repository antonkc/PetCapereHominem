const appName : string = "PetCapere"
const assets = [
	"/",
	"/index.html",
	"/css/main.css",
	"/js/main.js",
	"/layouts/column.html",
	"/views/views.json"
]

// If worker doesn't claim clients, then it won't work in first page, a fatal flaw for a one-page-apps
self.addEventListener('activate', () => (self as any).clients.claim());

self.addEventListener("install", (installEvent: any) => {
	installEvent.waitUntil(
		caches.open(appName).then(cache => {
			cache.addAll(assets)
		})
	)
});

self.addEventListener('fetch', function(event: any) {
	event.respondWith(
		caches.match(event.request)
		.then(function(response) {
			if (response) {
				return response;
			}
			var fetchRequest = event.request.clone();

			return fetch(fetchRequest).then(
				function(response) {
					if(!response || response.status !== 200 || response.type !== 'basic') {
						return response;
					}
					var responseToCache = response.clone();

					caches.open(appName)
						.then(function(cache) {
							cache.put(event.request, responseToCache);
						});

					return response;
				}
			);
		})
	);
});