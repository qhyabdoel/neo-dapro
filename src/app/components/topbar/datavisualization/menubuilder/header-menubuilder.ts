// Angular
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
// Loading bar
import { LoadingBarService } from '@ngx-loading-bar/core';
// Layout
import { Observable } from 'rxjs';
// State
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  ApiService,
  HtmlClassService,
  JsonService,
  LayoutConfigService,
  TranslationService,
} from 'src/app/libs/services';
import { LayoutConfigModel, User } from 'src/app/libs/models';
import { environment } from 'src/environments/environment';
import { ModalGlossaryComponent } from 'src/app/components/modals/modalGlossary/modalGlossary';

@Component({
  selector: '[header-component]',
  templateUrl: './header-menubuilder.html',
  styleUrls: ['./header-menubuilder.scss'],
})
export class HeaderMenuBuilderComponent implements OnInit {
  @Input() options: any;
  @Input() isNotiApp: boolean;
  @Input() notifList: any;
  @Input() notifListCount: number;
  @Input() isApplication: boolean;
  @Input() redirect: any;
  @Output() onClickSearch: EventEmitter<any> = new EventEmitter<any>();
  @Output() onClickNotification: EventEmitter<any> = new EventEmitter<any>();
  // Public properties
  menuHeaderDisplay: boolean;
  fluid: boolean;
  is_click: boolean = false;
  searchText: string;
  user: any;
  user$: Observable<User>;
  imagePlaceholder = './assets/media/users/default.jpg';
  model: LayoutConfigModel;
  isShow_global_search: boolean = true;
  isShow_change_password: boolean = true;
  modalReference: NgbModalRef;

  constructor(
    private layoutConfigService: LayoutConfigService,
    public loader: LoadingBarService,
    public htmlClassService: HtmlClassService,
    private modalService: NgbModal,
    private translationService: TranslationService,
    private jsonService: JsonService,
    private changeDetector: ChangeDetectorRef,
    private service: ApiService
  ) {}

  ngOnInit(): void {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.model = this.layoutConfigService.getConfig();
    this.user = new User();
    this.user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : [];
    this.jsonService
      .retEnvironment(environment.type)
      .then((data) => {
        this.isShow_global_search = data.global_search;
        this.isShow_change_password = data.change_password;
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });
  }

  search() {
    this.onClickSearch.emit(this.searchText);
  }

  getLink(item, index?) {
    item = Object.assign({}, item, { index: index });
    this.onClickNotification.emit(item);
  }
  changeSkin(e): void {
    this.model.login.self.skin = e;
    this.layoutConfigService.setConfig(this.model, true);
    document.body.className = '';
    document.body.className =
      e == 'dark'
        ? 'theme-light-pqs theme-pds ng-tns-0-0 theme-dark theme-cyan kt-header--fixed kt-header-mobile--fixed kt-subheader--fixed kt-subheader--enabled kt-subheader--solid kt-aside--enabled kt-aside--fixed kt-aside--minimize kt-header-base-dark kt-header-menu-dark kt-brand-dark kt-aside-dark kt-page--loaded'
        : 'theme-light-pqs theme-pds ng-tns-0-0 kt-header--fixed kt-header-mobile--fixed kt-subheader--fixed kt-subheader--enabled kt-subheader--solid kt-aside--enabled kt-aside--fixed kt-aside--minimize kt-header-base-dark kt-header-menu-dark kt-brand-dark kt-aside-dark kt-page--loaded';
  }
  openModalTemplate = () => {
    this.modalReference = this.modalService.open(ModalGlossaryComponent, {
      size: 'md',
      centered: true,
    });
  };
  changePassword = () => {};
  logout = () => {};
  public open: any = {
    setting: false,
    notification: false,
    help: false,
    language: false,
    userprofile: false,
  };
  public setting: boolean;
  public notification: boolean;
  public help: boolean;
  public language: boolean;
  public userprofile: boolean;

  handleOpen(type: string) {
    this.open = { ...this.open, [type]: !this.open[type] };
    this.changeDetector.detectChanges();
  }
}
