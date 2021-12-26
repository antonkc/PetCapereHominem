import type DataCenter from "../../js/DataCenter.js";
import type { componentUpdateArgs } from "../BaseComponent.js";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { employTemplate, fillPlaceholders, getLoader, populateWithIdSelector } from "../../js/common/utils.js";
import BaseFireAuthComponent from "../BaseFireAuthComponent.js";

type valitationResult = {
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

const templateNames = ["notLogged","loginForm","registerForm","logged","authDataDisplay","authDataForm","dbPublicDisplay","dbPublicForm","dbPrivateDisplay","dbPrivateForm","profileSettingsMessage"] as const;
type ProfileSettingsTemplates = typeof templateNames[number];

type ProfileSettingsArgs = { };
class ProfileSettings extends BaseFireAuthComponent<ProfileSettingsArgs>{
	protected isRegisterForm: Boolean = false;
	protected _res: any;
	protected templates : {[tempalteName in ProfileSettingsTemplates ]: HTMLTemplateElement};
	protected keepLoginInfo: {email: string, password: string};

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

	public async update(params: componentUpdateArgs<ProfileSettingsArgs>){
		if(params.type === "reload"){
			this.drawComponent();
		}

		return this;
	}
	protected override async authUpdated() {
		this.drawComponent();
	}

	protected isValidPassword(): valitationResult {
		let answer: valitationResult = {valid: true, codes: []};
		let passElem: HTMLInputElement = this.root.querySelector("#password");
		let pass2Elem: HTMLInputElement = this.root.querySelector("#password2");

		if(pass2Elem.value !== passElem.value){
			answer.valid = false;
			answer.codes.push("err_passNotSame");
		}
		if(passElem.value.length < 9){
			answer.valid = false;
			answer.codes.push("err_passShort");
		}
		if((/[0-9]/).test(passElem.value) === false || (/[a-z]/).test(passElem.value) === false || (/[A-Z]/).test(passElem.value) === false ){
			answer.valid = false;
			answer.codes.push("err_passTooSimple");
		}

		return answer;
	}
	protected getInformedEmail(): string {
		let emailElem: HTMLInputElement = this.root.querySelector("#email");

		if(emailElem){
			return emailElem.value;
		}

		return "";
	}
	protected getInformedPass(): string {
		let passwordElem: HTMLInputElement = this.root.querySelector("#password");

		if(passwordElem){
			return passwordElem.value;
		}

		return "";
	}

	protected res(resourceName: string): string{
		if(!this._res) return "";
		return this._res[resourceName] ? (this._res[resourceName] as string) : "";
	}

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

	protected drawLogged(): void {
		employTemplate(this.templates.logged, this.root);
		this.root.querySelector('.loggedText').textContent = fillPlaceholders(this.res("name"), this.auth.currentUser.displayName);

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
		employTemplate(this.templates.authDataDisplay, this.root.querySelector(".authInfo"));
		this.root.querySelector('[for="name"]').textContent = this.res("name");
		this.root.querySelector('[for="email"]').textContent = this.res("email");

		this.root.querySelector("#name").textContent = this.auth.currentUser.displayName;
		this.root.querySelector("#email").textContent = this.auth.currentUser.email;

		const editBtn = this.root.querySelector("#editAuth") as HTMLButtonElement;
		editBtn.title = this.res("edit");
		editBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawAuthDataForm();
		});
	}
	protected drawAuthDataForm(): void {
		const form = employTemplate<HTMLFormElement>(this.templates.authDataForm, this.root.querySelector(".authInfo"));
		form.addEventListener("submit", (ev) => {
			ev.preventDefault();
			// TODO: change data as needed
			this.drawAuthDataDisplay();
		});

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
		employTemplate(this.templates.dbPublicDisplay, this.root.querySelector(".dbInfoPublic"));

		const editBtn = this.root.querySelector("#editPublic") as HTMLButtonElement;
		editBtn.title = this.res("edit");
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

		const cancelBtn = form.querySelector(".dbInfoPublic #cancel") as HTMLButtonElement;
		cancelBtn.textContent = this.res("cancel");
		cancelBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawPublicDataDisplay();
		});

		(form.querySelector('.dbInfoPublic [type="submit"]') as HTMLInputElement).value = this.res("submit");
	}
	protected drawPrivateDataDisplay(): void {
		employTemplate(this.templates.dbPrivateDisplay, this.root.querySelector(".dbInfoPrivate"));

		const editBtn = this.root.querySelector("#editPriv") as HTMLButtonElement;
		editBtn.title = this.res("edit");
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

		const cancelBtn = form.querySelector("#cancel") as HTMLButtonElement;
		cancelBtn.textContent = this.res("cancel");
		cancelBtn.addEventListener("click", (ev) => {
			ev.preventDefault();
			this.drawPrivateDataDisplay();
		});

		(form.querySelector('[type="submit"]') as HTMLInputElement).value = this.res("submit");
	}

	protected drawNotLogged(): void {
		employTemplate(this.templates.notLogged, this.root);
		this.root.querySelector(".notLoggedText").textContent = this.res("notLogged");
		this.root.querySelector("#alternateLoginsText").textContent = this.res("loginWith");
		this.root.querySelector("#logWithGoogle>img").setAttribute("alt", this.res("logWGoogleImg"));

		let logWithGoogle = this.root.querySelector("#logWithGoogle") as HTMLElement;
		logWithGoogle.addEventListener("click", async (ev) => {
			this.clearMessages();
			const provider = new GoogleAuthProvider();
			try {
				const result = await signInWithPopup(this.auth, provider);
				this.authUpdated();
			}
			catch (err) {
				console.error(err);
				this.drawMessages(this._res, [{
					baseCode: "err_someErr",
					msgType: MsgType.error,
					placeHolderFillers: [err.message]
				}]);
			}
		});

		this.drawLoginForm();
	}
	protected drawLoginForm(): void {
		const form = employTemplate<HTMLFormElement>(this.templates.loginForm, this.root.querySelector("#formContainer"));
		form.addEventListener("submit", async (ev) => {
			ev.preventDefault();
			this.clearMessages();
			try {
				await signInWithEmailAndPassword(this.auth, this.getInformedEmail(), this.getInformedPass());
			}
			catch (err) {
				console.error(err);
				this.drawMessages(this._res, [{
					baseCode: "err_someErr",
					msgType: MsgType.error,
					placeHolderFillers: [err.message]
				}]);
			}
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
		const form = employTemplate<HTMLFormElement>(this.templates.registerForm, this.root.querySelector("#formContainer"));
		form.addEventListener("submit", async (ev) => {
			ev.preventDefault();
			this.clearMessages();
			let passCheck = this.isValidPassword();
			if(passCheck.valid){
				try {
					await createUserWithEmailAndPassword(this.auth, this.getInformedEmail(), this.getInformedPass());
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
				this.drawMessages(this._res, passCheck.codes.map((val) => {
					return {
						baseCode: val,
						msgType: MsgType.error,
						placeHolderFillers: null
					}
				}));
			}
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
}

export default ProfileSettings;

export type { ProfileSettingsArgs };