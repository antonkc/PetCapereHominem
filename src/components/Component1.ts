// This is an example component
type Component1Args = {
	title: string,
	body: string
}
class Component1 {
	static _componentName = "Component1"

	data: Component1Args;
	templatesArea: Element;
	root: HTMLElement;
	rootTemplate: HTMLTemplateElement;

	_assignFields(params: any){
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

	constructor(root: HTMLElement, params: Component1Args, templatesArea: HTMLElement) {
		this.root = root;
		this.templatesArea = templatesArea;
		this.rootTemplate = this.templatesArea.querySelector("#"+Component1._componentName);
		this.data = {
			title: "",
			body: ""
		};
		this._assignFields(params);
		this._update();
	}

	update(params:any){
		this._assignFields(params);
		this._update();
	}
}

export default Component1;