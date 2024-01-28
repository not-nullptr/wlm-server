import colors from "chalk";
import { Socket } from "net";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { Token } from "../types/User";

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
