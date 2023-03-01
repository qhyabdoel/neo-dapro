import * as _moment from 'moment';
import { orderBy } from 'lodash';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import {
  JsonService,
  TranslationService,
} from 'src/app/libs/services';
import {
  ManualConfigurations,
  NotificationTemplate,
  Notification,
} from 'src/app/libs/models';
import { ApiService, LayoutUtilsService, MessageType } from 'src/app/libs/services';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { search_regex_three } from 'src/app/libs/helpers/utility';
import { NotificationsEditComponent } from '../notification-edit/notification-edit.component';
import { NotificationsRecipientComponent } from '../recipient/recipient.component';
import { NotificationsTemplatesComponent } from '../templates/templates.component';
import { ManualComponent } from '../manual/form-manual.component';

@Component({
  selector: 'pq-notifications-list-lists',
  templateUrl: './list.component.html',
})
export class NotificationsListComponent implements OnInit {
  //data type any
  config: any;

  //data type boolean
  isloader: boolean;
  isEnable: boolean;
  isShow_notif_configuration_manual: boolean;
  isShow_notification_template: boolean;

  //data type string
  startfinish: string = 'start';
  activeTab: string = 'list';
  searchText: string = '';

  //data type array
  pagelength: any = [];
  applicationList: any = [];
  menuList: any = [];
  templateList: any = [];
  templatesList: any = [];
  dataList: any = [];
  displayedColumns: any = [];

  //data type object
  resultById: any;
  notif: any;
  applications: any;
  menus: any;
  templates: any;
  messages: any;

  dataSource: MatTableDataSource<any>;
  notification: Notification;
  notificationTemplate: NotificationTemplate;

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  /**
   * @param dialog: MatDialog
   */
  constructor(
    private httpClient: HttpClient,
    private _apicall: ApiService,
    private cdr: ChangeDetectorRef,
    public dialog: MatDialog,
    private layoutUtilsService: LayoutUtilsService,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.isloader = true;
    this.jsonService
      .retEnvironment(environment.type)
      .then((data) => {
        this.isShow_notif_configuration_manual = data.notif_configuration_manual;
        this.isShow_notification_template = data.global_notification_template;
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });
    await this.loadNotificationList();
    // this.loadApplicationsList();
    // this.loadNotificationTemplateList();
  }

  async ngAfterViewInit() {
    // await this.loadNotificationList();
    // this.loadApplicationsList();
    // this.loadNotificationTemplateList();
  }

  loadNotificationList() {
    let url = '/api/notification/get';
    this.displayedColumns = [];
    this._apicall.get(url).subscribe(
      (result) => {
        this.dataList = result.response;

        let menu_id = '00000000-0000-0000-0000-000000000000';
        let notification_template_id = '00000000-0000-0000-0000-000000000000';
        if (this.dataList.menu_id == menu_id) {
          this.dataList = Object.assign({}, this.dataList, {
            menu: {
              menu_id: '00000000-0000-0000-0000-000000000000',
              id: null,
              application: {
                id: '00000000-0000-0000-0000-000000000000',
                slug: null,
                title: null,
                total_dashboard: 0,
                created_at: null,
                updated_at: null,
                options: null,
                menu: null,
                __application_id: '',
              },
              dashboard_id: 0,
              parent_id: '00000000-0000-0000-0000-000000000000',
              title: null,
              options: {
                icon: null,
                enable_protect_module: false,
                enable_icon_default: true,
                enable_share_via_email: false,
              },
              created_at: null,
              updated_at: null,
            },
          });
        }

        if (this.dataList.notification_template_id == notification_template_id) {
          this.dataList = Object.assign({}, this.dataList, {
            notification_template: {
              id: '00000000-0000-0000-0000-000000000000',
              created_at: null,
              updated_at: null,
              template_name: null,
              notification_description: null,
              email_subject: null,
              email_body: null,
              notification_count: 0,
            },
          });
        }

        this.dataList = this.sortByDateDesc(this.dataList);
        // reformat data notification
        for (let i = 0; i < this.dataList.length; i++) {
          this.dataList[i] = {
            ...this.dataList[i],
            created_at: _moment(this.dataList[i].created_at).format('DD/MM/YYYY HH:MM'),
            // Used for search and sort functionality
            slice_name: this.dataList[i].chart ? this.dataList[i].chart.slice_name : '',
            application_title: this.dataList[i].menu ? this.dataList[i].menu.application.title : '',
            condition: this.dataList[i].condition,
            template_name: this.dataList[i].notification_template
              ? this.dataList[i].notification_template.template_name
              : '',
            enable: this.dataList[i].enable ? this.dataList[i].enable : false,
          };
        }

        // this.activeTab = 'list';
        if (!this.isShow_notification_template)
          this.displayedColumns = ['created_at', 'slice_name', 'application_title', 'alert', 'enable', 'actions'];
        else
          this.displayedColumns = [
            'created_at',
            'slice_name',
            'application_title',
            'alert',
            'template_name',
            'enable',
            'actions',
          ];
        this.loadTable();
        this.isloader = false;
      },
      (err) => {
        console.log(err);
        this.isloader = false;
      }
    );
  }

