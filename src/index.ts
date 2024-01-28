import express, { Request } from "express";
import https from "https";
import fs from "fs";
import { XMLParser } from "fast-xml-parser";
import { RST2Parser } from "./types/REST";
import { MSNUtils, getSortaISODate } from "./util";
import colors from "chalk";
import net from "net";
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
import { v4 } from "uuid";

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
<S:Envelope xmlns:S="http://www.w3.org/2003/05/soap-envelope" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" xmlns:wsa="http://www.w3.org/2005/08/addressing">
	<S:Header>
		<wsa:Action xmlns:S="http://www.w3.org/2003/05/soap-envelope" xmlns:wsa="http://www.w3.org/2005/08/addressing" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="Action" S:mustUnderstand="1">http://schemas.xmlsoap.org/ws/2005/02/trust/RSTR/Issue</wsa:Action>
		<wsa:To xmlns:S="http://www.w3.org/2003/05/soap-envelope" xmlns:wsa="http://www.w3.org/2005/08/addressing" xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="To" S:mustUnderstand="1">http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</wsa:To>
		<wsse:Security S:mustUnderstand="1">
			<wsu:Timestamp xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd" wsu:Id="TS">
				<wsu:Created>2024-01-27T22:49:04Z</wsu:Created>
				<wsu:Expires>2024-01-27T22:54:04Z</wsu:Expires>
			</wsu:Timestamp>
		</wsse:Security>
		<psf:pp xmlns:psf="http://schemas.microsoft.com/Passport/SoapServices/SOAPFault">
			<psf:serverVersion>1</psf:serverVersion>
			<psf:PUID>AA1888D5EFAC2421</psf:PUID>
			<psf:configVersion>16.000.26889.00</psf:configVersion>
			<psf:uiVersion>3.100.2179.0</psf:uiVersion>
			<psf:mobileConfigVersion>16.000.26208.0</psf:mobileConfigVersion>
			<psf:appDataVersion>1</psf:appDataVersion>
			<psf:authstate>0x48803</psf:authstate>
			<psf:reqstatus>0x0</psf:reqstatus>
			<psf:serverInfo Path="Live1" RollingUpgradeState="ExclusiveNew" LocVersion="0" ServerTime="2024-01-27T22:49:04Z">XYZPPLOGN1A23 2017.09.28.12.44.07</psf:serverInfo>
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
				<psf:credProperty Name="CID">b2648d8befac2421</psf:credProperty>
				<psf:credProperty Name="AuthMembername">nullptr@escargot.chat</psf:credProperty>
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
				<psf:extProperty Name="CID">b2648d8befac2421</psf:extProperty>
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
					<wsu:Created>2024-01-27T22:49:04Z</wsu:Created>
					<wsu:Expires>2024-01-28T22:49:04Z</wsu:Expires>
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
					<wsu:Created>2024-01-27T22:49:04Z</wsu:Created>
					<wsu:Expires>2024-01-28T22:49:04Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact2">t=fcbc5cf196208db1a026Y6+H31sTUOFkqjNTDYqAAFLr5Ote7BMrMnUIzpg860jh084QMgs5djRQLLQP0TVOFkKdWDwAJdEWcfsI9YL8otN9kSfhTaPHR1njHmG0H98O2NE/Ck6zrog3UJFmYlCnHidZk1g3AzUNVXmjZoyMSyVvoHLjQSzoGRpgHg3hHdi7zrFhcYKWD8XeNYdoz9wfA2YAAAgZIgF9kFvsy2AC0Fl/ezc/fSo6YgB9TwmXyoK0wm0F9nz5EfhHQLu2xxgsvMOiXUSFSpN1cZaNzEk/KGVa3Z33Mcu0qJqvXoLyv2VjQyI0VLH6YlW5E+GMwWcQurXB9hT/DnddM5Ggzk3nX8uMSV4kV+AgF1EWpiCdLViRI6DmwwYDtUJU6W6wQXsfyTm6CNMv0eE0wFXmZvoKaL24fggkp99dX+m1vgMQJ39JblVH9cmnnkBQcKkV8lnQJ003fd6iIFzGpgPBW5Z3T1Bp7uzSGMWnHmrEw8eOpKC5ny4x8uoViXDmA2UId23xYSoJ/GQrMjqB+NslqnuVsOBE1oWpNrmfSKhGU1X0kR4Eves56t5i5n3XU+7ne0MkcUzlrMi89n2j8aouf0zeuD7o+ngqvfRCsOqjaU71XWtuD4ogu2X7/Ajtwkxg/UJDFGAnCxFTTd4dqrrEpKyMK8eWBMaartFxwwrH39HMpx1T9JgknJ1hFWELzG8b302sKy64nCseOTGaZrdH63pjGkT7vzyIxVH/b+yJwDRmy/PlLz7fmUj6zpTBNmCtl1EGFOEFdtI2R04EprIkLXbtpoIPA7m0TPZURpnWufCSsDtD91ChxR8j/FnQ/gOOyKg/EJrTcHvM1e50PMRmoRZGlltBRRwBV+ArPO64On6zygr5zud5o/aADF1laBjkuYkjvUVsXwgnaIKbTLN2+sr/WjogxT1Yins79jPa1+3dDenxZtE/rHA/6qsdJmo5BJZqNYQUFrnpkU428LryMnBaNp2BW51JRsWXPAA7yCi0wDlHzEDxpqaOnhI4Ol87ra+VAg==&amp;p=</wsse:BinarySecurityToken>
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
					<wst:BinarySecret>Y1OqJQEpQ4HJAMZClCg4iCHk4QtLDQ8f</wst:BinarySecret>
				</wst:RequestedProofToken></wst:RequestSecurityTokenResponse>			<wst:RequestSecurityTokenResponse>
				<wst:TokenType>urn:passport:compact</wst:TokenType>
				<wsp:AppliesTo xmlns:wsa="http://www.w3.org/2005/08/addressing">
					<wsa:EndpointReference>
						<wsa:Address>messenger.msn.com</wsa:Address>
					</wsa:EndpointReference>
				</wsp:AppliesTo>
				<wst:Lifetime>
					<wsu:Created>2024-01-27T22:49:04Z</wsu:Created>
					<wsu:Expires>2024-01-28T22:49:04Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact3">t=fcbc5cf196208db1a026Y6+H31sTUOFkqjNTDYqAAFLr5Ote7BMrMnUIzpg860jh084QMgs5djRQLLQP0TVOFkKdWDwAJdEWcfsI9YL8otN9kSfhTaPHR1njHmG0H98O2NE/Ck6zrog3UJFmYlCnHidZk1g3AzUNVXmjZoyMSyVvoHLjQSzoGRpgHg3hHdi7zrFhcYKWD8XeNYdoz9wfA2YAAAgZIgF9kFvsy2AC0Fl/ezc/fSo6YgB9TwmXyoK0wm0F9nz5EfhHQLu2xxgsvMOiXUSFSpN1cZaNzEk/KGVa3Z33Mcu0qJqvXoLyv2VjQyI0VLH6YlW5E+GMwWcQurXB9hT/DnddM5Ggzk3nX8uMSV4kV+AgF1EWpiCdLViRI6DmwwYDtUJU6W6wQXsfyTm6CNMv0eE0wFXmZvoKaL24fggkp99dX+m1vgMQJ39JblVH9cmnnkBQcKkV8lnQJ003fd6iIFzGpgPBW5Z3T1Bp7uzSGMWnHmrEw8eOpKC5ny4x8uoViXDmA2UId23xYSoJ/GQrMjqB+NslqnuVsOBE1oWpNrmfSKhGU1X0kR4Eves56t5i5n3XU+7ne0MkcUzlrMi89n2j8aouf0zeuD7o+ngqvfRCsOqjaU71XWtuD4ogu2X7/Ajtwkxg/UJDFGAnCxFTTd4dqrrEpKyMK8eWBMaartFxwwrH39HMpx1T9JgknJ1hFWELzG8b302sKy64nCseOTGaZrdH63pjGkT7vzyIxVH/b+yJwDRmy/PlLz7fmUj6zpTBNmCtl1EGFOEFdtI2R04EprIkLXbtpoIPA7m0TPZURpnWufCSsDtD91ChxR8j/FnQ/gOOyKg/EJrTcHvM1e50PMRmoRZGlltBRRwBV+ArPO64On6zygr5zud5o/aADF1laBjkuYkjvUVsXwgnaIKbTLN2+sr/WjogxT1Yins79jPa1+3dDenxZtE/rHA/6qsdJmo5BJZqNYQUFrnpkU428LryMnBaNp2BW51JRsWXPAA7yCi0wDlHzEDxpqaOnhI4Ol87ra+VAg==&amp;p=</wsse:BinarySecurityToken>
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
					<wsu:Created>2024-01-27T22:49:04Z</wsu:Created>
					<wsu:Expires>2024-01-28T22:49:04Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact4">t=fcbc5cf196208db1a026Y6+H31sTUOFkqjNTDYqAAFLr5Ote7BMrMnUIzpg860jh084QMgs5djRQLLQP0TVOFkKdWDwAJdEWcfsI9YL8otN9kSfhTaPHR1njHmG0H98O2NE/Ck6zrog3UJFmYlCnHidZk1g3AzUNVXmjZoyMSyVvoHLjQSzoGRpgHg3hHdi7zrFhcYKWD8XeNYdoz9wfA2YAAAgZIgF9kFvsy2AC0Fl/ezc/fSo6YgB9TwmXyoK0wm0F9nz5EfhHQLu2xxgsvMOiXUSFSpN1cZaNzEk/KGVa3Z33Mcu0qJqvXoLyv2VjQyI0VLH6YlW5E+GMwWcQurXB9hT/DnddM5Ggzk3nX8uMSV4kV+AgF1EWpiCdLViRI6DmwwYDtUJU6W6wQXsfyTm6CNMv0eE0wFXmZvoKaL24fggkp99dX+m1vgMQJ39JblVH9cmnnkBQcKkV8lnQJ003fd6iIFzGpgPBW5Z3T1Bp7uzSGMWnHmrEw8eOpKC5ny4x8uoViXDmA2UId23xYSoJ/GQrMjqB+NslqnuVsOBE1oWpNrmfSKhGU1X0kR4Eves56t5i5n3XU+7ne0MkcUzlrMi89n2j8aouf0zeuD7o+ngqvfRCsOqjaU71XWtuD4ogu2X7/Ajtwkxg/UJDFGAnCxFTTd4dqrrEpKyMK8eWBMaartFxwwrH39HMpx1T9JgknJ1hFWELzG8b302sKy64nCseOTGaZrdH63pjGkT7vzyIxVH/b+yJwDRmy/PlLz7fmUj6zpTBNmCtl1EGFOEFdtI2R04EprIkLXbtpoIPA7m0TPZURpnWufCSsDtD91ChxR8j/FnQ/gOOyKg/EJrTcHvM1e50PMRmoRZGlltBRRwBV+ArPO64On6zygr5zud5o/aADF1laBjkuYkjvUVsXwgnaIKbTLN2+sr/WjogxT1Yins79jPa1+3dDenxZtE/rHA/6qsdJmo5BJZqNYQUFrnpkU428LryMnBaNp2BW51JRsWXPAA7yCi0wDlHzEDxpqaOnhI4Ol87ra+VAg==&amp;p=</wsse:BinarySecurityToken>
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
					<wsu:Created>2024-01-27T22:49:04Z</wsu:Created>
					<wsu:Expires>2024-01-28T22:49:04Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact5">t=fcbc5cf196208db1a026Y6+H31sTUOFkqjNTDYqAAFLr5Ote7BMrMnUIzpg860jh084QMgs5djRQLLQP0TVOFkKdWDwAJdEWcfsI9YL8otN9kSfhTaPHR1njHmG0H98O2NE/Ck6zrog3UJFmYlCnHidZk1g3AzUNVXmjZoyMSyVvoHLjQSzoGRpgHg3hHdi7zrFhcYKWD8XeNYdoz9wfA2YAAAgZIgF9kFvsy2AC0Fl/ezc/fSo6YgB9TwmXyoK0wm0F9nz5EfhHQLu2xxgsvMOiXUSFSpN1cZaNzEk/KGVa3Z33Mcu0qJqvXoLyv2VjQyI0VLH6YlW5E+GMwWcQurXB9hT/DnddM5Ggzk3nX8uMSV4kV+AgF1EWpiCdLViRI6DmwwYDtUJU6W6wQXsfyTm6CNMv0eE0wFXmZvoKaL24fggkp99dX+m1vgMQJ39JblVH9cmnnkBQcKkV8lnQJ003fd6iIFzGpgPBW5Z3T1Bp7uzSGMWnHmrEw8eOpKC5ny4x8uoViXDmA2UId23xYSoJ/GQrMjqB+NslqnuVsOBE1oWpNrmfSKhGU1X0kR4Eves56t5i5n3XU+7ne0MkcUzlrMi89n2j8aouf0zeuD7o+ngqvfRCsOqjaU71XWtuD4ogu2X7/Ajtwkxg/UJDFGAnCxFTTd4dqrrEpKyMK8eWBMaartFxwwrH39HMpx1T9JgknJ1hFWELzG8b302sKy64nCseOTGaZrdH63pjGkT7vzyIxVH/b+yJwDRmy/PlLz7fmUj6zpTBNmCtl1EGFOEFdtI2R04EprIkLXbtpoIPA7m0TPZURpnWufCSsDtD91ChxR8j/FnQ/gOOyKg/EJrTcHvM1e50PMRmoRZGlltBRRwBV+ArPO64On6zygr5zud5o/aADF1laBjkuYkjvUVsXwgnaIKbTLN2+sr/WjogxT1Yins79jPa1+3dDenxZtE/rHA/6qsdJmo5BJZqNYQUFrnpkU428LryMnBaNp2BW51JRsWXPAA7yCi0wDlHzEDxpqaOnhI4Ol87ra+VAg==&amp;p=</wsse:BinarySecurityToken>
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
					<wsu:Created>2024-01-27T22:49:04Z</wsu:Created>
					<wsu:Expires>2024-01-28T22:49:04Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact6">t=fcbc5cf196208db1a026Y6+H31sTUOFkqjNTDYqAAFLr5Ote7BMrMnUIzpg860jh084QMgs5djRQLLQP0TVOFkKdWDwAJdEWcfsI9YL8otN9kSfhTaPHR1njHmG0H98O2NE/Ck6zrog3UJFmYlCnHidZk1g3AzUNVXmjZoyMSyVvoHLjQSzoGRpgHg3hHdi7zrFhcYKWD8XeNYdoz9wfA2YAAAgZIgF9kFvsy2AC0Fl/ezc/fSo6YgB9TwmXyoK0wm0F9nz5EfhHQLu2xxgsvMOiXUSFSpN1cZaNzEk/KGVa3Z33Mcu0qJqvXoLyv2VjQyI0VLH6YlW5E+GMwWcQurXB9hT/DnddM5Ggzk3nX8uMSV4kV+AgF1EWpiCdLViRI6DmwwYDtUJU6W6wQXsfyTm6CNMv0eE0wFXmZvoKaL24fggkp99dX+m1vgMQJ39JblVH9cmnnkBQcKkV8lnQJ003fd6iIFzGpgPBW5Z3T1Bp7uzSGMWnHmrEw8eOpKC5ny4x8uoViXDmA2UId23xYSoJ/GQrMjqB+NslqnuVsOBE1oWpNrmfSKhGU1X0kR4Eves56t5i5n3XU+7ne0MkcUzlrMi89n2j8aouf0zeuD7o+ngqvfRCsOqjaU71XWtuD4ogu2X7/Ajtwkxg/UJDFGAnCxFTTd4dqrrEpKyMK8eWBMaartFxwwrH39HMpx1T9JgknJ1hFWELzG8b302sKy64nCseOTGaZrdH63pjGkT7vzyIxVH/b+yJwDRmy/PlLz7fmUj6zpTBNmCtl1EGFOEFdtI2R04EprIkLXbtpoIPA7m0TPZURpnWufCSsDtD91ChxR8j/FnQ/gOOyKg/EJrTcHvM1e50PMRmoRZGlltBRRwBV+ArPO64On6zygr5zud5o/aADF1laBjkuYkjvUVsXwgnaIKbTLN2+sr/WjogxT1Yins79jPa1+3dDenxZtE/rHA/6qsdJmo5BJZqNYQUFrnpkU428LryMnBaNp2BW51JRsWXPAA7yCi0wDlHzEDxpqaOnhI4Ol87ra+VAg==&amp;p=</wsse:BinarySecurityToken>
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
					<wsu:Created>2024-01-27T22:49:04Z</wsu:Created>
					<wsu:Expires>2024-01-28T22:49:04Z</wsu:Expires>
				</wst:Lifetime>
				<wst:RequestedSecurityToken>
					<wsse:BinarySecurityToken Id="Compact7">t=fcbc5cf196208db1a026Y6+H31sTUOFkqjNTDYqAAFLr5Ote7BMrMnUIzpg860jh084QMgs5djRQLLQP0TVOFkKdWDwAJdEWcfsI9YL8otN9kSfhTaPHR1njHmG0H98O2NE/Ck6zrog3UJFmYlCnHidZk1g3AzUNVXmjZoyMSyVvoHLjQSzoGRpgHg3hHdi7zrFhcYKWD8XeNYdoz9wfA2YAAAgZIgF9kFvsy2AC0Fl/ezc/fSo6YgB9TwmXyoK0wm0F9nz5EfhHQLu2xxgsvMOiXUSFSpN1cZaNzEk/KGVa3Z33Mcu0qJqvXoLyv2VjQyI0VLH6YlW5E+GMwWcQurXB9hT/DnddM5Ggzk3nX8uMSV4kV+AgF1EWpiCdLViRI6DmwwYDtUJU6W6wQXsfyTm6CNMv0eE0wFXmZvoKaL24fggkp99dX+m1vgMQJ39JblVH9cmnnkBQcKkV8lnQJ003fd6iIFzGpgPBW5Z3T1Bp7uzSGMWnHmrEw8eOpKC5ny4x8uoViXDmA2UId23xYSoJ/GQrMjqB+NslqnuVsOBE1oWpNrmfSKhGU1X0kR4Eves56t5i5n3XU+7ne0MkcUzlrMi89n2j8aouf0zeuD7o+ngqvfRCsOqjaU71XWtuD4ogu2X7/Ajtwkxg/UJDFGAnCxFTTd4dqrrEpKyMK8eWBMaartFxwwrH39HMpx1T9JgknJ1hFWELzG8b302sKy64nCseOTGaZrdH63pjGkT7vzyIxVH/b+yJwDRmy/PlLz7fmUj6zpTBNmCtl1EGFOEFdtI2R04EprIkLXbtpoIPA7m0TPZURpnWufCSsDtD91ChxR8j/FnQ/gOOyKg/EJrTcHvM1e50PMRmoRZGlltBRRwBV+ArPO64On6zygr5zud5o/aADF1laBjkuYkjvUVsXwgnaIKbTLN2+sr/WjogxT1Yins79jPa1+3dDenxZtE/rHA/6qsdJmo5BJZqNYQUFrnpkU428LryMnBaNp2BW51JRsWXPAA7yCi0wDlHzEDxpqaOnhI4Ol87ra+VAg==&amp;p=</wsse:BinarySecurityToken>
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
});

