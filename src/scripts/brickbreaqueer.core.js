import RainbowBreaker from "./libraries/rainbowbreaker";
import flags from "../data/flags.json";
import words from "../data/words.json";


window.BrickBreaqueer = (config) => {
	config.flags = flags;
	config.words = words;
	if(config.fontFamily) document.fonts.load(`10pt "${config.fontFamily}"`).then(() => RainbowBreaker.init(config));
	else RainbowBreaker.init(config);
}