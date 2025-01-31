import { defineStore } from 'pinia';

export const useToggleButtonStore = defineStore('toggle-button', {
	state: () => ({
		sizeX: 0,
		sizeY: 0,
	}),
	actions: {
		setSize(sizeX: number, sizeY: number) {
			this.sizeX = sizeX;
			this.sizeY = sizeY;
		},
	},
});
