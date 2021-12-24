import type DataCenter from "../../js/DataCenter.js";
import type { componentUpdateArgs } from "../BaseComponent.js";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import { employTemplate, fillPlaceholders } from "../../js/common/utils.js";
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

// This is an example component
type ProfileSettingsArgs = { }
class ProfileSettings extends BaseFireAuthComponent<ProfileSettingsArgs>{
	protected isRegisterForm: Boolean = false;

	protected loggedTemplate: HTMLTemplateElement
	protected notLoggedTemplate: HTMLTemplateElement
	protected messageTemplate: HTMLTemplateElement

	protected override async authUpdated() {
		let res = await this.petCap.loadRes("common");
		
		if(this.isLogged){
			employTemplate(this.loggedTemplate, this.root);
			this.root.querySelector("#name").textContent = this.auth.currentUser.displayName;
			this.root.querySelector("#email").textContent = this.auth.currentUser.email;
			this.root.querySelector('label[for="email"]').textContent = res["email"];
			this.root.querySelector('label[for="name"]').textContent = res["name"];
			this.root.querySelector('.loggedText').textContent = fillPlaceholders(res["name"], this.auth.currentUser.displayName);

			let logoutButton = this.root.querySelector("#logOut") as HTMLButtonElement;
			logoutButton.textContent = res["logout"];
			logoutButton.addEventListener("click", (ev) => {
				ev.preventDefault();
				this.auth.signOut();
			});
		}
		else {
			employTemplate(this.notLoggedTemplate, this.root);
			this.root.querySelector(".notLoggedText").textContent = res["notLogged"];
			this.root.querySelector("[for='email']").textContent = res["email"];
			this.root.querySelector("[for='password']").textContent = res["password"];
			this.root.querySelector("[for='password2']").textContent = res["password2"];
			this.root.querySelector("#alternateLoginsText").textContent = res["loginWith"];
			this.root.querySelector("#logWithGoogle>img").setAttribute("alt", res["logWGoogleImg"]);
			

			let registerButton = this.root.querySelector("#register") as HTMLButtonElement;
			let loginButton = this.root.querySelector("#logIn") as HTMLButtonElement;
			registerButton.textContent = res["register"];
			registerButton.value = res["register"];
			loginButton.textContent = res["login"];
			loginButton.value = res["login"];

			registerButton.addEventListener("click", async (ev) => {
				ev.preventDefault();
				this.clearMessages();
				if(this.isRegisterForm){
					let passCheck = this.isValidPassword();
					if(passCheck.valid){
						try {
							await createUserWithEmailAndPassword(this.auth, this.getInformedEmail(), this.getInformedPass());
						}
						catch (err) {
							console.error(err);
							this.writeMessages(res, [{
								baseCode: "err_someErr",
								msgType: MsgType.error,
								placeHolderFillers: [err.message]
							}]);
						}
					}
					else {
						this.writeMessages(res, passCheck.codes.map((val) => {
							return {
								baseCode: val,
								msgType: MsgType.error,
								placeHolderFillers: null
							}
						}));
					}
				}
				else {
					this.showRegisterForm();
				}
			});
			loginButton.addEventListener("click", async (ev) => {
				ev.preventDefault();
				this.clearMessages();
				if(this.isRegisterForm){
					this.showLoginForm();
				}
				else {
					try {
						await signInWithEmailAndPassword(this.auth, this.getInformedEmail(), this.getInformedPass());
					}
					catch (err) {
						console.error(err);
						this.writeMessages(res, [{
							baseCode: "err_someErr",
							msgType: MsgType.error,
							placeHolderFillers: [err.message]
						}]);
					}
				}
			});

			
			let logWithGoogle = this.root.querySelector("#logWithGoogle") as HTMLElement;
			logWithGoogle.addEventListener("click", async (ev) => {
				this.clearMessages();
				const provider = new GoogleAuthProvider();
				try {
					await signInWithPopup(this.auth, provider);
				}
				catch (err) {
					console.error(err);
					this.writeMessages(res, [{
						baseCode: "err_someErr",
						msgType: MsgType.error,
						placeHolderFillers: [err.message]
					}]);
				}
			});
		}
	}

	constructor(root: HTMLElement, params: ProfileSettingsArgs, templatesArea: HTMLElement, dataCenter: DataCenter) {
		super(root, params, templatesArea, dataCenter);
		this.loggedTemplate = this.templatesArea.querySelector("#Logged");
		this.notLoggedTemplate = this.templatesArea.querySelector("#NotLogged");
		this.messageTemplate = this.templatesArea.querySelector("#ProfileSettingsMessage");
		this.authUpdated();
	}

	async update(params: componentUpdateArgs<ProfileSettingsArgs>){
		if(params.type === "reload"){
			this.authUpdated();
		}

		return this;
	}

	protected showRegisterForm(): void{
		(this.root.querySelector("#pass2Line") as HTMLElement).style.display = "";
		this.isRegisterForm = true;
	}
	protected showLoginForm(): void{
		(this.root.querySelector("#pass2Line") as HTMLElement).style.display = "none";
		this.isRegisterForm = false;
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

	protected writeMessages( resources: any, messages: Array<IProfileSettingsMessage>): void {
		let outputDiv = this.root.querySelector("#profileSettingsOutput") as HTMLElement;

		messages.forEach((msg) => {
			let text = msg.placeHolderFillers ?
				fillPlaceholders.bind(null, resources[msg.baseCode]).apply(null, msg.placeHolderFillers) :
				resources[msg.baseCode];
			let msgElem = employTemplate(this.messageTemplate, outputDiv, true);
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