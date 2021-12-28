import type IAddress from "./IAddress";

interface ILightProfile {
	id: string,
	name: string,
	photo: string,
	cert: boolean,
}

interface IProfile {
	id: string,
	name?: string,
	bio?: string,
	photo?: string,
	pbMail?: string,
	pbPhone?: string,
	upDate?: Date,
	modDate?: Date,
	addr?: IAddress,
	cert?: boolean,
	certOrg?: boolean,
}

export default IProfile

export type { ILightProfile }