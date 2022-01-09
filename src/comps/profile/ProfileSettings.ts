import type DataCenter from "../../js/DataCenter.js";
import type { componentUpdateArgs } from "../BaseComponent.js";
import type { IValitationResult } from "../../js/types/IValidationResult.js";
import type { IInfoPromt } from "../../js/types/InfoPromt.js";
import type IProfile from "../../js/common/dataClasses/IProfile.js";
import type IPrivateProfile from "../../js/common/dataClasses/IPrivateProfile.js";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, updateProfile, updateEmail } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import { employTemplate, fillPlaceholders, firebaseTimeToDate, getAddrString, getFormData, getInnerValue, getLoader, populateWithIdSelector, setHtmlElementsData } from "../../js/common/utils.js";
import { DocumentData, DocumentReference, Firestore, updateDoc, doc, getDoc, serverTimestamp, collection, setDoc, getDocFromCache } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";
import BaseFireAuthComponent from "../BaseFireAuthComponent.js";
import { InfoPromtType } from "../../js/types/InfoPromt.js";
import DbColletions from "../../js/common/dataClasses/DbCollections.js";
import { isLong, isNotEmpty, isSecure, isValidEmail, isValidPhoneNumber, test, testMatch } from "../../js/common/tests.js";
import Consts from "../../js/common/Consts.js";

type ILoginInfo = {
	email: string,
	password: string
}
type IRegisterInfo = {
	email: string,
	name: string,
	password: string,
	password2: string
}
type IAuthUpdateInfo = {
	name: string
}
type IPublicUpdateInfo = {
	pbMail: string,
	pbPhone: string,
	bio: string
}
type IPrivateUpdateInfo = {
}

const templateNames = ["notLogged","loginForm","registerForm","logged","authDataDisplay","authDataForm","dbPublicDisplay","dbPublicForm","dbPrivateDisplay","dbPrivateForm","profileSettingsMessage"] as const;
type ProfileSettingsTemplates = typeof templateNames[number];

type ProfileSettingsArgs = { };
class ProfileSettings extends BaseFireAuthComponent<ProfileSettingsArgs>{
	protected _res: any;
	protected templates : {[tempalteName in ProfileSettingsTemplates ]: HTMLTemplateElement};
	protected keepLoginInfo: {email: string, password: string};
	protected firestore: Firestore;

