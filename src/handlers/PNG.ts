import { Socket } from "net";

export default function PNG(_: any, __: any, socket: Socket) {
	setTimeout(() => socket.write("QNG 60\r\n"), 500);
}
