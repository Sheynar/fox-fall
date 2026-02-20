import { createRouter, createWebHashHistory } from 'vue-router';
import { instanceRoutes } from './instance';

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			name: 'home',
			path: '/',
			component: () => import('./LandingPage.vue'),
		},
		{
			path: '/instance',
			children: instanceRoutes,
		},
	],
});

export default router;