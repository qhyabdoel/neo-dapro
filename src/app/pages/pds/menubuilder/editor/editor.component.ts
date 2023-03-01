import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  isValidate,
  setDataSave,
  static_form_data,
} from 'src/app/components/sidebars/menubuilder/rightbar/helperRightbar';
import { JsonService } from 'src/app/libs/services';
import { InjectDirective } from 'src/app/libs/directives';
import {
  GetApplicationList,
  GetDashboardList,
  SetMenuBuilderDetail,
  SetMenuBuilderSelectedItem,
  SetMenuList,
  SetOptionLeftbar,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import {
  applicationListSelector,
  menuBuilderSelector,
  menuListSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { leftbar_option_application, topbar_option_application } from './helper.editor.component';
import apps from './../../../../../assets/data/applications.json';
import { ApiService, NotificationService } from 'src/app/libs/services';
import { rest_api } from 'src/app/libs/configs';
@Component({
  selector: '[editor-visualization]',
  templateUrl: './editor.component.html',
})
export class EditorVisualizationComponent implements OnInit {
  @ViewChild(InjectDirective, { static: true }) injectComp: InjectDirective;
  static_url = rest_api.API_APPLICATION_LIST;
  topbarOptions: any = {};
  leftbarOptions: any = {};
  messages: any;
  formData: any;
  applicationList: any = [];
  loadUrl = '';
  slugId = '';
  menu: [];
  popupMessage: any = {
    title: '',
    desc: '',
  };
  constructor(
    private jsonService: JsonService,
    private route: Router,
    private store: Store<AppState>,
    private service: ApiService,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {
    this.loadUrl = this.route.url.replace('pds', 'api');
    const split = this.loadUrl.split('?');
    this.slugId = split.length > 1 ? split[1].split('=')[1] : '';
    this.store
      .select(applicationListSelector)
      .pipe()
      .subscribe((result) => {
        this.applicationList = result.response;
      });
    this.store.select(menuBuilderSelector).subscribe((res) => {
      if (res) {
        this.setFormData(res);
      }
    });
    this.store.select(menuListSelector).subscribe((res) => {
      if (res) {
        this.menu = res;
      }
    });
  }

  async ngOnInit() {
    this.messages = await this.jsonService.retMessage();
    this.initialTopbarOptions();
    this.initialSidebarOptions();
    this.store.dispatch(GetDashboardList());
    this.store.dispatch(GetApplicationList());
    this.store.dispatch(SetMenuBuilderDetail({ item: static_form_data(apps) }));
    this.store.dispatch(SetMenuBuilderSelectedItem({ item: null }));
    this.store.dispatch(SetMenuList({ item: [] }));
    this.initialOnLoadData();
  }

  setFormData = (res) => {
    this.formData = res;
    this.menu = res.menu;
  };

  initialOnLoadData = async () => {
    this.messages = await this.jsonService.retMessage();
    if (this.slugId == '') {
      return;
    }
    const item = this.applicationList.find((obj) => obj.slug == this.slugId);
    this.store.dispatch(SetMenuBuilderDetail({ item: item }));
    this.formData = item;
    this.topbarOptions.title = item.title;
  };

  initialTopbarOptions() {
    this.topbarOptions = topbar_option_application(this.messages);
  }

  initialSidebarOptions() {
    // this.leftbarOptions = leftbar_option_application;
    this.store.dispatch(SetOptionLeftbar({ options: leftbar_option_application }));
  }

  validationPage = () => {
    let result = null;
    result = isValidate(this.menu, this.popupMessage, this.messages);
    this.popupMessage = result.popupMessage;
    return result.validate;
  };

  async buttonSave(res) {
    if (!res) {
      return;
    }

    if (!this.validationPage()) {
      this.service.openModal(this.popupMessage.title, this.popupMessage.desc);
      return;
    }
    this.changeDetector.detectChanges();
    this.formData = {
      ...this.formData,
      options: {
        ...this.formData.options,
        menu: this.menu,
      },
    };
    this.submit(setDataSave(this.formData, this.menu));
  }

  async submit(data) {
    let url = this.static_url;
    if (this.formData.slug) {
      url = `${this.static_url}/${this.formData.slug}`;
    }

    const val = await this.service.postApi(url, data, true);
    if (val.status) {
      if (val.result.response != null) {
        this.notificationService.setNotif();
        this.formData = val.result.response;
      }
      // call api for application list
      this.store.dispatch(GetApplicationList());
      this.changeDetector.detectChanges();
    }
  }
  buttonNew() {
    // new ruoute
    this.route.navigate(['/pds/applicationbuilder_app']);
    // set slug id
    this.slugId = '';
    // create intial form data
    this.store.dispatch(SetMenuBuilderDetail({ item: static_form_data(apps) }));
    // intial variable baru
    this.ngOnInit();
  }
  async buttonView() {
    this.messages = await this.jsonService.retMessage();
    const me = this;
    if (this.formData.slug == '' || this.formData.slug == null) {
      this.service.openModal(this.messages.APPLICATIONS.W, this.messages.APPLICATIONS.MSG_PSAF);
      return;
    } else {
      const url = this.route.serializeUrl(
        this.route.createUrlTree(['pds', 'app_preview'], {
          queryParams: {},
        })
      );
      this.route.navigate(['/pds/app_preview'], {
        queryParams: { link: me.formData.slug },
      });
      // can't handle new tab because problem in cache browser is empty
      // window.open(url + '?link=' + me.formData.slug, '_blank');
    }
  }

  titleChange(title) {
    this.formData = { ...this.formData, title: title };
  }
  async loadApplicationTo(item) {
    this.messages = await this.jsonService.retMessage();
    this.route.navigate(['/pds/applicationbuilder_app'], {
      queryParams: { link: item.slug },
    });
    this.store.dispatch(SetMenuBuilderDetail({ item: item }));
    this.formData = item;
    this.topbarOptions.title = item.title;
  }
}
