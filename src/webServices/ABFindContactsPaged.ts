import { Request, Response } from "express";
import {
	generateABFindContactsPagedXML,
	generateSoapXML,
	sleep,
} from "../util";
import { Contact } from "../types/Soap";

export default async function ABFindContactsPaged(req: Request, res: Response) {
	return res.status(200).send(
		generateSoapXML(
			generateABFindContactsPagedXML([
				{
					contactId: "b67ff5eb-eabf-4471-bd7a-b5a41d95bcfb",
					contactInfo: {
						contactType: "Regular",
						quickName: "Sample Contact",
						passportName: "samplecontact@discord.com",
						birthdate: new Date("2000-01-01T00:00:00Z"),
						CID: "1234567890",
						displayName: "Sample Contact",
						Gender: "Unspecified",
						hasSpace: false,
						isFavorite: true,
						isMessengerUser: true,
						isMobileIMEnabled: false,
						IsNotMobileVisible: false,
						IsPassportNameHidden: false,
						IsPrivate: false,
						isSmtp: false,
						primaryEmailType: "ContactEmailPersonal",
						PrimaryLocation: "ContactLocationPersonal",
						PrimaryPhone: "ContactPhonePersonal",
						spotWatchState: "NoDevice",
						TimeZone: "None",
						puid: 0,
					},
					propertiesChanged: "",
					fDeleted: false,
					lastChange: new Date(),
				},
			]),
		),
	);
}
