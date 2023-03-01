// import { LayoutUtilsService, MessageType } from '../../../../../core/_base/crud/utils/layout-utils.service';
// import { FormGroup, Validators, FormBuilder, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
// import { ManualConfigurations } from '../../../../../core/_base/layout/models/index';
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
import { Subscription } from 'rxjs';
import { ManualConfigurations } from 'src/app/libs/models';
import { ApiService, LayoutUtilsService, TranslationService, JsonService, MessageType } from 'src/app/libs/services';

@Component({
  selector: 'pq-manual-form',
  templateUrl: './form-manual.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ManualComponent implements OnInit, OnDestroy {
  //data type boolean
  hasFormErrors: boolean = false;
  viewLoading: boolean = false;
  isEditForm: boolean = false;

  // data type string

  //data type array
  dataList: any = [];

  //data type object
  manualConfigurations: ManualConfigurations;
  ntFG: FormGroup;
  ckeConfig: any;
  settingType: any;
  messages: any;
  // Private properties
  private componentSubscriptions: Subscription;

  constructor(
    public dialogRef: MatDialogRef<ManualComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _apicall: ApiService,
    private _fb: FormBuilder,
    private layoutUtilsService: LayoutUtilsService,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.init();
  }

  ngOnDestroy(): void {
    if (this.componentSubscriptions) {
      this.componentSubscriptions.unsubscribe();
    }
  }

  init() {
    // console.log(this.data)
    this.settingType = ['smtp', 'postfix', 'pop3'].map((s) => [s, String(s).toUpperCase()]);
    if (this.data.id) {
      this.isEditForm = true;
      this.manualConfigurations = new ManualConfigurations();
      this.manualConfigurations.clear();
      this.manualConfigurations.id = this.data.id;
      this.manualConfigurations.setting_type = this.data.setting_type || 'smtp';
      this.manualConfigurations.data.username = this.data.data.username;
      this.manualConfigurations.data.password = this.data.data.password;
      this.manualConfigurations.data.host = this.data.data.host;
      this.manualConfigurations.data.port = this.data.data.port;
      this.manualConfigurations.data.sender = this.data.data.sender;
    } else {
      this.isEditForm = false;
      const _n = new ManualConfigurations();
      _n.clear();
      this.manualConfigurations = _n;
    }
    this.createForm();
  }

  // get f() { return this.ntFG.controls; }
  createForm() {
    this.ntFG = this._fb.group({
      // setting_type: [this.manualConfigurations.setting_type,Validators.required],
      username: [this.manualConfigurations.data.username, Validators.required],
      password: [this.manualConfigurations.data.password, Validators.required],
      host: [this.manualConfigurations.data.host, Validators.required],
      port: [this.manualConfigurations.data.port, Validators.required],
      sender: [this.manualConfigurations.data.sender, Validators.required],
    });
  }

  getTitle(): string {
    if (this.data && this.data.id) {
      // tslint:disable-next-line:no-string-throw
      return this.messages.NOTIFICATIONS.ED + ' ' + this.data.setting_type;
    }

    // tslint:disable-next-line:no-string-throw
    return 'Create Data';
  }

  onAlertClose($event) {
    this.hasFormErrors = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  prepareManual(): ManualConfigurations {
    const controls = this.ntFG.controls;
    const _n = new ManualConfigurations();
    _n.clear();
    // _n.id = controls.id.value;
    // _n.setting_type = controls.setting_type.value;
    _n.data.username = controls.username.value;
    _n.data.password = controls.password.value;
    _n.data.host = controls.host.value;
    _n.data.port = controls.port.value;
    _n.data.sender = controls.sender.value;

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
      const _n = this.prepareManual();

      if (this.data.id) {
        this.updateManual(_n);
      } else {
        this.createManual(_n);
      }
    }
  }

  async createManual(_data: ManualConfigurations) {
    this.messages = await this.jsonService.retMessage();
    this.viewLoading = true;
    const _addMessage = this.messages.NOTIFICATIONS.MSG_NMSA;
    const _errorMessage = this.messages.NOTIFICATIONS.MSG_UPSA;
    let url = '/api/settings/create';
    let param = {
      // id: _data.id,
      setting_type: 'smtp', //_data.setting_type,
      data: {
        username: _data.data.username,
        password: _data.data.password,
        port: _data.data.port,
        host: _data.data.host,
        sender: _data.data.sender,
      },
    };

    let rest = await this._apicall.postApi(url, param);

    if (rest.status) {
      this.viewLoading = false;
      this._apicall.openModal('Success', _addMessage);
      this.dialogRef.close(true);
    } else {
      this.viewLoading = false;
      this.layoutUtilsService.showActionNotification(_errorMessage, MessageType.Read, 5000, true, true);
      this.dialogRef.close(true);
    }
  }

  async updateManual(_data: ManualConfigurations) {
    this.messages = await this.jsonService.retMessage();
    this.viewLoading = true;
    const _updateMessage = this.messages.NOTIFICATIONS.MSG_DSU;
    const _errorMessage = this.messages.NOTIFICATIONS.MSG_UPSU;
    let url = '/api/settings/update?id=' + this.data.id;
    let param = {
      // id: _data.id,
      setting_type: 'smtp', //_data.setting_type,
      data: {
        username: _data.data.username,
        password: _data.data.password,
        port: _data.data.port,
        host: _data.data.host,
        sender: _data.data.sender,
      },
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
}
