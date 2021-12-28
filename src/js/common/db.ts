import type { FirebaseApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, connectFirestoreEmulator, Firestore } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";

function getFireStoreDB(fireApp: FirebaseApp) : Firestore{
	let fireStore;
	if(window.location.hostname !== "localhost" ){
		fireStore = getFirestore(fireApp);
	}
	else {
		fireStore = getFirestore();
		connectFirestoreEmulator(fireStore, "http://localhost", 8080);
	}

	return fireStore;
}

export default getFireStoreDB;