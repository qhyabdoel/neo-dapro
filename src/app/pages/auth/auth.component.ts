import { Component, ElementRef, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';

import { AuthNoticeService, LayoutConfigService, SplashScreenService, TranslationService } from "src/app/libs/services";

import * as objectPath from 'object-path';

@Component({
	selector: 'kt-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AuthComponent implements OnInit {
	// Public properties
	today: number = Date.now();
	headerLogo: string;
	headerBrandLogo: string;
	classHeaderBrandLogo: string;
	background:any;

	/**
	 * Component constructor
	 *
	 * @param el
	 * @param render
	 * @param layoutConfigService: LayoutConfigService
	 * @param authNoticeService: authNoticeService
	 * @param translationService: TranslationService
	 * @param splashScreenService: SplashScreenService
	 */
	constructor(
		private el: ElementRef,
		private render: Renderer2,
		private layoutConfigService: LayoutConfigService,
		public authNoticeService: AuthNoticeService,
		private translationService: TranslationService,
		private splashScreenService: SplashScreenService) {
	}

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit(): void {
		//console.log("this.translationService.getSelectedLanguage()", this.translationService.getSelectedLanguage());
		this.translationService.setLanguage(this.translationService.getSelectedLanguage());
		this.headerLogo = this.layoutConfigService.getLogo();
		
		this.splashScreenService.hide();
		const config = this.layoutConfigService.getConfig();
		// get login layout
		let skin = objectPath.get(config, 'login.self.skin');
		if(skin == 'light'){
			this.background = 'theme-blush';
			this.headerBrandLogo = objectPath.get(config, 'login.logoLight');
			this.classHeaderBrandLogo = objectPath.get(config, 'login.classTextBrandLight');
		}else{
			this.background = 'theme-dark';
			this.headerBrandLogo = objectPath.get(config, 'login.logoDark');
			this.classHeaderBrandLogo = objectPath.get(config, 'login.classTextBrandDark');
		}
	}


	/**
	 * Load CSS for this specific page only, and destroy when navigate away
	 * @param styleUrl
	 */
	private loadCSS(styleUrl: string) {
		return new Promise((resolve, reject) => {
			const styleElement = document.createElement('link');
			styleElement.href = styleUrl;
			styleElement.type = 'text/css';
			styleElement.rel = 'stylesheet';
			styleElement.onload = resolve;
			this.render.appendChild(this.el.nativeElement, styleElement);
		});
	}
}
