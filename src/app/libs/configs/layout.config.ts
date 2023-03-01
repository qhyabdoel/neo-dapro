import {LayoutConfigModel} from 'src/app/libs/models';

export class LayoutConfig {
	public defaults: LayoutConfigModel = {
		demo: 'demo1',
		// == Base Layout
		self: {
			layout: 'fluid', // fluid|boxed
			body: {
				'background-image': './assets/media/misc/bg-1.jpg',
			},
			logo: {
				dark: './assets/images/logo_paques.svg',
				light: './assets/images/logo_paques.svg',
				brand: './assets/images/logo_paques.svg',
				green: './assets/media/logos/logo-light.png',
			},
		},
		// == Page Splash Screen loading
		loader: {
			enabled: true,
			type: 'spinner-logo',
			logo: './assets/images/logo-mini-md.png',
			message: 'Please wait...',
		},
		// == Colors for javascript
		colors: {
			state: {
				brand: '#5d78ff',
				dark: '#282a3c',
				light: '#ffffff',
				primary: '#5867dd',
				success: '#34bfa3',
				info: '#36a3f7',
				warning: '#ffb822',
				danger: '#fd3995',
			},
			base: {
				label: [
					'#c5cbe3',
					'#a1a8c3',
					'#3d4465',
					'#3e4466',
				],
				shape: [
					'#f0f3ff',
					'#d9dffa',
					'#afb4d4',
					'#646c9a',
				],
			},
		},
		header: {
			self: {
				skin: 'dark',
				fixed: {
					desktop: true,
					mobile: true,
				},
			},
			menu: {
				self: {
					display: true,
					layout: 'default',
					'root-arrow': false,
				},
				desktop: {
					arrow: true,
					toggle: 'click',
					submenu: {
						skin: 'dark',
						arrow: true,
						dark : '#383F43',
						light : "#f2f3f8"
					},
				},
				mobile: {
					submenu: {
						skin: 'dark',
						accordion: true,
					},
				},
			},
		},
		subheader: {
			display: true,
			layout: 'subheader-pds',
			fixed: true,
			width: 'fluid',
			style: 'solid',
		},
		content: {
			width: 'fluid',
		},
		brand: {
			self: {
				skin: 'dark',
			},
		},
		aside: {
			self: {
				skin: 'dark',
				display: true,
				fixed: true,
				minimize: {
					toggle: true,
					default: true,
				},
			},
			footer: {
				self: {
					display: true,
				},
			},
			menu: {
				dropdown: false,
				scroll: false,
				submenu: {
					accordion: true,
					dropdown: {
						arrow: true,
						'hover-timeout': 500,
					},
				},
			},
		},
		footer: {
			self: {
				width: 'fluid',
			},
		},
		login :{
			self: {
				skin: 'dark',
			},
			logoDark : './assets/images/pq-logo-w.svg',
			logoLight : './assets/images/pq-logo-dark.svg',
			bgDark : 'theme-dark',
			bgLight : 'theme-light-pqs',
			bgImageDark : './assets/images/pq-signin-image.svg',
			bgImageLight: './assets/media/pq-signin-image.svg',
			classTextBrandDark : 'logo-dark',
			classTextBrandLight : 'logo-light',
			classTextDescBrandDark : 'white',
			classTextDescBrandLight : 'black',
			classTextDescDark : 'white',
			classTextDescLight : 'black',
			classTextTittleDark : 'white',
			classTextTittleLight : 'black'
		}
	};

	/**
	 * Good place for getting the remote config
	 */
	public get configs(): LayoutConfigModel {
		return this.defaults;
	}
}
