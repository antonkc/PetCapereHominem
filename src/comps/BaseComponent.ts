import type DataCenter from "../js/DataCenter"

type componentUpdateArgs<T> = {
	type: string,
	args?: T
}

type IBaseComponent<T> = {
	update: (params: componentUpdateArgs<T>) => Promise<IBaseComponent<T>>
}

export type { componentUpdateArgs }

class BaseComponent<T> implements IBaseComponent<T> {
	protected root: HTMLElement
	protected templatesArea: HTMLElement
	protected dataCenter: DataCenter

	constructor(root: HTMLElement, params: T, templatesArea: HTMLElement, dataCenter: DataCenter){
		this.root = root;
		this.templatesArea = templatesArea;
		this.dataCenter = dataCenter;
	}

	public async update(params: componentUpdateArgs<T>): Promise<typeof this> {
		return this;
	}
}

export default BaseComponent;

export type { IBaseComponent };