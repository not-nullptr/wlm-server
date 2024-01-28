export interface Rst2 {
	"?xml": string;
	"s:Envelope": SEnvelope;
}

export interface SEnvelope {
	"s:Header": SHeader;
	"s:Body": SBody;
}

export interface SBody {
	"ps:RequestMultipleSecurityTokens": PSRequestMultipleSecurityTokens;
}

export interface PSRequestMultipleSecurityTokens {
	"wst:RequestSecurityToken": WstRequestSecurityToken[];
}

export interface WstRequestSecurityToken {
	"wst:RequestType": string;
	"wsp:AppliesTo": WspAppliesTo;
	"wsp:PolicyReference"?: string;
}

export interface WspAppliesTo {
	"wsa:EndpointReference": WsaEndpointReference;
}

export interface WsaEndpointReference {
	"wsa:Address": string;
}

export interface SHeader {
	"wsa:Action": string;
	"wsa:To": string;
	"wsa:MessageID": number;
	"ps:AuthInfo": PSAuthInfo;
	"wsse:Security": WsseSecurity;
}

export interface PSAuthInfo {
	"ps:HostingApp": string;
	"ps:BinaryVersion": number;
	"ps:UIVersion": number;
	"ps:Cookies": string;
	"ps:RequestParams": string;
}

export interface WsseSecurity {
	"wsse:UsernameToken": WsseUsernameToken;
	"wsu:Timestamp": WsuTimestamp;
}

export interface WsseUsernameToken {
	"wsse:Username": string;
	"wsse:Password": string;
}

export interface WsuTimestamp {
	"wsu:Created": Date;
	"wsu:Expires": Date;
}

export class RST2Parser {
	constructor(public xml: Rst2) {
		this.xml = xml;
	}
	public get username(): string {
		return this.xml["s:Envelope"]["s:Header"]["wsse:Security"][
			"wsse:UsernameToken"
		]["wsse:Username"];
	}
	public get password(): string {
		return this.xml["s:Envelope"]["s:Header"]["wsse:Security"][
			"wsse:UsernameToken"
		]["wsse:Password"];
	}
}

export class ABServiceParser {}
