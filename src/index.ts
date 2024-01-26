import express, { Request } from "express";
import https from "https";
import fs from "fs";
import { XMLParser } from "fast-xml-parser";
import { RST2Parser, Rst2 } from "./types/REST";

const app = express();
const parser = new XMLParser();

app.use((req, res, next) => {
	// parse the body of the request
	let body = "";
	req.on("data", (chunk) => {
		body += chunk.toString();
	});
	req.on("end", () => {
		req.body = parser.parse(body);
		res.header("Content-Type", "text/xml; charset=utf-8");
		next();
	});
});

app.post("/RST2.srf", (req, res) => {
	const body = new RST2Parser(req.body);
	console.log(body.username, body.password);
	return res.status(200).send(`
<?xml version="1.0" encoding="utf-8" ?>
<S:Envelope
	xmlns:S="http://www.w3.org/2003/05/soap-envelope"
	xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd"
	xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd"
	xmlns:wst="http://schemas.xmlsoap.org/ws/2005/02/trust"
	xmlns:psf="http://schemas.microsoft.com/Passport/SoapServices/SOAPFault">
	<S:Body>
		<S:Fault>
			<S:Code>
				<S:Value>S:Sender</S:Value>
				<S:Subcode>
					<S:Value>wst:InvalidRequest</S:Value>
				</S:Subcode>
			</S:Code>
			<S:Reason>
				<S:Text xml:lang="en-US">Invalid Request</S:Text>
			</S:Reason>
			<S:Detail>
				<psf:error>
					<psf:value>0x80048820</psf:value>
					<psf:internalerror>
						<psf:code>0x80045c01</psf:code>
						<psf:text>Invalid STS request.&#x000D;&#x000A;</psf:text>
					</psf:internalerror>
				</psf:error>
			</S:Detail>
		</S:Fault>
	</S:Body>
</S:Envelope>

	`);
});

const options = {
	key: fs.readFileSync("./src/certs/localhost.key"),
	cert: fs.readFileSync("./src/certs/localhost.crt"),
};

https.createServer(options, app).listen(443, () => {
	console.log("Listening on port 443");
});
