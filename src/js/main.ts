import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-analytics.js";

import PetCap from "./PetCap.js";
import type { IUserPreferences } from "./types.js";

const petCap = new PetCap();

(function serviceWorkerInit(){
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', function() {
			navigator.serviceWorker.register('/serviceWorker.js').then(function(registration) {
				console.log('ServiceWorker registration successful with scope: ', registration.scope);
			}, function(err) {
				console.error('ServiceWorker registration failed: ', err);
			});
		});
	}
	else {
		console.warn("Browser does not support serviceWorker")
	}
})();
(function essentialLoad(){
	let essential: IUserPreferences = (()=>{
		let essentialStr = localStorage.getItem("essential");
		if(essentialStr !== null){
			return JSON.parse(essentialStr);
		} else {
			return petCap.essetial;
		}
	})();

	if(essential.allowedUsage.functional === false){
		let hoverPaner = (document.querySelector("#hoverPanel") as HTMLElement);
		petCap.loadComponent("CookieQuestion", hoverPaner, {});
		hoverPaner.style.display = "";
		petCap.dataCenter.get("cookiePrefs", ()=>{
			hoverPaner.style.display = "none";
			localStorage.setItem("essential", JSON.stringify(petCap.essetial));
		});
	}

	let toolRow = (document.querySelector("#toolRow") as HTMLElement);
	petCap.loadComponent("ProfileIcon", toolRow, {});

})();
(function firebaseInit(){
	const firebaseConfig = {
		apiKey: "AIzaSyDdy_c4fySNAxSb010ftlYW_t6QQ70KfII",
		authDomain: "petcaperehominem.firebaseapp.com",
		projectId: "petcaperehominem",
		storageBucket: "petcaperehominem.appspot.com",
		messagingSenderId: "621774205019",
		appId: "1:621774205019:web:088f726e0624f611298f7e",
		measurementId: "G-2R29MZX7JF"
	};

	const fireApp = initializeApp(firebaseConfig);
	petCap.dataCenter.shared.fireApp = fireApp;
	const auth = getAuth(fireApp);
	petCap.dataCenter.shared.auth = auth;

	petCap.dataCenter.get("cookiePrefs", ()=>{
		if( petCap.essetial.allowedUsage.analytics){
			const analytics = getAnalytics(fireApp);
			petCap.dataCenter.shared.analytics = analytics;
		}
	});
})();
(function navigationInit(){
	let elems = document.querySelectorAll('a[data-target]');
	petCap.loadRes("common","es-es").then((res) => {
		for (let i = 0; i < elems.length; i++) {
			const link = elems[i] as HTMLElement;
			const key = "nav_" + link.getAttribute("data-target");
			if( res[key]){
				link.setAttribute("alt", res[key]);
				link.innerText = (res[key]);
			}
		}
	}).catch((err) => {
		console.error(err);
	});

	const navState = petCap.appState;
	if(navState.view === undefined || navState.view === null) {
		petCap.loadView("home");
	}
	else {
		petCap.loadView(navState.view);
	}

	document.addEventListener("click", function navigationListener(ev){
		let target: HTMLElement = ev.target as HTMLElement;
		let dataTarget = target.getAttribute("data-target");
		if(target.tagName === "A" && dataTarget !== null) {
			ev.stopImmediatePropagation();
			ev.preventDefault();
			let hrefVal = {view: dataTarget};
			petCap.mergeState(hrefVal, target.getAttribute("alt"));
			petCap.loadView(dataTarget);
		}
	})
})();