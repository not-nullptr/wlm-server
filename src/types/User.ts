export interface Token {
	passport: string;
}

export enum MSNStatus {
	Online = "NLN",
	Idle = "IDL",
	Busy = "BSY",
	Away = "AWY",
	BeRightBack = "BRB",
	OnThePhone = "PHN",
	OutToLunch = "LUN",
	Invisible = "HDN",
	Offline = "FLN",
}
