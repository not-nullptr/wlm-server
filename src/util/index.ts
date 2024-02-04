import colors from "chalk";
import { Socket } from "net";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { MSNStatus, Token } from "../types/User";
import { readFileSync } from "fs";
import { Activity, FeedVideo } from "../types/REST";
import { Contact } from "../types/Soap";
import {
	APIUser,
	GatewayDispatchEvents,
	GatewayDispatchPayload,
	GatewayOpcodes,
	GatewayReceivePayload,
	GatewaySendPayload,
} from "discord-api-types/v9";
import WebSocket from "ws";
import { RelationshipTypes } from "discord.js-selfbot-v13/typings/enums";
import { listeners } from "process";
import { Ready, Status } from "./Discord";
import { v4 } from "uuid";
import { NLNOptions, UBXOptions } from "../types/Socket";

export const sockets: Socket[] = [];

export function getSortaISODate() {
	const currentDate = new Date();
	const year = currentDate.getFullYear();
	const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
	const day = currentDate.getDate().toString().padStart(2, "0");
	const hours = currentDate.getHours().toString().padStart(2, "0");
	const minutes = currentDate.getMinutes().toString().padStart(2, "0");
	const seconds = currentDate.getSeconds().toString().padStart(2, "0");
	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
}

export async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function log(prefix: string, ...lines: string[]) {
	for (const line of lines) {
		console.log(`${colors.gray("[")}${prefix}${colors.gray("]")} ${line}`);
	}
}

export enum DispatchEventsCustom {
	RelationshipRemove = "RELATIONSHIP_REMOVE",
}

export type DispatchPayloadsCustom =
	| GatewayDispatchPayload
	| {
			t: DispatchEventsCustom.RelationshipRemove;
			op: GatewayOpcodes.Dispatch;
			d: {
				id: string;
				type: RelationshipTypes;
				nickname: string;
			};
	  };

export type DispatchData<
	T extends GatewayDispatchEvents | DispatchEventsCustom,
> = (DispatchPayloadsCustom & {
	t: T;
})["d"];

export type OpcodeSendData<T extends GatewayOpcodes> = (GatewaySendPayload & {
	op: T;
})["d"];

export type OpcodeReceiveData<T extends GatewayOpcodes> =
	(GatewayReceivePayload & {
		op: T;
	})["d"];

enum GatewayCapabilities {
	LAZY_USER_NOTES = 1 << 0,
	NO_AFFINE_USER_IDS = 1 << 1,
	VERSIONED_READ_STATES = 1 << 2,
	VERSIONED_USER_GUILD_SETTINGS = 1 << 3,
	DEDUPE_USER_OBJECTS = 1 << 4,
	PRIORITIZED_READY_PAYLOAD = 1 << 5,
	MULTIPLE_GUILD_EXPERIMENT_POPULATIONS = 1 << 6,
	NON_CHANNEL_READ_STATES = 1 << 7,
	AUTH_TOKEN_REFRESH = 1 << 8,
	USER_SETTINGS_PROTO = 1 << 9,
	CLIENT_STATE_V2 = 1 << 10,
	PASSIVE_GUILD_UPDATE = 1 << 11,
	UNKNOWN = 1 << 12,
}

