import Aura from '@primevue/themes/aura';
import { createApp } from 'vue';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import './style.css';
import App from '@/App.vue';

const app = createApp(App);

app.use(PrimeVue, {
	theme: {
		preset: Aura,
	},
});

app.mount('#app');
