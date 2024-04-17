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
			title: 'Starlight Template',
			social: {
				github: 'https://github.com/Inteli-College/2024-1B-T02-EC10-G03',
			},
			editLink: {
				baseUrl: 'https://github.com/Inteli-College/2024-1B-T02-EC10-G03/tree/main/docs',
			},
			logo: {
				src: './src/assets/houston.webp',
			},
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{
					label: 'Guides',
					items: [{ label: 'Example Guide', autogenerate: { directory: 'guides' } }],
				},
				{
					label: 'Reference',
					autogenerate: { directory: 'reference' },
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
