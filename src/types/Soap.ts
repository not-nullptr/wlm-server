export interface ContactInfo {
	contactType: "Regular" | "Me";
	quickName: string;
	passportName: string;
	IsPassportNameHidden: boolean;
	displayName: string;
	puid: number;
	CID: string;
	IsNotMobileVisible: boolean;
	isMobileIMEnabled: boolean;
	isMessengerUser: boolean;
	isFavorite: boolean;
	isSmtp: boolean;
	hasSpace: boolean;
	spotWatchState: "NoDevice";
	birthdate: Date;
	primaryEmailType: "ContactEmailPersonal";
	PrimaryLocation: "ContactLocationPersonal";
	PrimaryPhone: "ContactPhonePersonal";
	IsPrivate: boolean;
	Gender: "Male" | "Female" | "Unspecified";
	TimeZone: "None";
}

export interface Contact {
	contactId: string;
	contactInfo: ContactInfo;
	propertiesChanged: string;
	fDeleted: boolean;
	lastChange: Date;
}

export interface TextAd {
	text: string;
	link: string;
}
