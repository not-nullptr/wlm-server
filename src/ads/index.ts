import express from "express";
import fs from "fs";
import { TextAd } from "../types/Soap";
import { FeedVideo } from "../types/REST";
import { generateVideoPicksXML } from "../util";

const adRouter = express.Router();

function generateTextAdXML(textAd: TextAd): string {
	const template = fs.readFileSync("templates/ads/text-ad.xml");
	return template
		.toString()
		.replaceAll("{%1}", textAd.text)
		.replaceAll("{%2}", textAd.link);
}

adRouter.get("/text", (req, res) => {
	const textAds: TextAd[] = JSON.parse(
		fs.readFileSync("static/data.json").toString(),
	).textads;
	const ad = textAds[Math.floor(Math.random() * textAds.length)];
	return res.status(200).send(generateTextAdXML(ad));
});

adRouter.get("/video-picks", (_, res) => {
	const videos: FeedVideo[] = JSON.parse(
		fs.readFileSync("./static/data.json", "utf-8"),
	).videos;
	return res.status(200).send(generateVideoPicksXML(videos));
});

adRouter.get("/video-feeds", (_, res) => {
	return res
		.status(200)
		.send(fs.readFileSync("templates/news/video-feed.xml"));
});

const staticRouter = express.Router();

staticRouter.use(express.static("src/ads/static"));

adRouter.use("/static", (req, res, next) => {
	staticRouter(req, res, next);
});

export default adRouter;
