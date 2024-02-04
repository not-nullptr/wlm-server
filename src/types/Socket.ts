import { MSNStatus } from "./User";

export interface NLNOptions {
	status: MSNStatus;
	passport: string;
	displayName: string;
	id: string;
}

export interface UBXOptions {
	passport: string;
}
