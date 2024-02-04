import { logs, rainbow } from "../constants";
import { Command, Protocol, SendFunction, VerCommand } from "../types/Command";
import { log } from "../util";
import colors from "chalk";
import { Socket } from "net";

export default function CHG(
	data: any,
	send: SendFunction,
	socket: Socket,
	rawMessage: string,
) {
	socket.write(rawMessage);
}
