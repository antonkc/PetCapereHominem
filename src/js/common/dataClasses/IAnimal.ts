import type AnimalStatus from "./AnimalStatus";

interface ILightAnimal {
	id: string,
	name: string,
	status: AnimalStatus,
}

interface IAnimal {
	id: string,
	name: string,
	duplicated: Boolean,
	species: string,
	subspecies: string,
	imgs: Array<string>,
	status: AnimalStatus,
}

export default IAnimal;

export type { ILightAnimal }