	protected publicDocRef: DocumentReference<DocumentData>;
	protected publicData: IProfile = {};
	protected privDocRef: DocumentReference<DocumentData>;
	protected privData: IPrivateProfile = {};

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
		this.firestore = this.dataCenter.shared.firestore;
		(this.templates as any) = {};
		populateWithIdSelector(templateNames, this.templates, this.templatesArea);
		this.authUpdated();
	}
	public async update(params: componentUpdateArgs<ProfileSettingsArgs>) {
		if(params.type === "reload"){
			this.drawComponent();
			if(this.auth && this.auth.currentUser){
				this.bindDbDocs();
			}
		}

		return this;
	}
	protected override async authUpdated() {
		if(this.auth && this.auth.currentUser){
			this.bindDbDocs();
		}
		this.drawComponent();
	}
	protected override async authDataUpdated() {
		if(this.auth && this.auth.currentUser){
			this.root.querySelector('.loggedText').textContent = fillPlaceholders(this.res("loggedAs"), this.auth.currentUser.displayName);
			let authDisplay = this.root.querySelector('.authInfo') as HTMLElement;
			authDisplay.querySelector("#name").textContent = this.auth.currentUser.displayName;
			authDisplay.querySelector("#email").textContent = this.auth.currentUser.email;
			setHtmlElementsData( this.root.querySelector(".dbInfoPublic"), [this.publicData], {
				pbaddr: (val) =>{
					let addrStr = getAddrString(val);
					return addrStr !== "" ? addrStr : this.res("addr_notInformed");
				},
				upDate: (val) => {
					return {
						textContent: val ? this.petCap.getFormatedDate( val) : "",
						dateTime: val ? val.toUTCString() : ""
					}
				},
				modDate: (val) => {
					return {
						textContent: val ? this.petCap.getFormatedDate( val) : "",
						dateTime: val ? val.toUTCString() : ""
					}
				}
			});
			setHtmlElementsData( this.root.querySelector(".dbInfoPrivate"), [this.privData]);
		}
	}

	protected async loginInAction(form: HTMLFormElement): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.clearMessages();
			let values = getFormData<ILoginInfo>(form);
			let validation = this.validateLogIn(values);
			this.iterationFlow( this.root, async () => {
				form.innerHTML = ""
				form.appendChild(getLoader(10));

				await signInWithEmailAndPassword(this.auth, values.email, values.password);
				resolve(true);
			}, async (err) => {
				setHtmlElementsData(this.drawLoginForm(), [values]);
				resolve(false);
			}, validation);
		});
	}
	protected async registerAction(form: HTMLFormElement): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.clearMessages();
			let values = getFormData<IRegisterInfo>(form);
			let validation = this.validateRegister(values);

			this.iterationFlow( this.root, async () => {
				form.innerHTML = ""
				form.appendChild(getLoader(19));

				await createUserWithEmailAndPassword(this.auth, values.email, values.password);
				await updateProfile(this.auth.currentUser, {
					displayName: values.name
				});

				resolve(true);
			}, async (err) => {
				setHtmlElementsData(this.drawRegisterForm(), [values]);
				resolve(false);
			}, validation);
		});
	}
	protected async googleSignInAction(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.clearMessages();
			this.iterationFlow( this.root, async () => {
				const provider = new GoogleAuthProvider();
				const result = await signInWithPopup(this.auth, provider);
				resolve(true);
			}, async (err) => {
				resolve(false);
			});
		})
	}

	protected async updateAuthAction(form: HTMLFormElement): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.clearMessages();
			let values = getFormData<IAuthUpdateInfo>(form);
			let validation = this.validateAuthForm(values);

			this.iterationFlow( form.parentElement, async () => {
				form.innerHTML = ""
				form.appendChild(getLoader(12));

				let profUpdate = updateProfile(this.auth.currentUser, {
					displayName: values.name
				});

				let pubUpdate = setDoc(this.publicDocRef, {
					name: values.name
				}, {merge: true});

				await Promise.all([profUpdate, pubUpdate]);
				this.dataCenter.emmit(Consts.profileDataChangeEvent, true);

				resolve(true);
			}, async (err) => {
				setHtmlElementsData( this.drawAuthDataForm(), [values]);
				resolve(false);
			}, validation);
		});
	}
	protected async updatePublicAction(form: HTMLFormElement): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.clearMessages();
			let values = getFormData<IPublicUpdateInfo>(form);
			let validation = this.validatePubForm(values);

			this.iterationFlow( form.parentElement, async () => {
				form.innerHTML = ""
				form.appendChild(getLoader(26));

				await setDoc(this.publicDocRef, {
					bio: values.bio,
					pbMail: values.pbMail,
					pbPhone: values.pbPhone
				}, {merge: true});

				this.publicData = (await getDoc(this.publicDocRef)).data();
				this.publicData.modDate = firebaseTimeToDate(this.publicData.modDate);
				this.publicData.upDate = firebaseTimeToDate(this.publicData.upDate);
				this.dataCenter.emmit(Consts.profileDataChangeEvent, true);

				resolve(true);
			}, async (err) => {
				setHtmlElementsData(this.drawPublicDataForm(), [values, this.publicData]);
				resolve(false);
			}, validation);
		});
	}
	protected async updatePrivateAction(form: HTMLFormElement): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.clearMessages();
			let values = getFormData<IPrivateUpdateInfo>(form);
			let validation = this.validatePrivForm(values);

			this.iterationFlow( form.parentElement, async () => {
				form.innerHTML = ""
				form.appendChild(getLoader(10));
				// Currently, nothing to do
				this.privData = (await getDoc(this.privDocRef)).data();
				this.dataCenter.emmit(Consts.profileDataChangeEvent, true);

				resolve(true);
			}, async (err) => {
				setHtmlElementsData(this.drawPrivateDataForm(), [values, this.privData]);
				resolve(false);
			}, validation);
		});
	}

	//#region validation
	protected validateLogIn(values: ILoginInfo): IValitationResult {
		let result: IValitationResult = {
			valid: true,
			codes: []
		};
		test(isNotEmpty, values.email, result, "err_empty", ["email"])
		&& test(isValidEmail, values.email, result, "err_badFormat", ["email"]);
		test(isNotEmpty, values.password, result, "err_empty", ["password"]);
		return result;
	}
	protected validateRegister(values: IRegisterInfo): IValitationResult {
		let result: IValitationResult = {
			valid: true,
			codes: []
		};
		test(isNotEmpty, values.email, result, "err_empty", ["email"])
		&& test(isValidEmail, values.email, result, "err_badFormat", ["email"]);
		test(isNotEmpty, values.name, result, "err_empty", ["name"])
		&& test(isLong.bind(null, 4), values.name, result, "err_nameShort", null);
		testMatch(values.password2, values.password, result, "err_passNotSame", null);
		test(isLong.bind(null, 9), values.password, result, "err_passShort", null);
		test(isSecure, values.password, result, "err_passTooSimple", null);
		return result;
	}
	protected validateAuthForm(values: IAuthUpdateInfo): IValitationResult {
		let result: IValitationResult = {
			valid: true,
			codes: []
		};
		test(isNotEmpty, values.name, result, "err_empty", ["name"])
		&& test(isLong.bind(null, 4), values.name, result, "err_nameShort", null);
		return result;
	}
	protected validatePubForm(values: IPublicUpdateInfo): IValitationResult {
		let result: IValitationResult = {
			valid: true,
			codes: []
		};
		values.pbMail && test(isValidEmail, values.pbMail, result, "err_badFormat", ["dbField_pbMail"]);
		values.pbPhone && test(isValidPhoneNumber, values.pbPhone, result, "err_badFormat", ["dbField_pbPhone"]);
		return result;
	}
	protected validatePrivForm(values: IPrivateUpdateInfo): IValitationResult {
		let result: IValitationResult = {
			valid: true,
			codes: []
		};
		return result;
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
	protected drawMessages(root: HTMLElement, resources: any, messages: Array<IInfoPromt>): void {
		let outputDiv = root.querySelector(".profileSettingsOutput") as HTMLElement;

		messages.forEach((msg) => {
			let text = msg.placeHolderFillers ?
				fillPlaceholders.bind(null, resources[msg.baseCode]).apply(null, msg.placeHolderFillers) :
				resources[msg.baseCode];//*/
			let msgElem = employTemplate(this.templates.profileSettingsMessage, outputDiv, true);
			msgElem.textContent = text;
			switch (msg.msgType) {
				case InfoPromtType.error:
					msgElem.classList.add("error")
					break;
				case InfoPromtType.info:
					msgElem.classList.add("info")
					break;
				case InfoPromtType.warning:
					msgElem.classList.add("warning")
					break;
			}
		});
	}
	protected clearMessages(): void {
		let outputDivs = this.root.querySelectorAll(".profileSettingsOutput") as NodeList;
		for (let i = 0; i < outputDivs.length; i++) {
			const elem = outputDivs[i] as HTMLElement;
			elem.innerHTML = "";
		}
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
	protected drawAuthDataDisplay(): HTMLElement {
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
		return display;
	}
	protected drawAuthDataForm(): HTMLFormElement {
		const form = employTemplate<HTMLFormElement>(this.templates.authDataForm, this.root.querySelector(".authInfo"));
		form.addEventListener("submit", async (ev) => {
			ev.preventDefault();
			if(await this.updateAuthAction(form)){
				this.drawAuthDataDisplay();
			}
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
		return form;
	}
	protected drawPublicDataDisplay(): HTMLElement {
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

		setHtmlElementsData(display, [this.publicData], {
			pbaddr: (val) =>{
				let addrStr = getAddrString(val);
				return addrStr !== "" ? addrStr : this.res("addr_notInformed");
			},
			upDate: (val) => {
				return {
					textContent: val ? this.petCap.getFormatedDate( val) : "",
					dateTime: val ? val.toUTCString() : ""
				}
			},
			modDate: (val) => {
				return {
					textContent: val ? this.petCap.getFormatedDate( val) : "",
					dateTime: val ? val.toUTCString() : ""
				}
			}
		});
		return display;
	}
	protected drawPublicDataForm(): HTMLFormElement {
		const form = employTemplate<HTMLFormElement>(this.templates.dbPublicForm, this.root.querySelector(".dbInfoPublic"));
		form.addEventListener("submit", async (ev) => {
			ev.preventDefault();
			if(await this.updatePublicAction(form)){
				this.drawPublicDataDisplay();
			}
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

		setHtmlElementsData(form, [this.publicData], {
			pbaddr: (val) =>{
				let addrStr = getAddrString(val);
				return addrStr !== "" ? addrStr : this.res("addr_notInformed");
			},
			upDate: (val) => {
				return {
					textContent: val ? this.petCap.getFormatedDate( val) : "",
					dateTime: val ? val.toUTCString() : ""
				}
			},
			modDate: (val) => {
				return {
					textContent: val ? this.petCap.getFormatedDate( val) : "",
					dateTime: val ? val.toUTCString() : ""
				}
			}
		});
		return form;
	}
	protected drawPrivateDataDisplay(): HTMLElement {
		const display = employTemplate(this.templates.dbPrivateDisplay, this.root.querySelector(".dbInfoPrivate")) as HTMLElement;
		display.querySelector('#dbPrivateDisplayTitle').textContent = this.res("t_profile_priv");

		display.querySelector('[for="addr"]').textContent = this.res("dbField_addr");

		const editBtn = display.querySelector("#editPriv") as HTMLButtonElement;
		editBtn.title = fillPlaceholders( this.res("editSomething"), this.res("t_profile_priv"));
		editBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawPrivateDataForm();
		});

		setHtmlElementsData(display, [this.privData], {
			addr: getAddrString
		});
		return display;
	}
	protected drawPrivateDataForm(): HTMLFormElement {
		const form = employTemplate<HTMLFormElement>(this.templates.dbPrivateForm, this.root.querySelector(".dbInfoPrivate"));
		form.addEventListener("submit", async (ev) => {
			ev.preventDefault();
			if(await this.updatePrivateAction(form)){
				this.drawPrivateDataDisplay();
			}
		});
		form.querySelector('#dbPrivateFormTitle').textContent = this.res("t_profile_priv");

		form.querySelector('[for="addr"]').textContent = this.res("dbField_addr");

		const cancelBtn = form.querySelector("#cancel") as HTMLButtonElement;
		cancelBtn.textContent = this.res("cancel");
		cancelBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawPrivateDataDisplay();
		});

		(form.querySelector('[type="submit"]') as HTMLInputElement).value = this.res("submit");

		setHtmlElementsData(form, [this.privData], {
			addr: getAddrString
		});

		return form;
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
	protected drawLoginForm(): HTMLFormElement {
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

		return form;
	}
	protected drawRegisterForm(): HTMLFormElement {
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

		return form;
	}
	//#endregion drawNotLogged

	protected async iterationFlow(iterationRoot: HTMLElement, callback: () => Promise<void>, errorCallBack: (err: any) => Promise<void>, validation?: IValitationResult) {
		if(!validation || validation && validation.valid){
			try {
				await callback();
			}
			catch (err) {
				console.error(err);
				errorCallBack(err);
				this.drawMessages(iterationRoot, this._res, [{
					baseCode: "err_someErr",
					msgType: InfoPromtType.error,
					placeHolderFillers: [err.message]
				}]);
			}
		}
		else {
			this.drawMessages(iterationRoot, this._res, validation.codes.map((val) => {
				let subValues = val.subCodes ? val.subCodes.map((subcode) => this.res(subcode)) : null;
				return {
					baseCode: val.code,
					msgType: InfoPromtType.error,
					placeHolderFillers: subValues
				}
			}));
		}
	}
	protected async bindDbDocs(): Promise<void> {
		this.publicDocRef = doc(this.firestore, DbColletions.Profiles, this.auth.currentUser.uid);
		this.privDocRef = doc(this.firestore, DbColletions.PrivateProfiles, this.auth.currentUser.uid);

		await this.syncDbDocs();
	}
	protected async syncDbDocs(): Promise<void> {
		let pub = (async () => {
			let pubDocSnap = await getDoc(this.publicDocRef);
			let pubDocData = pubDocSnap.data({serverTimestamps: "none"}) as IProfile;
			if(pubDocData){
				this.publicData = pubDocData;

				this.publicData.modDate = firebaseTimeToDate(this.publicData.modDate);
				this.publicData.upDate = firebaseTimeToDate(this.publicData.upDate);
			}
			else {
				await setDoc(this.publicDocRef, {
					name: this.auth.currentUser.displayName,
					bio: "",
					photo: this.auth.currentUser.photoURL,
					upDate: serverTimestamp(),
					modDate: serverTimestamp()
				});
				pubDocSnap = await getDoc(this.publicDocRef);
				this.publicData = pubDocSnap.data({serverTimestamps: "none"}) as IProfile;

				this.publicData.modDate = firebaseTimeToDate(this.publicData.modDate);
				this.publicData.upDate = firebaseTimeToDate(this.publicData.upDate);
			}
		})();
		let priv = (async () => {
			let privDocSnap = await getDoc(this.privDocRef);
			let privDocData = privDocSnap.data({serverTimestamps: "none"}) as IProfile;
			if(privDocData){
				this.privData = privDocData;
			}
			else {
				await setDoc(this.privDocRef, {
					pref: JSON.stringify(this.petCap.userPrefs)
				});
				privDocSnap = await getDoc(this.privDocRef);
				this.privData = privDocSnap.data({serverTimestamps: "none"}) as IProfile;
			}
		})();
		await Promise.all([pub, priv]);
		setHtmlElementsData(this.root.querySelector(".dbInfoPrivate"), [this.privData], {
			addr: (val) =>{
				let addrStr = getAddrString(val);
				return addrStr !== "" ? addrStr : this.res("addr_notInformed");
			}
		});
		setHtmlElementsData(this.root.querySelector(".dbInfoPublic"), [this.publicData], {
			pbaddr: (val) =>{
				let addrStr = getAddrString(val);
				return addrStr !== "" ? addrStr : this.res("addr_notInformed");
			},
			upDate: (val) => {
				return {
					textContent: val ? this.petCap.getFormatedDate( val) : "",
					dateTime: val ? val.toUTCString() : ""
				}
			},
			modDate: (val) => {
				return {
					textContent: val ? this.petCap.getFormatedDate( val) : "",
					dateTime: val ? val.toUTCString() : ""
				}
			}
		});
	}
	protected async updatePublicData(data: IProfile){
		if(Object.keys( data).length > 0){
			await setDoc(this.publicDocRef, data, {merge: true});
		}
	}
	protected async updatePrivateData(data: IPrivateProfile){
		if(Object.keys( data).length > 0){
			await setDoc(this.privDocRef, data, {merge: true});
		}
	}
	protected res(resourceName: string): string {
		if(!this._res) return "";
		return this._res[resourceName] ? (this._res[resourceName] as string) : "";
	}
}

export default ProfileSettings;

export type { ProfileSettingsArgs };