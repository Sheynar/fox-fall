import type { RouteRecordRaw } from "vue-router";

export const viewRoutes: RouteRecordRaw[] = [
	{
		name: 'instance:view',
		path: ':instanceId',
		props: true,
		component: () => import('./ViewInstance.vue'),
		children: [
			{
				name: 'document:edit',
				path: 'document/edit/:documentId',
				props: true,
				component: () => import('./ViewDocument.vue'),
			},
		],
	},
];