export class MSNUtils {
	static socket: WebSocket;
	static sendOp<T extends GatewayOpcodes>(
		opcode: T,
		payload: OpcodeSendData<T>,
	): void {
		try {
			const data = {
				op: opcode,
				d: payload,
			};
			this.socket.send(JSON.stringify(data));
		} catch {
			console.log("failed to send op", opcode, payload);
		}
	}
	static readyData: Ready;
	static async startGateway() {
		return new Promise<void>((resolve) => {
			this.socket = new WebSocket(
				"wss://gateway.discord.gg/?v=9&encoding=json",
			);
			this.socket.onopen = async () => {
				MSNUtils.sendOp(GatewayOpcodes.Identify, {
					token: process.env.DISCORD_TOKEN,
					capabilities:
						GatewayCapabilities.LAZY_USER_NOTES |
						GatewayCapabilities.NO_AFFINE_USER_IDS |
						GatewayCapabilities.VERSIONED_READ_STATES |
						GatewayCapabilities.VERSIONED_USER_GUILD_SETTINGS |
						GatewayCapabilities.DEDUPE_USER_OBJECTS |
						GatewayCapabilities.PRIORITIZED_READY_PAYLOAD |
						GatewayCapabilities.MULTIPLE_GUILD_EXPERIMENT_POPULATIONS |
						GatewayCapabilities.NON_CHANNEL_READ_STATES |
						GatewayCapabilities.AUTH_TOKEN_REFRESH |
						GatewayCapabilities.USER_SETTINGS_PROTO |
						GatewayCapabilities.CLIENT_STATE_V2 |
						GatewayCapabilities.PASSIVE_GUILD_UPDATE |
						GatewayCapabilities.UNKNOWN,
					properties: {
						os: "Linux",
						browser: "Chrome",
						device: "",
						system_locale: "en-GB",
						browser_user_agent:
							"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
						browser_version: "119.0.0.0",
						os_version: "",
						referrer: "",
						referring_domain: "",
						referrer_current: "",
						referring_domain_current: "",
						release_channel: "stable",
						client_build_number: 245648,
						client_event_source: null,
					},
					presence: {
						status: "unknown",
						since: 0,
						activities: [],
						afk: false,
					},
					compress: false,
					client_state: {
						guild_versions: {},
						highest_last_message_id: "0",
						read_state_version: 0,
						user_guild_settings_version: -1,
						user_settings_version: -1,
						private_channels_version: "0",
						api_code_version: 0,
					},
				} as any);
			};
			this.socket.onmessage = (e) => {
				const data = JSON.parse(
					e.data.toString(),
				) as GatewayReceivePayload;
				switch (data.op) {
					case GatewayOpcodes.Hello:
						setInterval(() => {
							this.sendOp(GatewayOpcodes.Heartbeat, null);
						}, data.d.heartbeat_interval);
						break;
					case GatewayOpcodes.Dispatch: {
						const dispatchData = data as DispatchPayloadsCustom;
						switch (dispatchData.t) {
							case GatewayDispatchEvents.Ready: {
								this.readyData =
									dispatchData.d as unknown as Ready;
								break;
							}
							case "READY_SUPPLEMENTAL" as any: {
								this.readyData = {
									...this.readyData,
									...dispatchData.d,
								} as any;
								resolve();
								break;
							}
							case GatewayDispatchEvents.PresenceUpdate: {
								this.listeners
									.find((l) => l.e === "PRESENCE_UPDATE")
									?.cb(dispatchData.d);
							}
						}
						break;
					}
				}
			};
		});
	}
	static listeners: { e: string; cb: (data: any) => void; id: string }[] = [];
	static on(event: string, cb: (data: any) => void) {
		const id = v4();
		this.listeners.push({ e: event, cb, id });
	}
	static off(id: string) {
		this.listeners = this.listeners.filter((l) => l.id !== id);
	}
	static getSocketByPassport(passport: string) {
		return sockets.find((s) => s.passport === passport);
	}
	static getSocketByTicket(ticket: string) {
		return sockets.find((s) => s.ticket === ticket);
	}
	static getSocketBySessionId(sessionId: string) {
		return sockets.find((s) => s.sessionId === sessionId);
	}
	static async genRandomBytes(length: number) {
		return new Promise<Buffer>((resolve, reject) => {
			randomBytes(length, (err, buf) => {
				if (err) reject(err);
				else resolve(buf);
			});
		});
	}
}

export function verifyAndDecodeJWT(token: string): Promise<Token> {
	return new Promise<any>((resolve, reject) => {
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err || !decoded || typeof decoded === "string")
				reject(err || "No token returned!");
			else resolve(decoded);
		});
	});
}

export function encodeJWT(payload: Token): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
			if (err || !token) reject(err || "No token returned!");
			else resolve(token);
		});
	});
}

export function getRST2Failure(date: string = getSortaISODate()) {
	const template = readFileSync("templates/RST2/failure.xml");
	return template.toString().replaceAll("{%1}", date);
}

export function getRST2Success(
	token: string,
	date: string = getSortaISODate(),
) {
	const template = readFileSync("templates/RST2/success.xml");
	return template
		.toString()
		.replaceAll("{%1}", token)
		.replaceAll("{%2}", date);
}

export function generateActivityXML(activity: Activity) {
	// 	return `<ActivityDetails>
	// 	<OwnerCID>0</OwnerCID>
	// 	<ObjectId>${activity.date.toISOString()}</ObjectId>
	// 	<ApplicationId>505</ApplicationId>
	// 	<ChangeType>20</ChangeType>
	// 	<PublishDate>${activity.date.toISOString()}</PublishDate>
	// 	<TemplateVariables>
	// 		<TemplateVariable xsi:type="TextTemplateVariable">
	// 			<Name>Name</Name>
	// 			<Value>${activity.title}</Value>
	// 		</TemplateVariable>
	// 		${activity.variables
	// 			.map(
	// 				(variable) => `<TemplateVariable xsi:type="${variable.type}">
	// 			<Name>${variable.name}</Name>
	// 			<Value>${variable.value}</Value>
	// 		</TemplateVariable>`,
	// 			)
	// 			.join("\n")}
	// 	</TemplateVariables>
	// </ActivityDetails>`;
	let [template, mapTemplate] = readFileSync("templates/news/activity.xml")
		.toString()
		.split("<!-- MAP_TEMPLATE -->");
	template = template
		.replaceAll("{%1}", activity.date.toISOString())
		.replaceAll("{%2}", activity.title);
	const mapTemplates = activity.variables.map((variable) =>
		mapTemplate
			.replaceAll("{%1}", variable.type)
			.replaceAll("{%2}", variable.name)
			.replaceAll("{%3}", variable.value),
	);
	template = template.replace("{%3}", mapTemplates.join("\n"));
	return template;
}

export function generateTemplateXML(activity: Activity) {
	const template = readFileSync("templates/news/template.xml");
	return template.toString().replaceAll("{%1}", activity.body);
}

