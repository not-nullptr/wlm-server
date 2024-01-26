import { HTTPParser } from "http-parser-js";

export function parseRequest(input: Buffer) {
	const parser = new HTTPParser(HTTPParser.REQUEST);
	let complete = false;
	let shouldKeepAlive;
	let upgrade;
	let method;
	let url;
	let versionMajor;
	let versionMinor;
	let headers: any[] = [];
	let trailers: any[] = [];
	let bodyChunks: any[] = [];

	parser[HTTPParser.kOnHeadersComplete] = function (req) {
		shouldKeepAlive = req.shouldKeepAlive;
		upgrade = req.upgrade;
		method = HTTPParser.methods[req.method];
		url = req.url;
		versionMajor = req.versionMajor;
		versionMinor = req.versionMinor;
		headers = req.headers;
	};

	parser[HTTPParser.kOnBody] = function (chunk, offset, length) {
		bodyChunks.push(chunk.slice(offset, offset + length));
	};

	// This is actually the event for trailers, go figure.
	parser[HTTPParser.kOnHeaders] = function (t) {
		trailers = t;
	};

	parser[HTTPParser.kOnMessageComplete] = function () {
		complete = true;
	};

	// Since we are sending the entire Buffer at once here all callbacks above happen synchronously.
	// The parser does not do _anything_ asynchronous.
	// However, you can of course call execute() multiple times with multiple chunks, e.g. from a stream.
	// But then you have to refactor the entire logic to be async (e.g. resolve a Promise in kOnMessageComplete and add timeout logic).
	parser.execute(input);
	parser.finish();

	let body = Buffer.concat(bodyChunks);

	return {
		shouldKeepAlive,
		upgrade,
		method,
		url,
		versionMajor,
		versionMinor,
		headers: Object.fromEntries(
			Array.from({ length: headers.length / 2 }, (_, index) => [
				headers[index * 2],
				headers[index * 2 + 1],
			])
		),
		body,
		trailers,
	};
}
