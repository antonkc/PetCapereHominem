type IValidationCodes = Array<{code: string, subCodes: Array<string>}>
type IValitationResult = {
	valid: Boolean,
	codes: IValidationCodes
};

export type { IValitationResult, IValidationCodes}