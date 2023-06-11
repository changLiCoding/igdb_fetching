/* eslint-disable */
require("dotenv").config();

const fs = require("fs");
const axios = require("axios");
const path = require("path");

const startingDate = new Date(2016, 0, 1).getTime();
const headers = {
	"Client-ID": process.env.CLIENT_ID,
	Authorization: `Bearer ${process.env.IGDB_TOKEN}`,
};

const fetchGames = async () => {
	const url = "https://api.igdb.com/v4/games";

	const response = await axios.post(
		url,
		`fields name, slug, genres, tags, platforms, themes, first_release_date, summary, total_rating, total_rating_count, cover, screenshots; where screenshots != null & cover != null & total_rating_count > 220 & first_release_date > ${startingDate}; limit: 20;`,
		{ headers }
	);

	return response.data;
};

async function getCoverImage(coverId) {
	const url = "https://api.igdb.com/v4/covers";

	const response = await axios.post(url, `fields url; where id = ${coverId};`, {
		headers,
	});

	console.log("return of response in fetchImageFromIgdb.js", response.data);

	const coverUrl = response.data[0].url.replace("t_thumb", "t_cover_big");

	return coverUrl;
}

const getGameScreenshots = async (screenshotsArr) => {
	const url = "https://api.igdb.com/v4/screenshots";
	const screenshotsReturnData = [];
	for (const screenshotID of screenshotsArr) {
		const res = await axios.post(
			url,
			`fields url; where id = ${screenshotID};`,
			{
				headers,
			}
		);

		const screenshotUrl = res.data[0].url.replace(
			"t_thumb",
			"t_screenshot_big"
		);
		screenshotsReturnData.push(screenshotUrl);
		await new Promise((resolve) => setTimeout(resolve, 1));
	}
	return screenshotsReturnData;
};

const getGameGenres = async (genresArr) => {
	const url = "https://api.igdb.com/v4/genres";
	const genresReturnData = [];

	for (const genreID of genresArr) {
		const res = await axios.post(url, `fields name; where id = ${genreID};`, {
			headers,
		});

		genresReturnData.push(res.data[0].name);
		await new Promise((resolve) => setTimeout(resolve, 1));
	}

	return genresReturnData;
};

const getGamePlatforms = async (platformsArr) => {
	const url = "https://api.igdb.com/v4/platforms";
	const platformsReturnData = [];
	for (const platformID of platformsArr) {
		const res = await axios.post(
			url,
			`fields name; where id = ${platformID};`,
			{
				headers,
			}
		);
		platformsReturnData.push(res.data[0].name);
		await new Promise((resolve) => setTimeout(resolve, 1));
	}
	return platformsReturnData;
};

const getGameThemes = async (themesArr) => {
	const url = "https://api.igdb.com/v4/themes";
	const themesReturnData = [];
	for (const themeID of themesArr) {
		const res = await axios.post(url, `fields name; where id = ${themeID};`, {
			headers,
		});
		themesReturnData.push(res.data[0].name);
		await new Promise((resolve) => setTimeout(resolve, 1));
	}
	return themesReturnData;
};

const getGameTags = async (tagsArr) => {
	const url = "https://api.igdb.com/v4/tags";
	const tagsReturnData = [];
	for (const tagID of tagsArr) {
		const res = await axios.post(url, `fields name; where id = ${tagID};`, {
			headers,
		});
		tagsReturnData.push(res.data[0].name);
		await new Promise((resolve) => setTimeout(resolve, 1));
	}
	return tagsReturnData;
};

const generateGameObjects = async () => {
	const gameData = await fetchGames();

	const games = [];
	for (const game of gameData) {
		const coverUrl = game.cover ? await getCoverImage(game.cover) : null;

		// const tags = game.tags ? await getGameTags(game.tags) : null;
		const platforms = game.platforms
			? await getGamePlatforms(game.platforms)
			: null;

		const themes = game.themes ? await getGameThemes(game.themes) : null;
		const genres = game.genres ? await getGameGenres(game.genres) : null;
		const screenshots = game.screenshots
			? await getGameScreenshots(game.screenshots)
			: null;
		games.push({
			...game,
			genres,
			id: game.id,
			name: game.name,
			cover: coverUrl,
			platforms,
			themes,
			screenshots,
		});

		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	const jsonData = JSON.stringify(games, null, 2);
	const filePath = path.join(__dirname, "games.json");

	fs.writeFile(filePath, jsonData, (err) => {
		if (err) {
			console.error("Error writing JSON file:", err);
		} else {
			console.log("JSON file created successfully.");
		}
	});

	return games;
};

generateGameObjects()
	.then((games) => {
		console.log(games);
	})
	.catch((error) => {
		console.error(error);
	});
