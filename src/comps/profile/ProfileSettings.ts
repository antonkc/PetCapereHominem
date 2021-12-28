import type DataCenter from "../../js/DataCenter.js";
import type { componentUpdateArgs } from "../BaseComponent.js";
import type { Firestore } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile, updateEmail } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { employTemplate, fillPlaceholders, getLoader, populateWithIdSelector } from "../../js/common/utils.js";
import BaseFireAuthComponent from "../BaseFireAuthComponent.js";
import { getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";
import getFireStoreDB from "../../js/common/db.js";

type IValitationResult = {
	valid: Boolean,
	codes: Array<string>
};
enum MsgType {
	info,
	warning,
	error
}
type IProfileSettingsMessage = {
	baseCode: string,
	msgType: MsgType,
	placeHolderFillers: Array<string>
}
type ILoginInformation = {
	email: string,
	password: string
}
type IRegisterInformation = {
	email: string,
	name: string,
	password: string,
	password2: string
}

const templateNames = ["notLogged","loginForm","registerForm","logged","authDataDisplay","authDataForm","dbPublicDisplay","dbPublicForm","dbPrivateDisplay","dbPrivateForm","profileSettingsMessage"] as const;
type ProfileSettingsTemplates = typeof templateNames[number];

type ProfileSettingsArgs = { };
class ProfileSettings extends BaseFireAuthComponent<ProfileSettingsArgs>{
	protected _res: any;
	protected templates : {[tempalteName in ProfileSettingsTemplates ]: HTMLTemplateElement};
	protected keepLoginInfo: {email: string, password: string};
	protected firestore: Firestore;

	constructor(root: HTMLElement, params: ProfileSettingsArgs, templatesArea: HTMLElement, dataCenter: DataCenter) {
		super(root, params, templatesArea, dataCenter);
		this.petCap.loadRes("common").then((res) => {
			this._res = res;
			this.drawComponent();
		}).catch((reason) => {
			console.error(reason);
			this._res = {};
			this.drawComponent();
		});
		this.keepLoginInfo = {email: "", password: ""};
		(this.templates as any) = {};
		populateWithIdSelector(templateNames, this.templates, this.templatesArea);
		this.authUpdated();
	}
	public async update(params: componentUpdateArgs<ProfileSettingsArgs>) {
		if(params.type === "reload"){
			this.drawComponent();
		}

		return this;
	}
	protected override async authUpdated() {
		this.drawComponent();
	}

	protected async loginInAction(form: HTMLFormElement) {
		this.clearMessages();
		let values = this.getFormData<ILoginInformation>(form);
		let validation = this.validateLogIn(values);
		await this.authSignFlow( async () => {
			await signInWithEmailAndPassword(this.auth, values.email, values.password);
		}, validation);
	}
	protected async registerAction(form: HTMLFormElement) {
		this.clearMessages();
		let values = this.getFormData<IRegisterInformation>(form);
		let validation = this.validateLogIn(values);
		
		await this.authSignFlow( async () => {
			await createUserWithEmailAndPassword(this.auth, values.email, values.password);
			await updateProfile(this.auth.currentUser, {
				displayName: values.name
			});

			
		}, validation);
	}
	protected async updateAuthAction(form: HTMLFormElement) {
		this.clearMessages();
		let values = this.getFormData<IRegisterInformation>(form);
		let validation = this.validateAuthForm(values);
		
		await this.authSignFlow( async () => {
			await updateProfile(this.auth.currentUser, {
				displayName: values.name
			});
		}, validation);
	}
	protected async googleSignInAction() {
		this.clearMessages();
		await this.authSignFlow( async () => {
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(this.auth, provider);
		});
	}
	
	//#region validation
	protected validateLogIn(values: ILoginInformation): IValitationResult {
		let result: IValitationResult = {
			valid: true,
			codes: []
		};
		this.validatePass(result, values.password, null);
		this.validateMail(result, values.email);
		return result;
	}
	protected validateRegister(values: IRegisterInformation): IValitationResult {
		let result: IValitationResult = {
			valid: true,
			codes: []
		};
		this.validatePass(result, values.password, values.password2);
		this.validateMail(result, values.email);
		this.validateName(result, values.name);
		return result;
	}
	protected validateAuthForm(values: IRegisterInformation): IValitationResult {
		let result: IValitationResult = {
			valid: true,
			codes: []
		};
		this.validateName(result, values.name);
		return result;
	}
	protected validatePass(validation: IValitationResult, password: string, password2: string | null): IValitationResult {
		if(password2 !== null && password !== password2){
			validation.valid = false;
			validation.codes.push("err_passNotSame");
		}
		if(password.length < 9){
			validation.valid = false;
			validation.codes.push("err_passShort");
		}
		if((/[0-9]/).test(password) === false || (/[a-z]/).test(password) === false || (/[A-Z]/).test(password) === false ){
			validation.valid = false;
			validation.codes.push("err_passTooSimple");
		}

		return validation;
	}
	protected validateMail(validation: IValitationResult, email: string): IValitationResult {
		if(email.replace(/ \t\r\n/g,'') === ""){
			validation.valid = false;
			validation.codes.push("err_emailEmpty");
		}
		if((/^[a-z0-9\._-]+@[a-z0-9\._-]+.[a-z]+$/i).test(email)){
			validation.valid = false;
			validation.codes.push("err_emailBadFormat");
		}

		return validation;
	}
	protected validateName(validation: IValitationResult, name: string): IValitationResult {
		if(name.replace(/ \t\r\n/g,'') === ""){
			validation.valid = false;
			validation.codes.push("err_nameEmpty");
		}
		return validation;
	}
	//#endregion validation

	//#region drawBasic
	protected drawComponent(): void {
		if(this._res && this.auth){
			if(this.isLogged) this.drawLogged();
			else this.drawNotLogged();
		}
		else {
			this.root.innerHTML = "";
			this.root.appendChild(getLoader(10));
		}
	}
	protected drawMessages( resources: any, messages: Array<IProfileSettingsMessage>): void {
		let outputDiv = this.root.querySelector("#profileSettingsOutput") as HTMLElement;

		messages.forEach((msg) => {
			let text = msg.placeHolderFillers ?
				fillPlaceholders.bind(null, resources[msg.baseCode]).apply(null, msg.placeHolderFillers) :
				resources[msg.baseCode];
			let msgElem = employTemplate(this.templates.profileSettingsMessage, outputDiv, true);
			msgElem.textContent = text;
			switch (msg.msgType) {
				case MsgType.error:
					msgElem.classList.add("error")
					break;
				case MsgType.info:
					msgElem.classList.add("info")
					break;
				case MsgType.warning:
					msgElem.classList.add("warning")
					break;
			}
		});
	}
	protected clearMessages(): void {
		let outputDiv = this.root.querySelector("#profileSettingsOutput") as HTMLElement;
		outputDiv.innerHTML = "";
	}
	//#endregion drawBasic
	//#region drawLogged
	protected drawLogged(): void {
		employTemplate(this.templates.logged, this.root);
		this.root.querySelector("#compTitle").textContent = this.res("t_profile_data");
		this.root.querySelector('.loggedText').textContent = fillPlaceholders(this.res("loggedAs"), this.auth.currentUser.displayName);

		let logoutBtn = this.root.querySelector("#logOut") as HTMLButtonElement;
		logoutBtn.textContent = this.res("logout");
		logoutBtn.addEventListener("click", async (ev) => {
			ev.preventDefault();
			await this.auth.signOut();
			this.authUpdated();
		});

		this.drawAuthDataDisplay();
		this.drawPublicDataDisplay();
		this.drawPrivateDataDisplay();
	}
	protected drawAuthDataDisplay(): void {
		const display = employTemplate(this.templates.authDataDisplay, this.root.querySelector(".authInfo")) as HTMLElement;
		display.querySelector('#authDataDisplayTitle').textContent = this.res("t_profile_auth");

		display.querySelector('[for="name"]').textContent = this.res("name");
		display.querySelector('[for="email"]').textContent = this.res("email");

		display.querySelector("#name").textContent = this.auth.currentUser.displayName;
		display.querySelector("#email").textContent = this.auth.currentUser.email;

		const editBtn = display.querySelector("#editAuth") as HTMLButtonElement;
		editBtn.title = fillPlaceholders( this.res("editSomething"), this.res("t_profile_auth"));
		editBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawAuthDataForm();
		});
	}
	protected drawAuthDataForm(): void {
		const form = employTemplate<HTMLFormElement>(this.templates.authDataForm, this.root.querySelector(".authInfo"));
		form.addEventListener("submit", async (ev) => {
			ev.preventDefault();
			await this.updateAuthAction(form);
			this.drawAuthDataDisplay();
		});
		form.querySelector('#authDataFormTitle').textContent = this.res("t_profile_auth");

		form.querySelector('[for="name"]').textContent = this.res("name");
		form.querySelector('[for="email"]').textContent = this.res("email");
		(form.querySelector("#name") as HTMLInputElement).value = this.auth.currentUser.displayName;
		form.querySelector("#email").textContent = this.auth.currentUser.email;

		const cancelBtn = form.querySelector("#cancel") as HTMLButtonElement;
		cancelBtn.textContent = this.res("cancel");
		cancelBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawAuthDataDisplay();
		});

		(form.querySelector('[type="submit"]') as HTMLInputElement).value = this.res("submit");
	}
	protected drawPublicDataDisplay(): void {
		const display = employTemplate(this.templates.dbPublicDisplay, this.root.querySelector(".dbInfoPublic")) as HTMLElement;
		display.querySelector('#dbPublicDisplayTitle').textContent = this.res("t_profile_public");

		display.querySelector('[for="pbmail"]').textContent = this.res("dbField_pbMail");
		display.querySelector('[for="pbPhone"]').textContent = this.res("dbField_pbPhone");
		display.querySelector('[for="bio"]').textContent = this.res("dbField_bio");
		display.querySelector('[for="pbaddr"]').textContent = this.res("dbField_pb_addr");
		display.querySelector('[for="upDate"]').textContent = this.res("dbField_upDate");
		display.querySelector('[for="modDate"]').textContent = this.res("dbField_modDate");

		const editBtn = display.querySelector("#editPublic") as HTMLButtonElement;
		editBtn.title = fillPlaceholders( this.res("editSomething"), this.res("t_profile_public"));
		editBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawPublicDataForm();
		});
	}
	protected drawPublicDataForm(): void {
		const form = employTemplate<HTMLFormElement>(this.templates.dbPublicForm, this.root.querySelector(".dbInfoPublic"));
		form.addEventListener("submit", (ev) => {
			ev.preventDefault();
			// TODO: change data as needed
			this.drawPublicDataDisplay();
		});
		form.querySelector('#dbPublicFormTitle').textContent = this.res("t_profile_public");

		form.querySelector('[for="pbmail"]').textContent = this.res("dbField_pbMail");
		form.querySelector('[for="pbPhone"]').textContent = this.res("dbField_pbPhone");
		form.querySelector('[for="bio"]').textContent = this.res("dbField_bio");
		form.querySelector('[for="pbaddr"]').textContent = this.res("dbField_pb_addr");
		form.querySelector('[for="upDate"]').textContent = this.res("dbField_upDate");
		form.querySelector('[for="modDate"]').textContent = this.res("dbField_modDate");

		const cancelBtn = form.querySelector(".dbInfoPublic #cancel") as HTMLButtonElement;
		cancelBtn.textContent = this.res("cancel");
		cancelBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawPublicDataDisplay();
		});

		(form.querySelector('.dbInfoPublic [type="submit"]') as HTMLInputElement).value = this.res("submit");
	}
	protected drawPrivateDataDisplay(): void {
		const display = employTemplate(this.templates.dbPrivateDisplay, this.root.querySelector(".dbInfoPrivate")) as HTMLElement;
		display.querySelector('#dbPrivateDisplayTitle').textContent = this.res("t_profile_priv");

		display.querySelector('[for="addr"]').textContent = this.res("dbField_addr");
		display.querySelector('[for="subs"]').textContent = this.res("dbField_subs");
		
		const editBtn = display.querySelector("#editPriv") as HTMLButtonElement;
		editBtn.title = fillPlaceholders( this.res("editSomething"), this.res("t_profile_priv"));
		editBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawPrivateDataForm();
		});
	}
	protected drawPrivateDataForm(): void {
		const form = employTemplate<HTMLFormElement>(this.templates.dbPrivateForm, this.root.querySelector(".dbInfoPrivate"));
		form.addEventListener("submit", (ev) => {
			ev.preventDefault();
			// TODO: change data as needed
			this.drawPrivateDataDisplay();
		});
		form.querySelector('#dbPrivateFormTitle').textContent = this.res("t_profile_priv");

		form.querySelector('[for="addr"]').textContent = this.res("dbField_addr");
		form.querySelector('[for="subs"]').textContent = this.res("dbField_subs");

		const cancelBtn = form.querySelector("#cancel") as HTMLButtonElement;
		cancelBtn.textContent = this.res("cancel");
		cancelBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawPrivateDataDisplay();
		});

		(form.querySelector('[type="submit"]') as HTMLInputElement).value = this.res("submit");
	}
	//#endregion drawLogged
	//#region drawNotLogged
	protected drawNotLogged(): void {
		employTemplate(this.templates.notLogged, this.root);
		this.root.querySelector(".notLoggedText").textContent = this.res("notLogged");
		this.root.querySelector("#alternateLoginsText").textContent = this.res("loginWith");
		this.root.querySelector("#logWithGoogle>img").setAttribute("alt", this.res("logWGoogleImg"));

		let logWithGoogle = this.root.querySelector("#logWithGoogle") as HTMLElement;
		logWithGoogle.addEventListener("click", (ev) => {
			this.googleSignInAction();
		});

		this.drawLoginForm();
	}
	protected drawLoginForm(): void {
		(this.root.querySelector("#compTitle") as HTMLHeadingElement).textContent = this.res("t_profile_ini");

		const form = employTemplate<HTMLFormElement>(this.templates.loginForm, this.root.querySelector("#formContainer"));
		form.addEventListener("submit", async (ev) => {
			ev.preventDefault();
			this.loginInAction(form);
		});

		form.querySelector('[for="email"]').textContent = this.res("email");
		form.querySelector('[for="password"]').textContent = this.res("password");

		const emailInput = (form.querySelector('#email') as HTMLInputElement);
		emailInput.value = this.keepLoginInfo["email"];
		emailInput.placeholder = this.res("placeHolEmail");

		const passInput = (form.querySelector('#password') as HTMLInputElement);
		passInput.value = this.keepLoginInfo["password"];
		passInput.placeholder = this.res("placeHolPass");
		
		let loginSubmit = form.querySelector("#login") as HTMLInputElement;
		loginSubmit.value = this.res("login");

		let registerBtn = form.querySelector("#register") as HTMLButtonElement;
		registerBtn.textContent = this.res("register");
		registerBtn.addEventListener("click",(ev) => {
			ev.preventDefault();
			this.keepLoginInfo["password"] = form["password"].value;
			this.keepLoginInfo["email"] = form["email"].value;
			this.clearMessages();
			this.drawRegisterForm();
		});
	}
	protected drawRegisterForm(): void {
		(this.root.querySelector("#compTitle") as HTMLHeadingElement).textContent = this.res("t_profile_reg");

		const form = employTemplate<HTMLFormElement>(this.templates.registerForm, this.root.querySelector("#formContainer"));
		form.addEventListener("submit", async (ev) => {
			ev.preventDefault();
			this.registerAction(form);
		});

		form.querySelector("[for='email']").textContent = this.res("email");
		form.querySelector('[for="name"]').textContent = this.res("name");
		form.querySelector("[for='password']").textContent = this.res("password");
		form.querySelector("[for='password2']").textContent = this.res("password2");

		const emailInput = (form.querySelector('#email') as HTMLInputElement);
		emailInput.value = this.keepLoginInfo["email"];
		emailInput.placeholder = this.res("placeHolEmail");

		(form.querySelector('#name') as HTMLInputElement).placeholder = this.res("placeHolName");

		const passInput = (form.querySelector('#password') as HTMLInputElement);
		passInput.value = this.keepLoginInfo["password"];
		passInput.placeholder = this.res("placeHolPass2");

		(form.querySelector('#password2') as HTMLInputElement).placeholder = this.res("placeHolPass2");

		let loginBtn = form.querySelector("#login") as HTMLButtonElement;
		loginBtn.textContent = this.res("login");
		loginBtn.addEventListener("click",(ev) => {
			ev.preventDefault();
			this.keepLoginInfo["password"] = form["password"].value;
			this.keepLoginInfo["email"] = form["email"].value;
			this.clearMessages();
			this.drawLoginForm();
		});

		let registerSubmit = form.querySelector("#register") as HTMLInputElement;
		registerSubmit.value = this.res("register");
	}
	//#endregion drawNotLogged
	
	protected getFirestore(): Firestore {
		if(this.firestore) return this.firestore;

		if(this.dataCenter.shared.firestore){
			this.firestore = this.dataCenter.shared.firestore;
		}
		else {
			this.firestore = getFireStoreDB(this.fireApp);
			this.dataCenter.shared.firestore = this.firestore;
		}

		return this.firestore;
	}
	protected getFormData<T = any>(form: HTMLFormElement): T {
		let result: any = {};
		const relevantElems = form.elements;
		for (let i = 0; i < relevantElems.length; i++) {
			const elem = relevantElems[i] as HTMLInputElement;
			
			if(elem["name"]){
				result[elem["name"]] = elem["value"];
			}
		}

		return result as T;
	}
	protected async authSignFlow(callback: () => Promise<void>, validation?: IValitationResult) {
		if(!validation || validation && validation.valid){
			try {
				await callback();
			}
			catch (err) {
				console.error(err);
				this.drawMessages(this._res, [{
					baseCode: "err_someErr",
					msgType: MsgType.error,
					placeHolderFillers: [err.message]
				}]);
			}
		}
		else {
			this.drawMessages(this._res, validation.codes.map((val) => {
				return {
					baseCode: val,
					msgType: MsgType.error,
					placeHolderFillers: null
				}
			}));
		}
	}
	protected res(resourceName: string): string {
		if(!this._res) return "";
		return this._res[resourceName] ? (this._res[resourceName] as string) : "";
	}
}

export default ProfileSettings;

export type { ProfileSettingsArgs };