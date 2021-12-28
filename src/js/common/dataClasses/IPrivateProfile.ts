import type IAddress from "./IAddress";
import type { ILightPost } from "./IPost";

interface IPrivateProfile {
	id: string,
	subs?: Array<ILightPost>,
	addr?: IAddress,
}

export default IPrivateProfile