app.post("/abservice/SharingService.asmx", (req, res) => {
	return res.status(200).send(`
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
	<soap:Header>
		<ServiceHeader xmlns="http://www.msn.com/webservices/AddressBook">
			<Version>15.01.1408.0000</Version>
			<CacheKey>12r1:JF3yauTeHUc5z96S_E5hBmh-VTagFBvqqHK6Fm6dwnni47lr9HMtAF8vEv4HxXGxLuGYFztGyV_b1I5i-s5eys7If-RGw9iPJBDXoxBV_XlKE6_VOvN5DT4pAQA1Lwy9toS6IqINzjG-Nx3lgoIG_7wsGnzsSU0bS7p5fDP4pZ3Bmu5aZTaz9uzfM1DLqojLEJIE_yehrQm9xO9WWXVuKDzFUOwyzY-RkzZi5g</CacheKey>
			<CacheKeyChanged>true</CacheKeyChanged>
			<PreferredHostName>m1.escargot.chat</PreferredHostName>
			<SessionId>7d59305d-451c-4a4a-a410-dc36593a8535</SessionId>
		</ServiceHeader>
	</soap:Header>
	<soap:Body>
		<FindMembershipResponse xmlns="http://www.msn.com/webservices/AddressBook">
			<FindMembershipResult>
				<Services>
					<Service>
						<Memberships><Membership>
									<MemberRole>Allow</MemberRole>
									<Members><Member xsi:type="PassportMember">
													<MembershipId>Allow/01835ed4-0271-4aae-bba4-30483be03931</MembershipId>
													<Type>Passport</Type>
													<State>Accepted</State>
													<Deleted>false</Deleted>
													<LastChanged>2024-01-28T01:00:20Z</LastChanged>
													<JoinedDate>2022-03-26T04:38:28Z</JoinedDate>
													<ExpirationDate>0001-01-01T00:00:00</ExpirationDate>
													<Changes />
													<PassportName>jakeyz@escargot.chat</PassportName>
													<IsPassportNameHidden>false</IsPassportNameHidden>
													<PassportId>0</PassportId>
													<CID>3547112726749815995</CID>
													<PassportChanges />
													<LookedupByCID>false</LookedupByCID>
												</Member></Members>
									<MembershipIsComplete>true</MembershipIsComplete>
								</Membership><Membership>
									<MemberRole>Block</MemberRole>
									<Members></Members>
									<MembershipIsComplete>true</MembershipIsComplete>
								</Membership><Membership>
									<MemberRole>Reverse</MemberRole>
									<Members><Member xsi:type="PassportMember">
													<MembershipId>Reverse/01835ed4-0271-4aae-bba4-30483be03931</MembershipId>
													<Type>Passport</Type>
													<State>Accepted</State>
													<Deleted>false</Deleted>
													<LastChanged>2024-01-28T01:00:20Z</LastChanged>
													<JoinedDate>2022-03-26T04:38:28Z</JoinedDate>
													<ExpirationDate>0001-01-01T00:00:00</ExpirationDate>
													<Changes />
													<PassportName>jakeyz@escargot.chat</PassportName>
													<IsPassportNameHidden>false</IsPassportNameHidden>
													<PassportId>0</PassportId>
													<CID>3547112726749815995</CID>
													<PassportChanges />
													<LookedupByCID>false</LookedupByCID>
												</Member></Members>
									<MembershipIsComplete>true</MembershipIsComplete>
								</Membership><Membership>
								<MemberRole>Pending</MemberRole>
								<Members></Members>
								<MembershipIsComplete>true</MembershipIsComplete>
							</Membership>
						</Memberships>
						<Info>
							<Handle>
								<Id>1</Id>
								<Type>Messenger</Type>
								<ForeignId />
							</Handle>
							<InverseRequired>false</InverseRequired>
							<AuthorizationCriteria>Everyone</AuthorizationCriteria>
							<IsBot>false</IsBot>
						</Info>
						<Changes />
						<LastChange>2024-01-28T01:00:20Z</LastChange>
						<Deleted>false</Deleted>
					</Service>
				</Services>
				<OwnerNamespace>
					<Info>
						<Handle>
							<Id>00000000-0000-0000-0000-000000000000</Id>
							<IsPassportNameHidden>false</IsPassportNameHidden>
							<CID>0</CID>
						</Handle>
						<CreatorPuid>0</CreatorPuid>
						<CreatorCID>2388223847251666098</CreatorCID>
						<CreatorPassportName>nullptr@escargot.chat</CreatorPassportName>
						<CircleAttributes>
							<IsPresenceEnabled>false</IsPresenceEnabled>
							<Domain>WindowsLive</Domain>
						</CircleAttributes>
						<MessengerApplicationServiceCreated>false</MessengerApplicationServiceCreated>
					</Info>
					<Changes />
					<CreateDate>2024-01-28T01:00:20Z</CreateDate>
					<LastChange>2024-01-28T01:00:20Z</LastChange>
				</OwnerNamespace>
			</FindMembershipResult>
		</FindMembershipResponse>
	</soap:Body>
</soap:Envelope>
	`);
});

