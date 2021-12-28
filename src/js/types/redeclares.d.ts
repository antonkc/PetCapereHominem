// This file is necesary.
// Enables usage of ES6 modules in the client files with type hints

declare module 'https://*'

declare module 'https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js' {
	export * from 'firebase/app'
}

declare module 'https://www.gstatic.com/firebasejs/9.1.1/firebase-analytics.js' {
	export * from 'firebase/analytics'
}

declare module 'https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js' {
	export * from 'firebase/auth'
}

declare module "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js" {
	export * from "firebase/firestore"
}