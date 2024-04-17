import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import starlightImageZoom from 'starlight-image-zoom';

// https://astro.build/config
export default defineConfig({
	site: process.env.CI ? 'http://vinicioslugli.github.io' : 'http://localhost:4321',
	base: '/starlight-docs-template/',
	integrations: [
		starlight({
			title: 'Starlight Template',
			social: {
				github: 'https://github.com/ViniciosLugli/starlight-docs-template',
			},
			editLink: {
				baseUrl: 'https://github.com/ViniciosLugli/starlight-docs-template/tree/main',
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
