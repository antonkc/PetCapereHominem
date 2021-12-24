/**
 * 
 * @param template Has to match this format /<template id="[^"]+"><div class="[^"]+">.*<\\/div><\\/template>/ (only one element under template with no whitespace between template tags and child tags)
 * @param root 
 * @returns firstChild of isntantiated template
 */
function employTemplate<T extends HTMLElement>(template: HTMLTemplateElement, root: T, addToExisting?: boolean): HTMLElement{
	if(!addToExisting) root.innerHTML = "";
	let clone = template.content.firstElementChild.cloneNode(true) as HTMLElement;
	root.appendChild(clone);

	return clone;
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

export {employTemplate, fillPlaceholders};