  loadTemplateList() {
    let url = '/api/notification/template/get';
    this._apicall.get(url).subscribe(
      (result) => {
        this.dataList = result.response;
        for (let i = 0; i < this.dataList.length; i++) {
          this.dataList[i] = {
            ...this.dataList[i],
            created_at: _moment(this.dataList[i].created_at).format('DD/MM/YYYY HH:MM'),
            // Used for search and sort functionality
          };
        }

        // this.activeTab = 'template';
        this.displayedColumns = [
          'created_at',
          'template_name',
          'notification_description',
          'notification_count',
          'actions',
        ];
        this.loadTable();
        this.isloader = false;
      },
      (err) => {
        this.isloader = false;
        console.log(err);
      }
    );
  }

  loadManualConfigurations() {
    let url = '/api/settings/get';
    this._apicall.get(url).subscribe(
      (result) => {
        this.dataList = result.response;
        for (let i = 0; i < this.dataList.length; i++) {
          this.dataList[i] = {
            ...this.dataList[i],
            created_at: _moment(this.dataList[i].created_at).format('DD/MM/YYYY HH:MM'),
            // Used for search and sort functionality
            host: this.dataList[i].data.host,
            password: this.dataList[i].data.password,
            port: this.dataList[i].data.port,
            sender: this.dataList[i].data.sender,
            username: this.dataList[i].data.username,
          };
        }

        // this.activeTab = 'manual';
        this.displayedColumns = ['created_at', 'setting_type', 'username', 'host', 'port', 'sender', 'actions'];
        this.loadTable();
        this.isloader = false;
      },
      (err) => {
        console.log(err);
        this.isloader = false;
      }
    );
  }

  loadNotificationTemplateList() {
    let url = '/api/notification/template/get';
    this._apicall.get(url).subscribe(
      (result) => {
        this.templatesList = result.response;
        this.loadTable();
        this.isloader = false;
      },
      (err) => {
        console.log(err);
        this.isloader = false;
      }
    );
  }

  loadApplicationsList() {
    let url = '/api/applications';
    this._apicall.get(url).subscribe(
      (result) => {
        this.applicationList = result.response;
        this.cdr.detectChanges();
        this.isloader = false;
      },
      (err) => {
        console.log(err);
        this.isloader = false;
      }
    );
  }

  loadTable() {
    this.dataSource = undefined;
    this.dataSource = new MatTableDataSource();
    this.dataSource.data = this.dataList;
    this.pagelength = this.dataList.length;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.paginator.firstPage();
    this.cdr.detectChanges();
  }

