import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Role } from 'src/app/libs/models';
import { ApiService, LayoutUtilsService, TranslationService, JsonService, MessageType } from 'src/app/libs/services';

@Component({
  selector: 'kt-role-edit-dialog',
  templateUrl: './role-edit.dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Default,
})
export class RoleEditDialogComponent implements OnInit, OnDestroy {
  //data type any
  loading: boolean = true;
  //data type boolean
  hasFormErrors: boolean = false;
  viewLoading: boolean = false;
  loadingAfterSubmit: boolean = false;
  isEditForm: boolean = false;
  isScopeCheckedValidation: boolean = true;
  checkAllMenu: boolean = false;
  // data type object
  role: Role;
  roleForm: FormGroup;
  // data type scope
  scopeList: any = [];
  selectedScopeForAdd: any = [];
  applicationList: any = [];
  appMenuList: any = [];
  selectedAppMenuForAdd: any = [];
  //data type string
  applicationId: string;
  errorMessage: string = '';
  messages: any;
  // Private properties
  private componentSubscriptions: Subscription;

  constructor(
    public dialogRef: MatDialogRef<RoleEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private roleFB: FormBuilder,
    private _apicall: ApiService,
    // private httpClient: HttpClient,
    private layoutUtilsService: LayoutUtilsService,
    private translationService: TranslationService,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.loading = true;
    this.selectedScopeForAdd = [];
    await this.loadScopeList();
    this.initRole();
    await this.loadApplicationList(this.data.role.uuid);
  }

  ngOnDestroy() {
    if (this.componentSubscriptions) {
      this.componentSubscriptions.unsubscribe();
    }
  }

  initRole() {
    if (this.data.role.uuid) {
      this.isEditForm = true;
      this.role = new Role();
      this.role.clear();
      this.role.uuid = this.data.role.uuid;
      this.role.roledesc = this.data.role.roledesc;
      this.role.rolename = this.data.role.rolename;
      this.role.scopes = this.data.role.scopes[0];

      for (var i = 0; i < this.data.role.scopes.length; i++) {
        this.selectedScopeForAdd = this.data.role.scopes;
      }
    } else {
      this.isEditForm = false;
      const newrole = new Role();
      newrole.clear();
      this.role = newrole;
    }
    this.createForm();
  }

  createForm() {
    this.roleForm = this.roleFB.group({
      rolename: [{ value: this.role.rolename, disabled: this.isEditForm === true ? true : false }, Validators.required],
      roledesc: [this.role.roledesc, Validators.required],
    });
  }

  prepareRole(): Role {
    const controls = this.roleForm.controls;
    const _role = new Role();
    _role.clear();
    _role.rolename = controls.rolename.value;
    _role.roledesc = controls.roledesc.value;

    return _role;
  }

  getTitle(): string {
    if (this.role && this.role.uuid) {
      return `Edit role '${this.role.rolename}'`;
    }

    return 'Create role';
  }

  onAlertClose() {
    this.hasFormErrors = false;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    this.hasFormErrors = false;
    this.isScopeCheckedValidation = true;
    const controls = this.roleForm.controls;

    if (this.roleForm.invalid) {
      Object.keys(controls).forEach((controlName) => controls[controlName].markAsTouched());

      if (this.selectedScopeForAdd.length === 0) {
        this.isScopeCheckedValidation = false;
      }

      this.hasFormErrors = true;
      return;
    } else {
      if (this.selectedScopeForAdd.length === 0) {
        this.isScopeCheckedValidation = false;
        return;
      }

      const role = this.prepareRole();

      if (this.data.role.uuid) {
        this.updateRole(role);
      } else {
        this.createRole(role);
      }
    }
  }

  async createRole(_role: Role) {
    this.viewLoading = true;
    const _addMessage = this.messages.USER_MANAGEMENTS.MSG_NRSA;
    let url = '/api/role/add';
    let application = {};
    this.getCheckedApp();
    if (this.selectedAppMenuForAdd.length > 0) {
      application = {
        application_id: this.applicationId,
        menu: this.selectedAppMenuForAdd,
      };
    }
    let param = {
      rolename: _role.rolename,
      roledesc: _role.roledesc,
      scopes: this.selectedScopeForAdd,
      application: application,
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
    }
  }

