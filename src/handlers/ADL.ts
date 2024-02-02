import { logs, rainbow } from "../constants";
import { ADLCommand, Command, Locale, SendFunction } from "../types/Command";
import { log } from "../util";
import colors from "chalk";
import { Socket } from "net";

export default function ADL(
	data: ADLCommand,
	send: SendFunction,
	socket: Socket
) {
	setTimeout(() => {
		send(Command.ADL, "OK");
	}, 50);
}
