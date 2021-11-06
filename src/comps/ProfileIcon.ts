import type { FirebaseApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { Auth, getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import type DataCenter from "src/js/DataCenter";
import type PetCap from "src/js/PetCap";
import BaseComponent, { componentUpdateArgs } from "src/comps/BaseComponent.js";

class ProfileIcon extends BaseComponent {
	rootTemplate: HTMLTemplateElement;
	defaultAvatarTemplate : HTMLTemplateElement;
	isLogged: Boolean;
	isAnonymous: Boolean;
	auth: Auth;
	petCap: PetCap;

	async _updateDisplay(){
		const userNameElem = this.root.querySelector("#userName") as HTMLSpanElement;
		const avatarContainerElem = this.root.querySelector("#avatarContainer") as HTMLSpanElement;
		if(this.isLogged && this.isAnonymous === false) {
			const user = this.auth.currentUser;
			userNameElem.textContent = user.displayName;

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
			let res = await this.petCap.loadRes("common");
			userNameElem.textContent = res["gest"];
			avatarContainerElem.innerHTML = "";
			avatarContainerElem.appendChild(this.defaultAvatarTemplate.content.cloneNode(true));
		}
	}

	_build(){
		let clone = this.rootTemplate.content.cloneNode(true);
		let elem = clone.firstChild as HTMLLinkElement;
		this.root.appendChild(elem);
		this._updateDisplay();
	}

	constructor(root: HTMLElement, params: {}, templatesArea: HTMLElement, dataCenter: DataCenter){
		super(root, params, templatesArea, dataCenter);
		this.petCap = (this.dataCenter.shared.petCap as PetCap);
		const app = this.dataCenter.shared.fireApp as FirebaseApp;

		this.rootTemplate = this.templatesArea.querySelector("#ProfileIcon");
		this.defaultAvatarTemplate = this.templatesArea.querySelector("#genericUserImage");
		this.isLogged = false;
		this.isAnonymous = false;
		this._build();

		this.dataCenter.get("cookiePrefs", () => {
			if(this.petCap.userPrefs.allowedUsage.functional){
				this.auth  = getAuth(app);
				this.dataCenter.shared.auth = this.auth;

				const user = this.auth.currentUser;
				if (user !== null) {
					this.isLogged = true;
					this.isAnonymous = false;
					this._updateDisplay();
				}

				onAuthStateChanged(this.auth, (user) => {
					if (user) {
						this.isLogged = true
						if(user.isAnonymous) {
							this.isAnonymous = true;
						}
					} else {
						this.isLogged = false;
						this.isAnonymous = true;
					}
					this._updateDisplay();
				});
			}
		}, true);
	}

	update(params: componentUpdateArgs) {
		if(params.type = "reload") {
			this._build();
		}
		return this;
	}
}

export default ProfileIcon;