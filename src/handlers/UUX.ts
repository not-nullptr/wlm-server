import { logs, rainbow } from "../constants";
import { Command, ICommand, Locale, SendFunction } from "../types/Command";
import { log } from "../util";
import colors from "chalk";
import { Socket } from "net";

export default function ADL(
	data: ICommand,
	send: SendFunction,
	socket: Socket
) {
	const payload = data.payload?.substring(
		0,
		data?.payload.lastIndexOf(">") + 1
	);
	const nextCmd = data.payload?.substring(
		data?.payload.lastIndexOf(">") + 1,
		data?.payload.length
	);
	if (nextCmd) {
		const [command, trid, ...rest] = nextCmd.split(" ");
		switch (command) {
			case "CHG": {
				socket.write(nextCmd);
				break;
			}
		}
	}

	socket.write(`UUX ${data.trid} 0\r\n`);
}
