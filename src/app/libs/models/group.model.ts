import { BaseModel } from './base.model';

export class Group extends BaseModel {
  uuid: string;
  groupname: string;
  groupdesc: string;
  roles: string[];
  title: string;

  clear(): void {
    this.uuid = '';
    this.groupname = '';
    this.groupdesc = '';
    this.roles = [];
    this.title = '';
  }
}
