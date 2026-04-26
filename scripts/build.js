const path = require("node:path");
const { buildCSS, buildJS } = require("chokibasic");


const srcin = path.resolve(__dirname, "../src/");
const jsin = path.resolve(srcin, "scripts/brickbreaker.core.js");
const jsout = path.resolve(srcin, "scripts/brickbreaker.core.min.js");
const cssin = path.resolve(srcin, "styles/brickbreaker.core.scss");
const cssout = path.resolve(srcin, "styles/brickbreaker.core.min.css");


(async () => {
	await buildJS(jsin, jsout);
	await buildCSS(cssin, cssout);
})();