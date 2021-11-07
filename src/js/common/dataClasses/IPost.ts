import IAddress from "./IAddress";
import { ILightAnimal } from "./IAnimal";
import { ILightProfile } from "./IProfile";
import PostType from "./PostType";

interface ILightPost {
	id: string;
	type: PostType;
	modDate: Date;
	title: String;
}

interface IPost {
	id: string;
	author?: ILightProfile;
	type?: PostType;
	upDate?: Date;
	modDate?: Date;
	img?: String;
	lang?: String;
	title?: String;
	leadIn?: String;
	body?: String;
	addr?: IAddress;
	anis?: Array<ILightAnimal>;
}

export default IPost

export type { ILightPost }