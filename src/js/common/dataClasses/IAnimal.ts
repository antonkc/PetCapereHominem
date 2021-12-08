import type AnimalStatus from "./AnimalStatus";

interface ILightAnimal {
	id: String;
	name: String;
	status: AnimalStatus;
}

interface IAnimal {
	id: String;
	name: String;
	duplicated: Boolean;
	species: string;
	subspecies: String;
	imgs: Array<String>;
	status: AnimalStatus;
}

export default IAnimal;

export type { ILightAnimal }