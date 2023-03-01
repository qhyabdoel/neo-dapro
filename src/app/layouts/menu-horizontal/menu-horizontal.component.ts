import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
} from '@angular/core';

import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import * as objectPath from 'object-path';

import {
  HtmlClassService,
  LayoutConfigService,
  MenuConfigService,
  MenuHorizontalService,
  TranslationService,
} from 'src/app/libs/services';

import { MenuOptions, OffcanvasOptions } from 'src/app/libs/directives';

@Component({
  selector: 'kt-menu-horizontal',
  templateUrl: './menu-horizontal.component.html',
  styleUrls: ['./menu-horizontal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuHorizontalComponent implements OnInit, AfterViewInit {
  // Public properties
  currentRouteUrl: any = '';
  moduleName: string = '';
  headerLogo: any = '';
  rootArrowEnabled: boolean;
  backgroundSubMenu: string;
  isShowMenu$: Observable<boolean>;
  isShowTrueAIMenu$: Observable<boolean>;
  isAppPreview: boolean = false;

  menu;
  menuOptions: MenuOptions = {
    submenu: {
      desktop: 'dropdown',
      tablet: 'accordion',
      mobile: 'accordion',
    },
    accordion: {
      slideSpeed: 200, // accordion toggle slide speed in milliseconds
      expandAll: false, // allow having multiple expanded accordions in the menu
    },
    dropdown: {
      timeout: 50,
    },
  };

  offcanvasOptions: OffcanvasOptions = {
    overlay: true,
    baseClass: 'kt-header-menu-wrapper',
    closeBy: 'kt_header_menu_mobile_close_btn',
    toggleBy: {
      target: 'kt_header_mobile_toggler',
      state: 'kt-header-mobile__toolbar-toggler--active',
    },
  };

  /**
   * Component Conctructor
   *
   * @param el: ElementRef
   * @param htmlClassService: HtmlClassService
   * @param menuHorService: MenuHorService
   * @param menuConfigService: MenuConfigService
   * @param layoutConfigService: LayouConfigService
   * @param router: Router
   * @param render: Renderer2
   * @param cdr: ChangeDetectorRef
   */
  constructor(
    private el: ElementRef,
    public htmlClassService: HtmlClassService,
    public menuHorService: MenuHorizontalService,
    private menuConfigService: MenuConfigService,
    private layoutConfigService: LayoutConfigService,
    private router: Router,
    private render: Renderer2,
    private cdr: ChangeDetectorRef,
    private translationService: TranslationService
  ) {}

  /**
   * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
   */

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    this.getInitRouting();
  }

  /**
   * On init
   */
  ngOnInit(): void {
    this.getInitRouting();
  }

  getInitRouting() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.menuConfigService.setShowMenu(true);
    this.menu = '';
    this.rootArrowEnabled = this.layoutConfigService.getConfig('header.menu.self.root-arrow');
    this.headerLogo = this.layoutConfigService.getLogo();
    this.currentRouteUrl = String(this.router.url).split('?')[0];

    let urlPath = this.router.url.split('/');
    if (urlPath && urlPath.length > 0) {
      this.moduleName = urlPath[0] ? urlPath[0] : urlPath[1];
    }

    // console.log(this.moduleName,this.currentRouteUrl)
    //#f2f3f8 light //#383F43 dark
    let path = this.layoutConfigService.getConfig('header.menu.desktop.submenu.skin');
    this.backgroundSubMenu = this.layoutConfigService.getConfig('header.menu.desktop.submenu.' + path);
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.currentRouteUrl = String(this.router.url).split('?')[0];
      this.cdr.markForCheck();
    });
    this.isShowMenu$ = this.menuConfigService.getShowMenu;
    this.isShowTrueAIMenu$ = this.menuConfigService.getTrueAIMenu;
    this.menuConfigService.getShowMenu.subscribe((e) => {});

    if (window.location.href.includes('app_preview')) {
      this.isAppPreview = true;
    }
    this.cdr.detectChanges();
  }
  /**
   * Return Css Class Name
   * @param item: any
   */
  getItemCssClasses(item) {
    let classes = 'kt-menu__item';

    if (objectPath.get(item, 'submenu')) {
      classes += ' kt-menu__item--submenu';
    }

    if (!item.submenu && this.isMenuItemIsActive(item)) {
      classes += ' kt-menu__item--active kt-menu__item--here';
    }

    if (item.submenu && this.isMenuItemIsActive(item)) {
      classes += ' kt-menu__item--open kt-menu__item--here';
    }

    if (objectPath.get(item, 'resizer')) {
      classes += ' kt-menu__item--resize';
    }

    const menuType = objectPath.get(item, 'submenu.type') || 'classic';
    if (
      (objectPath.get(item, 'root') && menuType === 'classic') ||
      parseInt(objectPath.get(item, 'submenu.width'), 10) > 0
    ) {
      classes += ' kt-menu__item--rel';
    }

    const customClass = objectPath.get(item, 'custom-class');
    if (customClass) {
      classes += ' ' + customClass;
    }

    if (objectPath.get(item, 'icon-only')) {
      classes += ' kt-menu__item--icon-only';
    }

    return classes;
  }

  /**
   * Returns Attribute SubMenu Toggle
   * @param item: any
   */
  getItemAttrSubmenuToggle(item) {
    let toggle = 'hover';
    if (objectPath.get(item, 'toggle') === 'click') {
      toggle = 'click';
    } else if (objectPath.get(item, 'submenu.type') === 'tabs') {
      toggle = 'tabs';
    } else {
      // submenu toggle default to 'hover'
    }

    return toggle;
  }

  /**
   * Returns Submenu CSS Class Name
   * @param item: any
   */
  getItemMenuSubmenuClass(item) {
    let classes = '';

    const alignment = objectPath.get(item, 'alignment') || 'right';

    if (alignment) {
      classes += ' kt-menu__submenu--' + alignment;
    }

    const type = objectPath.get(item, 'type') || 'classic';
    if (type === 'classic') {
      classes += ' kt-menu__submenu--classic';
    }
    if (type === 'tabs') {
      classes += ' kt-menu__submenu--tabs';
    }
    if (type === 'mega') {
      if (objectPath.get(item, 'width')) {
        classes += ' kt-menu__submenu--fixed';
      }
    }

    if (objectPath.get(item, 'pull')) {
      classes += ' kt-menu__submenu--pull';
    }

    return classes;
  }

  /**
   * Check Menu is active
   * @param item: any
   */
  isMenuItemIsActive(item): boolean {
    if (item.submenu) {
      return this.isMenuRootItemIsActive(item);
    }

    if (!item.page) {
      return false;
    }

    return this.currentRouteUrl.indexOf(item.page) !== -1;
  }

  /**
   * Check Menu Root Item is active
   * @param item: any
   */
  isMenuRootItemIsActive(item): boolean {
    if (item.submenu.items) {
      for (const subItem of item.submenu.items) {
        if (this.isMenuItemIsActive(subItem)) {
          return true;
        }
      }
    }

    if (item.submenu.columns) {
      for (const subItem of item.submenu.columns) {
        if (this.isMenuItemIsActive(subItem)) {
          return true;
        }
      }
    }

    if (typeof item.submenu[Symbol.iterator] === 'function') {
      for (const subItem of item.submenu) {
        const active = this.isMenuItemIsActive(subItem);
        if (active) {
          return true;
        }
      }
    }

    return false;
  }

  activeClass(e) {
    this.menu = e;
  }
}
