import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-analytics.js";

import type { IComponentQueueElement, IComponentDefinition, IComponentHandlerElement, IViewDefinition, IViewContainer} from "./main.d.js";

// Core Goblal class definition
const PetCap = (function(){
	const urlParams : URLSearchParams = new URLSearchParams(window.location.search);

	class ComponentLoader {
		name: String;
		component: any;
		templateRoot: Element;
		_queue: Array< IComponentQueueElement>;
		handlers: Array< IComponentHandlerElement>;

		static templatesContainer: Element= document.querySelector("#templatesContainer");
		static componentsPath: string = window.location.origin + "/components/";

		constructor(name : string){
			this.name = name;
			this.component = null;
			this.templateRoot = null;
			this._queue = [];
			this.handlers = [];

			let js = (async () => {
				this.component = (await import(`${ComponentLoader.componentsPath}${name}.js`)).default;
			})();
			let html = (async () => {
				const res = await fetch(`${ComponentLoader.componentsPath}${name}.html`);
				if(res.ok) {
					let templates = await res.text();

					let templateRoot = document.createElement("div");
					templateRoot.setAttribute("data-component", name);
					templateRoot.innerHTML = templates;

					ComponentLoader.templatesContainer.appendChild(templateRoot);
					this.templateRoot = templateRoot;
					return templateRoot;
				}
				throw `{${name}} template html not retrieved`;
			})();
			
			Promise.all([js, html]).then( async () => {
				this._queue.forEach( (elem) => {
					this.handlers.push(new this.component(elem.root, elem.param, this.templateRoot));
				} );
				delete this._queue;
				this._queue = [];
			} );
		}

		_load(root: HTMLElement, param: any) {
			const component = new this.component(root, param,this.templateRoot);
			this.handlers.push(component);
		}

		load(root: HTMLElement, param: any){
			if(this.component !== null) {
				this._load(root, param)
			}
			else {
				this._queue.push({root:root,param:param});
			}
		}

		reset(){
			this.handlers = [];
			this._queue = [];
		}
	}

	const getView = (function(){
		const views : Promise<IViewContainer> = (async () => {
			const res = await fetch(`${window.location.origin}/views/views.json`)
			if(res.ok){
				return await res.json();
			}
			throw "could not retrieve views";
		})();

		return async (viewName : String) => {
			for (let i = 0; i < (await views).v.length; i++) {
				const view = (await views).v[i];
				if(view.name === viewName)
					return view;
			}
			throw `Could not find view "${viewName}"`;
		};
	})();
	
	class PetCap {
		static _counters: any = {};
		static _loaders: any = {};
		/** Use as readonly. For write operations use PetCap.setStateValue or PetCap.mergeState instead.
		 */
		static appState : any = (() => {
			const urlState = urlParams.get("appState");
			if(urlState !== null) {
				try{
					return JSON.parse(decodeURIComponent(urlState));
				}
				catch(er){
					console.error(er);
					return {};
				}
			}
			else {
				console.log("Null page state")
				return {};
			}
		})();

		public static userPreferences = {
			cookies: {
				functional: false,
				preferences: false,
				analytics: false
			},
			theme: "default",
			lang: "es-es",
		};

		public static getNextId: (prefix?: string) => string = (prefix = "_") => {
			if(PetCap._counters[prefix] === undefined)
			PetCap._counters[prefix] = 0;

			let id = prefix + PetCap._counters[prefix]++;
			return id;
		}
		public static loadView = async (viewName: string) => {
			delete PetCap._counters;
			PetCap._counters = {};
			Object.keys(PetCap._loaders).forEach( key => PetCap._loaders[key].reset());

			const viewObject = await getView(viewName);
			const layRes = await fetch(`${window.location.origin}/layouts/${viewObject.layout}.html`);
			if(layRes.ok){
				const layoutHtml = await layRes.text();
				const layoutDiv = document.getElementById("innerLayout");
				
				if(layoutDiv === null)
					throw "Could not find innerLayout";
				
				layoutDiv.innerHTML = layoutHtml;
				const zones = layoutDiv.querySelectorAll("[data-zone]");

				if(Array.isArray(viewObject.components)) {
					viewObject.components.forEach((comp: IComponentDefinition) => {
						if(this._loaders[comp.s] === undefined) {
							this._loaders[comp.s] = new ComponentLoader(comp.s);
						}
						let loader: ComponentLoader = this._loaders[comp.s];
						let foundMatchingZone = false;
						for (let i = 0; i < zones.length; i++) {
							const zone = zones[i];
							if(zone.getAttribute('data-zone') === comp.z) {
								foundMatchingZone = true;
								let componentRoot = document.createElement("div");
								componentRoot.setAttribute("data-title", comp.t);
								componentRoot.setAttribute("id", PetCap.getNextId("c"));
								componentRoot.classList.add("component");

								zone.appendChild(componentRoot);
								loader.load(componentRoot, comp.p);
								break;
							}
						}

						if(!foundMatchingZone) {
							console.error("No mathing zone for component [" + comp.t + "]; zone: "+ comp.z);
						}
					});
				}
				else {
					throw `Components is not defined for ${viewObject.name}`;
				}

				return {status: "loaded layout"};
			}
			throw "Unable to fetch layout";
		}
		public static loadRes: (name: string, lang?: string) => Promise<any> = async (name, lang = "es-es") => {
			const res = await fetch(`/assets/lang/${name}/${lang}.json`);
			if(res.ok){
				return await res.json();
			}
			throw new Error("Unable to fetch resources");
		}

		/** Should be used only for data that should be stored in history. Otherwise sessionStorage, localStorage and cookies must be used.
		 */
		public static setStateValue: (key: string, value: any, stateHistoryName: string) => any = (key: string, value: any, stateHistoryName: string) => {
			PetCap.appState[key] = value;
			urlParams.set("appState", encodeURIComponent(JSON.stringify(PetCap.appState)));
			window.history.pushState( PetCap.appState, stateHistoryName, window.location.origin + window.location.pathname + "?" + urlParams.toString() + window.location.hash);
		}

		/** Works the same as setStateValue, but can change multiple properties at the same time.
		 */
		public static mergeState: (toMergeObj: any, stateHistoryName: string) => any = (toMergeObj: any, stateHistoryName: string) => {
			let keys = Object.keys(toMergeObj);
			for (let i = 0; i < keys.length; i++) {
				PetCap.appState[keys[i]] = toMergeObj[keys[i]];
			}
			urlParams.set("appState", encodeURIComponent(JSON.stringify(PetCap.appState)));
			window.history.pushState( PetCap.appState, stateHistoryName, window.location.origin + window.location.pathname + "?" + urlParams.toString() + window.location.hash);
		}
	};

	return PetCap;
})();

(function pageInit(){
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
	})();
	(function navigationInit(){
		let elems = document.querySelectorAll('a[data-target]');
		PetCap.loadRes("common","es-es").then((res) => {
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
	
		const navState = PetCap.appState;
		if(navState.view === undefined || navState.view === null) {
			PetCap.loadView("home");
		}
		else {
			PetCap.loadView(navState.view);
		}
	
		document.addEventListener("click", (ev)=>{
			let target: HTMLElement = ev.target as HTMLElement;
			if(target.tagName === "A" && target.getAttribute("data-target") !== null) {
				let hrefVal = JSON.parse(target.getAttribute("href"));
				PetCap.mergeState(hrefVal, target.getAttribute("alt"));
				PetCap.loadView(target.getAttribute("data-target"));
				ev.preventDefault();
			}
		})
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
		const analytics = getAnalytics(fireApp);
	})();
})();