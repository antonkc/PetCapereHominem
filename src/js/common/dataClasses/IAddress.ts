interface IAddress {
	geoHash: String,
	country?: String,
	countrySub1?: String,
	countrySub2?: String,
	countrySub3?: String,
	countrySub4?: String,
	street?: string,
	streetNumber?: string,
	PC?: string
}

export default IAddress