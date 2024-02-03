import express from "express";
import fs from "fs";

const configRouter = express.Router();

interface ConfigOptions {
	tabs: Tab[];
}

interface Tab {
	image: string;
	name: string;
	type: string;
	tooltip: string;
	link: string;
}

function generateConfigXML(options: ConfigOptions) {
	const template = fs.readFileSync("templates/config/config.xml");
	return template
		.toString()
		.replaceAll(
			"{%0}",
			options.tabs
				.map(
					(_, i) =>
						`<URL id="${i}">http://127.1.1.1/config/tabs?id=${i}</URL>`,
				)
				.join("\n"),
		);
}

configRouter.get("/MsgrConfig.asmx", (req, res) => {
	const tabs: Tab[] = JSON.parse(
		fs.readFileSync("static/data.json").toString(),
	).tabs;
	const options: ConfigOptions = {
		tabs,
	};
	return res.status(200).send(generateConfigXML(options));
});

configRouter.get("/tabs", (req, res) => {
	const tabs: Tab[] = JSON.parse(
		fs.readFileSync("static/data.json").toString(),
	).tabs;
	let tabTemplate = fs
		.readFileSync("templates/config/tab-template.xml")
		.toString();
	if (!req.query.id || typeof req.query.id !== "string")
		return res.status(400).send("Invalid tab ID");
	let tab = tabs.at(parseInt(req.query.id));
	if (!tab) return res.status(404).send("Tab not found");
	return res
		.status(200)
		.send(
			tabTemplate
				.replaceAll("{%0}", tab.image)
				.replaceAll("{%1}", tab.name)
				.replaceAll("{%2}", tab.type)
				.replaceAll("{%3}", tab.tooltip)
				.replaceAll("{%4}", tab.link)
				.replaceAll("{%5}", req.query.id),
		);
});

export default configRouter;
