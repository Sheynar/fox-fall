import '@packages/frontend-libs/dist/frontend-libs.css';
import { addErrorHandler } from '@packages/frontend-libs/dist/error';
import Aura from '@primeuix/themes/aura';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import './style.css';
import App from '@/App.vue';

addErrorHandler((error) => {
	console.error(error);
	debugger;
	alert(`Error: ${error}`);
});

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
