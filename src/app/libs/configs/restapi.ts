const subbaseurl = '/api/';
export const rest_api = {
  AUTH_LOGIN: subbaseurl + 'login',
  AUTH_LOGOUT: subbaseurl + 'logout',
  LICENCES: subbaseurl + 'licences',
  REFRESH_TOKEN: subbaseurl + 'refresh-token',
  API_PERMISSION: subbaseurl + 'permissions',
  API_ROLES: subbaseurl + 'roles',
  API_CHART_LIST: subbaseurl + 'chart/list',
  API_DASHBOARD_LIST: subbaseurl + 'dashboard/list',
  API_USERS: subbaseurl + 'users',
  //start chart detail api
  COLOR_PALLETE: '/assets/data/color_palette.json',
  CHART_DATASOURCE: subbaseurl + 'chart/datasources',
  CHART_EXPLORE: subbaseurl + 'chart/explore_json/',
  //end chart detail api
  //start captcha
  CAPTCHA: subbaseurl + 'captcha',
  //end captcha
  // menu builder
  API_APPLICATION_LIST: subbaseurl + 'applications',
  // menu builder
};
