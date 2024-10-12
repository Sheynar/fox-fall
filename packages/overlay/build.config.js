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
	},
};
