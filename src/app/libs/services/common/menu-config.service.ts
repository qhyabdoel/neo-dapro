// Angular
import { Injectable } from '@angular/core';
// RxJS
import { Subject, BehaviorSubject } from 'rxjs';
import { LayoutConfigModel } from 'src/app/libs/models';

@Injectable()
export class MenuConfigService {
	// Public properties
	private isShowMenu: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	private isShowLeftMenu: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	private isTrueAIMenu: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	layoutConfig: LayoutConfigModel;
	onConfigUpdated$: Subject<any>;
	// Private properties
	private menuConfig: any;

	/**
	 * Service Constructor
	 */
	constructor() {
		// register on config changed event and set default config
		this.onConfigUpdated$ = new Subject();
	}

	/**
	 * Returns the menuConfig
	 */
	getMenus() {
		return this.menuConfig;
	}

	get getShowMenu() {
		return this.isShowMenu.asObservable();
	}

	get getLeftShowMenu() {
		return this.isShowLeftMenu.asObservable();
	}

	get getTrueAIMenu() {
		return this.isTrueAIMenu.asObservable();
	}

	setShowMenu(isShow) {
		this.isShowMenu.next(isShow);
	}

	setMenuTrueAI(isShow) {
		this.isTrueAIMenu.next(isShow);
	}

	setLeftShowMenu(isShow) {
		this.isShowLeftMenu.next(isShow);
	}

	/**
	 * Load config
	 *
	 * @param config: any
	 */
	loadConfigs(config: any) {
		this.menuConfig = config;
		this.onConfigUpdated$.next(this.menuConfig);
	}
}
