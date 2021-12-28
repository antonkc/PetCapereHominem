import type IAddress from "./IAddress";
import type { ILightAnimal } from "./IAnimal";
import type { ILightProfile } from "./IProfile";
import type PostType from "./PostType";

interface ILightPost {
	id: string,
	type: PostType,
	modDate: Date,
	title: string,
}

interface IPost {
	id: string,
	author?: ILightProfile,
	type?: PostType,
	upDate?: Date,
	modDate?: Date,
	img?: string,
	lang?: string,
	title?: string,
	leadIn?: string,
	body?: string,
	addr?: IAddress,
	anis?: Array<ILightAnimal>,
}

export default IPost

export type { ILightPost }