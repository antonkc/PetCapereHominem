import type { FirebaseApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import type DataCenter from "../../js/DataCenter.js";
import type PetCap from "../../js/PetCap.js";
import type { componentUpdateArgs } from "../BaseComponent.js";
import { Auth, getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { employTemplate } from "../../js/common/utils.js";
import BaseFireAuthComponent from "../BaseFireAuthComponent.js";


// This is an example component
type SettingsIconArgs = { };
class SettingsIcon extends BaseFireAuthComponent<SettingsIconArgs>{
	static _componentName = "SettingsIcon"
	defaultAvatarTemplate : HTMLTemplateElement;
	rootTemplate: HTMLTemplateElement;

	protected async _update() {
		employTemplate(this.rootTemplate, this.root);
		await this._authUpdated();
	}

	protected async _authUpdated(){
		const avatarContainerElem = this.root.querySelector("#avatarContainer") as HTMLSpanElement;
		if(this.isLogged && this.isAnonymous === false) {
			const user = this.auth.currentUser;

			avatarContainerElem.innerHTML = "";
			if(user.photoURL){
				let imgElem = document.createElement("img");
				imgElem.id = "avatar";
				imgElem.classList.add("profile", "photo");
				imgElem.src = user.photoURL;
				avatarContainerElem.appendChild(imgElem);
			}
			else {
				avatarContainerElem.appendChild(this.defaultAvatarTemplate.content.cloneNode(true));
			}
		}
		else {
			const res = await this.petCap.loadRes("common");
			employTemplate(this.defaultAvatarTemplate, avatarContainerElem);
		}
	}

	constructor(root: HTMLElement, params: SettingsIconArgs, templatesArea: HTMLElement, dataCenter: DataCenter) {
		super(root, params, templatesArea, dataCenter);
		this.petCap = (this.dataCenter.shared.petCap as PetCap);
		const app = this.dataCenter.shared.fireApp as FirebaseApp;

		this.rootTemplate = this.templatesArea.querySelector("#ProfileIcon");
		this.defaultAvatarTemplate = this.templatesArea.querySelector("#genericUserImage");
		this.isLogged = false;
		this.isAnonymous = true;
		this._update();

		this.dataCenter.get("cookiePrefs", () => {
			if(this.petCap.userPrefs.allowedUsage.functional){
				this.auth  = getAuth(app);
				this.dataCenter.shared.auth = this.auth;

				const user = this.auth.currentUser;
				if (user !== null) {
					this.isLogged = true;
					this.isAnonymous = user.isAnonymous;
					this._authUpdated();
				}
				onAuthStateChanged(this.auth, (user) => {
					if (user) {
						this.isLogged = true
						this.isAnonymous = user.isAnonymous;
					} else {
						this.isLogged = false;
						this.isAnonymous = true;
					}
					this._authUpdated();
				});
			}
		}, true);
	}

	async update(params: componentUpdateArgs<SettingsIconArgs>){
		if(params.type === "reload"){
			this._update();
		}

		return this;
	}
}

export default SettingsIcon;

export type { SettingsIconArgs };