export function generateSoapXML(body: string) {
	const template = readFileSync("templates/soap/generic.xml");
	return template.toString().replaceAll("{%1}", body);
}

export function createContact(contact: Contact) {
	return `<Contact>
	<contactId>${contact.contactId}</contactId>
	<contactInfo>
		<contactType>${contact.contactInfo.contactType}</contactType>
		<quickName>${contact.contactInfo.quickName}</quickName>
		<passportName>${contact.contactInfo.passportName}</passportName>
		<IsPassportNameHidden>${contact.contactInfo.IsPassportNameHidden}</IsPassportNameHidden>
		<displayName>${contact.contactInfo.displayName}</displayName>
		<puid>${contact.contactInfo.puid}</puid>
		<CID>${contact.contactInfo.CID}</CID>
		<IsNotMobileVisible>${contact.contactInfo.IsNotMobileVisible}</IsNotMobileVisible>
		<isMobileIMEnabled>${contact.contactInfo.isMobileIMEnabled}</isMobileIMEnabled>
		<isMessengerUser>${contact.contactInfo.isMessengerUser}</isMessengerUser>
		<isFavorite>${contact.contactInfo.isFavorite}</isFavorite>
		<isSmtp>${contact.contactInfo.isSmtp}</isSmtp>
		<hasSpace>${contact.contactInfo.hasSpace}</hasSpace>
		<spotWatchState>${contact.contactInfo.spotWatchState}</spotWatchState>
		<birthdate>${contact.contactInfo.birthdate.toISOString()}</birthdate>
		<primaryEmailType>${contact.contactInfo.primaryEmailType}</primaryEmailType>
		<PrimaryLocation>${contact.contactInfo.PrimaryLocation}</PrimaryLocation>
		<PrimaryPhone>${contact.contactInfo.PrimaryPhone}</PrimaryPhone>
		<IsPrivate>${contact.contactInfo.IsPrivate}</IsPrivate>
		<Gender>${contact.contactInfo.Gender}</Gender>
		<TimeZone>${contact.contactInfo.TimeZone}</TimeZone>
	</contactInfo>
	<propertiesChanged>${contact.propertiesChanged}</propertiesChanged>
	<fDeleted>${contact.fDeleted}</fDeleted>
	<lastChange>${contact.lastChange.toISOString()}</lastChange>
</Contact>`;
}

export function generateABFindContactsPagedXML(contacts: Contact[]) {
	const template = readFileSync("templates/soap/ABFindContactsPaged.xml");
	return template
		.toString()
		.replaceAll("{%1}", contacts.map(createContact).join("\n"));
}

export function generateFeedVideo(video: FeedVideo) {
	const videoTemplate = readFileSync("templates/news/video.xml");
	return videoTemplate
		.toString()
		.replaceAll("{%1}", video.title)
		.replaceAll("{%2}", video.link)
		.replaceAll("{%3}", video.description)
		.replaceAll("{%4}", video.enclosure.url)
		.replaceAll("{%5}", video.enclosure.type)
		.replaceAll("{%6}", video.enclosure.length.toString())
		.replaceAll("{%7}", new Date(video.pubDate).toISOString())
		.replaceAll("{%8}", video.guid);
}

export function generateVideoPicksXML(videos: FeedVideo[]) {
	let picks = readFileSync("templates/news/video-picks.xml").toString();
	picks = picks.replace("{%1}", videos.map(generateFeedVideo).join("\n"));
	return picks;
}

export async function discordReq<Req = any, Res = any>(
	endpoint: string,
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
	body?: Req,
) {
	const res = await fetch(`https://discord.com/api/v9${endpoint}`, {
		method,
		headers: {
			Authorization: process.env.DISCORD_TOKEN,
			"Content-Type": "application/json",
		},
		body: body ? JSON.stringify(body) : undefined,
	});
	return res.json() as Promise<Res>;
}

function genNLN(options: NLNOptions) {
	return `NLN ${options.status} 1:${options.passport} ${options.displayName.replaceAll(
		" ",
		"%20",
	)} ${options.id}:48 0\r\n`;
}

function genUBX(options: UBXOptions) {
	const guid = v4();
	const xml = `<Data><PSM></PSM><CurrentMedia></CurrentMedia><MachineGuid>{${guid}}</MachineGuid><DDP></DDP><SignatureSound></SignatureSound><Scene></Scene><ColorScheme></ColorScheme><EndpointData id="{${guid.toLowerCase()}}"><Capabilities>2788999212:48</Capabilities></EndpointData></Data>`;
	return `UBX 1:${options.passport} ${xml.length}\r\n${xml}`;
}

export function generatePresences(options: (NLNOptions & UBXOptions)[]) {
	return options.map((o) => `${genNLN(o)}${genUBX(o)}`);
}

export function discordStatusToMSNStatus(status: Status): MSNStatus {
	switch (status) {
		case Status.Online:
			return MSNStatus.Online;
		case Status.Idle:
			return MSNStatus.Away;
		case Status.DND:
			return MSNStatus.Busy;
		case Status.Offline:
			return MSNStatus.Offline;
	}
}
