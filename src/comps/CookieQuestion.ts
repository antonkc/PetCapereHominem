import type DataCenter from "../js/DataCenter.js";
import type PetCap from "../js/PetCap.js";
import BaseComponent, { componentUpdateArgs } from "./BaseComponent.js";


// This is an example component
type CookieQuestionArgs = {}
class CookieQuestion extends BaseComponent<CookieQuestionArgs>{
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
		let petCap = (this.dataCenter.shared.petCap as PetCap);

		this.root.innerHTML = "";
		petCap.loadRes("Common").then((res: any)=> {
			try {
				let clone = this.rootTemplate.content.cloneNode(true);
				this.root.appendChild(clone);
				let form = this.root.querySelector("#cookieForm");
				this.root.querySelector("#title").textContent = res["cookie_title"];
				this.root.querySelector("#cookieExpl").textContent = res["cookie_expl"];
	
	
				CookieQuestion.cookies.forEach( (elem) => {
					let switchClone = this.switchTemplate.content.cloneNode(true);
					let switchDiv = switchClone.firstChild as HTMLElement;
					let inputElem = switchDiv.querySelector("input") as HTMLInputElement;
					inputElem.id = "input"+ elem.id;
					inputElem.setAttribute("aria-describedby", elem.id);
					if(elem.readonly){
						inputElem.readOnly = true;
						inputElem.disabled = true;
					}
					let lblElem = switchDiv.querySelector("label") as HTMLLabelElement;
					lblElem.id = elem.id;
	
					switchDiv.querySelector("#"+ elem.id).textContent = res[ "cookie_"+ elem.id];
	
					form.appendChild(switchClone);
				});
	
				let btnSelection = this.root.querySelector("#agreeSelection");
				btnSelection.textContent = res[ "cookie_agree"];
				btnSelection.addEventListener("click", (ev) => {
					let elems = this.root.querySelectorAll("input");
					elems.forEach( elem => {
						(petCap.userPrefs.allowedUsage as any)[elem.id.replace("input","")] = elem.checked;
					});
	
					petCap.dataCenter.emmit("cookiePrefs",true);
					ev.preventDefault();
				});
	
				let btnAll = this.root.querySelector("#agreeAll");
				btnAll.textContent = res[ "cookie_agree_all"];
				btnAll.addEventListener("click", (ev) => {
					petCap.userPrefs.allowedUsage.adverisement= true;
					petCap.userPrefs.allowedUsage.analytics= true;
					petCap.userPrefs.allowedUsage.functional= true;
					petCap.userPrefs.allowedUsage.preferences= true;
					petCap.dataCenter.emmit("cookiePrefs",true);
					ev.preventDefault();
				});
	
				this.root.appendChild(clone);
			} catch (err: any) {
				console.error(err);
			}
		}).catch( (err: any) => {
			console.log("Could not load resources for CookieQuestion");
			console.error(err);
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
	
	async update(params: componentUpdateArgs<CookieQuestionArgs>) {
		if(params.type = "reload"){
			this._build();
		}
		return this;
	}
}

export default CookieQuestion;