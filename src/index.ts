import express, { Request, Response } from "express";
import https from "https";
import fs from "fs";
import { XMLParser } from "fast-xml-parser";
import xml2js from "xml2js";
import { Activity, FeedVideo, RST2Parser, Rst2 } from "./types/REST";
import {
	MSNUtils,
	discordStatusToMSNStatus,
	encodeJWT,
	generateActivityXML,
	generatePresences,
	generateTemplateXML,
	generateVideoPicksXML,
	getRST2Failure,
	getRST2Success,
	getSortaISODate,
	sleep,
	sockets,
	verifyAndDecodeJWT,
} from "./util";
import colors from "chalk";
import net, { Socket } from "net";
import { version } from "../package.json";
import {
	Command,
	ICommand,
	Locale,
	Protocol,
	SendFunction,
	UsrState,
} from "./types/Command";
import { logs, commandMap } from "./constants";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { ABServiceParser } from "./types/ABService";
import { createServer } from "http";
import adRouter from "./ads";
import configRouter from "./config";
import { GatewayPresenceUpdate } from "discord-api-types/v9";

dotenv.config();

console.log(
	colors.green(
		colors.bold(" __    __  __               __                          "),
	),
);
console.log(
	colors.green(
		colors.bold(
			"/ / /\\ \\ \\/ /   /\\/\\       / _\\ ___ _ ____   _____ _ __ ",
		),
	),
);
console.log(
	colors.green(
		colors.bold(
			"\\ \\/  \\/ / /   /    \\ _____\\ \\ / _ \\ '__\\ \\ / / _ \\ '__|",
		),
	),
);
console.log(
	colors.green(
		colors.bold(
			" \\  /\\  / /___/ /\\/\\ \\_____|\\ \\  __/ |   \\ V /  __/ |   ",
		),
	),
);
console.log(
	colors.green(
		colors.bold(
			"  \\/  \\/\\____/\\/    \\/     \\__/\\___|_|    \\_/ \\___|_|   ",
		),
	),
);
console.log(
	`\n${colors.italic(
		`${colors.blueBright(`v${version}`)} ${colors.gray(
			"//",
		)} ${colors.greenBright("the worst best msn server out there :)")}`,
	)}`,
);

console.log();

function log(prefix: string, text: string) {
	console.log(`${colors.gray("[")}${prefix}${colors.gray("]")} ${text}`);
}

const app = express();
const parser = new XMLParser();

app.set("etag", false);

app.use(cookieParser());

app.use((req, res, next) => {
	// parse the body of the request
	let body = "";
	req.on("data", (chunk) => {
		body += chunk.toString();
	});
	req.on("end", () => {
		req.body = parser.parse(body);
		req.rawBody = body;
		if (!req.path.includes("/static/")) {
			res.header("Content-Type", "text/xml; charset=utf-8");
		}
		res.removeHeader("x-powered-by");
		res.removeHeader("Connection");
		res.removeHeader("keep-alive");
		const ip =
			req.headers["x-forwarded-for"] || req.connection.remoteAddress;
		res.set("Server", `Your computer. I'm not joking. ${ip}.`);
		next();
	});
});

app.post("/RST2.srf", async (req, res) => {
	const body = new RST2Parser(req.body);
	log(logs.RST2, `Requesting token for ${colors.yellow(body.username)}`);
	if (
		false
		// || body.password !== "password"
	) {
		return res.status(200).send(getRST2Failure());
	} else {
		// we're in.
		function waitForSocket(passport: string) {
			return new Promise<Socket | undefined>(async (resolve) => {
				setTimeout(() => resolve(undefined), 10000); // check for a maximum of 100 times
				while (!MSNUtils.getSocketByPassport(passport)) {
					await sleep(100); // hacky but it works
				}
				resolve(MSNUtils.getSocketByPassport(passport));
			});
		}
		const socket = await waitForSocket(body.username);
		if (!socket) return res.sendStatus(500);
		log(logs.RST2, "Socket was successfully found.");
		const ticket = await encodeJWT({
			passport: body.username,
		});
		socket.ticket = ticket;
		return res.status(200).send(getRST2Success(ticket));
	}
});

