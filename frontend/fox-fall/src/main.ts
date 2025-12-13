import '@packages/frontend-libs/dist/frontend-libs.css';
import Aura from '@primeuix/themes/aura';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import './style.css';
import App from '@/App.vue';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			darkModeSelector: ':root',
		},
	},
});

app.mount('#app');

window.electronApi?.getDisplaySize().then((size) => {
	document.documentElement.style.setProperty('--vmin', `${Math.min(size.width, size.height) * 0.01}px`);
});
