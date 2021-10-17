import BaseComponent, { componentUpdateArgs } from "./BaseComponent";
import type DataCenter from "../js/DataCenter";
import type PetCap from "../js/PetCap";

// This is an example component
type CookieQuestionArgs = {}
class CookieQuestion extends BaseComponent{
	static _componentName = "CookieQuestion"

	rootTemplate: HTMLTemplateElement;
	switchTemplate: HTMLTemplateElement;

	static cookies = [
		{ id: "functional", readonly: true},
		{ id: "preferences", readonly: false},
		{ id: "analytics", readonly: false},
		{ id: "adverisement", readonly: false}
	];

	async _build() {
		let petCap = (this.dataCenter.shared.PetCap as PetCap);

		this.root.innerHTML = "";
		petCap.loadRes("Common").then((res: any)=> {
			let clone = this.rootTemplate.content.cloneNode(true);
			let elemDiv = clone.firstChild as HTMLElement;
			let form = elemDiv.querySelector("#cookieForm");
			elemDiv.querySelector("#title").textContent = res["cookie_title"];
			elemDiv.querySelector("#cookieExpl").textContent = res["cookie_expl"];


			CookieQuestion.cookies.forEach( (elem) => {
				let switchClone = this.switchTemplate.content.cloneNode(true);
				let switchDiv = switchClone.firstChild as HTMLElement;
				let inputElem = switchDiv.querySelector("input");
				inputElem.id = elem.id;
				if(elem.readonly){
					inputElem.readOnly = true;
				}
				switchDiv.querySelector("#cookieType").textContent = res[ "cookie_"+ elem.id];

				form.appendChild(switchClone);
			});

			let btnSelection = elemDiv.querySelector("#agreeSelection");
			btnSelection.textContent = res[ "cookie_agree"];
			btnSelection.addEventListener("click", (ev) => {
				let elems = elemDiv.querySelectorAll("input");
				elems.forEach( elem => {
					(petCap.userPreferences.cookies as any)[elem.id] = elem.checked;
				});

				petCap.dataCenter.emmit("cookiePrefs",true);
				ev.preventDefault();
			});

			let btnAll = elemDiv.querySelector("#agreeAll");
			btnAll.textContent = res[ "cookie_agree_all"];
			btnAll.addEventListener("click", (ev) => {
				petCap.userPreferences.cookies.adverisement= true;
				petCap.userPreferences.cookies.analytics= true;
				petCap.userPreferences.cookies.functional= true;
				petCap.userPreferences.cookies.preferences= true;
				petCap.dataCenter.emmit("cookiePrefs",true);
				ev.preventDefault();
			});

			this.root.appendChild(clone);
		}).catch( (err: any) => {
			console.error("Could not load resources for CookieQuestion", err);
		});
	}

	constructor(root: HTMLElement, params: CookieQuestionArgs, templatesArea: HTMLElement, dataCenter: DataCenter) {
		super(root, params, templatesArea, dataCenter);
		this.root = root;
		this.templatesArea = templatesArea;
		this.rootTemplate = this.templatesArea.querySelector("#CookieQuestion");
		this.switchTemplate = this.templatesArea.querySelector("#CookieSelector");
		this._build();
	}
	
	update: (params: componentUpdateArgs) => CookieQuestion = (params) => {
		if(params.type = "reload"){
			this._build();
		}
		return this;
	};
}

export default CookieQuestion;