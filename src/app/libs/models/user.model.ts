import { BaseModel } from './base.model';
import { Address } from './address.model';
import { SocialNetworks } from './social-networks.model';

export class User extends BaseModel {
  id: number;
  uuid: string;
  username: string;
  email: string;
  roles: number[];
  pic: string;
  fullname: string;
  firstname: string;
  lastname: string;
  occupation: string;
  companyName: string;
  phone: string;
  address: Address;
  socialNetworks: SocialNetworks;
  profile: string;
  group: boolean;
  title: string;
  selectedGroup: string;
  external_auth: boolean;
  isFirst: object;
  // add
  password: string;
  passwordConfirmation: string;
  groups: string[];
  scopes: string[];

  transform(userProfile: UserProfile) {
    this.uuid = userProfile.uuid;
    this.username = userProfile.username;
    this.email = userProfile.email;
    this.firstname = userProfile.firstname;
    this.lastname = userProfile.lastname;
    this.groups = userProfile.groups;
    this.scopes = userProfile.scopes;
  }

  clear(): void {
    this.id = undefined;
    this.uuid = undefined;
    this.username = '';
    this.email = '';
    this.roles = [];
    this.fullname = '';
    this.firstname = '';
    this.lastname = '';
    this.pic = './assets/images/users/default.jpg';
    this.occupation = '';
    this.companyName = '';
    this.phone = '';
    this.address = new Address();
    this.address.clear();
    this.socialNetworks = new SocialNetworks();
    this.socialNetworks.clear();
    this.profile = '';
    this.group = false;
    this.title = '';
    this.selectedGroup = '';
    this.external_auth = false;
    this.isFirst = {
      isDataProcessing: true,
      isDataVisualization: true,
      isApplications: true,
    };
    this.password = '';
    this.passwordConfirmation = '';
    this.groups = [];
    this.roles = [];
  }
}
