import { DataVisualizationState } from 'src/app/libs/store/states/datavisualization.state';
import { createReducer, on } from '@ngrx/store';
import {
  GetChartDatasourceSuccess,
  GetChartListSuccess,
  GetColorPalleteSuccess,
  GetDashboardListSuccess,
  GetChartExploreSuccess,
  DeleteDashboardSuccess,
  DeleteChartSuccess,
  GetChartExploreFailed,
  PostShareChartSuccess,
  PostShareChartFailed,
  PostShareUrlChartSuccess,
  PostShareUrlChartFailed,
  PostDetailChartExporeFormDataChart,
  SetItemDataset,
  SetRunQuery,
  SetExploreJSON,
  LoadChartById,
  PostSharedChartData,
  GetApplicationListSuccess,
  SetMenuBuilderDetail,
  SetMenuBuilderSelectedItem,
  SetMenuList,
  FlagingDynamicComponent,
  SetOptionLeftbar,
  SetActiveCollapseRightbar,
  SetInsertChartDashboard,
  DeleteChartDashboard,
  SetFormData,
  PostDashboardChartData,
  SetExtraFilter,
  isReloadCard,
  setSelectedValueChart,
  setApplicationById,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';

export const initialState: DataVisualizationState = {
  chartList: null,
  dashboardList: null,
  colorPalleteList: null,
  chartDatasource: null,
  chartExplore: null,
  deleteDashboard: null,
  deleteChart: null,
  errors: null,
  postShareChart: null,
  postShareUrlChart: null,
  detailChart: null,
  datasetItem: null,
  runQuery: null,
  exploreJSON: null,
  loadChartById: null,
  // property for shared chart
  sharedChartData: null,
  applicationList: null,
  menuBuilder: null,
  menuBuilderSelectedItem: null,
  menuList: null,
  flagingDynamic: null,
  leftbarOptions: null,
  rightbarActiveCollapse: null,
  insertChatDashboard: null,
  deleteChartDashboard: null,
  formDataChart: null,
  sharedDashboardData: null,
  extraFilter: null,
  isReloadCard: null,
  selectedValueChart: null,
  setApplicationById: null,
};
export const dataVisualizationReducer = createReducer(
  initialState,
  //GET CHART LIST SUCCESS
  on(GetChartListSuccess, (state, result) => ({ ...state, chartList: result })),
  //GET DASHBOARD LIST SUCCESS
  on(GetDashboardListSuccess, (state, result) => ({ ...state, dashboardList: result })),
  //GET Color Pallete LIST SUCCESS
  on(GetColorPalleteSuccess, (state, result) => ({ ...state, colorPalleteList: result })),
  //GET DASHBOARD LIST SUCCESS
  on(GetChartDatasourceSuccess, (state, result) => ({ ...state, chartDatasource: result })),
  //GET DASHBOARD LIST SUCCESS
  on(GetChartExploreSuccess, (state, result) => ({ ...state, chartExplore: result })),
  on(GetChartExploreFailed, (state, result) => ({ ...state, chartExplore: result })),
  //DELETE DASHBOARD
  on(DeleteDashboardSuccess, (state, result) => ({ ...state, deleteDashboard: result })),
  //DELETE CHART
  on(DeleteChartSuccess, (state, result) => ({ ...state, deleteChart: result })),
  //POST SHARE CHART
  on(PostShareChartSuccess, (state, result) => ({ ...state, postShareChart: result })),
  on(PostShareChartFailed, (state, result) => ({ ...state, errors: result })),
  //POST SHARE URL CHART
  on(PostShareUrlChartSuccess, (state, result) => ({ ...state, postShareUrlChart: result })),
  on(PostShareUrlChartFailed, (state, result) => ({ ...state, errors: result })),
  //SET DETAIL CHART
  on(PostDetailChartExporeFormDataChart, (state, result) => ({ ...state, detailChart: result.param })),
  //SET DATASET CHART
  on(SetItemDataset, (state, result) => ({ ...state, datasetItem: result.item })),
  on(SetRunQuery, (state, result) => ({ ...state, runQuery: result.data })),
  on(SetExploreJSON, (state, result) => ({ ...state, exploreJSON: result.data })),
  on(LoadChartById, (state, result) => ({ ...state, loadChartById: result.data })),
  on(PostSharedChartData, (state, result) => ({ ...state, sharedChartData: result })),
  //GET APPLICATION LIST SUCCESS
  on(GetApplicationListSuccess, (state, result) => ({ ...state, applicationList: result })),
  on(SetMenuBuilderDetail, (state, result) => ({ ...state, menuBuilder: result.item })),
  on(SetMenuBuilderSelectedItem, (state, result) => ({ ...state, menuBuilderSelectedItem: result.item })),
  on(SetMenuList, (state, result) => ({ ...state, menuList: result.item })),
  on(FlagingDynamicComponent, (state, result) => ({ ...state, flagingDynamic: result.item })),
  on(SetOptionLeftbar, (state, result) => ({ ...state, leftbarOptions: result.options })),
  on(SetActiveCollapseRightbar, (state, result) => ({ ...state, rightbarActiveCollapse: result.options })),
  on(SetInsertChartDashboard, (state, result) => ({ ...state, insertChatDashboard: result.item })),
  on(DeleteChartDashboard, (state, result) => ({ ...state, deleteChartDashboard: result.item })),
  on(SetFormData, (state, result) => ({ ...state, formDataChart: result.item })),
  //SET CHART LIST ON DASHBOARD
  on(PostDashboardChartData, (state, result) => ({ ...state, sharedDashboardData: result })),
  on(SetExtraFilter, (state, result) => ({ ...state, extraFilter: result.extraFilter })),
  on(isReloadCard, (state, result) => ({ ...state, isReloadCard: result })),
  on(setSelectedValueChart, (state, result) => ({ ...state, selectedValueChart: result.item })),
  on(setApplicationById, (state, result) => ({ ...state, setApplicationById: result.item }))
);
