import buildConf from './libraries/buildconf.js';
import path from 'path';

const ROOT = process.cwd();
const SRCCONF = path.join(ROOT, 'src/scripts/libraries/rainbowbreaker.yaml');
const DSTCONF = path.join(ROOT, 'src/scripts/libraries/rainbowbreaker.json');


(async () => {
    await buildConf(SRCCONF, DSTCONF);
})();