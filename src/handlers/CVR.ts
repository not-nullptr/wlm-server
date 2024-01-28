import { logs, rainbow } from "../constants";
import { Command, CvrCommand, Locale, SendFunction } from "../types/Command";
import { log } from "../util";
import colors from "chalk";
import { Socket } from "net";

export default function CVR(data: CvrCommand, send: SendFunction) {
	log(
		logs.CVR,
		`${colors.yellow(data.passport)} has identified: version ${colors.red(
			data.clientVer
		)}, running ${
			data.osType === "winnt" ? colors.red("NT") : colors.red(data.osType)
		} ${colors.red(data.osVer)} on ${colors.red(
			data.arch
		)}. The user is using locale ${colors.green(
			Locale[data.localeId]
		)} (${colors.greenBright(`0x0${data.localeId.toString(16)}`)})`
	);
	send(
		Command.CVR,
		data.clientVer,
		data.clientVer,
		data.clientVer,
		"https://aerochat.live",
		"https://aerochat.live"
	);
}
