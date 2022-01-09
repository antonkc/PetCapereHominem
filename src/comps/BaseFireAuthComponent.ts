import type { FirebaseApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import type DataCenter from "../js/DataCenter.js";
import type PetCap from "../js/PetCap.js";
import { Auth, getAuth, onAuthStateChanged, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import BaseComponent, { componentUpdateArgs } from "./BaseComponent.js";
import g from "../js/common/Consts.js";

class BaseFireAuthComponent<T> extends BaseComponent<T> {
	protected root: HTMLElement
	protected templatesArea: HTMLElement
	protected dataCenter: DataCenter
	protected petCap: PetCap
	protected auth: Auth
	protected fireApp: FirebaseApp

	protected isLogged: Boolean;
	protected isAnonymous: Boolean;

	protected authUpdated(): Promise<void> {
		return;
	};

	protected authDataUpdated(): Promise<void>{
		return;
	}

	constructor(root: HTMLElement, params: T, templatesArea: HTMLElement, dataCenter: DataCenter){
		super(root, params, templatesArea, dataCenter);
		this.petCap = this.dataCenter.shared.petCap;
		this.fireApp = this.dataCenter.shared.fireApp;
		this.auth = null;

		const app: FirebaseApp = this.fireApp;

		this.isLogged = false;
		this.isAnonymous = true;
		this.dataCenter.get(g.cookieEventName, () => {
			if(this.petCap.userPrefs.allowedUsage.functional){
				if(this.dataCenter.shared.auth){
					this.auth = this.dataCenter.shared.auth;
				}
				else {
					if(location.hostname !== "localhost"){
						this.auth = getAuth(app);
					}

					if(location.hostname === "localhost"){
						this.auth = getAuth();
						connectAuthEmulator(this.auth, "http://localhost:9099");
					}

					this.auth.useDeviceLanguage();
					this.dataCenter.shared.auth = this.auth;
				}

				const user = this.auth.currentUser;
				if (user !== null) {
					this.isLogged = true;
					this.isAnonymous = user.isAnonymous;
					this.authUpdated();
				}

				onAuthStateChanged(this.auth, (user) => {
					if (user) {
						this.isLogged = true
						this.isAnonymous = user.isAnonymous;
					} else {
						this.isLogged = false;
						this.isAnonymous = true;
					}
					this.authUpdated();
				});
			}
		}, true);
		this.dataCenter.subscribe(g.profileDataChangeEvent, () => {
			this.authDataUpdated();
		})

		if(this.dataCenter.shared.auth && this.dataCenter.shared.auth.currentUser){
			this.auth = this.dataCenter.shared.auth;
			this.isLogged = true;
			this.isAnonymous = this.dataCenter.shared.auth.currentUser.isAnonymous;
		}
	}

	async update(params: componentUpdateArgs<T>): Promise<typeof this> {
		return this;
	}
}

export default BaseFireAuthComponent;