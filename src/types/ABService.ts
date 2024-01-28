export interface BaseAsmx {
	"?xml": string;
	"soap:Envelope": SoapEnvelope;
}

export interface SoapEnvelope {
	"soap:Header": SoapHeader;
	"soap:Body": SoapBody;
}

export interface SoapBody {
	ABFindContactsPaged: ABFindContactsPaged;
}

export interface ABFindContactsPaged {
	filterOptions: FilterOptions;
	abView: string;
	extendedContent: string;
}

export interface FilterOptions {
	DeltasOnly: boolean;
	ContactFilter: ContactFilter;
}

export interface ContactFilter {
	IncludeHiddenContacts: boolean;
}

export interface SoapHeader {
	ABApplicationHeader: ABApplicationHeader;
	ABAuthHeader: ABAuthHeader;
}

export interface ABApplicationHeader {
	ApplicationId: string;
	IsMigration: boolean;
	PartnerScenario: string;
	CacheKey: string;
}

export interface ABAuthHeader {
	ManagedGroupRequest: boolean;
	TicketToken: string;
}

export class ABServiceParser {
	constructor(public xml: BaseAsmx) {
		this.xml = xml;
	}
	public get token(): string {
		return this.xml["soap:Envelope"]["soap:Header"].ABAuthHeader
			.TicketToken;
	}
}
