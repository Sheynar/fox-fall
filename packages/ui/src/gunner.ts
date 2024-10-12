import Aura from '@primevue/themes/aura';
import { createApp } from 'vue';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import './style.css';
import Gunner from '@/Gunner.vue';

const app = createApp(Gunner);

app.use(PrimeVue, {
	theme: {
		preset: Aura,
	},
});

app.mount('#app');
