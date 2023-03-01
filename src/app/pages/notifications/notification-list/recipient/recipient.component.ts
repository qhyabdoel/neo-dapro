// import { LayoutUtilsService, MessageType } from './../../../../../core/_base/crud/utils/layout-utils.service';
// import { FormGroup, Validators, FormBuilder } from '@angular/forms';
// import { Notification, NotificationTemplate } from './../../../../../core/_base/layout/models/index';
// import { HttpClient } from '@angular/common/http';
// import { ApiService } from './../../../../../core/_base/crud/utils/api.service';
// import { Subscription } from 'rxjs';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
// import { TranslationService, JsonService } from "../../../../../core/_base/layout";

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { NotificationTemplate, Notification } from 'src/app/libs/models';
import { ApiService, LayoutUtilsService, TranslationService, JsonService, MessageType } from 'src/app/libs/services';

@Component({
  selector: 'pq-notifications-lists-recipient',
  templateUrl: './recipient.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class NotificationsRecipientComponent implements OnInit, OnDestroy {
  //data type boolean
  hasFormErrors: boolean = false;
  viewLoading: boolean = false;

  //data type array
  applicationList: any = [];
  menuList: any = [];
  notificationTemplateList: any = [];
  emailList: any = [];
  messages: any;

  //data type object
  notification: Notification;
  notificationTemplate: NotificationTemplate;
  notificationForm: FormGroup;

  // Private properties
  private componentSubscriptions: Subscription;

  constructor(
    public dialogRef: MatDialogRef<NotificationsRecipientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _apicall: ApiService,
    private cdRef: ChangeDetectorRef,
    private layoutUtilsService: LayoutUtilsService,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.initNotifications();
  }

  ngOnDestroy(): void {
    if (this.componentSubscriptions) {
      this.componentSubscriptions.unsubscribe();
    }
  }
  addTagFn(val) {
    return val;
  }
  initNotifications() {
    this.notification = new Notification();
    this.notification.clear();
    this.notification = this.data;
    this.emailList = this.data.email_list != '' ? this.data.email_list.split(',') : this.emailList;
  }

  loadTemplateList() {
    let url = '/api/notification/template/get';
    this._apicall.get(url).subscribe(
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
  loadMenuList() {
    let url = '/api/notification/template/get';
    this._apicall.get(url).subscribe(
      (result) => {
        this.menuList = result.response;
        this.cdRef.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onAlertClose($event) {
    this.hasFormErrors = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    this.hasFormErrors = false;
    if (this.emailList && this.emailList.length == 0) this.hasFormErrors = true;
    else this.updateNotification();
  }

  async updateNotification() {
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
      application_id: this.data.application_id,
      menu_id: this.data.menu_id,
      notification_template_id: this.data.notification_template_id,
      email_list: this.emailList && this.emailList.length > 0 ? this.emailList.join() : '',
      enable: this.data.enable,
      // chart: this.data.chart,
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
}
