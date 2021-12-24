
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

export type IUserPreferences = {
	allowedUsage: {
		functional: boolean,
		preferences: boolean,
		analytics: boolean,
		adverisement: boolean
	},
	lang: string,
	currency: string
}