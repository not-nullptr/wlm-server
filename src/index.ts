import express, { Request, Response } from "express";
import https from "https";
import fs from "fs";
import { XMLParser } from "fast-xml-parser";
import xml2js from "xml2js";
import { RST2Parser, Rst2 } from "./types/REST";
import {
	MSNUtils,
	encodeJWT,
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

dotenv.config();

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
	if (
		false
		// || body.password !== "password"
	) {
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
		return res.status(200).send(`<?xml version="1.0" encoding="utf-8" ?>
<S:Envelope xmlns:S="http://www.w3.org/2003/05/soap-envelope" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:wsa="http://www.w3.org/2005/08/addressing">
	<S:Header>
		<wsa:Action xmlns:S="http://www.w3.org/2003/05/soap-envelope" xmlns:wsa="http://www.w3.org/2005/08/addressing" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="Action" S:mustUnderstand="1">http://schemas.xmlsoap.org/ws/2005/02/trust/RSTR/Issue</wsa:Action>
		<wsa:To xmlns:S="http://www.w3.org/2003/05/soap-envelope" xmlns:wsa="http://www.w3.org/2005/08/addressing" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="To" S:mustUnderstand="1">http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:To>
		<wsse:Security S:mustUnderstand="1">
			<wsu:Timestamp xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="TS">
				<wsu:Created>${getSortaISODate()}</wsu:Created>
				<wsu:Expires>${getSortaISODate()}</wsu:Expires>
			</wsu:Timestamp>
		</wsse:Security>
		<psf:pp xmlns:psf="http://schemas.microsoft.com/Passport/SoapServices/SOAPFault">
			<psf:serverVersion>1</psf:serverVersion>
			<psf:PUID>B67FF5EB1D95BCFB</psf:PUID>
			<psf:configVersion>16.000.26889.00</psf:configVersion>
			<psf:uiVersion>3.100.2179.0</psf:uiVersion>
			<psf:mobileConfigVersion>16.000.26208.0</psf:mobileConfigVersion>
			<psf:appDataVersion>1</psf:appDataVersion>
			<psf:authstate>0x48803</psf:authstate>
			<psf:reqstatus>0x0</psf:reqstatus>
			<psf:serverInfo Path="Live1" RollingUpgradeState="ExclusiveNew" LocVersion="0" ServerTime="2024-02-01T19:14:15Z">XYZPPLOGN1A23 2017.09.28.12.44.07</psf:serverInfo>
			<psf:cookies/>
			<psf:browserCookies>
				<psf:browserCookie Name="MH" URL="http://www.msn.com">MSFT; path=/; domain=.msn.com; expires=Wed, 30-Dec-2037 16:00:00 GMT</psf:browserCookie>
				<psf:browserCookie Name="MHW" URL="http://www.msn.com">; path=/; domain=.msn.com; expires=Thu, 30-Oct-1980 16:00:00 GMT</psf:browserCookie>
				<psf:browserCookie Name="MH" URL="http://www.live.com">MSFT; path=/; domain=.live.com; expires=Wed, 30-Dec-2037 16:00:00 GMT</psf:browserCookie>
				<psf:browserCookie Name="MHW" URL="http://www.live.com">; path=/; domain=.live.com; expires=Thu, 30-Oct-1980 16:00:00 GMT</psf:browserCookie>
			</psf:browserCookies>
			<psf:credProperties>
				<psf:credProperty Name="MainBrandID">MSFT</psf:credProperty>
				<psf:credProperty Name="BrandIDList"></psf:credProperty>
				<psf:credProperty Name="IsWinLiveUser">true</psf:credProperty>
				<psf:credProperty Name="CID">bd7ab5a41d95bcfb</psf:credProperty>
				<psf:credProperty Name="AuthMembername">nullptralt@escargot.chat</psf:credProperty>
				<psf:credProperty Name="Country">US</psf:credProperty>
				<psf:credProperty Name="Language">1033</psf:credProperty>
				<psf:credProperty Name="FirstName">John</psf:credProperty>
				<psf:credProperty Name="LastName">Doe</psf:credProperty>
				<psf:credProperty Name="ChildFlags">00000001</psf:credProperty>
				<psf:credProperty Name="Flags">40100643</psf:credProperty>
				<psf:credProperty Name="FlagsV2">00000000</psf:credProperty>
				<psf:credProperty Name="IP">127.0.0.1</psf:credProperty>
				<psf:credProperty Name="AssociatedForStrongAuth">0</psf:credProperty>
			</psf:credProperties>
			<psf:extProperties>
				<psf:extProperty Name="ANON" Expiry="Wed, 30-Dec-2037 16:00:00 GMT" Domains="bing.com;atdmt.com" IgnoreRememberMe="false">A=B97FB2EE7DB4CE0D0D5B8107FFFFFFFF&amp;E=1542&amp;W=1</psf:extProperty>
				<psf:extProperty Name="NAP" Expiry="Wed, 30-Dec-2037 16:00:00 GMT" Domains="bing.com;atdmt.com" IgnoreRememberMe="false">V=1.9&amp;E=14e8&amp;C=uT838e-8kV7Jbm-HqQel-ETkvE7QSUGh6ywMjZQ9JJyYtNKxtdfCBw&amp;W=1</psf:extProperty>
				<psf:extProperty Name="LastUsedCredType">1</psf:extProperty>
				<psf:extProperty Name="WebCredType">1</psf:extProperty>
				<psf:extProperty Name="CID">bd7ab5a41d95bcfb</psf:extProperty>
			</psf:extProperties>
			<psf:response/>
		</psf:pp>
	</S:Header>
	<S:Body>
		<wst:RequestSecurityTokenResponseCollection xmlns:S="http://www.w3.org/2003/05/soap-envelope" xmlns:wst="http://schemas.xmlsoap.org/ws/2005/02/trust" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:saml="urn:oasis:names:tc:SAML:1.0:assertion" xmlns:wsp="http://schemas.xmlsoap.org/ws/2004/09/policy" xmlns:psf="http://schemas.microsoft.com/Passport/SoapServices/SOAPFault">
			<wst:RequestSecurityTokenResponse>
				<wst:TokenType>urn:passport:legacy</wst:TokenType>
				<wsp:AppliesTo xmlns:wsa="http://www.w3.org/2005/08/addressing">
					<wsa:EndpointReference>
						<wsa:Address>http://Passport.NET/tb</wsa:Address>
					</wsa:EndpointReference>
				</wsp:AppliesTo>
				<wst:Lifetime>
					<wsu:Created>${getSortaISODate()}</wsu:Created>
					<wsu:Expires>${getSortaISODate()}</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<EncryptedData xmlns="http://www.w3.org/2001/04/xmlenc#" Id="BinaryDAToken0" Type="http://www.w3.org/2001/04/xmlenc#Element">
						<EncryptionMethod Algorithm="http://www.w3.org/2001/04/xmlenc#tripledes-cbc"></EncryptionMethod>
						<ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
							<ds:KeyName>http://Passport.NET/STS</ds:KeyName>
						</ds:KeyInfo>
						<CipherData>
							<CipherValue>Cap26AQZrSyMm2SwwTyJKyqLR9/S+vQWQsaBc5Mv7PwtQDMzup/udOOMMvSu99R284pmiD3IepBXrEMLK5rLrXAf2A6vrP6vYuGA45GCqQdoxusHZcjt9P2B8WyCTVT2cM8jtGqGIfRlU/4WzOLxNrDJwDfOsmilduGAGZfvRPW7/jyXXrnGK7/PWkymX4YDD+ygJfMrPAfvAprvw/HVE6tutKVc9cViTVYy8oHjosQlb8MKn3vKDW1O2ZWQUc47JPl7DkjQaanfNBGe6CL7K1nr6Z/jy7Ay7MjV+KQehmvphSEmCzLrpB4WWn2PdpdTrOcDj+aJfWHeGL4sIPwEKgrKnTQg9QD8CCsm5wew9P/br39OuIfsC6/PFBEHmVThqj0aMxYLRD4K2GoRay6Ab7NftoIP5dnFnclfRxETAoNpTPE2F5Q669QySrdXxBpBSk8GLmdCDMlhiyzSiByrhFQaZRcH8n9i+i289otYuJQ7xPyP19KwT4CRyOiIlh3DSdlBfurMwihQGxN2spU7P4MwckrDKeOyYQhvNm/XWId/oXBqpHbo2yRPiOwL9p1J4AxA4RaJuh77vyhn2lFQaxPDqZd5A8RJjpb2NE2N3UncKLW7GAangdoLbRDMqt51VMZ0la+b/moL61fKvFXinKRHc7PybrG3MWzgXxO/VMKAuXOsB9XnOgl2A524cgiwyg==</CipherValue>
						</CipherData>
					</EncryptedData>
				</wst:RequestedSecurityToken>
				<wst:RequestedAttachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="2jmj7l5rSw0yVb/vlWAYkK/YBwk="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedAttachedReference>
				<wst:RequestedUnattachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="2jmj7l5rSw0yVb/vlWAYkK/YBwk="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedUnattachedReference>
				<wst:RequestedProofToken>
					<wst:BinarySecret>tgoPVK67sU36fQKlGLMgWgTXp7oiaQgE</wst:BinarySecret>
				</wst:RequestedProofToken>
			</wst:RequestSecurityTokenResponse>
			<wst:RequestSecurityTokenResponse>
				<wst:TokenType>urn:passport:compact</wst:TokenType>
				<wsp:AppliesTo xmlns:wsa="http://www.w3.org/2005/08/addressing">
					<wsa:EndpointReference>
						<wsa:Address>messengerclear.live.com</wsa:Address>
					</wsa:EndpointReference>
				</wsp:AppliesTo>
				<wst:Lifetime>
					<wsu:Created>2024-02-01T19:14:15Z</wsu:Created>
					<wsu:Expires>2024-02-02T19:14:15Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact2">${ticket}</wsse:BinarySecurityToken>
				</wst:RequestedSecurityToken>
				<wst:RequestedAttachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedAttachedReference>
				<wst:RequestedUnattachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedUnattachedReference><wst:RequestedProofToken>
					<wst:BinarySecret>EHgkVduMLr3hIGy6eUNyYdAHh+iMeGKl</wst:BinarySecret>
				</wst:RequestedProofToken></wst:RequestSecurityTokenResponse>			<wst:RequestSecurityTokenResponse>
				<wst:TokenType>urn:passport:compact</wst:TokenType>
				<wsp:AppliesTo xmlns:wsa="http://www.w3.org/2005/08/addressing">
					<wsa:EndpointReference>
						<wsa:Address>messenger.msn.com</wsa:Address>
					</wsa:EndpointReference>
				</wsp:AppliesTo>
				<wst:Lifetime>
					<wsu:Created>2024-02-01T19:14:15Z</wsu:Created>
					<wsu:Expires>2024-02-02T19:14:15Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact3">${ticket}</wsse:BinarySecurityToken>
				</wst:RequestedSecurityToken>
				<wst:RequestedAttachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedAttachedReference>
				<wst:RequestedUnattachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedUnattachedReference></wst:RequestSecurityTokenResponse>			<wst:RequestSecurityTokenResponse>
				<wst:TokenType>urn:passport:compact</wst:TokenType>
				<wsp:AppliesTo xmlns:wsa="http://www.w3.org/2005/08/addressing">
					<wsa:EndpointReference>
						<wsa:Address>messengersecure.live.com</wsa:Address>
					</wsa:EndpointReference>
				</wsp:AppliesTo>
				<wst:Lifetime>
					<wsu:Created>2024-02-01T19:14:15Z</wsu:Created>
					<wsu:Expires>2024-02-02T19:14:15Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact4">${ticket}</wsse:BinarySecurityToken>
				</wst:RequestedSecurityToken>
				<wst:RequestedAttachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedAttachedReference>
				<wst:RequestedUnattachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedUnattachedReference></wst:RequestSecurityTokenResponse>			<wst:RequestSecurityTokenResponse>
				<wst:TokenType>urn:passport:compact</wst:TokenType>
				<wsp:AppliesTo xmlns:wsa="http://www.w3.org/2005/08/addressing">
					<wsa:EndpointReference>
						<wsa:Address>contacts.msn.com</wsa:Address>
					</wsa:EndpointReference>
				</wsp:AppliesTo>
				<wst:Lifetime>
					<wsu:Created>2024-02-01T19:14:15Z</wsu:Created>
					<wsu:Expires>2024-02-02T19:14:15Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact5">${ticket}</wsse:BinarySecurityToken>
				</wst:RequestedSecurityToken>
				<wst:RequestedAttachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedAttachedReference>
				<wst:RequestedUnattachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedUnattachedReference></wst:RequestSecurityTokenResponse>			<wst:RequestSecurityTokenResponse>
				<wst:TokenType>urn:passport:compact</wst:TokenType>
				<wsp:AppliesTo xmlns:wsa="http://www.w3.org/2005/08/addressing">
					<wsa:EndpointReference>
						<wsa:Address>storage.msn.com</wsa:Address>
					</wsa:EndpointReference>
				</wsp:AppliesTo>
				<wst:Lifetime>
					<wsu:Created>2024-02-01T19:14:15Z</wsu:Created>
					<wsu:Expires>2024-02-02T19:14:15Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact6">${ticket}</wsse:BinarySecurityToken>
				</wst:RequestedSecurityToken>
				<wst:RequestedAttachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedAttachedReference>
				<wst:RequestedUnattachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedUnattachedReference></wst:RequestSecurityTokenResponse>			<wst:RequestSecurityTokenResponse>
				<wst:TokenType>urn:passport:compact</wst:TokenType>
				<wsp:AppliesTo xmlns:wsa="http://www.w3.org/2005/08/addressing">
					<wsa:EndpointReference>
						<wsa:Address>sup.live.com</wsa:Address>
					</wsa:EndpointReference>
				</wsp:AppliesTo>
				<wst:Lifetime>
					<wsu:Created>2024-02-01T19:14:15Z</wsu:Created>
					<wsu:Expires>2024-02-02T19:14:15Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact7">${ticket}</wsse:BinarySecurityToken>
				</wst:RequestedSecurityToken>
				<wst:RequestedAttachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedAttachedReference>
				<wst:RequestedUnattachedReference>
					<wsse:SecurityTokenReference>
						<wsse:Reference URI="/DaESnwwMVTTpRTZEoNqUW/Md0k="></wsse:Reference>
					</wsse:SecurityTokenReference>
				</wst:RequestedUnattachedReference></wst:RequestSecurityTokenResponse>
		</wst:RequestSecurityTokenResponseCollection>
	</S:Body>
</S:Envelope>`);
	}
});

