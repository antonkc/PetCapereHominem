import { ILightPost } from "./IPost";

interface IReport {
	id: String;
	emmiter: String;
	reportedUser: String;
	reason: String;
	message: any;
	post: ILightPost;
}

export default IReport