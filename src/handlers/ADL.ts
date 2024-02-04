import { ADLCommand, Command, SendFunction } from "../types/Command";
import {
	MSNUtils,
	discordStatusToMSNStatus,
	generatePresences,
	sleep,
	verifyAndDecodeJWT,
} from "../util";
import { Socket } from "net";

export default async function ADL(
	data: ADLCommand,
	send: SendFunction,
	socket: Socket,
) {
	setTimeout(async () => {
		const jwt = await verifyAndDecodeJWT(socket.ticket!);
		send(Command.ADL, "OK");
		socket.write(` 1\r\n
MPOPEnabled: 1\r\n
BetaInvites: 1\r\n\r\nUBX 1:${jwt.passport} 0`);
		socket.write(
			`UBX 1:${socket.passport} 482\r\n<Data><PSM></PSM><CurrentMedia></CurrentMedia><MachineGuid>${socket.machineGuid}</MachineGuid><DDP></DDP><SignatureSound></SignatureSound><Scene></Scene><ColorScheme></ColorScheme><EndpointData id="${socket.machineGuid}"><Capabilities>2788999212:48</Capabilities></EndpointData><PrivateEndpointData id="${socket.machineGuid}"><EpName></EpName><ClientType>1</ClientType><State>NLN</State></PrivateEndpointData></Data>`,
		);
		// we write this dummy one otherwise the user's global name isn't displayed?
		socket.write(`NLN NLN 1:dummy@discord.com dummy@discord.com 0 0\r\n`);
		socket.write("UBX 1:dummy@discord.com 13\r\n<Data></Data>");
		socket.write(
			`NLN NLN 1:${jwt.passport} ${MSNUtils.readyData.user.global_name || MSNUtils.readyData.user.username} ${MSNUtils.readyData.user.id} 0\r\n`,
		);
		// socket.write(
		//  `NLN IDL 1:nullptralt@escargot.chat nullptralt@escargot.chat 2788999212:48 0\r\n
		// 	`NLN IDL 1:nullptralt@escargot.chat nullptralt@escargot.chat 2788999212:48 0\r\n`,
		// );
		// socket.write(
		// 	`UBX 1:nullptralt@escargot.chat 319\r\n<Data><PSM></PSM><CurrentMedia></CurrentMedia><MachineGuid>{3AC234CF-2B77-479C-A0A3-21311B718CD0}</MachineGuid><DDP></DDP><SignatureSound></SignatureSound><Scene></Scene><ColorScheme></ColorScheme><EndpointData id="{3ac234cf-2b77-479c-a0a3-21311b718cd0}"><Capabilities>2788999212:48</Capabilities></EndpointData></Data>NLN AWY 1:ewindows61@escargot.chat Everything%20Windows 2788999228:48 %3Cmsnobj%20Creator%3D%22ewindows61%40escargot.chat%22%20Type%3D%223%22%20SHA1D%3D%22S%2FVdus6oz43s7Nuy5CCKupb%2FRyk%3D%22%20Size%3D%227173%22%20Location%3D%220%22%20Friendly%3D%22RQB3AGkAbgBMAG8AZwBvADIAMAAyADMAAAA%3D%22%2F%3E\r\nUBX 1:ewindows61@escargot.chat 319\r\n<Data><PSM></PSM><CurrentMedia></CurrentMedia><MachineGuid>{D1D2A604-8574-49FE-8D42-124C73B95918}</MachineGuid><DDP></DDP><SignatureSound></SignatureSound><Scene></Scene><ColorScheme></ColorScheme><EndpointData id="{d1d2a604-8574-49fe-8d42-124c73b95918}"><Capabilities>2788999228:48</Capabilities></EndpointData></Data>NLN IDL 1:gumsl123@escargot.chat [c=#1A9DFF][i]Gum%20Skyloard[/i][/c=2] 2254291004:0 %3Cmsnobj%20Creator%3D%22gumsl123%40escargot.chat%22%20Type%3D%223%22%20SHA1D%3D%22jpYqAwQdflcQxeD4lskFjC6XNVk%3D%22%20Size%3D%2212687%22%20Location%3D%220%22%20Friendly%3D%22WwBpAF0ARwB1AG0AIABTAGsAeQBsAG8AYQByAGQAWwAvAGkAXQAAAA%3D%3D%22%2F%3E\r\nUBX 1:gumsl123@escargot.chat 204\r\n<Data><PSM></PSM><CurrentMedia></CurrentMedia><MachineGuid>{F9ECE9B0-34A9-4451-99F9-A4B4D20C9034}</MachineGuid><DDP></DDP><SignatureSound></SignatureSound><Scene></Scene><ColorScheme></ColorScheme></Data>NLN NLN 1:exorcism@escargot.chat exorcism@escargot.chat 2788999212:48 %3Cmsnobj%20Creator%3D%22exorcism%40escargot.chat%22%20Type%3D%223%22%20SHA1D%3D%22DLdn1k8v%2FQ0VYjA%2Ftd4Fc5m%2BmuE%3D%22%20Size%3D%2223328%22%20Location%3D%220%22%20Friendly%3D%22cAByAG8AZgBpAGwAZQAAAA%3D%3D%22%2F%3E\r\nUBX 1:exorcism@escargot.chat 381\r\n<Data><PSM></PSM><CurrentMedia></CurrentMedia><MachineGuid>{51E0B10F-FFBB-46EE-B658-8C4F9D0E116C}</MachineGuid><DDP></DDP><SignatureSound></SignatureSound><Scene></Scene><ColorScheme>-1716993</ColorScheme><EndpointData id="{51e0b10f-ffbb-46ee-b658-8c4f9d0e116c}"><Capabilities>2788999212:48</Capabilities></EndpointData></Data>`,
		// );
		const data = generatePresences(
			MSNUtils.readyData.merged_presences.friends.map((f) => {
				const user = MSNUtils.readyData.users.find(
					(u) => u.id === f.user_id!,
				)!;
				return {
					displayName: user.global_name || user.username,
					id: "0000000000",
					passport: `${user.username}@discord.com`,
					status: discordStatusToMSNStatus(f.status),
				};
			}),
		);
		// join into groups of 4, so [1, 2, 3, 4, 5, 6, 7, 8] becomes [[1, 2, 3, 4], [5, 6, 7, 8]]
		const groups = data
			.map((_, i, arr) => (i % 4 === 0 ? arr.slice(i, i + 4) : null))
			.filter((x) => x) as string[][];
		for (const group of groups) {
			socket.write(group.join(""));
			await sleep(50);
		}
		// get every friend who isn't in merged_presences
		const notInPresences = MSNUtils.readyData.users.filter(
			(u) =>
				!MSNUtils.readyData.merged_presences.friends.find(
					(f) => f.user_id === u.id,
				),
		);
		socket.write(
			`MSG Hotmail Hotmail 195\r\nMIME-Version: 1.0\r\nContent-Type: text/x-msmsgsinitialmdatanotification; charset=UTF-8\r\n\r\nMail-Data: <MD><E><I>0</I><IU>0</IU><O>0</O><OU>0</OU></E><Q><QTM>409600</QTM><QNM>204800</QNM></Q></MD>\r\n`,
		);
	}, 50);
}
