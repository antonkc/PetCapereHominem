import type IAddress from "./dataClasses/IAddress";

/**
 *
 * @param template Has to match this format /<template id="[^"]+"><div class="[^"]+">.*<\\/div><\\/template>/ (only one element under template with no whitespace between template tags and child tags)
 * @param root
 * @returns firstChild of isntantiated template
 */
function employTemplate<T extends HTMLElement>(template: HTMLTemplateElement, root: Element, addToExisting?: boolean): T{
	if(!addToExisting) root.innerHTML = "";
	let clone = template.content.firstElementChild.cloneNode(true) as T;
	root.appendChild(clone);

	return clone;
}

function getInnerValue(attrValRef: string | string[], data: any) {
	let value;
	if (Array.isArray(attrValRef)) {
		let lastValue = data;
		let isEndReached = false;
		let i = 0;

		do {
			lastValue = lastValue[attrValRef[i]];

			i++;
			if (i >= attrValRef.length) {
				isEndReached = true;
			}
		}
		while (!isEndReached && lastValue !== undefined);

		if (isEndReached) {
			value = lastValue;
		}
		else {
			console.warn(`Property not reached, last index:${i}`, attrValRef, data);
		}
	}
	else if (typeof attrValRef === "string") {
		value = data[attrValRef];
	}
	return value;
}
function getAddrString(addr: IAddress): string {
	let str = "";
	if(addr){
		str += addr.country ? addr.country + ", " : "-,";
		str += addr.countrySub1 ? addr.countrySub1 + ", " : "";
		str += addr.pc ? "("+ addr.pc+ ") " : "(-) ";
	}
	return str;
}
function padcutLeft(base: string | number, length: number, paddingChar: string): string {
	return cutLeft(padLeft(base, length, paddingChar), length);
}
function padLeft(base: string | number, length: number, paddingChar: string): string {
	base = base.toString();
	if(base.length < length){
		return (paddingChar)
	}
}
function cutLeft(base: string | number, length: number): string {
	base = base.toString();
	if(base.length > length){
		return base.substring(base.length - length)
	}
	return base;
}
function firebaseTimeToDate(fireTimeStamp: any): Date {
	if(fireTimeStamp) return new Date(fireTimeStamp.seconds*1000);
	return null;
}
function getFormData<T = any>(form: HTMLFormElement): T {
	let result: any = {};
	const relevantElems = form.elements;
	for (let i = 0; i < relevantElems.length; i++) {
		const elem = relevantElems[i] as HTMLInputElement;

		if(elem.name){
			result[elem.name] = elem.value;
		}
	}

	return result as T;
}
function setFormData(form: HTMLFormElement, data: any): HTMLFormElement {
	const fields = Object.keys(data);
	for (let i = 0; i < fields.length; i++) {
		const elem = fields[i];
		const possibleInput = form[elem] as HTMLInputElement;

		if(possibleInput){
			possibleInput.value = data[elem];
		}
	}

	return form;
}

type IObjectDataToStringSetter = {
	[key: string]: (value: any) => string | object
}
/**
 * Fills inputs, span and paragraphs under root with dataSources. Inputs must be named and the rest must have an id assigned.
 * @param root
 * @param dataSources Array of sources ordered by priority, once it finds a value it will not write anymore.
 * @param objectAndArrayFormatter Object, if a property of a dataSource is an array or an object, it will employ the function defined under the same key
 * @returns root
 */
function setHtmlElementsData(root: HTMLElement, dataSources: any[], objectAndArrayFormatter?: IObjectDataToStringSetter): HTMLElement {
	const elems = root.querySelectorAll("span[id],p[id],time[id]");
	const inputs = root.querySelectorAll("input[name],textarea[name]");

	for (let i = 0; i < elems.length; i++) {
		const elem = elems[i];
		for (let j = 0; j < dataSources.length; j++) {
			const data = dataSources[j];
			if(data[elem.id]){
				if(typeof data[elem.id] === "object" || Array.isArray( data[elem.id])){
					if(objectAndArrayFormatter[elem.id]){
						let val = objectAndArrayFormatter[elem.id](data[elem.id]);
						if(typeof val === "object"){
							let assignKeys = Object.keys(val);
							for (let k = 0; k < assignKeys.length; k++) {
								const key = assignKeys[k];
								(elem as any)[key] = (val as any)[key];
							}
						}
						else {
							elem.textContent = val;
						}
					}
				}
				else {
					elem.textContent = data[elem.id];
				}
				break;
			}
		}
	}
	for (let i = 0; i < inputs.length; i++) {
		const input = inputs[i] as HTMLInputElement;
		for (let j = 0; j < dataSources.length; j++) {
			const data = dataSources[j];
			if(data[input.name]){
				input.value = data[input.name];
				break;
			}
		}
	}

	return root;
}

function populateWithIdSelector(ids: readonly string[], toPopulate: any, templatesArea?: HTMLElement | Document){
	templatesArea = templatesArea ?? document;

	ids.forEach((id) => {
		toPopulate[id] = templatesArea.querySelector("#"+id);
		if(toPopulate[id] === null){
			console.warn(`Could not find "${id}"`, templatesArea);
		}
	})

	return toPopulate;
}

const placeHolderMatch = /\{\{([0-9]+)\}\}/g;
function fillPlaceholders(s : string, ...values : Array<string>) : string{
	return s.replace(placeHolderMatch, (match, $1) => {
		let index : number = Number.parseInt($1);
		if(isNaN(index) || index < 1 || values[index-1] === undefined){
			return match;
		}
		return values[index-1];
	});
}

function getLoader(remHeight: number = 4) : HTMLDivElement{
	let elem = document.createElement("div");
	elem.classList.add("loader");
	elem.style.height = remHeight + "rem";
	return elem;
}
function getInlineLoader() : HTMLSpanElement{
	let elem = document.createElement("span");
	elem.classList.add("loader");
	return elem;
}

export {employTemplate, fillPlaceholders, getInnerValue, populateWithIdSelector, getLoader, getInlineLoader, getAddrString, padcutLeft, padLeft, cutLeft, firebaseTimeToDate, getFormData, setFormData, setHtmlElementsData};