app.post("/whatsnew/whatsnewservice.asmx", (req, res) => {
	return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <soap:Header>
        <WNServiceHeader xmlns="http://www.msn.com/webservices/AddressBook">
            <Version>15.1.1216.0</Version>
        </WNServiceHeader>
    </soap:Header>
    <soap:Body>
        <GetContactsRecentActivityResponse xmlns="http://www.msn.com/webservices/AddressBook">
            <GetContactsRecentActivityResult>
                <Activities>
                    <ActivityDetails>
                        <OwnerCID>0</OwnerCID>
                        <ObjectId>Mon, 18 Dec 2022 10:29:51 PST</ObjectId>
                        <ApplicationId>505</ApplicationId>
                        <ChangeType>20</ChangeType>
                        <PublishDate>2022-03-21T20:38:31Z</PublishDate>
                        <TemplateVariables>
                            <TemplateVariable xsi:type="TextTemplateVariable">
                                <Name>Name</Name>
                                <Value>webEscargot is now available</Value>
                            </TemplateVariable>
			    <TemplateVariable xsi:type="HlinkTemplateVariable">
                                <Name>Url</Name>
                                <Value>https://web.escargot.chat/</Value>
			    </TemplateVariable>
                        </TemplateVariables>
                    </ActivityDetails>
                    <ActivityDetails>
                        <OwnerCID>0</OwnerCID>
                        <ObjectId>Mon, 25 Mar 2020 10:29:51 PST</ObjectId>
                        <ApplicationId>503</ApplicationId>
                        <ChangeType>20</ChangeType>
                        <PublishDate>2022-03-22T20:38:31Z</PublishDate>
                        <TemplateVariables>
                            <TemplateVariable xsi:type="TextTemplateVariable">
                                <Name>Name</Name>
                                <Value>Yahoo! Messenger 6</Value>
                            </TemplateVariable>
                            <TemplateVariable xsi:type="HlinkTemplateVariable">
                                <Name>Download</Name>
                                <Value>https://nina.chat/download/yahoo/</Value>
                                <Text />
                            </TemplateVariable>
                        </TemplateVariables>
                    </ActivityDetails>
                     <ActivityDetails>
                        <OwnerCID>0</OwnerCID>
                        <ObjectId>Mon, 22 Mar 2022 10:29:51 PST</ObjectId>
                        <ApplicationId>502</ApplicationId>
                        <ChangeType>20</ChangeType>
                        <PublishDate>2022-03-22T20:38:31Z</PublishDate>
                        <TemplateVariables>
                            <TemplateVariable xsi:type="TextTemplateVariable">
                                <Name>Name</Name>
                                <Value>Discord</Value>
                            </TemplateVariable>
                            <TemplateVariable xsi:type="HlinkTemplateVariable">
                                <Name>Discord</Name>
                                <Value>https://escargot.chat/discord/?src=wn</Value>
                                <Text />
                            </TemplateVariable>
                        </TemplateVariables>
                    </ActivityDetails>
                </Activities>
                <Templates>
                    <RecentActivityTemplateContainer>
                        <ApplicationId>505</ApplicationId>
                        <ApplicationName>webEscargot</ApplicationName>
                        <MiniIconSizeX>0</MiniIconSizeX>
                        <MiniIconSizeY>0</MiniIconSizeY>
                        <ChangeType>20</ChangeType>
                        <Locale>en-us</Locale>
                        <RequestedLocales>
                            <string>en-US</string>
                        </RequestedLocales>
                        <TemplateRevision>1</TemplateRevision>
                        <Templates>
                            <RecentActivityTemplate>
                                <Cardinality>One</Cardinality>
                                <Data>{text:Name}</Data>
                                <Title>webEscargot is now available for everyone, try it {hlink:Url="here"}!</Title>
                            </RecentActivityTemplate>
                        </Templates>
                        <ActivityType>
                            <string>blog</string>
                        </ActivityType>
                        <CanMergeItemsWithSameObjectID>false</CanMergeItemsWithSameObjectID>
                    </RecentActivityTemplateContainer>
                    <RecentActivityTemplateContainer>
                        <ApplicationId>503</ApplicationId>
                        <ApplicationName>Yahoo</ApplicationName>
                        <MiniIconSizeX>0</MiniIconSizeX>
                        <MiniIconSizeY>0</MiniIconSizeY>
                        <ChangeType>20</ChangeType>
                        <Locale>en-us</Locale>
                        <RequestedLocales>
                            <string>en-US</string>
                        </RequestedLocales>
                        <TemplateRevision>1</TemplateRevision>
                        <Templates>
                            <RecentActivityTemplate>
                                <Cardinality>One</Cardinality>
                                <Data>{text:Name}</Data>
                                <Title>Yahoo! Messenger 6 is now available for everyone, get started {hlink:Download="here"}!</Title>
                            </RecentActivityTemplate>
                        </Templates>
                        <ActivityType>
                            <string>blog</string>
                        </ActivityType>
                        <CanMergeItemsWithSameObjectID>false</CanMergeItemsWithSameObjectID>
                    </RecentActivityTemplateContainer>
                    <RecentActivityTemplateContainer>
                        <ApplicationId>502</ApplicationId>
                        <ApplicationName>Discord</ApplicationName>
                        <MiniIconSizeX>0</MiniIconSizeX>
                        <MiniIconSizeY>0</MiniIconSizeY>
                        <ChangeType>20</ChangeType>
                        <Locale>en-us</Locale>
                        <RequestedLocales>
                            <string>en-US</string>
                        </RequestedLocales>
                        <TemplateRevision>1</TemplateRevision>
                        <Templates>
                            <RecentActivityTemplate>
                                <Cardinality>One</Cardinality>
                                <Data>{text:Name}</Data>
                                <Title>Did you know we have a Discord server? Click {hlink:Discord="here"} to join us!</Title>
                            </RecentActivityTemplate>
                        </Templates>
                        <ActivityType>
                            <string>blog</string>
                        </ActivityType>
                        <CanMergeItemsWithSameObjectID>false</CanMergeItemsWithSameObjectID>
                    </RecentActivityTemplateContainer>
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

const httpsServer = https.createServer(options, app);

const httpServer = app;

httpsServer.listen(443, () => {
	log(logs.HTTPS, "Server running on port 443");
});

httpServer.listen(80, () => {
	log(logs.HTTP, "Server running on port 80");
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
	for (const command of commands) {
		let [cmd, trid, ...args] = command.split(" ") as [
			Command,
			string,
			...string[]
		];
		console.log(
			logs.receive,
			`Received command ${colors.blue(cmd)} (${colors.cyan(
				commandMap[cmd]
			)}), Transaction ID ${colors.yellow(trid)} (args: ${
				args.length > 0
					? colors.yellow(args.join(", "))
					: colors.dim(colors.italic("none"))
			})`
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
			continue;
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
	}
	return parsedCmds;
}

(async () => {
	const handlerTs = fs.readdirSync("./src/handlers");
	const handlers = await Promise.all(
		handlerTs.map(async (handler) => {
			const handlerModule = await import(`./handlers/${handler}`);
			return {
				type: handler.replace(".ts", "") as Command,
				fn: handlerModule.default as (
					data: ICommand,
					send: SendFunction,
					socket: net.Socket
				) => void,
			};
		})
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
					res: Response
				) => void,
			};
		})
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
		socket.on("data", (data) => {
			console.log(colors.bgCyan(colors.black(data.toString())));
			const cmds = parse(data.toString());
			cmds.forEach((cmd) => {
				const handler = handlers.find(
					(handler) => handler.type === cmd.type
				);
				if (handler) {
					handler.fn(
						cmd,
						(commandName, ...args) => {
							send(
								`${commandName} ${
									cmd.trid + " " || ""
								}${args.join(" ")}`
							);
						},
						socket
					);
				} else {
					console.log(
						logs.warning,
						`No handler for ${colors.blue(cmd.type)} (${colors.cyan(
							commandMap[cmd.type]
						)}). You can find documentation for it here: ${colors.cyan(
							colors.underline(
								colors.italic(
									colors.bold(
										`https://wiki.nina.chat/wiki/Protocols/MSNP/Commands/${cmd.type}`
									)
								)
							)
						)}`
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
			(webService) => webService.type === actionName
		);
		if (!webService) {
			log(
				logs.warning,
				`No web service found for ${colors.blue(actionName)}`
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
			(webService) => webService.type === actionName
		);
		if (!webService) {
			log(
				logs.warning,
				`No web service found for ${colors.blue(actionName)}`
			);
			return res.sendStatus(500);
		}
		webService.fn(req, res);
	});
})();