app.post("/whatsnew/whatsnewservice.asmx", (req, res) => {
	const news: Activity[] = (
		JSON.parse(fs.readFileSync("./static/data.json", "utf-8"))
			.news as Activity[]
	).map((activity) => ({
		...activity,
		date: new Date(activity.date),
	}));
	return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
	xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:xsd="http://www.w3.org/2001/XMLSchema">
	<soap:Header>
		<WNServiceHeader
			xmlns="http://www.msn.com/webservices/AddressBook">
			<Version>15.1.1216.0</Version>
		</WNServiceHeader>
	</soap:Header>
	<soap:Body>
		<GetContactsRecentActivityResponse
			xmlns="http://www.msn.com/webservices/AddressBook">
			<GetContactsRecentActivityResult>
				<Activities>
                    ${news.map(generateActivityXML).join("\n")}
				</Activities>
				<Templates>
                    ${news.map(generateTemplateXML).join("\n")}
				</Templates>
				<FeedUrl>http://escargot.chat/news</FeedUrl>
			</GetContactsRecentActivityResult>
		</GetContactsRecentActivityResponse>
	</soap:Body>
</soap:Envelope>`);
});

const options = {
	key: fs.readFileSync("./src/certs/localhost.key"),
	cert: fs.readFileSync("./src/certs/localhost.crt"),
};

app.use("/advertisements", adRouter);

app.use("/config", configRouter);
app.use("/Config", configRouter);

const httpsServer = https.createServer(options, app);

const httpServer = createServer(app);

httpsServer.listen(443, () => {
	log(logs.HTTPS, "Server running on port 443");
});

httpServer.listen(80, () => {
	log(logs.HTTP, "Server running on port 80");
});

const staticServer = express();

staticServer.use(express.static("static"));

staticServer.listen(3000, () => {
	log(logs.static, "Server running on port 3000");
});

function parse(message: string) {
	const commands: string[] = [];
	if (message.endsWith("\r\n")) {
		const lines = message.split("\r\n");
		const lastLine = lines.pop();
		if (lastLine && lastLine !== "") {
			lines.push(lastLine);
		}

		commands.push(...lines);
	} else {
		commands.push(message);
	}

	const parsedCmds: ICommand[] = [];
	commands.forEach((command) => {
		let [cmd, trid, ...args] = command.split(" ") as [
			Command,
			string,
			...string[],
		];
		if (command.trim() === "") return;
		const isCommand = /^[A-Z]{3}/.test(command);
		if (!isCommand) {
			// if not, append to the previous command
			parsedCmds[parsedCmds.length - 1].payload = command;
			return;
		}
		console.log(
			logs.receive,
			`Received command ${colors.blue(cmd)} (${colors.cyan(
				commandMap[cmd],
			)}), Transaction ID ${colors.yellow(trid)} (args: ${
				args.length > 0
					? colors.yellow(args.join(", "))
					: colors.dim(colors.italic("none"))
			})`,
		);
		// if the command has data after the first \r\n:
		if (command.includes("\r\n") && command.split("\r\n").length > 1) {
			const data = command.split("\r\n").slice(1).join("\r\n");
			switch (cmd) {
				case Command.ADL: {
					// const matches = data.match(/n="([^"]*)"/gm);
					// const [domain, emailBeginning, displayName] = matches?.map(
					// 	(match) => match.split('"')[1]
					// )!;
					// if (!domain || !emailBeginning || !displayName) {
					// 	console.log(logs.warning, "Invalid ADL command");
					// 	break;
					// }
					parsedCmds.push({
						type: cmd,
						trid: parseInt(trid),
						// domain,
						// emailBeginning,
						// displayName,
					});
					break;
				}
			}
			return;
		}
		switch (cmd) {
			case Command.VER:
				parsedCmds.push({
					type: cmd,
					trid: parseInt(trid),
					supportedProtocols: args as Protocol[],
				});
				break;
			case Command.CVR:
				parsedCmds.push({
					type: cmd,
					trid: parseInt(trid),
					localeId: Number(args[0]) as Locale,
					osType: args[1],
					osVer: parseFloat(args[2]),
					arch: args[3],
					libraryName: args[4],
					clientVer: args[5],
					clientName: args[6],
					passport: args[7],
				});
				break;
			case Command.USR: {
				if (args[1] === UsrState.Initial) {
					parsedCmds.push({
						type: cmd,
						trid: parseInt(trid),
						TWN: args[0] as any,
						state: args[1] as any,
						passport: args[2],
					});
				} else if (args[1] === UsrState.Subsequent) {
					parsedCmds.push({
						type: cmd,
						trid: parseInt(trid),
						TWN: args[0] as any,
						state: args[1] as any,
						t: args[2],
						p: args[3],
						machineGuid: args[4],
					});
				} else {
					parsedCmds.push({
						type: cmd,
						trid: parseInt(trid),
						TWN: args[0] as any,
						state: args[1] as any,
						t: args[2],
						p: args[3],
						machineGuid: args[4],
					});
				}
				break;
			}
			default:
				parsedCmds.push({
					type: cmd,
					trid: parseInt(trid),
				} as any);
				break;
		}
	});
	return parsedCmds;
}

(async () => {
	await MSNUtils.startGateway();
	const handlerTs = fs.readdirSync("./src/handlers");
	const handlers = await Promise.all(
		handlerTs.map(async (handler) => {
			const handlerModule = await import(`./handlers/${handler}`);
			return {
				type: handler.replace(".ts", "") as Command,
				fn: handlerModule.default as (
					data: ICommand,
					send: SendFunction,
					socket: net.Socket,
					rawMessage: string,
				) => void,
			};
		}),
	);
	const webServicesTs = fs.readdirSync("./src/webServices");
	const webServices = await Promise.all(
		webServicesTs.map(async (webService) => {
			const webServiceModule = await import(
				`./webServices/${webService}`
			);
			return {
				type: webService.replace(".ts", ""),
				fn: webServiceModule.default as (
					req: Request,
					res: Response,
				) => void,
			};
		}),
	);
	const tcpServer = net.createServer((socket) => {
		sockets.push(socket);
		socket.on("close", () => {
			sockets.splice(sockets.indexOf(socket), 1);
		});
		function send(data: string) {
			console.log(logs.send, data);
			socket.write(data + "\r\n");
		}
		const id = MSNUtils.on(
			"PRESENCE_UPDATE",
			(d: GatewayPresenceUpdate) => {
				const user = MSNUtils.readyData.users.find(
					(u) => u.id === d.user.id,
				);
				if (
					!user ||
					!MSNUtils.readyData.relationships.find(
						(r) => r.user_id === d.user.id,
					)
				)
					return;
				socket.write(
					generatePresences([
						{
							passport: `${user.username}@discord.com`,
							displayName: user.global_name || user.username,
							status: discordStatusToMSNStatus(d.status! as any),
							id: "0000000000",
						},
					]).join(""),
				);
			},
		);
		socket.on("data", (data) => {
			const cmds = parse(data.toString());
			cmds.forEach((cmd) => {
				const handler = handlers.find(
					(handler) => handler.type === cmd.type,
				);
				if (handler) {
					handler.fn(
						cmd,
						(commandName, ...args) => {
							send(
								`${commandName} ${
									cmd.trid + " " || ""
								}${args.join(" ")}`,
							);
						},
						socket,
						data.toString(),
					);
				} else {
					console.log(
						logs.warning,
						`No handler for ${colors.blue(cmd.type)} (${colors.cyan(
							commandMap[cmd.type],
						)}). You can find documentation for it here: ${colors.cyan(
							colors.underline(
								colors.italic(
									colors.bold(
										`https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/${cmd.type}`,
									),
								),
							),
						)}`,
					);
				}
			});
		});
	});

	tcpServer.listen(1863, () => {
		log(logs.TCP, "Server running on port 1863");
	});

	app.post("/abservice/SharingService.asmx", (req, res) => {
		const action = req.headers.soapaction as string | undefined;
		if (!action) return res.sendStatus(500);
		const actionName = action?.split("/").at(-1);
		const webService = webServices.find(
			(webService) => webService.type === actionName,
		);
		if (!webService) {
			log(
				logs.warning,
				`No web service found for ${colors.blue(actionName)}`,
			);
			return res.sendStatus(500);
		}
		webService.fn(req, res);
	});
	app.post("/storageservice/SchematizedStore.asmx", (req, res) => {
		return res.status(404).send();
	});
	app.post("/abservice/abservice.asmx", async (req, res) => {
		const action = req.headers.soapaction as string | undefined;
		if (!action) return res.sendStatus(500);
		const actionName = action?.split("/").at(-1);
		const webService = webServices.find(
			(webService) => webService.type === actionName,
		);
		if (!webService) {
			log(
				logs.warning,
				`No web service found for ${colors.blue(actionName)}`,
			);
			return res.sendStatus(500);
		}
		webService.fn(req, res);
	});
})();
