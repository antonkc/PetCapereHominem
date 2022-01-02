import type { ILightPost } from "./IPost";

interface IReport {
	emmiter: string,
	reportedUser: string,
	reason: string,
	message: string,
	post: ILightPost,
}

export default IReport