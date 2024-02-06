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
	groupIds?: string[];
}

export interface Contact {
	contactId: string;
	contactInfo: ContactInfo;
	propertiesChanged: string;
	fDeleted: boolean;
	lastChange: Date;
}

/*
			<Group>
				<groupId>06a2a129-5c17-497a-ad57-45557393910d</groupId>
				<groupInfo>
					<annotations>
						<Annotation>
							<Name>MSN.IM.Display</Name>
							<Value>1</Value>
						</Annotation>
					</annotations>
					<groupType>c8529ce2-6ead-434d-881f-341e17db3ff8</groupType>
					<name>Friends</name>
					<IsNotMobileVisible>false</IsNotMobileVisible>
					<IsPrivate>false</IsPrivate>
					<IsFavorite>false</IsFavorite>
				</groupInfo>
				<propertiesChanged />
				<fDeleted>false</fDeleted>
				<lastChange>2024-02-04T13:58:21Z</lastChange>
			</Group>
*/

export interface GroupInfo {
	annotations: { [key: string]: string };
	name: string;
}

export interface Group {
	groupId: string;
	groupInfo: GroupInfo;
}

export interface TextAd {
	text: string;
	link: string;
}
