enum InfoPromtType {
	info,
	warning,
	error
}
type IInfoPromt = {
	baseCode: string,
	msgType: InfoPromtType,
	placeHolderFillers: Array<string>
}

export {InfoPromtType, IInfoPromt}