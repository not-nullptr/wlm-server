import express, { Request } from "express";
import https from "https";
import fs from "fs";
import { XMLParser } from "fast-xml-parser";
import { RST2Parser, Rst2 } from "./types/REST";
import { getSortaISODate } from "./util";
import colors from "chalk";
import net from "net";
import { version } from "../package.json";

console.log(
	colors.green(
		colors.bold(" __    __  __               __                          ")
	)
);
console.log(
	colors.green(
		colors.bold(
			"/ / /\\ \\ \\/ /   /\\/\\       / _\\ ___ _ ____   _____ _ __ "
		)
	)
);
console.log(
	colors.green(
		colors.bold(
			"\\ \\/  \\/ / /   /    \\ _____\\ \\ / _ \\ '__\\ \\ / / _ \\ '__|"
		)
	)
);
console.log(
	colors.green(
		colors.bold(
			" \\  /\\  / /___/ /\\/\\ \\_____|\\ \\  __/ |   \\ V /  __/ |   "
		)
	)
);
console.log(
	colors.green(
		colors.bold(
			"  \\/  \\/\\____/\\/    \\/     \\__/\\___|_|    \\_/ \\___|_|   "
		)
	)
);
console.log(
	`\n${colors.italic(
		`${colors.blueBright(`v${version}`)} ${colors.gray(
			"//"
		)} ${colors.greenBright("the worst best msn server out there :)")}`
	)}`
);

console.log();

const logs = {
	send: `${colors.green(">>>")}`,
	receive: `${colors.red("<<<")}`,
	RST2: `${colors.blue("RST2")}`,
	HTTPS: `${colors.green("HTTPS")}`,
	TCP: `${colors.redBright("TCP")}`,
};

function log(prefix: string, text: string) {
	console.log(`${colors.gray("[")}${prefix}${colors.gray("]")} ${text}`);
}

const app = express();
const parser = new XMLParser();

app.set("etag", false);

app.use((req, res, next) => {
	// parse the body of the request
	let body = "";
	req.on("data", (chunk) => {
		body += chunk.toString();
	});
	req.on("end", () => {
		req.body = parser.parse(body);
		req.rawBody = body;
		res.header("Content-Type", "text/xml; charset=utf-8");
		res.removeHeader("x-powered-by");
		res.removeHeader("Connection");
		res.removeHeader("keep-alive");
		next();
	});
});

app.post("/RST2.srf", async (req, res) => {
	const body = new RST2Parser(req.body);
	log(logs.RST2, `Requesting token for ${colors.yellow(body.username)}`);
	console.log(
		colors.italic(colors.blueBright("(lets just pretend this is real)"))
	);
	return res.status(200).send(`<?xml version="1.0" encoding="utf-8" ?>
<S:Envelope xmlns:S="http://www.w3.org/2003/05/soap-envelope" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:wst="http://schemas.xmlsoap.org/ws/2005/02/trust" xmlns:psf="http://schemas.microsoft.com/Passport/SoapServices/SOAPFault">
	<S:Header>
		<psf:pp xmlns:psf="http://schemas.microsoft.com/Passport/SoapServices/SOAPFault">
			<psf:serverVersion>1</psf:serverVersion>
			<psf:authstate>0x80048800</psf:authstate>
			<psf:reqstatus>0x80048821</psf:reqstatus>
			<psf:serverInfo Path="Live1" RollingUpgradeState="ExclusiveNew" LocVersion="0" ServerTime="${getSortaISODate()}" BuildVersion="16.0.28426.6">XYZPPLOGN1A23 2017.09.28.12.44.07</psf:serverInfo>
			<psf:cookies/>
			<psf:response/>
		</psf:pp>
	</S:Header>
	<S:Body>
		<S:Fault>
			<S:Code>
				<S:Value>S:Sender</S:Value>
				<S:Subcode>
					<S:Value>wst:FailedAuthentication</S:Value>
				</S:Subcode>
			</S:Code>
			<S:Reason>
				<S:Text xml:lang="en-US">Authentication Failure</S:Text>
			</S:Reason>
			<S:Detail>
				<psf:error>
					<psf:value>0x80048821</psf:value>
					<psf:internalerror>
						<psf:code>0x80041012</psf:code>
						<psf:text>The entered and stored passwords do not match.&#x000D;&#x000A;</psf:text>
					</psf:internalerror>
				</psf:error>
			</S:Detail>
		</S:Fault>
	</S:Body>
</S:Envelope>`);
});

const options = {
	key: fs.readFileSync("./src/certs/localhost.key"),
	cert: fs.readFileSync("./src/certs/localhost.crt"),
};

const httpsServer = https.createServer(options, app);

httpsServer.listen(443, () => {
	log(logs.HTTPS, "Server running on port 443");
});

const tcpServer = net.createServer((socket) => {
	function send(data: string) {
		console.log(logs.send, data);
	}
	send("VER 1 MSNP18 CVR0");
	socket.on("data", (data) => {
		const commands = data.toString().split("\r\n");
		for (const command of commands) {
			if (command === "" || command === " ") continue;
			console.log(logs.receive, command);
			const [cmd, ...args] = command.split(" ");
		}
	});
});

tcpServer.listen(1863, () => {
	log(logs.TCP, "Server running on port 1863");
});
