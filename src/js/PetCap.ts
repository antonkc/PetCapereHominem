import ComponentLoader from "./ComponentLoader.js";
import DataCenter from "./DataCenter.js";
import type { IComponentDefinition, IUserPreferences, IViewContainer } from "./types";

const urlParams : URLSearchParams = new URLSearchParams(window.location.search);
const dataCenter = new DataCenter();
ComponentLoader.dataCenter = dataCenter;

const getView = (function(){
	const views : Promise<IViewContainer> = (async () => {
		const res = await fetch(`${window.location.origin}/views/views.json`)
		if(res.ok){
			return await res.json();
		}
		throw "could not retrieve views";
	})();

	return async (viewName : String) => {
		let viewsData = (await views);
		for (let i = 0; i < viewsData.v.length; i++) {
			const view = viewsData.v[i];
			if(view.name === viewName)
				return view;
		}
		throw `Could not find view "${viewName}"`;
	};
})();

/**
 * Central class for PetCapereHominem web application, it is a singleton
 */
class PetCap {
	static singleton: PetCap = null;
	constructor(){
		if(PetCap.singleton !== null){
			return PetCap.singleton;
		}
		this.dataCenter = dataCenter;
		this.dataCenter.shared.petCap = this;
		PetCap.singleton = this;
	}

	_persistentLoaders: any = {};
	_counters: any = {}
	_loaders: any = {}
	dataCenter: DataCenter

	/** Use as readonly. For write operations use PetCap.setStateValue or PetCap.mergeState.
	 */
	appState : any = (() => {
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

	public userPrefs: IUserPreferences = {
		allowedUsage: {
			functional: false,
			preferences: false,
			analytics: false,
			adverisement: false
		},
		lang: "es-es",
		currency: "€"
	};

	public getNextId: (prefix?: string) => string = (prefix = "_") => {
		if(this._counters[prefix] === undefined)
		this._counters[prefix] = 0;

		let id = prefix + this._counters[prefix]++;
		return id;
	}
	public loadComponent = (componentName: string, root: HTMLElement, params: any, isOnlyJs?: Boolean) => {
		isOnlyJs = !!isOnlyJs;
		if(this._persistentLoaders[componentName] === undefined) {
			this._persistentLoaders[componentName] = new ComponentLoader(componentName, isOnlyJs);
		}

		(this._persistentLoaders[componentName] as ComponentLoader).load(root, params);
	}
	public loadView = async (viewName: string) => {
		delete this._counters;
		this._counters = {};
		Object.keys(this._loaders).forEach( key => this._loaders[key].reset());

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
							componentRoot.setAttribute("id", this.getNextId("c"));
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
	public loadRes: (name: string, lang?: string) => Promise<any> = async (name, lang = "es-es") => {
		const res = await fetch(`/assets/lang/${name}/${lang}.json`);
		if(res.ok){
			return await res.json();
		}
		throw new Error("Unable to fetch resources");
	}

	/** Should be used only for data that should be stored in history. Otherwise sessionStorage, localStorage and cookies must be used.
	 */
	public setStateValue: (key: string, value: any, stateHistoryName: string) => any = (key: string, value: any, stateHistoryName: string) => {
		this.appState[key] = value;
		urlParams.set("appState", encodeURIComponent(JSON.stringify(this.appState)));
		window.history.pushState( this.appState, stateHistoryName, window.location.origin + window.location.pathname + "?" + urlParams.toString() + window.location.hash);
	}

	/** Works the same as setStateValue, but can change multiple properties at the same time.
	 */
	public mergeState: (toMergeObj: any, stateHistoryName: string) => any = (toMergeObj: any, stateHistoryName: string) => {
		let keys = Object.keys(toMergeObj);
		for (let i = 0; i < keys.length; i++) {
			this.appState[keys[i]] = toMergeObj[keys[i]];
		}
		urlParams.set("appState", encodeURIComponent(JSON.stringify(this.appState)));
		window.history.pushState( this.appState, stateHistoryName, window.location.origin + window.location.pathname + "?" + urlParams.toString() + window.location.hash);
	}
};

export default PetCap;