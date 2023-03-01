import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as FileSaver from 'file-saver';
import { Role, User } from 'src/app/libs/models';
import { search_regex_three } from 'src/app/libs/helpers/utility';
import { Group } from 'src/app/libs/models/group.model';
import { ApiService, LayoutUtilsService, TranslationService, JsonService, MessageType } from 'src/app/libs/services';
import {
  API_APPLICATION_LIST_URL,
  API_AUDIT_TRAIL_ALL_URL,
  API_GROUP_LIST_URL,
  API_ROLE_LIST_URL,
  API_USER_LIST_URL,
} from 'src/app/libs/services/common/apiUrl.service';
import { environment } from 'src/environments/environment';
import { AuditTrailComponent } from '../user-action/audit-trail/audit-trail-component';
import { GroupAddEditComponent } from '../user-action/group-add-edit/group-add-edit.component';
import { RoleEditDialogComponent } from '../user-action/role-add-edit/role-edit.dialog.component';
import { UserAddEditComponent } from '../user-action/user-add-edit/user-add-edit.component';

const displayColumnUser = ['username', 'email', 'firstname', 'lastname', 'groups', 'actions'];
const displayColumnGroup = ['groupname', 'groupdesc', 'scope', 'actions'];
const displayColumnRole = ['rolename', 'roledesc', 'scope', 'application_name', 'actions'];
@Component({
  selector: 'pq-users-list',
  templateUrl: './user-list.component.html',
})
export class UsersListComponent implements OnInit {
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  //data type any
  config: any;
  pagelength: any;
  messages: any;

  //data type boolean
  isloader: boolean;

  //data type string
  startfinish: string = 'start';
  activeTab: string = 'user';
  searchText: string = '';

  //data type array
  dataList: any = [];
  displayedColumns = [];
  roleList: any = [];
  applicationList: any = [];

  //data type object
  dataSource: MatTableDataSource<any>;
  showCsvDropdown: boolean = false;

  loading: boolean = true;
  /**
   * @param dialog: MatDialog
   */
  constructor(
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
    this.dataSource = new MatTableDataSource();
    this.isloader = false;
    this.loading = true;
    this.loadTabList('username');
  }

  ngAfterViewInit() {}

  initialTable() {
    this.dataSource = new MatTableDataSource();
    this.dataSource.sort = null;
    this.dataSource.paginator = null;
  }

  async loadTabList(type) {
    this.displayedColumns =
      type === 'username'
        ? displayColumnUser
        : type === 'groupname'
        ? displayColumnGroup
        : type === 'role'
        ? displayColumnRole
        : [];
    this.loadList(
      type === 'username'
        ? API_USER_LIST_URL
        : type === 'groupname'
        ? API_GROUP_LIST_URL
        : type === 'role'
        ? API_ROLE_LIST_URL
        : [],
      type
    );
    if (type === 'role') {
      this.loadApplicationList();
    }
  }
  loadApplicationList() {
    this._apicall.get(API_APPLICATION_LIST_URL).subscribe((result) => {
      this.applicationList = result.response;
      for (let i = 0; i < this.dataList.length; i++) {
        // let selectedApp = {};
        if (this.dataList[i].application_id !== null) {
          let selectedApp = this.applicationList.filter(
            (x) => x.__application_id === this.dataList[i].application_id
          )[0];
          if (selectedApp !== undefined) {
            this.dataList[i] = {
              ...this.dataList[i],
              application_name: selectedApp.title,
            };
          }
        } else {
          this.dataList[i] = {
            ...this.dataList[i],
            application_name: '-',
          };
        }
      }
      this.dataList = this.sortData('rolename', this.dataList);
      this.loadTable();
    });
  }

  async loadList(url, sortField) {
    let result = await this._apicall.getApi(url);
    this.dataList = this.sortData(sortField, result.result.response);
    this.loading = false;
    await this.initialTable();
    this.loadTable();
  }

