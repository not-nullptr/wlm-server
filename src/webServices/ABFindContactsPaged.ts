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
	guilds: {
		id: string;
		name: string;
	}[],
) {
	return generateABFindContactsPagedXML(
		[
			{
				groupId: "6234b9fd-03ac-4ae0-b7f0-36643e4f8485",
				groupInfo: {
					annotations: {},
					name: "Friends",
				},
			},
			{
				groupId: "7e28faf0-33f1-41ea-adda-eb45f3e612ef",
				groupInfo: {
					annotations: {},
					name: "Guilds",
				},
			},
		],
		[
			...friends.map((f) => ({
				contactId: getUuidByString(f.user.id),
				contactInfo: {
					contactType: "Regular",
					quickName:
						f.nickname || f.user.global_name || f.user.username,
					passportName: `${f.user.username}@discord.com`,
					birthdate: new Date("2000-01-01T00:00:00Z"),
					CID: f.user.id,
					displayName:
						f.nickname || f.user.global_name || f.user.username,
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
					groupIds: ["6234b9fd-03ac-4ae0-b7f0-36643e4f8485"], // "Friends"
				},
				propertiesChanged: "",
				fDeleted: false,
				lastChange: new Date(),
			})),
			...guilds.map((g) => ({
				contactId: getUuidByString(g.id),
				contactInfo: {
					contactType: "Regular",
					quickName: g.name,
					passportName: `${g.id}@discord.com`,
					birthdate: new Date("2000-01-01T00:00:00Z"),
					CID: g.id,
					displayName: g.name,
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
					groupIds: ["7e28faf0-33f1-41ea-adda-eb45f3e612ef"], // "Guilds"
				},
				propertiesChanged: "",
				fDeleted: false,
				lastChange: new Date(),
			})),
		].flat() as any,
	);
}

export default async function ABFindContactsPaged(req: Request, res: Response) {
	const friends = MSNUtils.readyData.relationships.map((r) => ({
		...r,
		user: MSNUtils.readyData.users.find((u) => u.id === r.id)!,
	}));
	console.log(MSNUtils.readyData.guilds);
	const guilds = MSNUtils.readyData.guilds.map((g) => ({
		id: g.id,
		name: g.properties.name,
	}));
	return res.status(200).send(
		generateSoapXML(
			convertFriendsToContacts(friends, guilds),
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