  changeTab(active) {
    this.activeTab = active;
    this.isloader = true;
    if (active === 'list') {
      this.loadNotificationList();
    } else if (active === 'template') {
      this.loadTemplateList();
    } else {
      this.loadManualConfigurations();
    }
    this.cdr.detectChanges();
  }

  async getDataById(_data) {
    this.messages = await this.jsonService.retMessage();
    this.resultById = {};
    let url = '/api/notification/get?id=' + _data.id;
    let rest = await this.getApiReturnBool(url);
    if (rest.status) {
      this.resultById = rest.msg.response;
      // reformat data notification
      let menu_id = '00000000-0000-0000-0000-000000000000';
      let notification_template_id = '00000000-0000-0000-0000-000000000000';
      if (this.resultById.menu_id == menu_id) {
        this.resultById = Object.assign({}, this.resultById, {
          menu: {
            menu_id: '00000000-0000-0000-0000-000000000000',
            id: null,
            application: {
              id: '00000000-0000-0000-0000-000000000000',
              slug: null,
              title: null,
              total_dashboard: 0,
              created_at: null,
              updated_at: null,
              options: null,
              menu: null,
              __application_id: null,
            },
            dashboard_id: 0,
            parent_id: '00000000-0000-0000-0000-000000000000',
            title: null,
            options: {
              icon: null,
              enable_protect_module: false,
              enable_icon_default: true,
              enable_share_via_email: false,
            },
            created_at: null,
            updated_at: null,
          },
        });
      }
      if (this.resultById.notification_template_id == notification_template_id) {
        this.resultById = Object.assign({}, this.resultById, {
          notification_template: {
            id: '00000000-0000-0000-0000-000000000000',
            created_at: null,
            updated_at: null,
            template_name: null,
            notification_description: null,
            email_subject: null,
            email_body: null,
            notification_count: 0,
          },
        });
      }
      if (this.applicationList.length > 0)
        this.resultById = Object.assign({}, this.resultById, { applicationList: this.applicationList });
    } else {
      const errorMessage = this.messages.NOTIFICATIONS.MSG_UPS;
      this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
    }
  }

  openChartId(id) {
    var url = `#/pds/newdatavisualization?slice_id=${id}&notifications=true`;
    window.open(url, '_blank');
  }

