import BaseComponent, { componentUpdateArgs } from "src/comps/BaseComponent.js";
import type DataCenter from "src/js/DataCenter.js";

// This is an example component
type Component1Args = {
	title: string,
	body: string
}
class Component1 extends BaseComponent{
	static _componentName = "Component1"

	data: Component1Args;
	rootTemplate: HTMLTemplateElement;

	_assignFields(params: Component1Args){
		this.data.title = params.title ? params.title : this.data.title;
		this.data.body = params.body ? params.body : this.data.body;
	}

	async _update() {
		let clone = this.rootTemplate.content.cloneNode(true);
		this.root.innerHTML = "";
		this.root.appendChild(clone);
		this.root.querySelector('#title').textContent = this.data.title;
		this.root.querySelector('#body').textContent = this.data.body;
	}

	constructor(root: HTMLElement, params: Component1Args, templatesArea: HTMLElement, dataCenter: DataCenter) {
		super(root, params, templatesArea, dataCenter);
		this.rootTemplate = this.templatesArea.querySelector("#"+Component1._componentName);
		this.data = {
			title: "",
			body: ""
		};
		this._assignFields(params);
		this._update();
	}

	update(params: componentUpdateArgs){
		if(params.type === "reload"){
			this._assignFields(params.args);
			this._update();
		}

		return this;
	}
}

export default Component1;