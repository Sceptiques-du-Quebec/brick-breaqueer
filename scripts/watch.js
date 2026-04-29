const path = require("node:path");
const { createWatchers, buildCSS, buildJS } = require("chokibasic");


const { close } = createWatchers(
	[
		{
			name: "js",
			patterns: ["src/scripts/**/*.js"],
			ignored: ["**/*.min.js"],
			callback: async (events) => {
				console.log("[js] batch", events.length, events.map(e => e.file));
				const entry = path.resolve(__dirname, "../src/scripts/brickbreaker.core.js");
				const outfile = path.resolve(__dirname, "../src/scripts/brickbreaker.core.min.js");


				const loaderentry = path.resolve(__dirname, "../src/scripts/brickbreaqueer.core.js");
				const loaderoutfile = path.resolve(__dirname, "../src/scripts/brickbreaqueer.core.min.js");

				await buildJS(entry, outfile, { loader: { '.json': 'json' } });
				await buildJS(loaderentry, loaderoutfile, { loader: { '.json': 'json' } });
				console.log("");
			},
		},
		{
			name: "scss",
			patterns: ["src/styles/**/*.scss"],
			callback: async (events) => {
				console.log("[scss] batch", events.length, events.map(e => e.file));
				const inputScss = path.resolve(__dirname, "../src/styles/brickbreaker.core.scss");
				const outCssMin = path.resolve(__dirname, "../src/styles/brickbreaker.core.min.css");
				await buildCSS(inputScss, outCssMin);
				console.log("");
			},
		},
	],
	{
		cwd: process.cwd(),
		debug: true
	}
);


process.on("SIGINT", async () => {
	await close();
	process.exit(0);
});