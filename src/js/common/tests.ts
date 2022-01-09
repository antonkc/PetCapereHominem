import type { IValitationResult } from "../types/IValidationResult";

function test<T = any>(testFn: (a: T) => boolean, testedValue: T, validationRef: IValitationResult, failCode: string, failSubCodes: Array<string>): boolean{
	let valid: boolean;
	valid = testFn(testedValue);
	if(!valid){
		validationRef.valid = false;
		validationRef.codes.push({code: failCode, subCodes: failSubCodes});
	}
	return valid;
}
function testMatch<T = any>(a: T, b: T, validationRef: IValitationResult, failCode: string, failSubCodes: Array<string>): boolean{
	let valid: boolean;
	valid = a === b;
	if(!valid){
		validationRef.valid = false;
		validationRef.codes.push({code: failCode, subCodes: failSubCodes});
	}
	return valid;
}

function isNotEmpty(val: string){ return (val && val.replace(/ \t\r\n/g,'') !== "")}
function isLong(length: number, val: string){ return val && val.length >= length}
function isShort(length: number, val: string){ return val && val.length <= length}
function isSecure(val: string){ return (/[0-9]/).test(val) && (/[a-z]/).test(val) && (/[A-Z]/).test(val)}
function isValidPhoneNumber(val: string){ return /^(\+[0-9][0-9][ \t]+)?[0-9 ]+$/.test(val)}
function isValidEmail(val: string){return /^(?=[a-z0-9@.!#$%&'*+/=?^_‘{|}~-]{1,254}$)(?=[a-z0-9.!#$%&'*+/=?^_‘{|}~-]{1,64}@)[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@(?:(?=[a-z0-9-]{1,63}\.)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?=[a-z0-9-]{1,63}$)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(val)}

export {test, testMatch, isNotEmpty, isLong, isShort, isSecure, isValidPhoneNumber, isValidEmail};