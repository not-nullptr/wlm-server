import { Command } from "../types/Command";
import colors from "chalk";

export const commandMap = {
	[Command.VER]: "Protocol Version",
	[Command.CVR]: "Client Version",
	[Command.INF]: `Authentication List ${colors.dim("(deprecated)")}`,
	[Command.USR]: "Authentication",
	[Command.XFR]: "Redirect To Notification Server",
};

export const logs = {
	send: `${colors.green(">>>")}`,
	warning: `${colors.yellow("⚠  Warning ")}`,
	receive: `${colors.red("<<<")}`,
	VER: `${colors.blue("VER")}`,
	CVR: `${colors.blue("CVR")}`,
	USR: `${colors.blue("USR")}`,
	RST2: `${colors.blue("RST2")}`,
	HTTPS: `${colors.green("HTTPS")}`,
	TCP: `${colors.redBright("TCP")}`,
};

export const rainbow = [
	colors.red,
	colors.yellow,
	colors.green,
	colors.blue,
	colors.magenta,
	colors.cyan,
];
