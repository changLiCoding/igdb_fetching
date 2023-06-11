/* eslint-disable */
require("dotenv").config();

const axios = require("axios");

const API_KEY = process.env.CLIENT_ID;
const token = process.env.IGDB_TOKEN;

const fetchGames = async () => {
	const url = "https://api.igdb.com/v4/games";
	const headers = {
		"Client-ID": API_KEY,
		Authorization: `Bearer ${token}`,
	};

	const response = await axios.post(
		url,
		`fields name, genres, tags, platforms, themes, first_release_date, summary, total_rating, total_rating_count, cover; where cover != null; limit: 100;`,
		{ headers }
	);

	console.log("response.data", response.data);
	return response.data;
};

async function getCoverImage(coverId) {
	const url = "https://api.igdb.com/v4/covers";
	const headers = {
		"Client-ID": API_KEY,
		Authorization: `Bearer ${token}`,
	};

	const response = await axios.post(url, `fields url; where id = ${coverId};`, {
		headers,
	});

	console.log("return of response in fetchImageFromIgdb.js", response.data);

	return response.data[0].url;
}

const generateGameObjects = async () => {
	const gameData = await fetchGames();

	const games = [];
	for (const game of gameData) {
		const coverUrl = game.cover ? await getCoverImage(game.cover) : null;
		games.push({
			id: game.id,
			name: game.name,
			coverUrl: coverUrl,
		});

		await new Promise((resolve) => setTimeout(resolve, 251));
	}

	return games;
};

generateGameObjects()
	.then((games) => {
		console.log(games);
	})
	.catch((error) => {
		console.error(error);
	});
