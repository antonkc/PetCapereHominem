import type ISharedSpaceDefinition from "./types/ISharedSpaceDefinition.js";

/**
 * [0] abort flag, default: false. Stops the emmission if set to true
 */
type IEmmitFlags = Array<boolean>;
type IKeySubscribers = {
	fns: Array<(value: any) => void>,
	eventContext: any,
	value: any
}
type IKeyAwaiters = {
	fns: Array<(value: any) => void>
}

let subscribers: any = {};
let oneOffs: any = {};

const getKeySubs: (key: string) => [IKeySubscribers, IKeyAwaiters] = (key) => {
	if(subscribers[key] === undefined){
		(subscribers[key] as IKeySubscribers) = {
			fns: [],
			eventContext: {},
			value: undefined
		}
	}
	if(oneOffs[key] === undefined){
		(oneOffs[key] as IKeyAwaiters) = {
			fns: []
		}
	}

	return [subscribers[key], oneOffs[key]];
}
const subscribe: (subs: [IKeySubscribers, IKeyAwaiters], fn: (value: any) => void) => void = (subs, fn) => {
	subs[0].fns.push(fn);
}
const awaitValue: (subs: [IKeySubscribers, IKeyAwaiters], fn: (value: any) => void) => void = (subs, fn) => {
	subs[1].fns.push(fn);
}

class DataCenter{
	static singleton: DataCenter = null;
	constructor(){
		if(DataCenter.singleton !== null){
			return DataCenter.singleton;
		}
		DataCenter.singleton = this;
	}

	shared: ISharedSpaceDefinition = {};

	/**
	 * Runs callback as soon as the value for the key is available, but not sooner than setTimeout(callback, 0)
	 */
	get: (key: string, callback: (value: any) => void, isOneOff?: boolean) => DataCenter = (key, callback, isOneOff) => {
		let subs = getKeySubs(key);

		if(subs[0].value !== undefined){
			setTimeout( callback.bind(null, subs[0].value), 0);
			if(!isOneOff) subscribe(subs, callback);
		}
		else {
			if(isOneOff) awaitValue( subs, callback);
			else subscribe( subs, callback);
		}

		return this;
	}
	/**
	 * Runs callback if there is an emmit for a related key
	 */
	subscribe: (key: string, callback: (value: any) => void, isOneOff?: boolean) => DataCenter = (key, callback, isOneOff) => {
		let subs = getKeySubs(key);
		if(isOneOff) awaitValue( subs, callback);
		else subscribe( subs, callback);

		return this;
	}
	/**
	 * Runs all subscribers to key with value
	 */
	emmit: (key: string, value: any) => DataCenter = (key, value) => {
		let subs = getKeySubs(key);
		subs[0].value = value;

		setTimeout(() => {
			subs[0].fns.forEach((callback) => {
				try {
					callback(value);
				} catch (err) {
					console.error(err);
				}
			});
			subs[1].fns.forEach((callback) => {
				try {
					callback(value);
				} catch (err) {
					console.error(err);
				}
			});
			subs[1].fns = [];
		}, 0);

		return this;
	}
	/**
	 * Runs all subscribers to key with the return value of fn, can be aborted setting flag 0 to true
	 */
	advancedEmmit: (key: string, fn: (previousValue: any, eventContext: any, flags: IEmmitFlags) => any) => DataCenter = (key, fn) => {
		let subs = getKeySubs(key);
		let flags: IEmmitFlags = [false];
		let value = fn(subs[0].value, subs[0].eventContext, flags);
		
		if(!flags[0]){
			subs[0].value = value;

			setTimeout(() => {
				subs[0].fns.forEach((callback) => {
					try {
						callback(value);
					} catch (err) {
						console.error(err);
					}
				});
				subs[1].fns.forEach((callback) => {
					try {
						callback(value);
					} catch (err) {
						console.error(err);
					}
				});
				subs[1].fns = [];
			}, 0);
		}

		return this;
	}
}

export default DataCenter;