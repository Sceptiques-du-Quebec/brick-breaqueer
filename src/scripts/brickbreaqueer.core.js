import RainbowBreaker from "./libraries/rainbowbreaker";


window.BrickBreaqueer = (config) => {
	return new Promise((res) => {
		if (config.fontFamily)
			document.fonts.load(`10pt "${config.fontFamily}"`)
				.then(() => res(RainbowBreaker.init(config)));
		else res(RainbowBreaker.init(config));
	});
}