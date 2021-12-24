import type { Analytics } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-analytics.js";
import type { FirebaseApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import type { Auth } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";
import type PetCap from "../PetCap.js";

type ISharedSpaceDefinition = {
	petCap?: PetCap,
	fireApp?: FirebaseApp,
	auth?: Auth,
	analytics?: Analytics,
}

export default ISharedSpaceDefinition;