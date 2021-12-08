import type DataCenter from "../js/DataCenter.js";
import BaseComponent, { componentUpdateArgs } from "./BaseComponent.js";


// This is an example component
type Component1Args = {
	title: string,
	body: string
}
class Component1 extends BaseComponent<Component1Args>{
	static _componentName = "Component1"

	data: Component1Args;
	rootTemplate: HTMLTemplateElement;

	protected _assignFields(params: Component1Args){
		this.data.title = params.title ? params.title : this.data.title;
		this.data.body = params.body ? params.body : this.data.body;
	}

	protected async _update() {
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

	async update(params: componentUpdateArgs<Component1Args>){
		if(params.type === "reload"){
			this._assignFields(params.args);
			this._update();
		}

		return this;
	}
}

export default Component1;