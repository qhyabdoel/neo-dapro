import { BaseModel } from './base.model';

export class Role extends BaseModel {
  id: number;
  title: string;
  permissions: number[];
  isCoreRole = false;
  uuid: string;
  roledesc: string;
  rolename: string;
  scopes: any = [];

  clear(): void {
    this.id = undefined;
    this.title = '';
    this.permissions = [];
    this.isCoreRole = false;
    this.uuid = undefined;
    this.roledesc = "";
    this.rolename = "";
    this.scopes = [];
  }
}