  async loadRecipientNotification(_data: any) {
    this.messages = await this.jsonService.retMessage();
    await this.getDataById(_data);
    // console.log(this.resultById);
    if (this.resultById.chart_id == 0) {
      const errorMessage = this.messages.NOTIFICATIONS.MSG_CNIL;
      this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
      return;
    }
    const dialogRef = await this.dialog.open(NotificationsRecipientComponent, { data: this.resultById });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.loadNotificationList();
    });
  }

  async editNotification(_data: any) {
    this.messages = await this.jsonService.retMessage();
    await this.getDataById(_data);
    // console.log(this.resultById);
    if (this.resultById.chart_id == 0) {
      const errorMessage = this.messages.NOTIFICATIONS.MSG_CNIL;
      this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
      return;
    }
    const dialogRef = await this.dialog.open(NotificationsEditComponent, { data: this.resultById });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.loadNotificationList();
    });
  }

  async deleteNotification(_data: Notification) {
    this.messages = await this.jsonService.retMessage();
    const _title = this.messages.NOTIFICATIONS.MSG_DN;
    const _description = this.messages.NOTIFICATIONS.MSG_AYSD + ' ' + '?';
    const _waitDesciption = this.messages.NOTIFICATIONS.MSG_ND;
    const _deleteMessage = this.messages.NOTIFICATIONS.MSG_NSD;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      let url = '/api/notification/delete?id=' + _data.id;
      let rest = await this.deleteApiReturnBool(url);

      if (rest.status) {
        this._apicall.openModal('Success', _deleteMessage);
        this.loadNotificationList();
      } else {
        // console.log('error delete data', rest.msg);
        const errorMessage = this.messages.NOTIFICATIONS.MSG_UPSD;
        this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
      }
    });
  }

  //CRUD Template Notification
  addNotificationTemplate() {
    const _new = new NotificationTemplate();
    _new.clear();
    this.editNotificationTemplate(_new);
  }

  editNotificationTemplate(_data: NotificationTemplate) {
    const dialogRef = this.dialog.open(NotificationsTemplatesComponent, { data: _data });
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      this.loadTemplateList();
    });
  }

  async deleteNotificationTemplate(_data: NotificationTemplate) {
    this.messages = await this.jsonService.retMessage();
    if (_data.notification_count > 0) return;
    const _title = this.messages.NOTIFICATIONS.MSG_DNT;
    const _description = this.messages.NOTIFICATIONS.MSG_AYSD;
    const _waitDesciption = this.messages.NOTIFICATIONS.MSG_NDT;
    const _deleteMessage = this.messages.NOTIFICATIONS.MSG_NTSD;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      let url = '/api/notification/template/delete?id=' + _data.id;
      let rest = await this.deleteApiReturnBool(url);

      if (rest.status) {
        this._apicall.openModal('Success', _deleteMessage);
        this.loadTemplateList();
      } else {
        // console.log('error', rest.msg);
        const errorMessage = this.messages.NOTIFICATIONS.MSG_UPS;
        this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
      }
    });
  }

  //CRUD Manual Configurations
  addManualConfigurations() {
    const _new = new ManualConfigurations();
    _new.clear();
    this.editManualConfigurations(_new);
  }

  editManualConfigurations(_data: ManualConfigurations) {
    const dialogRef = this.dialog.open(ManualComponent, { data: _data });
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      this.loadManualConfigurations();
    });
  }

  async deleteManualConfigurations(_data: ManualConfigurations) {
    this.messages = await this.jsonService.retMessage();
    const _title = this.messages.NOTIFICATIONS.MSG_NTSD;
    const _description = this.messages.NOTIFICATIONS.MSG_AYSD;
    const _waitDesciption = this.messages.NOTIFICATIONS.MSG_MCD;
    const _deleteMessage = this.messages.NOTIFICATIONS.MSG_MCSD;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      let url = '/api/settings/delete?id=' + _data.id;
      let rest = await this.deleteApiReturnBool(url);

      if (rest.status) {
        this._apicall.openModal('Success', _deleteMessage);
        this.loadManualConfigurations();
      } else {
        // console.log('error', rest.msg);
        const errorMessage = this.messages.NOTIFICATIONS.MSG_UPS;
        this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
      }
    });
  }

  //API Function
  async getApiReturnBool(url) {
    return await this._apicall
      .get(url)
      .toPromise()
      .then((result) => {
        return {
          status: true,
          msg: result,
        };
      })
      .catch((err) => {
        return {
          status: false,
          msg: err,
        };
      });
  }

  async deleteApiReturnBool(url) {
    return await this.httpClient
      .delete(url)
      .toPromise()
      .then((result) => {
        return {
          status: true,
          msg: result,
        };
      })
      .catch((err) => {
        return {
          status: false,
          msg: err,
        };
      });
  }

  async putApiReturnBool(url, param) {
    return await this.httpClient
      .put(url, param)
      .toPromise()
      .then((result) => {
        return {
          status: true,
          msg: result,
        };
      })
      .catch((err) => {
        return {
          status: false,
          msg: err,
        };
      });
  }

  //Sorting
  sortByDateDesc(dataList) {
    dataList.sort((a, b) => (a['created_at'] < b['created_at'] ? 1 : b['created_at'] < a['created_at'] ? -1 : 0));
    return dataList;
  }

  sortData(e) {
    this.dataSource.data = orderBy(this.dataSource.data, [e.active], [e.direction]);
  }

  searchData(searchField) {
    this.dataSource.data = search_regex_three(this.dataList, this.searchText, searchField);
  }
}
