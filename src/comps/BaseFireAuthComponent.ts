import type { FirebaseApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js"
import type DataCenter from "../js/DataCenter.js"
import type PetCap from "../js/PetCap.js"
import { Auth, getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js"
import BaseComponent, { componentUpdateArgs } from "./BaseComponent.js"

class BaseFireAuthComponent<T> extends BaseComponent<T> {
	protected root: HTMLElement
	protected templatesArea: HTMLElement
	protected dataCenter: DataCenter
	protected petCap: PetCap
	protected auth: Auth
	protected fireApp: FirebaseApp

	protected isLogged: Boolean;
	protected isAnonymous: Boolean;

	protected _authUpdated(): Promise<void> {
		return;
	};

	constructor(root: HTMLElement, params: T, templatesArea: HTMLElement, dataCenter: DataCenter){
		super(root, params, templatesArea, dataCenter);
		this.petCap = (this.dataCenter.shared.petCap as PetCap);
		this.fireApp = this.dataCenter.shared.fireApp as FirebaseApp;
		this.auth = null;

		const app: FirebaseApp = this.fireApp;

		this.isLogged = false;
		this.isAnonymous = true;
		this.dataCenter.get("cookiePrefs", () => {
			if(this.petCap.userPrefs.allowedUsage.functional){
				this.auth = null;
				if(this.dataCenter.shared.auth){
					this.auth = this.dataCenter.shared.auth;
				}
				else {
					this.auth = getAuth(app);
					this.auth.useDeviceLanguage();
					this.dataCenter.shared.auth = this.auth;
				}

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

	async update(params: componentUpdateArgs<T>): Promise<typeof this> {
		return this;
	}
}

export default BaseFireAuthComponent;