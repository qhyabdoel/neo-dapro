import { BaseBackendResponse } from 'src/app/libs/models/base.model';

export interface Menu {
  menu_id: string;
  id: string;
  dashboard_id?: number;
  dashboard?: {
    id: number;
    slug: string;
    share_url?: string;
  };
  title: string;
  options: {
    icon: string;
    enable_protect_module: boolean;
    enable_icon_default: boolean;
    enable_share_via_email: boolean;
  };
  expanded: boolean;
  $$id: number;
  children?: Menu[];
  $$expanded: boolean;
  parent_id?: string;
  slug: string;
  share_url: string;
}

export interface GetMenuResponse extends BaseBackendResponse {
  readonly response: Menu;
}
