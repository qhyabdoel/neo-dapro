interface UserCredential {
  email: string;
  password: string;
  captcha_id?: string;
  captcha?: string;
}

interface UserProfile {
  uuid: string;
  username: string;
  email: string;
  firstname: string;
  lastname: string;
  first_time_login: boolean;
  groups: string[];
  scopes: any;
}

interface LoginResponse {
  profile: UserProfile;
  access_token: string;
  refresh_token: string;
}

interface RefreshTokenResponse {
  profile: UserProfile;
  access_token: string;
  refresh_token: string;
}

interface ApiResult {
  status: string;
  code: number;
  response: any;
  message?: string;
}

interface ParamCreateashboard {
  dashboard: any;
  addMode: boolean;
  dashboard_title: string;
  slug: string;
  charts: any[];
}

interface Position {
  col?: number;
  row?: number;
  size_x?: number;
  size_y?: number;
  slice_id?: string;
  id?: string;
  index?: number;
}

interface ParamEditDashboard {
  id?: number;
  dashboard_title?: string;
  slug?: string;
  css?: string;
  position_json: Position[];
  default_filters?: any;
  duplicate_slices?: boolean;
  expanded_slices?: any;
  charts?: any[];
}

interface ParamCreateChart {
  action: string;
  slice_name: string;
}

interface ParamEditChart {
  form_data: any;
  action: string;
  slice_id: string;
  slice_name: string;
  add_to_dash: string;
  goto_dash: boolean;
}
interface ParamCreateChart {
  action: string;
  slice_name: string;
}

interface ParamEditChart {
  form_data: any;
  action: string;
  slice_id: string;
  slice_name: string;
  add_to_dash: string;
  goto_dash: boolean;
}

interface QueueItem {
  dispatcher: string;
  params: any;
  isFailed: boolean;
}

interface CaptchaInteface {
  captcha_blob: string;
  captcha_id: string;
}
