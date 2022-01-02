import { FirebaseOptions, initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-analytics.js";
import { getFirestore, connectFirestoreEmulator, Firestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";

import type { IUserPreferences } from "./types/types.js";
import PetCap from "./PetCap.js";
import g from "./common/Consts.js";

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
		console.warn("Browser does not support serviceWorker");
	}
})();
(function essentialLoad(){
	let toolRow = (document.querySelector("#toolRow") as HTMLElement);
	petCap.loadComponent("global/ProfileIcon", toolRow, {});

	const userDataPreferencesName = "essential"
	let essential: IUserPreferences = (()=>{
		let essentialStr = localStorage.getItem(userDataPreferencesName);
		if(essentialStr !== null){
			return JSON.parse(essentialStr);
		} else {
			return petCap.userPrefs;
		}
	})();

	if(essential.allowedUsage.functional === false) {
		let hoverPaner = (document.querySelector("#hoverPanel") as HTMLElement);
		petCap.loadComponent("global/CookieQuestion", hoverPaner, {});
		hoverPaner.style.display = "";
		petCap.dataCenter.subscribe(g.cookieEventName, ()=>{
			hoverPaner.style.display = "none";
		}, true);
	}
	else {
		petCap.userPrefs = essential;
		petCap.dataCenter.emmit(g.cookieEventName, true);
	}
	petCap.dataCenter.subscribe(g.cookieEventName, ()=>{
		localStorage.setItem(userDataPreferencesName, JSON.stringify(petCap.userPrefs));
	});
})();
(function firebaseInit(){
	const firebaseConfig : FirebaseOptions = {
		apiKey: "AIzaSyDdy_c4fySNAxSb010ftlYW_t6QQ70KfII",
		appId: "1:621774205019:web:088f726e0624f611298f7e",
		authDomain: "petcaperehominem.firebaseapp.com",
		measurementId: "G-2R29MZX7JF",
		messagingSenderId: "621774205019",
		projectId: "petcaperehominem",
		storageBucket: "petcaperehominem.appspot.com",
	};

	const fireApp = initializeApp(firebaseConfig);
	petCap.dataCenter.shared.fireApp = fireApp;

	let fireStore : Firestore;
	if(window.location.hostname !== "localhost" ){
		fireStore = getFirestore(fireApp);
	}
	if(window.location.hostname === "localhost" ){
		fireStore = getFirestore(fireApp);
		connectFirestoreEmulator(fireStore, "localhost", 8080);
	}
	//enableIndexedDbPersistence(fireStore);
	petCap.dataCenter.shared.firestore = fireStore;

	petCap.dataCenter.get(g.cookieEventName, ()=>{
		if( petCap.userPrefs.allowedUsage.analytics){
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
				link.setAttribute("title", res[key]);
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
			ev.preventDefault();
			let hrefVal = {view: dataTarget};
			petCap.mergeState(hrefVal, target.getAttribute("alt"));
			petCap.loadView(dataTarget);
			return false;
		}
	})
})();