const path = require('node:path');
require('electron-builder');

module.exports = {
	appId: "co.za.fox-fall.overlay",
	productName: "FoxFall Overlay",
	artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
	npmRebuild: false,
	directories: {
		output: "out/${productName}/${os}",
	},
	win: {
		// icon: `${iconPath}.ico`,
		publish: ['github'],
	},
	linux: {
		target: "tar.gz", // https://www.electron.build/linux#target
		executableName: "foxfall-overlay",
	}
};
