import type DataCenter from "../../js/DataCenter.js";
import type { componentUpdateArgs } from "../BaseComponent.js";
import { employTemplate } from "../../js/common/utils.js";
import BaseFireAuthComponent from "../BaseFireAuthComponent.js";


// This is an example component
type ProfileLessSettingsArgs = { }
class ProfileLessSettings extends BaseFireAuthComponent<ProfileLessSettingsArgs>{
	data: ProfileLessSettingsArgs;
	rootTemplate: HTMLTemplateElement;

	_assignFields(params: ProfileLessSettingsArgs){
	}

	protected override async authUpdated() {

	}
	protected async build() {
		employTemplate(this.rootTemplate, this.root);
	}

	constructor(root: HTMLElement, params: ProfileLessSettingsArgs, templatesArea: HTMLElement, dataCenter: DataCenter) {
		super(root, params, templatesArea, dataCenter);
		this.rootTemplate = this.templatesArea.querySelector("#ProfileLessSettings");
		this.data = { };
		this._assignFields(params);
		this.build();
	}

	async update(params: componentUpdateArgs<ProfileLessSettingsArgs>){
		if(params.type === "reload"){
			this._assignFields(params.args);
			this.build();
		}

		return this;
	}
}

export default ProfileLessSettings;

export type { ProfileLessSettingsArgs };