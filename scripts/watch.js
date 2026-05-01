const path = require("node:path");
const { createWatchers, buildCSS, buildJS } = require("chokibasic");


const { close } = createWatchers(
	[
		{
			name: "js",
			patterns: ["src/scripts/**/*.js", "src/scripts/**/*.json"],
			ignored: ["**/*.min.js"],
			callback: async (events) => {
				console.log("[js] batch", events.length, events.map(e => e.file));
				const loaderentry = path.resolve(__dirname, "../src/scripts/brickbreaqueer.core.js");
				const loaderoutfile = path.resolve(__dirname, "../src/scripts/brickbreaqueer.core.min.js");
				await buildJS(loaderentry, loaderoutfile);
				console.log("");
			},
		},
		{
			name: "scss",
			patterns: ["src/styles/**/*.scss"],
			callback: async (events) => {
				console.log("[scss] batch", events.length, events.map(e => e.file));
				const inputScss = path.resolve(__dirname, "../src/styles/brickbreaqueer.core.scss");
				const outCssMin = path.resolve(__dirname, "../src/styles/brickbreaqueer.core.min.css");
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