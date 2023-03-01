// import { LayoutUtilsService, MessageType } from './../../../../../core/_base/crud/utils/layout-utils.service';
import { Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
// import { ApiService } from './../../../../../core/_base/crud/utils/api.service';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';
// import { Group } from './../../../../../core/auth/_models/group.model';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { Group } from 'src/app/libs/models/group.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService, LayoutUtilsService, TranslationService, JsonService, MessageType } from 'src/app/libs/services';
// import { TranslationService, JsonService } from "../../../../../core/_base/layout";

@Component({
  selector: 'app-group-add-edit',
  templateUrl: './group-add-edit.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class GroupAddEditComponent implements OnInit, OnDestroy {
  //data type string
  errorMessage: string = '';
  //data type boolean
  hasFormErrors: boolean = false;
  viewLoading: boolean = false;
  isRoleCheckedValidation: boolean = true;
  isEditForm: boolean = false;
  //data type object
  group: Group;
  groupForm: FormGroup;
  //data type array
  roleList: any = [];
  groupList: any = [];
  scopeList: any = [];
  selectedRoleForAdd: any = [];
  messages: any;
  // Private properties
  private componentSubscriptions: Subscription;

  constructor(
    public dialogRef: MatDialogRef<GroupAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _apicall: ApiService,
    private httpClient: HttpClient,
    private groupFB: FormBuilder,
    private layoutUtilsService: LayoutUtilsService,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.selectedRoleForAdd = [];
    this.loadGroupList();
    this.loadRoleList();
    this.initGroup();
  }

  ngOnDestroy(): void {
    if (this.componentSubscriptions) {
      this.componentSubscriptions.unsubscribe();
    }
  }

  initGroup() {
    if (this.data.group.uuid !== '') {
      this.isEditForm = true;
      this.group = new Group();
      this.group.groupdesc = this.data.group.groupdesc;
      this.group.groupname = this.data.group.groupname;
      this.group.roles = this.data.group.roles;

      for (var i = 0; i < this.data.group.roles.length; i++) {
        this.selectedRoleForAdd.push(this.data.group.roles[i].uuid);
      }
    } else {
      this.isEditForm = false;
      const newGroup = new Group();
      newGroup.clear();
      this.group = newGroup;
    }

    this.createForm();
  }

  createForm() {
    this.groupForm = this.groupFB.group({
      groupname: [
        { value: this.group.groupname, disabled: this.isEditForm === true ? true : false },
        Validators.required,
      ],
      groupdesc: [this.group.groupdesc, ''],
    });
  }

  loadRoleList() {
    let url = '/api/roles';
    this._apicall.get(url).subscribe((result) => {
      this.roleList = result['response'];

      if (this.data.group.roles.length > 0) {
        for (var i = 0; i < this.roleList.length; i++) {
          let selectedRole = this.data.group.roles.filter((x) => x.uuid === this.roleList[i].uuid);
          if (selectedRole.length > 0) {
            this.roleList[i] = {
              ...this.roleList[i],
              isChecked: true,
            };
          } else {
            this.roleList[i] = {
              ...this.roleList[i],
              isChecked: false,
            };
          }
        }
      } else {
        for (var i = 0; i < this.roleList.length; i++) {
          this.roleList[i] = {
            ...this.roleList[i],
            isChecked: false,
          };
        }
      }
    });
  }

  loadGroupList() {
    let url = '/api/groups';
    this._apicall.get(url).subscribe(
      (result) => {
        this.groupList = result.response;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getTitle(): string {
    if (this.data.group && this.data.group.uuid) {
      // tslint:disable-next-line:no-string-throw
      return `Edit Group '${this.data.group.groupname}'`;
    }

    // tslint:disable-next-line:no-string-throw
    return 'Create Group';
  }

  onAlertClose($event) {
    this.hasFormErrors = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getCheckedRole(uuid, isChecked) {
    if (isChecked === true) {
      this.selectedRoleForAdd.push(uuid);
    } else {
      var removeIndex = this.selectedRoleForAdd.indexOf(uuid);
      if (removeIndex > -1) {
        this.selectedRoleForAdd.splice(removeIndex, 1);
      }
    }
  }

  prepareGroup(): Group {
    const controls = this.groupForm.controls;
    const _group = new Group();
    _group.clear();
    _group.groupname = controls.groupname.value;
    _group.groupdesc = controls.groupdesc.value;

    return _group;
  }

  onSubmit() {
    this.hasFormErrors = false;
    this.errorMessage = '';
    this.isRoleCheckedValidation = true;
    const controls = this.groupForm.controls;

    if (this.groupForm.invalid) {
      Object.keys(controls).forEach((controlName) => controls[controlName].markAsTouched());

      if (this.selectedRoleForAdd.length === 0) {
        this.isRoleCheckedValidation = false;
      }
      this.hasFormErrors = true;
      return;
    } else {
      if (this.selectedRoleForAdd.length === 0) {
        this.isRoleCheckedValidation = false;
        return;
      }

      const group = this.prepareGroup();

      if (this.data.group.uuid) {
        this.updateGroup(group);
      } else {
        this.createGroup(group);
      }
    }
  }

  async createGroup(_group: Group) {
    this.viewLoading = true;
    const _addMessage = this.messages.USER_MANAGEMENTS.MSG_NGSA;
    let url = '/api/group/add';
    let param = {
      groupdesc: _group.groupdesc,
      groupname: _group.groupname,
      roles: this.selectedRoleForAdd,
    };

    let rest = await this.postApiReturnBool(url, param);

    if (rest.status) {
      this.viewLoading = false;
      this._apicall.openModal('Success', _addMessage);
      this.dialogRef.close(true);
    } else {
      this.viewLoading = false;
      this.hasFormErrors = true;
      if (rest.msg.error.response === null) {
        this.errorMessage = rest.msg.error.message;
      } else {
        this.errorMessage = this.messages.USER_MANAGEMENTS.MSG_UPSA;
      }
      this.layoutUtilsService.showActionNotification(this.errorMessage, MessageType.Read, 5000, true, true);
      this.dialogRef.close(true);
    }
  }

  async updateGroup(_group: Group) {
    this.viewLoading = true;
    const _updateMessage = _group.groupname + this.messages.USER_MANAGEMENTS.MSG_SU;
    let url = '/api/group/' + this.data.group.uuid;
    let param = {
      groupdesc: _group.groupdesc,
      groupname: _group.groupname,
      roles: this.selectedRoleForAdd.length > 0 ? this.selectedRoleForAdd : _group.roles,
    };

    let rest = await this.putApiReturnBool(url, param);

    if (rest.status) {
      this.viewLoading = false;
      this._apicall.openModal('Success', _updateMessage);
      this.dialogRef.close(true);
    } else {
      this.viewLoading = false;
      this.hasFormErrors = true;
      if (rest.msg.error.response === null) {
        this.errorMessage = rest.msg.error.message;
      } else {
        this.errorMessage = this.messages.USER_MANAGEMENTS.MSG_UPSU + _group.groupname;
      }
      this.layoutUtilsService.showActionNotification(this.errorMessage, MessageType.Read, 5000, true, true);
    }
  }

  async postApiReturnBool(url, param) {
    return await this._apicall
      .post(url, param)
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
}