  async updateRole(_role: Role) {
    this.viewLoading = true;
    const _updateMessage = _role.rolename + this.messages.USER_MANAGEMENTS.MSG_SU;
    let url = '/api/role/' + this.data.role.uuid;
    let application = {};
    this.getCheckedApp();
    if (this.selectedAppMenuForAdd.length > 0) {
      application = {
        application_id: this.applicationId,
        menu: this.selectedAppMenuForAdd,
      };
    }
    let param = {
      rolename: _role.rolename,
      roledesc: _role.roledesc,
      scopes: this.selectedScopeForAdd.length > 0 ? this.selectedScopeForAdd : _role.scopes,
      application: application,
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
        this.errorMessage = this.messages.USER_MANAGEMENTS.MSG_UPSU + _role.rolename;
      }
      this.layoutUtilsService.showActionNotification(this.errorMessage, MessageType.Read, 5000, true, true);
    }
  }

  loadScopeList() {
    let url = '/api/scopes';
    this._apicall.get(url).subscribe((result) => {
      this.scopeList = result.response;
      if (this.data.role.scopes.length > 0) {
        for (let i = 0; i < this.scopeList.length; i++) {
          let selectedScope = this.data.role.scopes.filter((x) => x.name == this.scopeList[i].name);
          if (selectedScope.length > 0) {
            this.scopeList[i] = {
              ...this.scopeList[i],
              isChecked: true,
            };
          } else {
            this.scopeList[i] = {
              ...this.scopeList[i],
              isChecked: false,
            };
          }
        }
      } else {
        for (let i = 0; i < this.scopeList.length; i++) {
          this.scopeList[i] = {
            ...this.scopeList[i],
            isChecked: false,
          };
        }
      }
    });
  }

  loadApplicationList(roleId: string = null) {
    let url = roleId ? 'api/roles/' + roleId + '/applications' : 'api/applications';
    this._apicall.get(url).subscribe((result) => {
      this.applicationList = result.response;
      this.selectAppMenu(this.data.role.application_id, roleId);
      this.loading = false;
    });
  }

  selectAppMenu(appId, roleId?) {
    this.applicationId = appId;
    this.appMenuList = [];
    this.selectedAppMenuForAdd = [];
    let selectedApp = this.applicationList.filter((x) => x.__application_id === this.applicationId)[0];
    if (selectedApp !== undefined) this.appMenuList = selectedApp.menu;
    if (this.appMenuList.length > 0 && roleId === undefined) {
      for (let i = 0; i < this.appMenuList.length; i++) {
        this.appMenuList[i] = {
          ...this.appMenuList[i],
          allowed: false,
        };
        if (this.appMenuList[i].children !== undefined && this.appMenuList[i].children.length > 0) {
          for (let j = 0; j < this.appMenuList[i].children.length; j++) {
            this.appMenuList[i].children[j] = {
              ...this.appMenuList[i].children[j],
              allowed: false,
            };
            if (
              this.appMenuList[i].children[j].children !== undefined &&
              this.appMenuList[i].children[j].children.length > 0
            ) {
              for (let k = 0; k < this.appMenuList[i].children[j].children[k].length; k++) {
                this.appMenuList[i].children[j].children[k] = {
                  ...this.appMenuList[i].children[j].children[k],
                  allowed: false,
                };
              }
            }
          }
        }
      }
    } else if (this.appMenuList.length > 0 && roleId !== undefined) {
      for (let i = 0; i < this.appMenuList.length; i++) {
        let menuObj = {};
        let childrenObj = {};
        let grandChildrenObj = {};
        let children_arr = [];
        let grandChildren_arr = [];
        if (this.appMenuList[i].allowed) {
          menuObj = {
            menu_id: this.appMenuList[i].menu_id,
            dashboard_id: this.appMenuList[i].dashboard_id,
          };
          if (this.appMenuList[i].children !== undefined && this.appMenuList[i].children.length > 0) {
            for (let j = 0; j < this.appMenuList[i].children.length; j++) {
              if (this.appMenuList[i].children[j].allowed) {
                childrenObj = {
                  menu_id: this.appMenuList[i].children[j].menu_id,
                  dashboard_id: this.appMenuList[i].children[j].dashboard_id,
                };
                if (
                  this.appMenuList[i].children[j].children !== undefined &&
                  this.appMenuList[i].children[j].children.length > 0
                ) {
                  for (let k = 0; k < this.appMenuList[i].children[j].children.length; k++) {
                    if (this.appMenuList[i].children[j].children[k].allowed) {
                      grandChildrenObj = {
                        menu_id: this.appMenuList[i].children[j].children[k].menu_id,
                        dashboard_id: this.appMenuList[i].children[j].children[k].dashboard_id,
                      };
                      grandChildren_arr.push(grandChildrenObj);
                      childrenObj = {
                        ...childrenObj,
                        children: grandChildren_arr,
                      };
                    }
                  }
                }
                children_arr.push(childrenObj);
              }
            }

            menuObj = {
              ...menuObj,
              children: children_arr,
            };
          }
          this.selectedAppMenuForAdd.push(menuObj);
        }
      }
    }
  }

  getCheckedScope(uuid, isChecked) {
    this.selectedScopeForAdd = [
      {
        name: isChecked,
        action: [],
      },
    ];

    const scopes = Array.from(document.getElementsByClassName('checked'));
    scopes.forEach(scope => {
      scope.classList.remove('checked');
    });
  }

  onCheckedApplication(allowed, menuType, parentMenuId, childrenMenuId?, grandChildrenMenuId?) {
    let selectedParentMenu = this.appMenuList.filter((x) => x.menu_id === parentMenuId)[0];
    let selectedChildrenMenu = childrenMenuId
      ? selectedParentMenu.children.filter((x) => x.menu_id === childrenMenuId)[0]
      : null;
    let selectedGrandChildrenMenu = grandChildrenMenuId
      ? selectedChildrenMenu.children.filter((x) => x.menu_id === grandChildrenMenuId)[0]
      : null;
    if (menuType === 'parent') {
      if (selectedParentMenu !== undefined) {
        selectedParentMenu.allowed = allowed;
        if (selectedParentMenu.children !== undefined && selectedParentMenu.children.length > 0) {
          for (let i = 0; i < selectedParentMenu.children.length; i++) {
            selectedParentMenu.children[i].allowed = allowed;
            if (
              selectedParentMenu.children[i].children !== undefined &&
              selectedParentMenu.children[i].children.length > 0
            ) {
              for (let j = 0; j < selectedParentMenu.children[i].children.length; j++) {
                selectedParentMenu.children[i].children[j].allowed = allowed;
              }
            }
          }
        }
      }
    } else if (menuType === 'children') {
      let checkedChildren = selectedParentMenu.children.filter((x) => x.allowed === true);
      selectedParentMenu.allowed = checkedChildren.length > 0 ? true : false;
      selectedChildrenMenu.allowed = allowed;
      if (selectedChildrenMenu.children !== undefined && selectedChildrenMenu.children.length > 0) {
        for (let i = 0; i < selectedChildrenMenu.children.length; i++) {
          selectedChildrenMenu.children[i].allowed = allowed;
        }
      }
    } else if (menuType === 'grandchildren') {
      let checkedGrandChildren = selectedChildrenMenu.children.filter((x) => x.allowed === true);
      selectedParentMenu.allowed = allowed ? allowed : true;
      selectedChildrenMenu.allowed = checkedGrandChildren.length > 0 ? true : false;
      selectedGrandChildrenMenu.allowed = allowed;
    }
  }

  onCheckAllApplication(allowed, menuList) {
    for (let i = 0; i < menuList.length; i++) {
      menuList[i].allowed = allowed;
      if (menuList[i].children !== undefined && menuList[i].children.length > 0) {
        for (let j = 0; j < menuList[i].children.length; j++) {
          menuList[i].children[j].allowed = allowed;
          if (menuList[i].children[j].children !== undefined && menuList[i].children[j].children.length > 0) {
            for (let k = 0; k < menuList[i].children[j].children.length; k++) {
              menuList[i].children[j].children[k].allowed = allowed;
            }
          }
        }
      }
    }
  }

  getCheckedApp() {
    /* Temporary fix for issue #2872: Flattening the array of selected app menus */
    this.selectedAppMenuForAdd = [];

    // Iterate over top menus
    this.appMenuList.forEach((parent) => {
      if (parent.allowed) {
        this.selectedAppMenuForAdd.push({
          menu_id: parent.menu_id,
          dashboard_id: parent.dashboard_id,
        });

        // Iterate over the second level menus, if any
        if (parent.children) {
          parent.children.forEach((children) => {
            if (children.allowed) {
              this.selectedAppMenuForAdd.push({
                menu_id: children.menu_id,
                dashboard_id: children.dashboard_id,
              });
            }

            // Iterate over the third level menus, if any
            if (children.children) {
              children.children.forEach((grandChildren) => {
                if (children.allowed) {
                  this.selectedAppMenuForAdd.push({
                    menu_id: grandChildren.menu_id,
                    dashboard_id: grandChildren.dashboard_id,
                  });
                }
              });
            }
          });
        }
      }
    });
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
    return await this._apicall
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