app.post("/abservice/abservice.asmx", (req, res) => {
	console.log(JSON.stringify(req.body));
	return res.status(200).send(`
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
	<soap:Header>
		<ServiceHeader xmlns="http://www.msn.com/webservices/AddressBook">
			<Version>15.01.1408.0000</Version>
			<CacheKey>${MSNUtils}</CacheKey>
			<CacheKeyChanged>true</CacheKeyChanged>
			<PreferredHostName>m1.escargot.chat</PreferredHostName>
			<SessionId>dd903f56-1e09-4359-b1fd-4ffb0c1709eb</SessionId>
		</ServiceHeader>
	</soap:Header>
	<soap:Body>
		<ABFindContactsPagedResponse xmlns="http://www.msn.com/webservices/AddressBook">
			<ABFindContactsPagedResult><Groups>
						
							<Group>
		<groupId>25430f23-77bb-4049-966c-f7b8e0249489</groupId>
		<groupInfo>
			<annotations>
				<Annotation>
					<Name>MSN.IM.Display</Name>
					<Value>1</Value>
				</Annotation>
			</annotations>
			<groupType>c8529ce2-6ead-434d-881f-341e17db3ff8</groupType>
			<name>Favorites</name>
			<IsNotMobileVisible>false</IsNotMobileVisible>
			<IsPrivate>false</IsPrivate>
			<IsFavorite>true</IsFavorite>
		</groupInfo>
		<propertiesChanged />
		<fDeleted>false</fDeleted>
		<lastChange>2024-01-28T01:00:26Z</lastChange>
	</Group>
						
							<Group>
		<groupId>f2c77657-c782-4a49-8eeb-c57507d71159</groupId>
		<groupInfo>
			<annotations>
				<Annotation>
					<Name>MSN.IM.Display</Name>
					<Value>1</Value>
				</Annotation>
			</annotations>
			<groupType>c8529ce2-6ead-434d-881f-341e17db3ff8</groupType>
			<name>Coworkers</name>
			<IsNotMobileVisible>false</IsNotMobileVisible>
			<IsPrivate>false</IsPrivate>
			<IsFavorite>false</IsFavorite>
		</groupInfo>
		<propertiesChanged />
		<fDeleted>false</fDeleted>
		<lastChange>2024-01-28T01:00:26Z</lastChange>
	</Group>
						
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
		<lastChange>2024-01-28T01:00:26Z</lastChange>
	</Group>
						
							<Group>
		<groupId>5c7cdda1-fbe2-408b-afdf-82d180725466</groupId>
		<groupInfo>
			<annotations>
				<Annotation>
					<Name>MSN.IM.Display</Name>
					<Value>1</Value>
				</Annotation>
			</annotations>
			<groupType>c8529ce2-6ead-434d-881f-341e17db3ff8</groupType>
			<name>Family</name>
			<IsNotMobileVisible>false</IsNotMobileVisible>
			<IsPrivate>false</IsPrivate>
			<IsFavorite>false</IsFavorite>
		</groupInfo>
		<propertiesChanged />
		<fDeleted>false</fDeleted>
		<lastChange>2024-01-28T01:00:26Z</lastChange>
	</Group>
						
					</Groups><Contacts><Contact>
								<contactId>aa1888d5-0df9-4388-b264-8d8befac2421</contactId>
	<contactInfo><contactType>Regular</contactType>
		<quickName>nullptr</quickName><passportName>nullptr@escargot.chat</passportName>
		<IsPassportNameHidden>false</IsPassportNameHidden>
		<displayName>nullptr</displayName>
		<puid>0</puid><CID>2388223847251666098</CID>
		<IsNotMobileVisible>false</IsNotMobileVisible>
		<isMobileIMEnabled>false</isMobileIMEnabled>
		<isMessengerUser>true</isMessengerUser>
		<isFavorite>false</isFavorite>
		<isSmtp>false</isSmtp>
		<hasSpace>false</hasSpace>
		<spotWatchState>NoDevice</spotWatchState>
		<birthdate>0001-01-01T00:00:00</birthdate><primaryEmailType>ContactEmailPersonal</primaryEmailType>
		<PrimaryLocation>ContactLocationPersonal</PrimaryLocation>
		<PrimaryPhone>ContactPhonePersonal</PrimaryPhone>
		<IsPrivate>false</IsPrivate>
		<Gender>Unspecified</Gender>
		<TimeZone>None</TimeZone>
	</contactInfo>
	<propertiesChanged />
	<fDeleted>false</fDeleted>
	<lastChange>2024-01-28T01:00:26Z</lastChange>
								</Contact><Contact>
								<contactId>f034d45c-fef2-4dd7-baa4-505dc391c039</contactId>
	<contactInfo><contactType>Regular</contactType>
		<quickName>[c=20]molly[/c]</quickName><passportName>hex7c@escargot.chat</passportName>
		<IsPassportNameHidden>false</IsPassportNameHidden>
		<displayName>[c=20]molly[/c]</displayName>
		<puid>0</puid><CID>4161486323960554682</CID>
		<IsNotMobileVisible>false</IsNotMobileVisible>
		<isMobileIMEnabled>false</isMobileIMEnabled>
		<isMessengerUser>true</isMessengerUser>
		<isFavorite>false</isFavorite>
		<isSmtp>false</isSmtp>
		<hasSpace>false</hasSpace>
		<spotWatchState>NoDevice</spotWatchState>
		<birthdate>0001-01-01T00:00:00</birthdate><primaryEmailType>ContactEmailPersonal</primaryEmailType>
		<PrimaryLocation>ContactLocationPersonal</PrimaryLocation>
		<PrimaryPhone>ContactPhonePersonal</PrimaryPhone>
		<IsPrivate>false</IsPrivate>
		<Gender>Unspecified</Gender>
		<TimeZone>None</TimeZone>
	</contactInfo>
	<propertiesChanged />
	<fDeleted>false</fDeleted>
	<lastChange>2024-01-28T01:00:26Z</lastChange>
								</Contact><Contact>
								<contactId>b67ff5eb-eabf-4471-bd7a-b5a41d95bcfb</contactId>
	<contactInfo><contactType>Regular</contactType>
		<quickName>nullptralt@escargot.chat</quickName><passportName>nullptralt@escargot.chat</passportName>
		<IsPassportNameHidden>false</IsPassportNameHidden>
		<displayName>nullptralt@escargot.chat</displayName>
		<puid>0</puid><CID>-307206720018089283</CID>
		<IsNotMobileVisible>false</IsNotMobileVisible>
		<isMobileIMEnabled>false</isMobileIMEnabled>
		<isMessengerUser>true</isMessengerUser>
		<isFavorite>false</isFavorite>
		<isSmtp>false</isSmtp>
		<hasSpace>false</hasSpace>
		<spotWatchState>NoDevice</spotWatchState>
		<birthdate>0001-01-01T00:00:00</birthdate><primaryEmailType>ContactEmailPersonal</primaryEmailType>
		<PrimaryLocation>ContactLocationPersonal</PrimaryLocation>
		<PrimaryPhone>ContactPhonePersonal</PrimaryPhone>
		<IsPrivate>false</IsPrivate>
		<Gender>Unspecified</Gender>
		<TimeZone>None</TimeZone>
	</contactInfo>
	<propertiesChanged />
	<fDeleted>false</fDeleted>
	<lastChange>2024-01-28T01:00:26Z</lastChange>
								</Contact><Contact>
								<contactId>01835ed4-0271-4aae-bba4-30483be03931</contactId>
	<contactInfo><contactType>Regular</contactType>
		<quickName>[c=10][u][b]zJakeyZ[/b][/u][/c=16]</quickName><passportName>jakeyz@escargot.chat</passportName>
		<IsPassportNameHidden>false</IsPassportNameHidden>
		<displayName>[c=10][u][b]zJakeyZ[/b][/u][/c=16]</displayName>
		<puid>0</puid><CID>3547112726749815995</CID>
		<IsNotMobileVisible>false</IsNotMobileVisible>
		<isMobileIMEnabled>false</isMobileIMEnabled>
		<isMessengerUser>true</isMessengerUser>
		<isFavorite>false</isFavorite>
		<isSmtp>false</isSmtp>
		<hasSpace>false</hasSpace>
		<spotWatchState>NoDevice</spotWatchState>
		<birthdate>0001-01-01T00:00:00</birthdate><primaryEmailType>ContactEmailPersonal</primaryEmailType>
		<PrimaryLocation>ContactLocationPersonal</PrimaryLocation>
		<PrimaryPhone>ContactPhonePersonal</PrimaryPhone>
		<IsPrivate>false</IsPrivate>
		<Gender>Unspecified</Gender>
		<TimeZone>None</TimeZone>
	</contactInfo>
	<propertiesChanged />
	<fDeleted>false</fDeleted>
	<lastChange>2024-01-28T01:00:26Z</lastChange>
								</Contact><Contact>
		<contactId>aa1888d5-0df9-4388-b264-8d8befac2421</contactId>
		<contactInfo>
			<annotations>
				<Annotation>
					<Name>MSN.IM.MBEA</Name>
					<Value>0</Value>
				</Annotation>
				<Annotation>
					<Name>MSN.IM.GTC</Name>
					<Value>0</Value>
				</Annotation>
				<Annotation>
					<Name>MSN.IM.BLP</Name>
					<Value>1</Value>
				</Annotation><Annotation>
						<Name>MSN.IM.RoamLiveProperties</Name>
						<Value>1</Value>
					</Annotation></annotations>
			<contactType>Me</contactType>
			<quickName>nullptr</quickName>
			<passportName>nullptr@escargot.chat</passportName>
			<IsPassportNameHidden>false</IsPassportNameHidden>
			<displayName>nullptr</displayName>
			<puid>0</puid>
			<CID>2388223847251666098</CID>
			<IsNotMobileVisible>false</IsNotMobileVisible>
			<isMobileIMEnabled>false</isMobileIMEnabled>
			<isMessengerUser>false</isMessengerUser>
			<isFavorite>false</isFavorite>
			<isSmtp>false</isSmtp>
			<hasSpace>false</hasSpace>
			<spotWatchState>NoDevice</spotWatchState>
			<birthdate>0001-01-01T00:00:00</birthdate>
			<primaryEmailType>ContactEmailPersonal</primaryEmailType>
			<PrimaryLocation>ContactLocationPersonal</PrimaryLocation>
			<PrimaryPhone>ContactPhonePersonal</PrimaryPhone>
			<IsPrivate>false</IsPrivate>
			<Gender>Unspecified</Gender>
			<TimeZone>None</TimeZone>
		</contactInfo>
		<propertiesChanged />
		<fDeleted>false</fDeleted>
		<lastChange>2024-01-28T01:00:26Z</lastChange>
	</Contact></Contacts><CircleResult><CircleTicket>&lt;?xml version="1.0" encoding="utf-16"?&gt;&lt;SignedTicket xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" ver="1" keyVer="1"&gt;&lt;Data&gt;PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTE2Ij8+DQo8VGlja2V0IHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhtbG5zOnhzZD0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiPg0KICA8VFM+MDAwMC0wMS0wMVQwMDowMDowMDwvVFM+DQogIDxDSUQ+MjM4ODIyMzg0NzI1MTY2NjA5ODwvQ0lEPg0KPC9UaWNrZXQ+&lt;/Data&gt;&lt;Sig&gt;LBwjG9wpHmWyktoYUZsL2ogT3PkAp4wtTyHK/b65IJ2BP2t8QAPyTrQ6IM2dZ5dlr6UcsyuthFT7n3jeoHeuoXUINOvXc9zbPr4uQrKsGnCFYJHNYEm5lHvmb/W4rNCY+MSIw1cD3a3/n8J3sj05+ZssqpfMS5gsTQrD0y7MIKC/ZskDR/EOP/wiM+IetdY7v5TTFFb9bXUgDCPzytkKxNo/Pu59bXAmrHr+5CbFBRih+btf+CNIoUmn1MwCvgwNu5LV0l8bLTx5ZwmAg+cRlt7ACu+3ljTW1hA7Ftf1yGiuCPWxqjZccQ0WCfxbRaLPkLNVufAMsO/ya4bL2Fugcw==&lt;/Sig&gt;&lt;/SignedTicket&gt;</CircleTicket>
					</CircleResult><Ab>
					<abId>00000000-0000-0000-0000-000000000000</abId>
					<abInfo>
						<ownerPuid>0</ownerPuid>
						<OwnerCID>2388223847251666098</OwnerCID>
						<ownerEmail>nullptr@escargot.chat</ownerEmail>
						<fDefault>true</fDefault>
						<joinedNamespace>false</joinedNamespace>
						<IsBot>false</IsBot>
						<IsParentManaged>false</IsParentManaged>
						<AccountTierLastChanged>0001-01-01T00:00:00</AccountTierLastChanged>
						<ProfileVersion>0</ProfileVersion>
						<SubscribeExternalPartner>false</SubscribeExternalPartner>
						<NotifyExternalPartner>false</NotifyExternalPartner>
						<AddressBookType>Individual</AddressBookType>
					</abInfo>
					<lastChange>2024-01-28T01:00:26Z</lastChange>
					<DynamicItemLastChanged>0001-01-01T00:00:00</DynamicItemLastChanged>
					<createDate>2023-08-21T15:58:33Z</createDate>
					<propertiesChanged />
				</Ab>
			</ABFindContactsPagedResult>
		</ABFindContactsPagedResponse>
	</soap:Body>
</soap:Envelope>`);
});

const options = {
	key: fs.readFileSync("./src/certs/localhost.key"),
	cert: fs.readFileSync("./src/certs/localhost.crt"),
};

const httpsServer = https.createServer(options, app);

httpsServer.listen(443, () => {
	log(logs.HTTPS, "Server running on port 443");
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
						t: args[2].replace("t=", "").replace("&p=", ""),
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
	const tcpServer = net.createServer((socket) => {
		function send(data: string) {
			console.log(logs.send, data);
			socket.write(data + "\r\n");
		}
		socket.on("data", (data) => {
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
})();
