import type { ILightPost } from "./IPost";

interface IReport {
	id: string,
	emmiter: string,
	reportedUser: string,
	reason: string,
	message: string,
	post: ILightPost,
}

export default IReport