import type DataCenter from "../../js/DataCenter.js";
import type { componentUpdateArgs } from "../BaseComponent.js";
import BaseFireAuthComponent from "../BaseFireAuthComponent.js";
import { employTemplate } from "../../js/common/utils.js";

type ProfileIconArgs = {};
class ProfileIcon extends BaseFireAuthComponent<ProfileIconArgs> {
	protected rootTemplate: HTMLTemplateElement;
	protected defaultAvatarTemplate : HTMLTemplateElement;

	protected override async authUpdated(){
		const userNameElem = this.root.querySelector("#userName") as HTMLSpanElement;
		const avatarContainerElem = this.root.querySelector("#avatarContainer") as HTMLSpanElement;
		if(this.isLogged && this.isAnonymous === false) {
			const user = this.auth.currentUser;
			userNameElem.textContent = user.displayName;

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
			let res = await this.petCap.loadRes("common");
			userNameElem.textContent = res["gest"];
			employTemplate(this.defaultAvatarTemplate, avatarContainerElem);
		}
	}

	protected build(){
		employTemplate(this.rootTemplate, this.root);
		this.authUpdated();
	}

	constructor(root: HTMLElement, params: {}, templatesArea: HTMLElement, dataCenter: DataCenter){
		super(root, params, templatesArea, dataCenter);
		this.rootTemplate = this.templatesArea.querySelector("#ProfileIcon");
		this.defaultAvatarTemplate = this.templatesArea.querySelector("#genericUserImage");
		this.build();
	}

	async update(params: componentUpdateArgs<ProfileIconArgs>) {
		if(params.type = "reload") {
			this.build();
		}
		return this;
	}
}

export default ProfileIcon;