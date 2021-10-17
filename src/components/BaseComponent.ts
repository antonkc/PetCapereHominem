import { type } from "os";
import type DataCenter from "../js/DataCenter";

type componentUpdateArgs = {
	type: string,
	args?: any
}

export type { componentUpdateArgs };

class BaseComponent {
	protected root: HTMLElement
	protected templatesArea: HTMLElement
	protected dataCenter: DataCenter

	constructor(root: HTMLElement, params: any, templatesArea: HTMLElement, dataCenter: DataCenter){
		this.root = root;
		this.templatesArea = templatesArea;
		this.dataCenter = dataCenter;
	}

	update: (params: componentUpdateArgs) => BaseComponent;
}

export default BaseComponent;