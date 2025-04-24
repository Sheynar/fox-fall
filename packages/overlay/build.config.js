const path = require('node:path');
require('electron-builder');

module.exports = {
	appId: "co.za.fox-fall.overlay",
	productName: "FoxFall Overlay",
	artifactName: "FoxFall-${version}-${os}-${arch}.${ext}",
	npmRebuild: false,
	directories: {
		output: "out/${productName}/${os}",
	},
	win: {
		icon: path.resolve(__dirname, './icon.png'),
		publish: ['github'],
	},
	linux: {
		target: "tar.gz", // https://www.electron.build/linux#target
		executableName: "foxfall-overlay",
	}
};
