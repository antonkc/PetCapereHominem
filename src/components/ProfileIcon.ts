import DataCenter from "../js/DataCenter";
import BaseComponent, { componentUpdateArgs } from "./BaseComponent.js";

class ProfileIcon extends BaseComponent {
	rootTemplate: HTMLTemplateElement;

	_build(){
		let clone = this.rootTemplate.content.cloneNode(true);
		let elemDiv = clone.firstChild as HTMLElement;
		this.root.appendChild(elemDiv);
	}

	constructor(root: HTMLElement, params: {}, templatesArea: HTMLElement, dataCenter: DataCenter){
		super(root, params, templatesArea, dataCenter);
		this.rootTemplate = this.templatesArea.querySelector("#ProfileIcon");
		this._build();
	}

	update(params: componentUpdateArgs) {
		if(params.type = "reload") {
			this._build();
		}
		return this;
	}
}

export default ProfileIcon;