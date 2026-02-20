import '@packages/frontend-libs/dist/frontend-libs.css';
import { addErrorHandler } from '@packages/frontend-libs/dist/error';
import Aura from '@primeuix/themes/aura';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import './style.css';
import App from '@/App.vue';
import { localLinksOpenInWindow } from '@/lib/disgusting-stuff';
import router from '@/router';

localLinksOpenInWindow();

addErrorHandler((error) => {
	console.error(error);
	debugger;
	alert(`Error: ${error}`);
});

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			darkModeSelector: ':root',
		},
	},
});

(<any>window).router = router;

app.mount('#app');
