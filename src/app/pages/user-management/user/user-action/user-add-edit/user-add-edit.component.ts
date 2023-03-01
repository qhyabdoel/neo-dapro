import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { User, Group } from 'src/app/libs/models';
import { ApiService, TranslationService, JsonService } from 'src/app/libs/services';
import { API_GROUP_LIST_URL } from 'src/app/libs/services/common/apiUrl.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-add-edit',
  templateUrl: './user-add-edit.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class UserAddEditComponent implements OnInit, OnDestroy {
  //data type string
  errorMessage: string = '';
  environmentType: string = '';
  //data type boolean
  hasFormErrors: boolean = false;
  viewLoading: boolean = false;
  isEditForm: boolean = false;
  isPasswordNotMatch: boolean = false;
  isPasswordUsernameMatch: boolean = false;
  //data type array
  groupList: any[] = [];
  selectedGroup: any = [];
  //data type object
  user: User;
  group: Group;
  userForm: FormGroup;
  fieldPassword: boolean;
  fieldPasswordConfirmation: boolean;

  messages: any;
  // Private properties
  private componentSubscriptions: Subscription;

  constructor(
    public dialogRef: MatDialogRef<UserAddEditComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private _apicall: ApiService,
    private cdRef: ChangeDetectorRef,
    private userFB: FormBuilder,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.environmentType = environment.type;
    this.getTitle();
    this.loadGroupList();
    this.initUser();
  }

  ngOnDestroy(): void {
    if (this.componentSubscriptions) {
      this.componentSubscriptions.unsubscribe();
    }
  }

  togglePassword() {
    this.fieldPassword = !this.fieldPassword;
  }

  togglePasswordConfirmation() {
    this.fieldPasswordConfirmation = !this.fieldPasswordConfirmation;
  }

  initUser() {
    if (this.data.user.uuid) {
      this.isEditForm = true;
      this.user = new User();
      this.user.clear();
      this.user.username = this.data.user.username;
      this.user.email = this.data.user.email;
      this.user.firstname = this.data.user.firstname;
      this.user.lastname = this.data.user.lastname;
      this.user.selectedGroup = this.data.user.groups[0].uuid;
    } else {
      this.isEditForm = false;
      const newUser = new User();
      newUser.clear();
      this.user = newUser;
    }
    this.createForm();
  }

  async loadGroupList() {
    let rest = await this._apicall.getApi(API_GROUP_LIST_URL);
    this.groupList = rest.result.response;
    this.cdRef.detectChanges();
  }

  createForm() {
    this.userForm = this.userFB.group({
      username: [{ value: this.user.username, disabled: this.isEditForm === true ? true : false }, Validators.required],
      email: [
        { value: this.user.email, disabled: this.data.isChangePassword === true ? true : false },
        Validators.compose([Validators.required, Validators.email]),
      ],
      password: [
        this.user.password,
        (this.environmentType !== 'on_cloud' && !this.isEditForm) || this.data.isChangePassword
          ? Validators.required
          : '',
      ],
      passwordConfirmation: [
        this.user.password,
        (this.environmentType !== 'on_cloud' && !this.isEditForm) || this.data.isChangePassword
          ? Validators.required
          : '',
      ],
      firstname: [
        { value: this.user.firstname, disabled: this.data.isChangePassword ? true : false },
        Validators.required,
      ],
      lastname: [
        { value: this.user.lastname, disabled: this.data.isChangePassword ? true : false },
        Validators.required,
      ],
      selectedGroup: [
        { value: this.user.selectedGroup, disabled: this.data.isChangePassword ? true : false },
        Validators.required,
      ],
    });
  }

  checkPassword() {
    const controls = this.userForm.controls;
    let password = controls.password.value;
    let passwordConfirmation = controls.passwordConfirmation.value;
    let username = controls.username.value;
    if (username !== '' && password !== '' && username === password) return (this.isPasswordUsernameMatch = true);
    else if (password !== '' && passwordConfirmation !== '' && password !== passwordConfirmation)
      return (this.isPasswordNotMatch = true);
  }

  getTitle(): string {
    if (this.data.user && this.data.user.uuid && !this.data.isChangePassword)
      return this.messages.USER_MANAGEMENTS.MSG_EU + '\xa0' + this.data.user.firstname;
    else if (this.data.user && this.data.user.uuid && this.data.isChangePassword)
      return this.messages.USER_MANAGEMENTS.MSG_CPU + '\xa0' + this.data.user.firstname;
    else return this.messages.USER_MANAGEMENTS.MSG_CU;
  }

  onAlertClose($event) {
    this.hasFormErrors = false;
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  prepareUser(): User {
    const controls = this.userForm.controls;
    const _user = new User();
    _user.clear();
    _user.username = controls.username.value;
    _user.email = controls.email.value;
    _user.password = controls.password.value;
    _user.passwordConfirmation = controls.passwordConfirmation.value;
    _user.firstname = controls.firstname.value;
    _user.lastname = controls.lastname.value;
    _user.selectedGroup = controls.selectedGroup.value;

    return _user;
  }

  onSubmit() {
    this.hasFormErrors = false;
    this.isPasswordUsernameMatch = false;
    this.isPasswordNotMatch = false;
    this.errorMessage = '';
    const controls = this.userForm.controls;
    if (environment.type != 'on_cloud') this.checkPassword();

    if (this.userForm.invalid) {
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
      });
      return;
    } else {
      const user = this.prepareUser();
      if (environment.type != 'on_cloud' && (this.isPasswordNotMatch || this.isPasswordUsernameMatch)) {
        return;
      }

      if (this.data.user.uuid) {
        if (this.data.isChangePassword) {
          this.changePassword(user);
        } else {
          this.updateUser(user);
        }
      } else {
        this.createUser(user);
      }
    }
  }

  async createUser(_user: User) {
    this.viewLoading = true;
    const _addMessage = this.messages.USER_MANAGEMENTS.MSG_NUSA;
    let url = '/api/user/add';
    let param = {
      email: _user.email,
      firstname: _user.firstname,
      groups: [_user.selectedGroup],
      lastname: _user.lastname,
      username: _user.username,
    };

    if (environment.type != 'on_cloud') {
      param['password'] = _user.password;
      param['password_confirmation'] = _user.passwordConfirmation;
    }

    let rest = await this._apicall.postApi(url, param);
    if (rest.status) {
      this.viewLoading = false;
      this._apicall.openModal('Success', _addMessage);
      this.dialogRef.close(true);
    } else {
      this.viewLoading = false;
      this.hasFormErrors = true;

      /**
       * This is a temporary fix. Backend needs to be adjusted for consistent response
       */
      let error = typeof rest.msg.error !== 'undefined' ? rest.msg.error : rest.result.error || rest.result;
      if (error.response === null) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = this.messages.USER_MANAGEMENTS.MSG_UPS;
      }
    }
  }

  async updateUser(_user: User) {
    this.viewLoading = true;
    const _updateMessage = _user.firstname + this.messages.USER_MANAGEMENTS.MSG_SU;
    let url = '/api/user/' + this.data.user.uuid;
    let param = {
      email: _user.email,
      firstname: _user.firstname,
      groups: [_user.selectedGroup],
      lastname: _user.lastname,
    };

    let rest = await this._apicall.putApi(url, param);
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
        this.errorMessage = this.messages.USER_MANAGEMENTS.MSG_UPSU + _user.firstname + ' ' + _user.lastname;
      }
    }
  }

  async changePassword(_user: User) {
    this.viewLoading = true;
    const _updateMessage = _user.firstname + ' ' + _user.lastname + this.messages.USER_MANAGEMENTS.MSG_PSU;
    this.errorMessage = this.messages.USER_MANAGEMENTS.MSG_UPSU + _user.firstname + ' ' + _user.lastname + ' password.';
    let url = '/api/password/reset';
    let param = {
      email: _user.email,
      password: _user.password,
      password_confirmation: _user.passwordConfirmation,
    };

    let rest = await this._apicall.postApi(url, param);
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
        this.errorMessage = this.messages.USER_MANAGEMENTS.MSG_UPSA + ' user';
      }
    }
  }
}
