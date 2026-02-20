import type { RouteRecordRaw } from "vue-router";
import { viewRoutes } from "./view";

export const instanceRoutes: RouteRecordRaw[] = [
	{
		name: 'instance:select',
		path: 'list',
		component: () => import('./SelectInstance.vue'),
	},
	{
		path: 'view',
		children: viewRoutes,
	},
	{
		name: 'instance:admin',
		path: 'admin/:instanceId',
		props: true,
		component: () => import('./EditInstance.vue'),
	},
	{
		name: 'instance:add',
		path: 'add',
		component: () => import('./AddInstance.vue'),
	},
];