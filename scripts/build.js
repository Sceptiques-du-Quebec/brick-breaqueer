const path = require("node:path");
const { buildCSS, buildJS } = require("chokibasic");


const srcin = path.resolve(__dirname, "../src/");
const ljsin = path.resolve(srcin, "scripts/brickbreaqueer.core.js");
const ljsout = path.resolve(srcin, "scripts/brickbreaqueer.core.min.js");


(async () => {
	await buildJS(ljsin, ljsout);
})();