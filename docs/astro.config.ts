import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom';

// https://astro.build/config
export default defineConfig({
	site: process.env.CI ? 'https://inteli-college.github.io' : 'http://localhost:4321',
	base: '/2024-1B-T02-EC10-G03/',
	integrations: [
		starlight({
			title: 'Pyxis Vultures',
			social: {
				github: 'https://github.com/Inteli-College/2024-1B-T02-EC10-G03',
			},
			editLink: {
				baseUrl: 'https://github.com/Inteli-College/2024-1B-T02-EC10-G03/tree/main/docs',
			},
			logo: {
				src: './src/assets/logo.png',
			},
			customCss: ['./src/styles/custom.css'],

			sidebar: [
				{
					label: 'Overview',
					collapsed: true,
					autogenerate: { directory: 'overview' },
				},
				{
					label: 'Sprint 1',
					collapsed: true,
					autogenerate: { directory: 'sprint-1' },

					items: [
						{
							label: 'Negócios',
							collapsed: true,
							autogenerate: { directory: 'sprint-1/business' },
						},
						{
							label: 'Sistema',
							collapsed: true,
							autogenerate: { directory: 'sprint-1/system' },
						}
					]
				},
				{
					label: 'Sprint 2',
					collapsed: true,
					autogenerate: { directory: 'sprint-2' },
				},
				{
					label: 'Sprint 3',
					collapsed: true,
					autogenerate: { directory: 'sprint-3' },
				},
				{
					label: 'Sprint 4',
					collapsed: true,
					autogenerate: { directory: 'sprint-4' },
				},
				{
					label: 'Sprint 5',
					collapsed: true,
					autogenerate: { directory: 'sprint-5' },
				},
			],
			pagination: true,
			plugins: [
				starlightLinksValidator({
					errorOnRelativeLinks: false,
				}),
				starlightImageZoom(),
			],
		}),
	],
});
