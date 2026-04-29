const path = require("node:path");
const { buildCSS, buildJS } = require("chokibasic");


const srcin = path.resolve(__dirname, "../src/");
const jsin = path.resolve(srcin, "scripts/brickbreaker.core.js");
const jsout = path.resolve(srcin, "scripts/brickbreaker.core.min.js");

const ljsin = path.resolve(srcin, "scripts/brickbreaqueer.core.js");
const ljsout = path.resolve(srcin, "scripts/brickbreaqueer.core.min.js");

const cssin = path.resolve(srcin, "styles/brickbreaker.core.scss");
const cssout = path.resolve(srcin, "styles/brickbreaker.core.min.css");


(async () => {
	await buildJS(jsin, jsout);
	await buildJS(ljsin, ljsout);
	await buildCSS(cssin, cssout);
})();