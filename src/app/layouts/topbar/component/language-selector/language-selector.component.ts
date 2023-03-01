import {
  Component,
  HostBinding,
  OnInit,
  Input,
  ChangeDetectorRef,
  Renderer2,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs/operators';
import { TranslationService, JsonService } from 'src/app/libs/services';
import { SetIsLanguageChangeTriggered } from 'src/app/libs/store/actions/general.actions';
import { AppState } from 'src/app/libs/store/states';
import { EnglishIcon, IndonesianIcon, static_language } from './helper-language';

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  flagname: string;
  active?: boolean;
}

@Component({
  selector: 'kt-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.scss'],
})
export class LanguageSelectorComponent implements OnInit {
  // Public properties
  @HostBinding('class') classes = '';
  @ViewChild('toggleButton') toggleButton: ElementRef;
  @ViewChild('menu') menu: ElementRef;
  isOpen: boolean = false;
  language: LanguageFlag;
  languages: LanguageFlag[] = static_language;

  /**
   * Component constructor
   *
   * @param translationService: TranslationService
   * @param router: Router
   */

  constructor(
    private translationService: TranslationService,
    private jsonService: JsonService,
    private router: Router,
    public cdRef: ChangeDetectorRef,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private store: Store<AppState>,
  ) {
    iconRegistry.addSvgIconLiteral('id', sanitizer.bypassSecurityTrustHtml(IndonesianIcon));
    iconRegistry.addSvgIconLiteral('en', sanitizer.bypassSecurityTrustHtml(EnglishIcon));

    this.renderer.listen('window', 'click', (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (!this.toggleButton.nativeElement.contains(e.target) && !this.menu.nativeElement.contains(e.target)) {
        this.isOpen = false;
        this.cdRef.detectChanges();
      }
    });
  }

  /**
   * On init
   */
  ngOnInit() {
    this.setSelectedLanguage();
    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe((event) => {
      this.setSelectedLanguage();
    });
  }

  /**
   * Set language
   *
   * @param lang: any
   */
  setLanguage(lang) {
    this.languages.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
    this.translationService.setLanguage(lang);
    // start onchange static value
    var titleHeading = document.getElementById('title-heading');
    if (titleHeading) {
      let span = titleHeading.innerHTML;
      this.jsonService.setbuttonCreateName(lang == 'id' ? span + ' Baru' : 'New ' + span);
    } else this.jsonService.setbuttonCreateName(lang == 'id' ? 'Baru' : 'New');
  }

  handleSetLanguage = (lang) => {
    this.handleDialog();
    this.setLanguage(lang);

    this.store.dispatch(SetIsLanguageChangeTriggered({ isLanguageChangeTriggered: true }));
  };

  /**
   * Set selected language
   */
  setSelectedLanguage(): any {
    this.setLanguage(this.translationService.getSelectedLanguage());
  }

  handleDialog = () => {
    this.isOpen = !this.isOpen;
  };
}
