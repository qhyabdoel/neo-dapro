export interface DataVisualizationState {
  chartList: any;
  dashboardList: any;
  colorPalleteList: any;
  chartDatasource: any;
  chartExplore: any;
  deleteDashboard: any;
  deleteChart: any;
  errors: any;
  postShareChart: any;
  postShareUrlChart: any;
  detailChart: any;
  datasetItem: any;
  exploreJSON: any;
  runQuery: any;
  loadChartById: any;
  // property for chart
  sharedChartData: any;
  applicationList: any;
  menuBuilder: any;
  menuBuilderSelectedItem: any;
  menuList: any;
  flagingDynamic: any;
  leftbarOptions: any;
  rightbarActiveCollapse: any;
  insertChatDashboard: any;
  deleteChartDashboard: any;
  formDataChart: any;

  // property fro dashboard
  sharedDashboardData: any;
  extraFilter: any;
  isReloadCard: any;
  selectedValueChart: string;
  setApplicationById: any;
}

interface IKeyValue {
  [key: string]: any;
}

interface IColStyleCriteria {
  op: string;
  values: any[];
  format: IKeyValue;
}

export interface ITableColStyle {
  column: string;
  criterias: IColStyleCriteria[];
}

export interface ITableChartColStyle extends IColStyleCriteria {
  col: string;
}
