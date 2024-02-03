import colors from "chalk";
import { Socket } from "net";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { Token } from "../types/User";
import { readFileSync } from "fs";
import { Activity, FeedVideo } from "../types/REST";
import { Contact } from "../types/Soap";

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

export class MSNUtils {
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
