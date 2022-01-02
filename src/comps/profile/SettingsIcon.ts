import type { FirebaseApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import type DataCenter from "../../js/DataCenter.js";
import type PetCap from "../../js/PetCap.js";
import type { componentUpdateArgs } from "../BaseComponent.js";
import { employTemplate } from "../../js/common/utils.js";
import BaseFireAuthComponent from "../BaseFireAuthComponent.js";
import g from "../../js/common/Consts.js";


// This is an example component
type SettingsIconArgs = { };
class SettingsIcon extends BaseFireAuthComponent<SettingsIconArgs>{
	static componentName = "SettingsIcon"
	defaultAvatarTemplate : HTMLTemplateElement;
	rootTemplate: HTMLTemplateElement;

	protected async build() {
		employTemplate(this.rootTemplate, this.root);
		await this.authUpdated();
	}

	protected override async authUpdated(){
		const avatarContainerElem = this.root.querySelector("#avatarContainer") as HTMLSpanElement;
		const res = await this.petCap.loadRes("common");
		if(this.isLogged && this.isAnonymous === false) {
			const user = this.auth.currentUser;

			if(user.photoURL){
				avatarContainerElem.innerHTML = "";
				let imgElem = document.createElement("img");
				imgElem.id = "avatar";
				imgElem.classList.add("profile", "photo");
				imgElem.src = user.photoURL;
				avatarContainerElem.appendChild(imgElem);
			}
			else {
				employTemplate(this.defaultAvatarTemplate, avatarContainerElem);
			}
		}
		else {
			employTemplate(this.defaultAvatarTemplate, avatarContainerElem);
		}
	}

	constructor(root: HTMLElement, params: SettingsIconArgs, templatesArea: HTMLElement, dataCenter: DataCenter) {
		super(root, params, templatesArea, dataCenter);
		this.petCap = (this.dataCenter.shared.petCap as PetCap);
		const app = this.dataCenter.shared.fireApp as FirebaseApp;

		this.rootTemplate = this.templatesArea.querySelector("#SettingsIcon");
		this.defaultAvatarTemplate = this.templatesArea.querySelector("#GenericUserImage");
		this.isLogged = false;
		this.isAnonymous = true;
		this.build();
	}

	async update(params: componentUpdateArgs<SettingsIconArgs>){
		if(params.type === "reload"){
			this.build();
		}

		return this;
	}
}

export default SettingsIcon;

export type { SettingsIconArgs };