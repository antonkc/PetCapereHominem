interface IAddress {
	geoHash: string,
	country?: string,
	countrySub1?: string,
	countrySub2?: string,
	countrySub3?: string,
	countrySub4?: string,
	street?: string,
	pc?: string,
	od?: string,
}

export default IAddress