import { Request, Response } from "express";
import {
	MSNUtils,
	discordReq,
	generateABFindContactsPagedXML,
	generateSoapXML,
	log,
	sleep,
} from "../util";
import types from "discord-api-types/v9";
import getUuidByString from "uuid-by-string";
import { XMLParser } from "fast-xml-parser";
import { logs } from "../constants";

function convertFriendsToContacts(
	friends: {
		id: string;
		type: number;
		nickname: string | null;
		user: types.APIUser;
	}[],
) {
	return generateABFindContactsPagedXML(
		friends.map((f) => ({
			contactId: getUuidByString(f.user.id),
			contactInfo: {
				contactType: "Regular",
				quickName: "Sample Contact",
				passportName: `${f.user.username}@discord.com`,
				birthdate: new Date("2000-01-01T00:00:00Z"),
				CID: f.user.id,
				displayName: "Sample Contact",
				Gender: "Unspecified",
				hasSpace: false,
				isFavorite: false,
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
		})),
	);
}

export default async function ABFindContactsPaged(req: Request, res: Response) {
	const friends = MSNUtils.readyData.relationships.map((r) => ({
		...r,
		user: MSNUtils.readyData.users.find((u) => u.id === r.id)!,
	}));
	return res.status(200).send(
		generateSoapXML(
			convertFriendsToContacts(friends),
			// generateABFindContactsPagedXML([
			// 	{
			// 		contactId: "b67ff5eb-eabf-4471-bd7a-b5a41d95bcfb",
			// 		contactInfo: {
			// 			contactType: "Regular",
			// 			quickName: "Sample Contact",
			// 			passportName: "samplecontact@discord.com",
			// 			birthdate: new Date("2000-01-01T00:00:00Z"),
			// 			CID: "1234567890",
			// 			displayName: "Sample Contact",
			// 			Gender: "Unspecified",
			// 			hasSpace: false,
			// 			isFavorite: true,
			// 			isMessengerUser: true,
			// 			isMobileIMEnabled: false,
			// 			IsNotMobileVisible: false,
			// 			IsPassportNameHidden: false,
			// 			IsPrivate: false,
			// 			isSmtp: false,
			// 			primaryEmailType: "ContactEmailPersonal",
			// 			PrimaryLocation: "ContactLocationPersonal",
			// 			PrimaryPhone: "ContactPhonePersonal",
			// 			spotWatchState: "NoDevice",
			// 			TimeZone: "None",
			// 			puid: 0,
			// 		},
			// 		propertiesChanged: "",
			// 		fDeleted: false,
			// 		lastChange: new Date(),
			// 	},
			// ]),
		),
	);
}
