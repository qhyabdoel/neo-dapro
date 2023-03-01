import { BaseBackendResponse } from './base.model';
import { Menu } from './menu.model';

export interface Application {
  slug: string;
  title: string;
  total_dashboard?: number;
  created_by?: any;
  updated_by?: any;
  options: ApplicationOption;
  menu: Menu[];
  password?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

export interface ApplicationOption {
  publish: boolean;
  login_style: string;
  label_style: string;
  image_style: string;
  // 'selected_dashboard': number;
  enable_login_page: boolean;
  logo_login: string;
  background_image: string;
  topbar_option: {
    logo: string;
    enable_global_search: boolean;
    enable_notification_center: boolean;
    enable_application_setting: boolean;
    enable_information_glossary: boolean;
    text_information_glossary: string;
  };
  sub_topbar_option: {
    enable_back_button: boolean;
    enable_breadcrumb: boolean;
    enable_refresh_page_button: boolean;
  };
}

export interface GetApplicationResponse extends BaseBackendResponse {
  readonly response: Application;
}

export interface GetApplicationListResponse extends BaseBackendResponse {
  readonly response: Application[];
}
