const staticDevCoffee = "" // TODO: Name
const assets = [
	"/",
	"/index.html",
	"/css/main.css",
	"/js/app.js",
]

self.addEventListener("install", installEvent => {
	installEvent.waitUntil(
		caches.open(staticDevCoffee).then(cache => {
			cache.addAll(assets)
		})
	)
})