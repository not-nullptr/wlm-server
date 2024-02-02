import { Socket } from "net";
import { logs, rainbow } from "../constants";
import { Command, SendFunction, UsrCommand, UsrState } from "../types/Command";
import { MSNUtils, log, verifyAndDecodeJWT } from "../util";
import colors from "chalk";
import jwt from "jsonwebtoken";
import { promisify } from "util";

const verify = promisify(jwt.verify);

// in the config, there should be a \r\n after the GCF payload and every Policy tag
// for now, the hardcoded one from the nina wiki is good enough

export default async function USR(
	data: UsrCommand,
	send: SendFunction,
	socket: Socket
) {
	console.log(data);
	if (data.state === UsrState.Initial) {
		socket.passport = data.passport;
		log(
			logs.USR,
			`User ${colors.yellow(data.passport)} is attempting to log-in...`
		);
		let bytes =
			"47 43 46 20 30 20 31 32 30 39 0D 0A 3C 50 6F 6C 69 63 69 65 73 3E 0D 0A 09 3C 50 6F 6C 69 63 79 20 74 79 70 65 3D 22 53 48 49 45 4C 44 53 22 20 63 68 65 63 6B 73 75 6D 3D 22 44 39 37 30 35 41 37 31 42 41 38 34 31 43 42 33 38 39 35 35 38 32 32 45 30 34 38 39 37 30 43 33 22 3E 3C 63 6F 6E 66 69 67 3E 20 3C 73 68 69 65 6C 64 3E 3C 63 6C 69 20 6D 61 6A 3D 22 37 22 20 6D 69 6E 3D 22 30 22 20 6D 69 6E 62 6C 64 3D 22 30 22 20 6D 61 78 62 6C 64 3D 22 39 39 39 39 22 20 64 65 6E 79 3D 22 61 75 64 69 6F 20 63 61 6D 65 72 61 20 70 68 6F 6E 65 22 20 2F 3E 3C 2F 73 68 69 65 6C 64 3E 20 3C 62 6C 6F 63 6B 3E 3C 2F 62 6C 6F 63 6B 3E 3C 2F 63 6F 6E 66 69 67 3E 3C 2F 50 6F 6C 69 63 79 3E 0D 0A 09 3C 50 6F 6C 69 63 79 20 74 79 70 65 3D 22 41 42 43 48 22 20 63 68 65 63 6B 73 75 6D 3D 22 30 33 44 43 35 35 39 31 30 41 39 43 42 37 39 31 33 33 46 31 35 37 36 32 32 31 41 38 30 33 34 36 22 3E 3C 70 6F 6C 69 63 79 3E 3C 73 65 74 20 69 64 3D 22 70 75 73 68 22 20 73 65 72 76 69 63 65 3D 22 41 42 43 48 22 20 70 72 69 6F 72 69 74 79 3D 22 32 30 30 22 3E 20 20 20 20 20 20 3C 72 20 69 64 3D 22 70 75 73 68 73 74 6F 72 61 67 65 22 20 74 68 72 65 73 68 6F 6C 64 3D 22 31 38 30 30 30 30 22 20 2F 3E 20 20 20 20 3C 2F 73 65 74 3E 3C 73 65 74 20 69 64 3D 22 64 65 6C 61 79 73 75 70 22 20 73 65 72 76 69 63 65 3D 22 41 42 43 48 22 20 70 72 69 6F 72 69 74 79 3D 22 31 35 30 22 3E 20 20 3C 72 20 69 64 3D 22 77 68 61 74 73 6E 65 77 22 20 74 68 72 65 73 68 6F 6C 64 3D 22 31 38 30 30 30 30 30 22 20 2F 3E 20 20 3C 72 20 69 64 3D 22 77 68 61 74 73 6E 65 77 5F 73 74 6F 72 61 67 65 5F 41 42 43 48 5F 64 65 6C 61 79 22 20 74 69 6D 65 72 3D 22 31 38 30 30 30 30 30 22 20 2F 3E 20 20 3C 72 20 69 64 3D 22 77 68 61 74 73 6E 65 77 74 5F 6C 69 6E 6B 22 20 74 68 72 65 73 68 6F 6C 64 3D 22 39 30 30 30 30 30 22 20 74 72 69 67 67 65 72 3D 22 51 75 65 72 79 41 63 74 69 76 69 74 69 65 73 22 20 2F 3E 3C 2F 73 65 74 3E 20 20 3C 63 20 69 64 3D 22 50 52 4F 46 49 4C 45 5F 52 61 6D 70 75 70 22 3E 31 30 30 3C 2F 63 3E 3C 2F 70 6F 6C 69 63 79 3E 3C 2F 50 6F 6C 69 63 79 3E 0D 0A 09 3C 50 6F 6C 69 63 79 20 74 79 70 65 3D 22 45 52 52 4F 52 52 45 53 50 4F 4E 53 45 54 41 42 4C 45 22 20 63 68 65 63 6B 73 75 6D 3D 22 36 31 32 37 45 45 44 43 45 38 36 30 46 34 35 43 31 36 39 32 38 39 36 46 35 32 34 38 41 46 36 46 22 3E 3C 50 6F 6C 69 63 79 3E 20 3C 46 65 61 74 75 72 65 20 74 79 70 65 3D 22 33 22 20 6E 61 6D 65 3D 22 50 32 50 22 3E 20 20 3C 45 6E 74 72 79 20 68 72 3D 22 30 78 38 31 30 30 30 33 39 38 22 20 61 63 74 69 6F 6E 3D 22 33 22 2F 3E 20 20 3C 45 6E 74 72 79 20 68 72 3D 22 30 78 38 32 30 30 30 30 32 30 22 20 61 63 74 69 6F 6E 3D 22 33 22 2F 3E 20 3C 2F 46 65 61 74 75 72 65 3E 20 3C 46 65 61 74 75 72 65 20 74 79 70 65 3D 22 34 22 3E 20 20 3C 45 6E 74 72 79 20 68 72 3D 22 30 78 38 31 30 30 30 34 34 30 22 20 2F 3E 20 3C 2F 46 65 61 74 75 72 65 3E 20 3C 46 65 61 74 75 72 65 20 74 79 70 65 3D 22 36 22 20 6E 61 6D 65 3D 22 54 55 52 4E 22 3E 20 20 3C 45 6E 74 72 79 20 68 72 3D 22 30 78 38 30 30 37 32 37 34 43 22 20 61 63 74 69 6F 6E 3D 22 33 22 20 2F 3E 20 20 3C 45 6E 74 72 79 20 68 72 3D 22 30 78 38 32 30 30 30 30 32 30 22 20 61 63 74 69 6F 6E 3D 22 33 22 20 2F 3E 20 20 3C 45 6E 74 72 79 20 68 72 3D 22 30 78 38 30 30 37 32 37 34 41 22 20 61 63 74 69 6F 6E 3D 22 33 22 20 2F 3E 20 3C 2F 46 65 61 74 75 72 65 3E 3C 2F 50 6F 6C 69 63 79 3E 3C 2F 50 6F 6C 69 63 79 3E 0D 0A 09 3C 50 6F 6C 69 63 79 20 74 79 70 65 3D 22 50 32 50 22 20 63 68 65 63 6B 73 75 6D 3D 22 38 31 35 44 34 46 31 46 46 38 45 33 39 41 38 35 46 31 46 39 37 43 34 42 31 36 43 34 35 31 37 37 22 3E 3C 4F 62 6A 53 74 72 20 53 6E 64 44 6C 79 3D 22 31 22 20 2F 3E 3C 2F 50 6F 6C 69 63 79 3E 0D 0A 3C 2F 50 6F 6C 69 63 69 65 73 3E";
		const rand = await MSNUtils.genRandomBytes(48);
		const usrCommand = `USR ${data.trid} SSO S MBI_KEY_OLD ${rand.toString(
			"base64"
		)}\r\n`;
		const usrCommandBuffer = Buffer.from(usrCommand);
		bytes += usrCommandBuffer.toString("hex");
		const buffer = Buffer.from(bytes.replace(/\s/g, ""), "hex");
		socket.write(buffer);
	} else if (data.state === UsrState.Subsequent) {
		log(
			logs.USR,
			`GUID ${colors.yellow(data.machineGuid)} attempting log-in...`
		);
		if (!data.t) return socket.destroy();
		log(logs.USR, `Ticket: ${colors.yellow(data.t)}`);
		try {
			const jwt = await verifyAndDecodeJWT(data.t);
			if (jwt.passport !== socket.passport) {
				log(logs.warning, "Passport mismatch!");
				return socket.destroy();
			}
			// usually this would be insecure, but JWTs verify integrity so its cool
			socket.ticket = data.t;
			send(Command.USR, "OK", socket.passport, "1", "0");
			socket.write(`SBS 0 null\r\n
MSG Hotmail Hotmail 1460\r\n
MIME-Version: 1.0\r\n
Content-Type: text/x-msmsgsprofile; charset=UTF-8\r\n
LoginTime: 1706902514\r\n
EmailEnabled: 0\r\n
MemberIdHigh: 3061839339\r\n
MemberIdLow: 496352507\r\n
lang_preference: 1033\r\n
preferredEmail:\r\n
country:\r\n
PostalCode:\r\n
Gender:\r\n
Kid: 0\r\n
Age:\r\n
BDayPre:\r\n
Birthday:\r\n
Wallet:\r\n
Flags: 536872513\r\n
sid: 507\r\n
MSPAuth: ${data.t}\r\n
ClientIP: 87.254.0.131\r\n
ClientPort: 29612\r\n
ABCHMigrated:`);
			setTimeout(() => {
				socket.write(` 1\r\n
MPOPEnabled: 1\r\n
BetaInvites: 1\r\n\r\nUBX 1:${jwt.passport} 0`);
			}, 50);
		} catch {
			socket.destroy();
			log(logs.warning, "Invalid JWT, socket destroyed");
		}
	} else if ((data.TWN as any) === "SHA") {
		log(logs.USR, "SHA1 auth");

		try {
			const jwt = await verifyAndDecodeJWT(socket.ticket!);
			socket.write(
				`${Command.USR} ${data.trid} OK ${socket.passport} 0 0\r\n`
			);
		} catch (e) {
			socket.destroy();
			log(logs.warning, "Invalid JWT, socket destroyed");
		}
	}
}
