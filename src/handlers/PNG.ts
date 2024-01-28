import { Socket } from "net";

export default function PNG(_: any, __: any, socket: Socket) {
	socket.write("QNG 50\r\n");
}
