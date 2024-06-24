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
			defaultLocale: 'pt-BR',
			locales: {
				'pt-BR': {
					label: 'Português',
				},
			},
			sidebar: [
				{
					label: 'Visão Geral',
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
							label: 'Experiência do Usuário',
							collapsed: true,
							autogenerate: { directory: 'sprint-1/ux' },
						},
						{
							label: 'Sistema',
							collapsed: true,
							autogenerate: { directory: 'sprint-1/system' },
						},
						{
							label: 'Review',
							collapsed: true,
							autogenerate: { directory: 'sprint-1/review' },
						},
					],
				},
				{
					label: 'Sprint 2',
					collapsed: true,
					autogenerate: { directory: 'sprint-2' },
					items: [
						{
							label: 'Negócios',
							collapsed: true,
							autogenerate: { directory: 'sprint-2/business' },
						},
						{
							label: 'Experiência do Usuário',
							collapsed: true,
							autogenerate: { directory: 'sprint-2/ux' },
						},
						{
							label: 'Sistema',
							collapsed: true,
							autogenerate: { directory: 'sprint-2/system' },
						},
						{
							label: 'Review',
							collapsed: true,
							autogenerate: { directory: 'sprint-2/review' },
						},
					],
				},
				{
					label: 'Sprint 3',
					collapsed: true,
					autogenerate: { directory: 'sprint-3' },
					items: [
						{
							label: 'Experiência do Usuário',
							collapsed: true,
							autogenerate: { directory: 'sprint-3/ux' },
						},
						{
							label: 'Sistema',
							collapsed: true,
							autogenerate: { directory: 'sprint-3/system' },
						},
						{
							label: 'Review',
							collapsed: true,
							autogenerate: { directory: 'sprint-3/review' },
						},
					]

				},
				{
					label: 'Sprint 4',
					collapsed: true,
					autogenerate: { directory: 'sprint-4' },
					items: [
						{
							label: 'Experiência do Usuário',
							collapsed: true,
							autogenerate: { directory: 'sprint-4/ux' },
						},
						{
							label: 'Sistema',
							collapsed: true,
							autogenerate: { directory: 'sprint-4/system' },
						},
						{
							label: 'Teste',
							collapsed: true,
							autogenerate: { directory: 'sprint-4/tests' },
						},
						{
							label: 'Review',
							collapsed: true,
							autogenerate: { directory: 'sprint-4/review' },
						},
					],
				},
				{
					label: 'Sprint 5',
					collapsed: true,
					autogenerate: { directory: 'sprint-5' },
					items: [
						{
							label: 'Negócios',
							collapsed: true,
							autogenerate: { directory: 'sprint-5/business' },
						},
						{
							label: 'Sistema',
							collapsed: true,
							autogenerate: { directory: 'sprint-5/system' },
						},
						{
							label: 'Review',
							collapsed: true,
							autogenerate: { directory: 'sprint-5/review' },
						},
					]
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
