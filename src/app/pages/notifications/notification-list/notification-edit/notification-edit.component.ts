// import { LayoutUtilsService, MessageType } from './../../../../../core/_base/crud/utils/layout-utils.service';
// import { FormGroup, Validators, FormBuilder } from '@angular/forms';
// import { Notification, NotificationTemplate } from './../../../../../core/_base/layout/models/index';
// import { HttpClient } from '@angular/common/http';
// import { ApiService } from './../../../../../core/_base/crud/utils/api.service';
// import { Subscription } from 'rxjs';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
// import { environment } from '../../../../../../environments/environment';
// import { TranslationService, JsonService } from "../../../../../core/_base/layout";

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { NotificationTemplate, Notification } from 'src/app/libs/models';
import { ApiService, LayoutUtilsService, TranslationService, JsonService, MessageType } from 'src/app/libs/services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'pq-notifications-edit',
  templateUrl: './notification-edit.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class NotificationsEditComponent implements OnInit, OnDestroy {
  //data type boolean
  hasFormErrors: boolean = false;
  getErrorMenu: boolean = false;
  viewLoading: boolean = false;
  isEditForm: boolean = false;
  isShow_notification_template: boolean = true;

  // data type string
  messageErrMenu: string = '';
  flagChooseMenu: string = '';

  //data type array
  applicationList: any = [];
  notificationTemplateList: any = [];
  menuList: any = [];
  messages: any;

  //data type object
  selectedMenuList: any = {};
  notification: Notification;
  notificationTemplate: NotificationTemplate;
  notificationForm: FormGroup;

  // Private properties
  private componentSubscriptions: Subscription;

  constructor(
    public dialogRef: MatDialogRef<NotificationsEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _apicall: ApiService,
    private cdRef: ChangeDetectorRef,
    private dataFB: FormBuilder,
    private layoutUtilsService: LayoutUtilsService,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    // this.loadApplicationsList();
    await this.initNotification();
    this.loadTemplateList();
    this.jsonService
      .retEnvironment(environment.type)
      .then((data) => {
        this.isShow_notification_template = data.global_notification_template;
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });
  }

  ngOnDestroy(): void {
    if (this.componentSubscriptions) {
      this.componentSubscriptions.unsubscribe();
    }
  }

  openChartId() {
    var url = `#/pds/newdatavisualization?slice_id=${this.data.chart_id}&notifications=true`;
    window.open(url, '_blank');
  }
  async initNotification() {
    // get ListMenus
    await this.getMenuList(this.data.id);
    // if (this.data.id) {
    this.isEditForm = true;
    this.notification = new Notification();
    this.notification.clear();
    this.notification.chart_id = this.data.chart_id;
    this.notification.menu_id = this.selectedMenuList.menu_id || '00000000-0000-0000-0000-000000000000';
    this.notification.notification_template_id =
      this.data.notification_template_id || '00000000-0000-0000-0000-000000000000';
    this.notification.email_list = this.data.email_list;
    this.notification.enable = this.data.enable;
    this.notification.chart = this.data.chart;
    this.notification.menu = this.selectedMenuList;
    this.notification.criterias = this.data.criterias;
    this.notification.condition = this.data.condition;
    this.applicationList = this.data.applicationList;
    // if(this.data.menu_id!="00000000-0000-0000-0000-000000000000" && this.data.menu!=undefined && this.data.menu.application.__application_id && this.data.menu.application.__application_id!="") this.loadMenuList(this.data.menu.application.__application_id, "init");
    // } else {
    // 	this.isEditForm = false;
    // 	const _n = new Notification();
    // 	_n.clear();
    // 	this.notification = _n;
    // }
    this.createForm();
  }

  async loadTemplateList() {
    let url = '/api/notification/template/get';
    await this._apicall.get(url).subscribe(
      (result) => {
        this.notificationTemplateList = result.response;
        this.cdRef.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }
  loadApplicationsList() {
    let url = '/api/applications';
    this._apicall.get(url).subscribe(
      (result) => {
        this.applicationList = result.response;
        this.cdRef.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }
  loadMenuList(slug, opt?) {
    if (opt == undefined) slug = slug.value;
    let menuList =
      this.applicationList.filter((v) => {
        if (v.__application_id == slug) {
          this.notification.application_id = v.__application_id;
          return v;
        }
      })[0] || [];
    this.selectedMenuList = menuList.menu;
    // console.log(this.menuList, slug, this.notification.application_id)
  }

  get f() {
    return this.notificationForm.controls;
  }
  createForm() {
    this.notificationForm = this.dataFB.group({
      // application_id:[this.notification.application_id, Validators.required],
      menu_id: [this.notification.menu_id, Validators.required],
      notification_template_id: [this.notification.notification_template_id, Validators.required],
      // email_list:[this.notification.email_list,!this.isEditForm, Validators.required],
      enable: [this.notification.enable],
    });
  }

  getTitle(): string {
    if (this.data.chart && this.data.id) {
      return this.messages.NOTIFICATIONS.MSG_EN + ' ' + this.data.chart.slice_name;
    }
    return this.messages.NOTIFICATIONS.CN;
  }

  onAlertClose($event) {
    this.hasFormErrors = false;
    this.getErrorMenu = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  prepareNotification(): Notification {
    const controls = this.notificationForm.controls;
    const _n = new Notification();
    _n.clear();
    // _n.chart_id = controls.chart_id.value;
    // _n.col = controls.col.value;
    // _n.op = controls.op.value;
    // _n.val = controls.val.value;
    // _n.application_id = controls.application_id.value;
    _n.menu_id = controls.menu_id.value;
    _n.notification_template_id = controls.notification_template_id.value;
    // _n.email_list = controls.email_list.value;
    _n.enable = controls.enable.value;
    // _n.chart = controls.chart.value;

    return _n;
  }

  onSubmit() {
    this.hasFormErrors = false;
    const controls = this.notificationForm.controls;

    if (this.notificationForm.invalid) {
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
      });

      this.hasFormErrors = true;
      return;
    } else {
      const _n = this.prepareNotification();

      if (this.data.id) {
        this.updateNotification(_n);
      } else {
        this.createNotification(_n);
      }
    }
  }

  async createNotification(_data: any) {
    this.messages = await this.jsonService.retMessage();
    this.viewLoading = true;
    const _addMessage = this.messages.NOTIFICATIONS.MSG_NSA;
    const _errorMessage = this.messages.NOTIFICATIONS.MSG_UPSA;
    let url = '/api/notification/create';
    let param = {
      chart_id: this.data.chart_id,
      col: this.data.col,
      op: this.data.op,
      val: this.data.val,
      // application_id: _data.application_id,
      menu_id: this.notification.menu_id, //_data.menu_id,
      notification_template_id: _data.notification_template_id,
      email_list: this.data.email_list,
      enable: _data.enable,
    };

    let rest = await this._apicall.postApi(url, param);

    if (rest.status) {
      this.viewLoading = false;
      this._apicall.openModal('Success', _addMessage);
      this.dialogRef.close(true);
    } else {
      // console.log('error add notification', rest.msg);
      this.viewLoading = false;
      this.layoutUtilsService.showActionNotification(_errorMessage, MessageType.Read, 5000, true, true);
      this.dialogRef.close(true);
    }
  }

  async updateNotification(_data: any) {
    this.messages = await this.jsonService.retMessage();
    this.viewLoading = true;
    const _updateMessage = this.messages.NOTIFICATIONS.MSG_DSU;
    const _errorMessage = this.messages.NOTIFICATIONS.MSG_UPSU;
    let url = '/api/notification/update?id=' + this.data.id;
    let param = {
      chart_id: this.data.chart_id,
      col: this.data.col,
      op: this.data.op,
      val: this.data.val,
      // application_id: _data.application_id,
      menu_id: _data.menu_id, // this.notification.menu_id,
      notification_template_id: _data.notification_template_id,
      email_list: this.data.email_list,
      enable: _data.enable,
    };
    let rest = await this._apicall.postApi(url, param);

    if (rest.status) {
      this.viewLoading = false;
      this._apicall.openModal('Success', _updateMessage);
      this.dialogRef.close(true);
    } else {
      // console.log('error update notification', rest.msg);
      this.layoutUtilsService.showActionNotification(_errorMessage, MessageType.Read, 5000, true, true);
      this.dialogRef.close(true);
    }
  }

  async getMenuList(id) {
    this.messages = await this.jsonService.retMessage();
    let url = 'api/notification/menu/get?id=' + id;
    this.getErrorMenu = false;
    let rest = await this._apicall.getApi(url);
    if (rest.status) {
      this.menuList = rest.result.response != null ? rest.result.response : [];
      this.selectedMenuList = rest.result.response;
      let f = false;
      switch (this.selectedMenuList) {
        case null:
          this.selectedMenuList = {};
          f = true;
          break;
        default:
          if (this.selectedMenuList.length == 0) {
            this.selectedMenuList = {};
            f = true;
          } else if (this.selectedMenuList.length == 1) this.selectedMenuList = this.selectedMenuList[0];
          else this.selectedMenuList = {};
          break;
      }
      if (f) {
        this.getErrorMenu = true;
        this.messageErrMenu = this.messages.NOTIFICATIONS.MSG_ERR;
      }
    } else {
      // console.log('error get data', rest.msg);
      const errorMessage = this.messages.NOTIFICATIONS.MSG_UPS;
      this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
    }
  }
}
