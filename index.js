require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const isUrl = require("is-url");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Mongoose Configuration
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const urlSchema = new mongoose.Schema({
	original_url: { type: String, unique: true },
	short_url: Number,
});
let Url = new mongoose.model("Url", urlSchema);

app.use(cors());
app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
	res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", async (req, res) => {
	const urlInput = req.body.url;
	const isValid = isUrl(urlInput);
	if (isValid) {
		const checkUrl = await Url.findOne({ original_url: urlInput });
		if (checkUrl) {
			res.json({ original_url: checkUrl.original_url, short_url: checkUrl.short_url });
		} else {
			const count = await Url.countDocuments({});
			let url = new Url({
				original_url: urlInput,
				short_url: count + 1,
			});
			await url.save();
			res.json({ original_url: url.original_url, short_url: url.short_url });
		}
	} else {
		res.json({ error: "invalid url" });
	}
});

app.get("/api/shorturl/:number", async (req, res) => {
	try {
		const data = await Url.findOne({ short_url: req.params.number });
		if (data) {
			res.redirect(data.original_url);
		} else {
			res.json({ error: "invalid url" });
		}
	} catch (err) {
		res.json({ error: "invalid url" });
	}
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
