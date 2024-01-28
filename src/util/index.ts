import colors from "chalk";
import { Socket } from "net";

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
}
