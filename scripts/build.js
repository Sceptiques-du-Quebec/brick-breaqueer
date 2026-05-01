const path = require("node:path");
const { buildCSS, buildJS } = require("chokibasic");


const srcin = path.resolve(__dirname, "../src/");
const ljsin = path.resolve(srcin, "scripts/brickbreaqueer.core.js");
const ljsout = path.resolve(srcin, "scripts/brickbreaqueer.core.min.js");
const cssin = path.resolve(srcin, "styles/brickbreaqueer.core.scss");
const cssout = path.resolve(srcin, "styles/brickbreaqueer.core.min.css");


(async () => {
	await buildJS(ljsin, ljsout);
	await buildCSS(cssin, cssout);
})();