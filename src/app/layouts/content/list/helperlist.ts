/* 
 static color data visualziation list includes chart list, dashboard list  and application list
*/

export const staticLoadingArray = (number) => new Array(number);
const backgroundList = [
  'bg-pqs-green',
  'bg-pqs-green',
  'bg-pqs-purple',
  'bg-pqs-tosca',
  'bg-pqs-brown',
  'bg-pqs-blue',
  'bg-pqs-brown',
  'bg-pqs-red',
];
// image static for application list or menu builder list
const imageBackgroundApplication = [
  '/assets/images/application view icon/icon-monitor-1.svg',
  '/assets/images/application view icon/icon-monitor-2.svg',
  '/assets/images/application view icon/icon-monitor-3.svg',
  '/assets/images/application view icon/icon-monitor-4.svg',
];

// image static fot dashboard list
const imageBackgroundDashboard = [
  '/assets/images/dashboard_view_icon/icon-dashboard-1.svg',
  '/assets/images/dashboard_view_icon/icon-dashboard-2.svg',
  '/assets/images/dashboard_view_icon/icon-dashboard-3.svg',
  '/assets/images/dashboard_view_icon/icon-dashboard-4.svg',
];

// return content by type
// have 3 type (app, dashboard and chart)
// default content type is chart
const handleContentByType = (type, appContent, dashboardContent, chartContent) => {
  switch (type) {
    case 'application':
      return appContent;

    case 'dashboard':
      return dashboardContent;

    default:
      return chartContent;
  }
};

// additional object who needed by chart lists
export const additionalForChartList = {
  getImagesFieldFromUrl: 'visual_type_chart_list',
  isLabelType: true,
  labelTypeCompareField: 'viz_type',
  labelValueField: 'label',
  imageCompareField: 'viz_type',
  imageValueField: 'imageLg',
  isButtonTabs: true,
};

// generate option object by type
// its designed to display a list according type list
export const list_option_object = (type, translationService) => {
  let objectNeededToDisplayList = null;
  objectNeededToDisplayList = {
    type: type,
    secondTitle: handleContentByType(type, 'Dashboard', 'Chart', 'Dataset Name'),
    iconTitle: handleContentByType(type, 'zmdi zmdi-desktop-mac', 'zmdi zmdi-view-dashboard', 'zmdi zmdi-chart'),
    isNewFramework: true,
    fieldUpdatedDate: handleContentByType(type, 'updated_at', 'changed_on', 'changed_on'),
    fieldTotalItems: handleContentByType(type, 'total_dashboard', 'charts', 'ds_name'),
    leng: handleContentByType(type, 'fix', 'len', 'fix'),
    searchField: handleContentByType(type, 'title', 'dashboard_title', 'name'),
    linkField: handleContentByType(type, 'slug', 'slug', 'id'),
    linkUrl: handleContentByType(type, '../applicationbuilder_app', '../dashboard/view', '../newdatavisualization'),
    isRandomImageBackground: handleContentByType(type, true, true, false),
    arrayBackgroundClass: backgroundList,
    arrayImageBackground:
      type === 'application' ? imageBackgroundApplication : type === 'dashboard' ? imageBackgroundDashboard : [],

    isButtonCreate: true,
    buttonCreateName: handleContentByType(
      type,
      translationService.getSelectedLanguage() == 'en' ? 'New Application' : 'Aplikasi Baru',
      translationService.getSelectedLanguage() == 'en' ? 'New Dashboard' : 'Dasbor Baru',
      translationService.getSelectedLanguage() == 'en' ? 'New Chart' : 'Grafik Baru'
    ),
    routeButtonCreate: handleContentByType(
      type,
      '../applicationbuilder_app',
      '../dashboardeditor',
      '../newdatavisualization'
    ),
    isButtonTabs: handleContentByType(type, false, true, true),
    isButtonRefresh: true,
    buttonTabs:
      type === 'dashboard' || type === 'chart'
        ? [
            {
              name: 'Chart',
              title: translationService.getSelectedLanguage() == 'en' ? 'CHART' : 'GRAFIK',
              isActive: type === 'chart',
              class: 'zmdi zmdi-chart',
              routerUrl: '../listdatavisualization',
            },
            {
              name: 'Dashboard',
              title: translationService.getSelectedLanguage() == 'en' ? 'DASHBOARD' : 'DASBOR',
              isActive: type === 'dashboard',
              class: 'zmdi zmdi-view-dashboard',
              routerUrl: '../dashboardvisualization',
            },
          ]
        : null,
    getImagesUrl: handleContentByType(
      type,
      '',
      '',
      '/assets/data/datavisualization/visual_type_' + translationService.getSelectedLanguage() + '.json'
    ),
  };
  if (type === 'chart') {
    objectNeededToDisplayList = { ...objectNeededToDisplayList, ...additionalForChartList };
  }
  return objectNeededToDisplayList;
};
