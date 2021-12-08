import type DataCenter from "../../js/DataCenter.js";
import { employTemplate } from "../../js/common/utils.js";
import BaseComponent, { componentUpdateArgs } from "../BaseComponent.js";
import BaseFireAuthComponent from "../BaseFireAuthComponent.js";


// This is an example component
type ProfileLessSettingsArgs = { }
class ProfileLessSettings extends BaseFireAuthComponent<ProfileLessSettingsArgs>{
	static _componentName = "ProfileLessSettings"

	data: ProfileLessSettingsArgs;
	rootTemplate: HTMLTemplateElement;

	_assignFields(params: ProfileLessSettingsArgs){
	}

	protected override async _authUpdated() {

	}
	protected async _build() {
		employTemplate(this.rootTemplate, this.root);
	}

	constructor(root: HTMLElement, params: ProfileLessSettingsArgs, templatesArea: HTMLElement, dataCenter: DataCenter) {
		super(root, params, templatesArea, dataCenter);
		this.rootTemplate = this.templatesArea.querySelector("#"+ProfileLessSettings._componentName);
		this.data = { };
		this._assignFields(params);
		this._build();
	}

	async update(params: componentUpdateArgs<ProfileLessSettingsArgs>){
		if(params.type === "reload"){
			this._assignFields(params.args);
			this._build();
		}

		return this;
	}
}

export default ProfileLessSettings;

export type { ProfileLessSettingsArgs };