import type { IUserPreferences } from "../../types/types";
import type IAddress from "./IAddress";
import type { ILightPost } from "./IPost";

interface IPrivateProfile {
	subs?: Array<ILightPost>,
	addr?: IAddress,
	pref?: IUserPreferences,
}

export default IPrivateProfile