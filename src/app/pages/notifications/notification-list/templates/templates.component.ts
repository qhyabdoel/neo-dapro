// import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud/utils/layout-utils.service';
// import { FormGroup, Validators, FormBuilder, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
// import { Notification, NotificationTemplate } from '../../../../../core/_base/layout/models/index';
// import { HttpClient } from '@angular/common/http';
// import { ApiService } from '../../../../../core/_base/crud/utils/api.service';
// import { Subscription } from 'rxjs';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
// import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
// import { TranslationService, JsonService } from "../../../../../core/_base/layout";

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularEditorConfig } from '@kolkov/angular-editor';
// import { CKEditorComponent } from 'ng2-ckeditor';
import { Subscription } from 'rxjs';
import { NotificationTemplate } from 'src/app/libs/models';
import { ApiService, LayoutUtilsService, TranslationService, JsonService, MessageType } from 'src/app/libs/services';
@Component({
  selector: 'pq-notifications-lists-templates',
  templateUrl: './templates.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class NotificationsTemplatesComponent implements OnInit, OnDestroy {
  //data type boolean
  hasFormErrors: boolean = false;
  viewLoading: boolean = false;
  isEditForm: boolean = false;

  // data type string
  mycontent: string = '';

  //data type array
  dataList: any = [];

  //data type object
  notificationTemplate: NotificationTemplate;
  ntFG: FormGroup;
  // config: AngularEditorConfig = {
  //   editable: true,
  //   spellcheck: true,
  //   minHeight: '5rem',
  //   placeholder: 'Enter text here...',
  //   translate: 'no',
  //   defaultParagraphSeparator: 'p',
  //   defaultFontName: 'Arial',
  //   toolbarHiddenButtons: [
  //     [
  //       'undo',
  //       'redo',
  //       'strikeThrough',
  //       'subscript',
  //       'superscript',
  //       'customClasses',
  //       'insertImage',
  //       'insertVideo',
  //       'textColor',
  //       'backgroundColor',
  //       'toggleEditorMode',
  //     ],
  //   ],
  // };
  htmlContent = '';
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    sanitize: false,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [['bold']],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
  };
  messages: any;
  // Private properties
  private componentSubscriptions: Subscription;

  constructor(
    public dialogRef: MatDialogRef<NotificationsTemplatesComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private _apicall: ApiService,
    private cdRef: ChangeDetectorRef,
    private _fb: FormBuilder,
    private layoutUtilsService: LayoutUtilsService,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();

    this.initNotification();
  }

  ngOnDestroy(): void {
    if (this.componentSubscriptions) {
      this.componentSubscriptions.unsubscribe();
    }
  }

  openChartId() {
    var url = `#/pds/newdatavisualization?slice_id=${this.data.chart_id}`;
    window.open(url, '_blank');
  }
  initNotification() {
    if (this.data.id) {
      this.isEditForm = true;
      this.notificationTemplate = new NotificationTemplate();
      this.notificationTemplate.clear();
      this.notificationTemplate.id = this.data.id;
      this.notificationTemplate.email_body = this.data.email_body;
      this.notificationTemplate.email_subject = this.data.email_subject;
      this.notificationTemplate.notification_description = this.data.notification_description;
      // this.notificationTemplate.notification_count = this.data.notification_count;
      this.notificationTemplate.template_name = this.data.template_name;
      // ngModel
      this.mycontent = this.data.email_body;
    } else {
      this.isEditForm = false;
      const _n = new NotificationTemplate();
      _n.clear();
      this.notificationTemplate = _n;
    }
    this.createForm();
  }

  loadTemplateList() {
    let url = '/api/notification/template/get';
    this._apicall.get(url).subscribe(
      (result) => {
        this.notificationTemplate = result.response;
        this.cdRef.detectChanges();
      },
      (err) => {
        console.log(err);
      }
    );
  }
  get f() {
    return this.ntFG.controls;
  }
  createForm() {
    this.ntFG = this._fb.group({
      // id: [{value: '', disabled: !this.isEditForm}, Validators.required],
      // email_body: ['',Validators.required],
      email_subject: [this.notificationTemplate.email_subject, Validators.required],
      notification_description: [this.notificationTemplate.notification_description, Validators.required],
      // notification_count:['', Validators.required],
      template_name: [this.notificationTemplate.template_name, Validators.required],
    });
  }

  getTitle(): string {
    if (this.data && this.data.id) {
      // tslint:disable-next-line:no-string-throw
      return this.messages.NOTIFICATIONS.MSG_ENT + ' ' + this.data.template_name;
    }

    // tslint:disable-next-line:no-string-throw
    return this.messages.NOTIFICATIONS.MSG_ANT;
  }

  onAlertClose($event) {
    this.hasFormErrors = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  prepareNotification(): NotificationTemplate {
    const controls = this.ntFG.controls;
    const _n = new NotificationTemplate();
    _n.clear();
    // _n.id = controls.id.value;
    _n.email_body = this.mycontent; //controls.email_body.value;
    _n.email_subject = controls.email_subject.value;
    _n.notification_description = controls.notification_description.value;
    // _n.notification_count = controls.notification_count.value;
    _n.template_name = controls.template_name.value;

    return _n;
  }

  onSubmit() {
    this.hasFormErrors = false;
    const controls = this.ntFG.controls;

    if (this.ntFG.invalid) {
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

  async createNotification(_data: NotificationTemplate) {
    this.messages = await this.jsonService.retMessage();
    this.viewLoading = true;
    const _addMessage = this.messages.NOTIFICATIONS.MSG_NSA;
    const _errorMessage = this.messages.NOTIFICATIONS.MSG_UPSA;
    let url = '/api/notification/template/create';
    let param = {
      // id: _data.id,
      email_body: _data.email_body,
      email_subject: _data.email_subject,
      notification_description: _data.notification_description,
      // notification_count: _data.notification_count,
      template_name: _data.template_name,
    };

    let rest = await this._apicall.postApi(url, param);

    if (rest.status) {
      this.viewLoading = false;

      this._apicall.openModal('Success', _addMessage);
      this.dialogRef.close(true);
    } else {
      // console.log('error add notification template', rest.msg);
      this.viewLoading = false;
      this.layoutUtilsService.showActionNotification(_errorMessage, MessageType.Read, 5000, true, true);
      this.dialogRef.close(true);
    }
  }

  async updateNotification(_data: NotificationTemplate) {
    this.messages = await this.jsonService.retMessage();
    this.viewLoading = true;
    const _updateMessage = this.messages.NOTIFICATIONS.MSG_DSU;
    const _errorMessage = this.messages.NOTIFICATIONS.MSG_UPSU;
    let url = '/api/notification/template/update?id=' + this.data.id;
    let param = {
      // id: _data.id,
      email_body: _data.email_body,
      email_subject: _data.email_subject,
      notification_description: _data.notification_description,
      // notification_count: _data.notification_count,
      template_name: _data.template_name,
    };
    let rest = await this._apicall.postApi(url, param);

    if (rest.status) {
      this.viewLoading = false;

      this._apicall.openModal('Success', _updateMessage);
      this.dialogRef.close(true);
    } else {
      // console.log('error update notification template', rest.msg);
      this.layoutUtilsService.showActionNotification(_errorMessage, MessageType.Read, 5000, true, true);
      this.dialogRef.close(true);
    }
  }
  onChange(event) {
    this.mycontent = event;
  }
}
