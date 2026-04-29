import RainbowBreaker from "./libraries/rainbowbreaker";

window.BrickBreaqueer = (config) => {
	if(config.fontFamily) {
		document.fonts.load(`10pt "${config.fontFamily}"`).then(() => {
			RainbowBreaker.init(config);
		});
	} else {
		RainbowBreaker.init(config);
	}
}