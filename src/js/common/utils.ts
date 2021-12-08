/**
 * 
 * @param template Has to match this format /<template id="[^"]+"><div class="[^"]+">.*<\\/div><\\/template>/ (only one element under template with no whitespace between template tags and child tags)
 * @param root 
 * @returns firstChild of isntantiated template
 */
function employTemplate<T extends HTMLElement>(template: HTMLTemplateElement, root: T, addToExisting?: boolean): HTMLElement{
	if(!addToExisting) root.innerHTML = "";
	const clone = template.content.cloneNode(true);
	root.appendChild(clone);

	return clone as HTMLElement;
}

const placeHolderMatch = /\{\{([0-9]+)\}\}/g;
function fillPlaceholders(s : string, ...values : Array<string>) : string{
	return s.replace(placeHolderMatch, (match, $1) => {
		let index : number = Number.parseInt($1);
		if(isNaN(index) || index < 1 || values[index] === undefined){
			return match;
		}
		return values[index];
	});
}

export {employTemplate, fillPlaceholders};