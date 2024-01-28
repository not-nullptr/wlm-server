import { logs, rainbow } from "../constants";
import { Command, Protocol, SendFunction, VerCommand } from "../types/Command";
import { log } from "../util";
import colors from "chalk";
import { Socket } from "net";

export default function VER(
	data: VerCommand,
	send: SendFunction,
	socket: Socket
) {
	console.log();
	console.log(
		`${colors.gray("==========")} ${colors.green(
			"New Sign On"
		)} ${colors.gray("==========")}`
	);
	console.log();
	log(
		logs.VER,
		`Supported protocols: ${data.supportedProtocols
			.map((s, i) => rainbow[i % rainbow.length](s))
			.join(", ")}`
	);
	if (!data.supportedProtocols.includes(Protocol.MSNP18)) {
		console.log(
			logs.warning,
			"Client does not support MSNP18, trying to force MSNP18"
		);
	}
	send(Command.VER, Protocol.MSNP18, Protocol.MSNP17, Protocol.CVR0);
}
