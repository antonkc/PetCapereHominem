
export type IComponentQueueElement = {
	param: any,
	root: HTMLElement
}

export type IComponentDefinition = {
	t: string, // Title
	z: string, // Target zone
	s: string, // Source/Component name
	p: any // parameters
}

export type IComponentHandlerElement = {
	update: (params: any) => void
}

export type IViewDefinition = {
	name: String,
	layout: String, // Name of the layout employed
	components: Array<IComponentDefinition>
}

export type IViewContainer = {
	v: Array<IViewDefinition>
}
// Localization standarts: https://github.com/unicode-org/cldr/tree/main/common/bcp47
export type IUserPreferences = {
	allowedUsage: {
		functional: boolean,
		preferences: boolean,
		analytics: boolean,
		adverisement: boolean
	},
	dateLocale: "es-es" | "en-us", // https://www.techonthenet.com/js/language_tags.php
	dateTimeFormatLong: Intl.DateTimeFormatOptions,
	dateTimeFormat: Intl.DateTimeFormatOptions,
	lang: string,
	currency: string
}