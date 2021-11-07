import { ILightPost } from "./IPost";

interface ILightProfile {
	id: string,
	name: string,
	photo: string,
	cert: boolean;
}

interface IProfile {
	id: string;
	bio?: string;
	pbMail?: string;
	upDate?: Date;
	modDate?: Date;
	cert?: boolean;
	subs?: Array<ILightPost>;
}

export default IProfile

export type { ILightProfile }