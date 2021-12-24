import { employTemplate } from "../../js/common/utils.js";
import type DataCenter from "../../js/DataCenter.js";
import BaseComponent, { componentUpdateArgs } from "../BaseComponent.js";


// This is an example component
type Component1Args = {
	title: string,
	body: string
}
class Component1 extends BaseComponent<Component1Args>{
	data: Component1Args;
	rootTemplate: HTMLTemplateElement;

	protected assignFields(params: Component1Args){
		this.data.title = params.title ? params.title : this.data.title;
		this.data.body = params.body ? params.body : this.data.body;
	}

	protected async build() {
		let body = employTemplate(this.rootTemplate, this.root);
		body.querySelector('#title').textContent = this.data.title;
		body.querySelector('#body').textContent = this.data.body;
	}

	constructor(root: HTMLElement, params: Component1Args, templatesArea: HTMLElement, dataCenter: DataCenter) {
		super(root, params, templatesArea, dataCenter);
		this.rootTemplate = this.templatesArea.querySelector("#Component1");
		this.data = {
			title: "",
			body: ""
		};
		this.assignFields(params);
		this.build();
	}

	async update(params: componentUpdateArgs<Component1Args>){
		if(params.type === "reload"){
			this.assignFields(params.args);
			this.build();
		}

		return this;
	}
}

export default Component1;