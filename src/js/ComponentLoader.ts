import type BaseComponent from "../comps/BaseComponent.js";
import type DataCenter from "./DataCenter.js";
import type { IComponentHandlerElement, IComponentQueueElement } from "./types.js";

class ComponentLoader {
	static dataCenter: DataCenter = null;
	name: String;
	component: typeof BaseComponent;
	templateRoot: HTMLElement;
	_queue: Array< IComponentQueueElement>;
	handlers: Array< IComponentHandlerElement>;

	static templatesContainer: HTMLElement = null;
	static componentsPath: string = window.location.origin + "/comps/";

	constructor(name : string, isOnlyJs?: Boolean){
		isOnlyJs = !!isOnlyJs;
		if(ComponentLoader.templatesContainer === null){
			ComponentLoader.templatesContainer = document.querySelector("#templatesContainer");
		}
		this.name = name;
		this.component = null;
		this.templateRoot = null;
		this._queue = [];
		this.handlers = [];
		let promises: Array<Promise<void>> = [];

		promises.push((async () => {
			this.component = (await import(`${ComponentLoader.componentsPath}${name}.js`)).default;
		})());

		if(isOnlyJs === false)
		promises.push((async () => {
			const res = await fetch(`${ComponentLoader.componentsPath}${name}.html`);
			if(res.ok) {
				let templates = await res.text();

				let templateRoot = document.createElement("div");
				templateRoot.setAttribute("data-component", name);
				templateRoot.innerHTML = templates;

				ComponentLoader.templatesContainer.appendChild(templateRoot);
				this.templateRoot = templateRoot;
				return;
			}
			throw `{${name}} template html not retrieved`;
		})());
		
		Promise.all(promises).then( async () => {
			this._queue.forEach( (elem) => {
				this.handlers.push(new this.component(elem.root, elem.param, this.templateRoot, ComponentLoader.dataCenter));
			} );
			delete this._queue;
			this._queue = [];
		} );
	}

	_load(root: HTMLElement, param: any) {
		const component = new this.component(root, param, this.templateRoot, ComponentLoader.dataCenter);
		this.handlers.push(component);
	}

	load(root: HTMLElement, param: any){
		if(this.component !== null) {
			this._load(root, param)
		}
		else {
			this._queue.push({root:root,param:param});
		}
	}

	reset(){
		this.handlers = [];
		this._queue = [];
	}
}

export default ComponentLoader;