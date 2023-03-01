import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JsonService, TranslationService, LayoutUtilsService } from 'src/app/libs/services';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { findTypeCheckByUrl } from 'src/app/libs/helpers/data-visualization-helper';

@Component({
  selector: '[topbar-visualization]',
  templateUrl: './pqsubtopbar.component.html',
})
export class PqsubtopbarComponent implements OnInit, AfterViewInit {
  @Input() options: any;
  @Input() isLoadData: any;
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() fullscreen: EventEmitter<any> = new EventEmitter<any>();
  @Output() download: EventEmitter<any> = new EventEmitter<any>();
  @Output() newbutton: EventEmitter<any> = new EventEmitter<any>();
  @Output() savebutton: EventEmitter<any> = new EventEmitter<any>();
  @Output() viewbutton: EventEmitter<any> = new EventEmitter<any>();
  @Output() backbutton: EventEmitter<any> = new EventEmitter<any>();
  @Output() folderbutton: EventEmitter<any> = new EventEmitter<any>();
  @Output() analyzebutton: EventEmitter<any> = new EventEmitter<any>();
  @Output() sharebutton: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() title: EventEmitter<any> = new EventEmitter<any>();

  isLeftToggle: boolean = false;
  isRightToggle: boolean = false;
  messages: any;
  buttonCreateName: any;
  popupMessage: any = {
    title: '',
    desc: '',
  };
  id: any;
  openMenu: boolean = false;

  constructor(
    private layoutUtilsService: LayoutUtilsService,
    private translationService: TranslationService,
    private jsonService: JsonService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private activeRoute: ActivatedRoute
  ) {
    this.activeRoute.queryParams.subscribe((params) => {
      if (params.slice_id) {
        this.id = params.slice_id;
      } else if (params.token) {
        this.id = params.token;
      } else {
        this.id = params.link;
      }
    });
  }

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    if (this.options && this.options.buttonCreateName)
      this.jsonService.setbuttonCreateName(this.options.buttonCreateName);
    this.buttonCreateName = this.jsonService.getbuttonCreateName;
  }

  ngAfterViewInit() {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.changeLang();
    });
  }

  async changeLang() {
    this.messages = await this.jsonService.retMessage();

    document.getElementById('Chart').innerHTML = '<i class="zmdi zmdi-chart"></i>' + this.messages.CHART.TITLE;
    document.getElementById('Dashboard').innerHTML =
      '<i class="zmdi zmdi-view-dashboard"></i>' + this.messages.DASHBOARD.TITLE;
  }

  ngOnDownload() {
    this.download.emit();
  }
  ngOnFullScreen() {
    this.fullscreen.emit();
  }
  ngOnRefresh() {
    this.refresh.emit();
  }

  toggleLeftRight(type) {
    if (type == 'left') this.isLeftToggle = !this.isLeftToggle;
    if (type == 'right') this.isRightToggle = !this.isRightToggle;
    this.layoutUtilsService.addRemoveBodyClass(type, this.isLeftToggle, this.isRightToggle);
  }

  async buttonSave(title) {
    let type = findTypeCheckByUrl();
    if (type === 'application') {
      this.messages = await this.jsonService.retMessage();
      const dialogRef = this.layoutUtilsService.saveElement(
        `${this.messages.APPLICATIONS.SAVE} ${this.messages.APPLICATIONS.APP} ? `,
        `${this.messages.CHART.MSG_YWCSABC}.`,
        `${title} is saving ...`,
        '',
        false
      );
      dialogRef.afterClosed().subscribe(async (res) => {
        this.savebutton.emit(res);
      });
    } else {
      this.savebutton.emit();
    }
  }

  async buttonNew(title) {
    this.messages = await this.jsonService.retMessage();
    const dialogRef = this.layoutUtilsService.saveElement(
      `${this.messages.CHART.MSG_DWC}`,
      `${this.messages.CHART.MSG_YWCSABC}.`,
      `${title} is saving ...`
    );

    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      if (res === true) {
        res = 'save';
      }
      if (res === 'load') {
        res = 'new';
      }
      this.newbutton.emit(res);
    });
  }

  buttonView() {
    this.viewbutton.emit();
  }
  buttonFolder() {
    this.folderbutton.emit();
  }
  buttonAnalyze() {
    this.analyzebutton.emit();
  }
  buttonShare() {
    this.sharebutton.emit();
  }
  buttonBack() {
    this.backbutton.emit();
  }
  buttonAction(event) {
    if (event.name === 'copy') {
      this.handleOpenMenu();
    } else if (event === 'light' || event === 'dark') {
      this.handleAction.emit({ name: event });
    } else {
      this.handleAction.emit(event);
    }
  }

  titleChange(event) {
    this.title.emit(event);
  }

  handleOpenMenu = () => {
    this.openMenu = !this.openMenu;
  };

  handleStylingButtonAction = (item) => {
    if (this.id && item.name !== 'copy') {
      return 'btn btn-info btn-outline btn-sm py-0 px-2';
    } else if (item.name === 'copy') {
      return 'dropdown-toggle btn btn-outline btn-sm';
    } else {
      return 'btn btn-info btn-outline btn-sm py-0 px-2 disabled';
    }
  };
}