  loadAuditTrailLog(_user: User) {
    const dialogRef = this.dialog.open(AuditTrailComponent, { data: _user });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.loadTabList('username');
    });
  }

  loadTable() {
    this.dataSource.data = this.dataList;
    this.pagelength = this.dataList.length;
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.paginator.firstPage();
    this.cdr.detectChanges();
  }

  async changeTab(active) {
    this.loading = true;
    this.activeTab = active;
    this.searchText = '';
    this.initialTable();
    this.applicationList = [];
    if (active === 'user') {
      await this.loadTabList('username');
    } else if (active === 'group') {
      await this.loadTabList('groupname');
    } else {
      await this.loadTabList('role');
    }
  }

  //CRUD User
  addUser() {
    const newUser = new User();
    newUser.clear();
    this.editUser(newUser);
  }

  editUser(_user: User) {
    const dialogRef = this.dialog.open(UserAddEditComponent, { data: { user: _user } });
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.loadTabList('username');
    });
  }

  deleteUser(_user: User) {
    const _title = this.messages.USER_MANAGEMENTS.MSG_DU;
    const _description = this.messages.USER_MANAGEMENTS.MSG_AYSD + ' ' + _user.firstname + ' ' + _user.lastname + '?';
    const _waitDesciption = _user.firstname + ' ' + _user.lastname + this.messages.USER_MANAGEMENTS.MSG_ID;
    const _deleteMessage = _user.firstname + ' ' + _user.lastname + this.messages.USER_MANAGEMENTS.MSG_SD;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      let url = '/api/user/' + _user.uuid;
      let rest = await this._apicall.deleteApi(url, false);

      if (rest.status) {
        this._apicall.openModal('Success', _deleteMessage);
        this.loadTabList('username');
      } else {
        let errorMessage = this.messages.USER_MANAGEMENTS.MSG_UPSD + ' ' + _user.firstname + ' ' + _user.lastname;
        if (rest.msg.status === 500) {
          errorMessage = `${errorMessage}. ${rest.msg.error.message}`;
        }
        this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
      }
    });
  }

  changePassword(_user: User) {
    if (environment.type == 'on_cloud') {
      const dialogRef = this.layoutUtilsService.overwriteElement(
        this.messages.USER_MANAGEMENTS.MSG_RRP,
        this.messages.USER_MANAGEMENTS.MSG_DYWRP + ' ' + _user.username + '(' + _user.email + ')',
        this.messages.USER_MANAGEMENTS.MSG_SMR,
        this.messages.USER_MANAGEMENTS.MSG_SM
        // true
      );
      dialogRef.afterClosed().subscribe(async (res) => {
        if (!res) {
          return;
        }
        let param = {
          email: _user.email,
        };
        let url = '/api/password/reset';
        let result = this._apicall.postApi(url, param, true);
      });
    } else {
      const dialogRef = this.dialog.open(UserAddEditComponent, { data: { user: _user, isChangePassword: true } });
      dialogRef.afterClosed().subscribe((res) => {
        if (!res) {
          return;
        }
        this.loadTabList('username');
      });
    }
  }

  //CRUD Group
  addGroup() {
    const newgroup = new Group();
    newgroup.clear();
    this.editGroup(newgroup);
  }

  editGroup(group: Group) {
    const dialogRef = this.dialog.open(GroupAddEditComponent, { data: { group: group } });
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      this.loadTabList('groupname');
    });
  }

  async deleteGroup(_group: Group) {
    this.messages = await this.jsonService.retMessage();
    const _title = this.messages.USER_MANAGEMENTS.MSG_DG;
    const _description = this.messages.USER_MANAGEMENTS.MSG_DG + ' ' + _group.groupname + ' ?';
    const _waitDesciption = _group.groupname + this.messages.USER_MANAGEMENTS.MSG_ID;
    const _deleteMessage = _group.groupname + this.messages.USER_MANAGEMENTS.MSG_SD;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      let url = '/api/group/' + _group.uuid;
      let rest = await this._apicall.deleteApi(url, false);

      if (rest.status) {
        this._apicall.openModal('Success', _deleteMessage);
        this.loadTabList('groupname');
      } else {
        // console.log('error', rest.msg);
        let errorMessage = this.messages.USER_MANAGEMENTS.MSG_UPSD + ' ' + _group.groupname;
        if (rest.msg.status === 500) {
          errorMessage = `${errorMessage}. ${rest.msg.error.message}`;
        }
        this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
      }
    });
  }

  //CRUD Role
  addRole() {
    const newrole = new Role();
    newrole.clear();
    this.editRole(newrole);
  }

  editRole(_role: Role) {
    const dialogRef = this.dialog.open(RoleEditDialogComponent, { data: { role: _role } });
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      this.loadTabList('role');
      await this.loadApplicationList();
    });
  }

  async deleteRole(_role: Role) {
    this.messages = await this.jsonService.retMessage();
    const _title = this.messages.USER_MANAGEMENTS.MSG_DR;
    const _description = this.messages.USER_MANAGEMENTS.MSG_AYSD + ' ' + _role.rolename + ' ?';
    const _waitDesciption = _role.rolename + this.messages.USER_MANAGEMENTS.MSG_ID;
    const _deleteMessage = _role.rolename + this.messages.USER_MANAGEMENTS.MSG_SD;

    const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption);
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      let url = '/api/role/' + _role.uuid;
      let result = await this._apicall.deleteApi(url, false);

      if (result.status) {
        this._apicall.openModal('Success', _deleteMessage);
        this.loadTabList('role');
        await this.loadApplicationList();
      } else {
        let errorMessage = this.messages.USER_MANAGEMENTS.MSG_UPSD + ' ' + _role.rolename;
        if (result.msg.status === 500) {
          errorMessage = `${errorMessage}. ${result.msg.error.message}`;
        }
        this.layoutUtilsService.showActionNotification(errorMessage, MessageType.Delete, 5000, true, true);
      }
    });
  }

  //General Function
  sortData(col, dataList) {
    let key = col;
    dataList && dataList.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));
    return dataList;
  }

  searchData(searchField) {
    this.dataSource.data = search_regex_three(this.dataList, this.searchText, searchField);
  }

  downloadAuditTrail() {
    this._apicall.get(API_AUDIT_TRAIL_ALL_URL, 'download').subscribe((resp: any) => {
      FileSaver.saveAs(resp, `audit_trail.csv`);
    });
  }

  downloadUserList() {
    this._apicall.get(`${API_USER_LIST_URL}?csv=true`, 'download').subscribe((resp: any) => {
      FileSaver.saveAs(resp, `users.csv`);
    });
  }

  tabOnClick(tab: string) {
    this.activeTab = tab;
  }
}
