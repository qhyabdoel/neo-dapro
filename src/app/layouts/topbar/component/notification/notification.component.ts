// Angular
import {
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, NotificationService, TranslationService } from 'src/app/libs/services';
import { User } from 'src/app/libs/models';

@Component({
  selector: 'kt-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent {
  @ViewChild('toggleButton1') toggleButton: ElementRef;
  @ViewChild('menu1') menu: ElementRef;
  isOpen: boolean = false;
  // Show dot on top of the icon
  @Input() dot: string;

  // Show pulse on icon
  @Input() pulse: boolean;

  @Input() pulseLight: boolean;

  // Set icon class name
  @Input() icon = 'flaticon2-bell-alarm-symbol';
  @Input() iconType: '' | 'success';

  // Set true to icon as SVG or false as icon class
  @Input() useSVG: boolean;

  // Set bg image path
  @Input() bgImage: string;

  // Set skin color, default to light
  @Input() skin: 'light' | 'dark' = 'light';

  @Input() type: 'brand' | 'success' = 'success';

  notifListCount = 0;
  logList: any = [];
  endpointList: any = [];
  user$: Observable<User>;
  user: User;
  open: any;
  /**
   * Component constructor
   *
   * @param sanitizer: DomSanitizer
   */
  constructor(
    private _apicall: ApiService,
    public cdRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    private translationService: TranslationService,
    private renderer: Renderer2
  ) {
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

  backGroundStyle(): string {
    if (!this.bgImage) {
      return 'none';
    }

    return 'url(' + this.bgImage + ')';
  }

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    await this.loadLogList();
  }

  async getApi(url) {
    let a = await this._apicall
      .get(url)
      .toPromise()
      .then((_) => {
        return _;
      })
      .catch((err) => {
        console.log(err);
      });
    return a;
  }

  clickNotif() {
    this.notifListCount = 0;
    this.handleDialog();
  }

  async loadLogList() {
    this.notificationService.setNotif();
    this.notificationService.getNotif.subscribe((val) => {
      this.logList = val ? val.logList : [];
      this.notifListCount = val ? val.logList.length : 0;
      this.cdRef.detectChanges();
    });
  }

  handleDialog = () => {
    this.isOpen = !this.isOpen;
  };
}
