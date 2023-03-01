import { createAction, props } from '@ngrx/store';

export enum DataVisualizationActionTypes {
  GetChartList = '[GetChart] Action',
  GetChartListSuccess = '[GetChartSuccess] Action',
  GetChartListFailed = '[GetChartFailed] Action',
  GetDashboardList = '[GetDashboard] Action',
  GetDashboardListSuccess = '[GetDashboardSuccess] Action',
  GetDashboardListFailed = '[GetDashboardFailed] Action',
  // start chart detail api
  GetChartDatasource = '[GetChartDatasource] Action',
  GetChartDatasourceSuccess = '[GetChartDatasourceSuccess] Action',
  GetChartDatasourceFailed = '[GetChartDatasourceFailed] Action',
  GetChartExplore = '[GetChartExplore] Action',
  GetChartExploreSuccess = '[GetChartExploreSuccess] Action',
  GetChartExploreFailed = '[GetChartExploreFailed] Action',
  GetColorPallete = '[GetColorPallete] Action',
  GetColorPalleteSuccess = '[GetColorPalleteSuccess] Action',
  GetColorPalleteFailed = '[GetColorPalleteFailed] Action',
  DeleteChart = '[DeleteChart] Action',
  DeleteChartSuccess = '[DeleteChartSuccess] Action',
  DeleteChartFailed = '[DeleteChartFailed] Action',
  DeleteDashboard = '[DeleteDashboard] Action',
  DeleteDashboardSuccess = '[DeleteDashboardSuccess] Action',
  DeleteDashboardFailed = '[DeleteDashboardFailed] Action',
  PostShareChart = '[PostShareChart] Action',
  PostShareChartSuccess = '[PostShareChartSuccess] Action',
  PostShareChartFailed = '[PostShareChartFailed] Action',
  PostShareUrlChart = '[PostShareUrlChart] Action',
  PostShareUrlChartSuccess = '[PostShareUrlChartSuccess] Action',
  PostShareUrlChartFailed = '[PostShareUrlChartFailed] Action',
  PostDetailChartExporeFormDataChart = '[PostDetailChartExporeFormDataChart] Action',
  SetItemDataset = '[SetItemDataset] Action',
  SetRunQuery = '[SetRunQuery] Action',
  SetExploreJSON = '[SetExploreJSON] Action',
  LoadChartById = '[LoadChartById] Action',
  PostShareChartData = '[LoadChartDataById] Action',
  SetFormData = '[SetFormData] Action',
  // end chart detail api

  // menu builder
  GetApplicationList = '[GetApplication] Action',
  GetApplicationListSuccess = '[GetApplicationSuccess] Action',
  GetApplicationListFailed = '[GetApplicationFailed] Action',
  SetMenuBuilderDetail = '[SetMenuBuilderDetail] Action',
  SetMenuBuilderSelectedItem = '[SetMenuBuilderSelectedItem] Action',
  SetMenuList = '[SetMenuList] Action',
  FlagingDynamicComponent = '[FlagingDynamicComponent] Action',
  // menu builder
  SetOptionLeftbar = '[SetOptionLeftbar] Action',
  SetActiveCollapseRightbar = '[SetActiveCollapseRightbar] Action',

  // dashboard
  DeleteChartDashboard = '[DeleteChartDashboard] Action',
  SetInsertChartDashboard = '[SetInsertChartDashboard] Action',
  PostDashboardChartData = '[PostDashboardChartData] Action',
  SetExtraFilter = '[SetExtraFilter] Action',
  isReloadCard = '[isReloadCard] Action',
  setSelectedValueChart = '[setSelectedValueChart] Action',
  setApplicationById = '[setApplicationById] Action',
}

interface ChartExploreProps {
  url: string;
  param: string;
}

export const LoadChartById = createAction(DataVisualizationActionTypes.LoadChartById, props<{ data: any }>());

export const GetChartList = createAction(DataVisualizationActionTypes.GetChartList);

export const GetChartListSuccess = createAction(DataVisualizationActionTypes.GetChartListSuccess, props<any>());

export const GetChartListFailed = createAction(DataVisualizationActionTypes.GetChartListFailed, props<any>());

export const GetDashboardList = createAction(DataVisualizationActionTypes.GetDashboardList);

export const GetDashboardListSuccess = createAction(DataVisualizationActionTypes.GetDashboardListSuccess, props<any>());

export const GetDashboardListFailed = createAction(DataVisualizationActionTypes.GetDashboardListFailed, props<any>());

// start chart detail api
export const GetChartDatasource = createAction(DataVisualizationActionTypes.GetChartDatasource);

export const GetChartDatasourceSuccess = createAction(
  DataVisualizationActionTypes.GetChartDatasourceSuccess,
  props<any>()
);

export const GetChartDatasourceFailed = createAction(
  DataVisualizationActionTypes.GetChartDatasourceFailed,
  props<any>()
);

export const GetChartExplore = createAction(DataVisualizationActionTypes.GetChartExplore, props<ChartExploreProps>());

export const GetChartExploreSuccess = createAction(DataVisualizationActionTypes.GetChartExploreSuccess, props<any>());

export const GetChartExploreFailed = createAction(DataVisualizationActionTypes.GetChartExploreFailed, props<any>());

export const GetColorPallete = createAction(DataVisualizationActionTypes.GetColorPallete);

export const GetColorPalleteSuccess = createAction(DataVisualizationActionTypes.GetColorPalleteSuccess, props<any>());

export const GetColorPalleteFailed = createAction(DataVisualizationActionTypes.GetColorPalleteFailed, props<any>());

export const DeleteChart = createAction(DataVisualizationActionTypes.DeleteChart, props<{ id: any }>());

export const DeleteChartSuccess = createAction(DataVisualizationActionTypes.DeleteChartSuccess, props<any>());

export const DeleteChartFailed = createAction(DataVisualizationActionTypes.DeleteChartFailed, props<any>());

export const DeleteDashboard = createAction(DataVisualizationActionTypes.DeleteDashboard, props<{ id: string }>());

export const DeleteDashboardSuccess = createAction(DataVisualizationActionTypes.DeleteDashboardSuccess, props<any>());

export const DeleteDashboardFailed = createAction(DataVisualizationActionTypes.DeleteDashboardFailed, props<any>());

export const PostDetailChartExporeFormDataChart = createAction(
  DataVisualizationActionTypes.PostDetailChartExporeFormDataChart,
  props<{ param: any }>()
);

export const SetItemDataset = createAction(DataVisualizationActionTypes.SetItemDataset, props<{ item: any }>());
export const SetRunQuery = createAction(DataVisualizationActionTypes.SetRunQuery, props<{ data: any }>());
export const SetExploreJSON = createAction(DataVisualizationActionTypes.SetExploreJSON, props<{ data: any }>());

// end chart detail api

//top bar
export const PostShareChart = createAction(DataVisualizationActionTypes.PostShareChart, props<{ id: string }>());

export const PostShareChartSuccess = createAction(DataVisualizationActionTypes.PostShareChartSuccess, props<any>());

export const PostShareChartFailed = createAction(DataVisualizationActionTypes.PostShareChartFailed, props<any>());

export const PostShareUrlChart = createAction(DataVisualizationActionTypes.PostShareUrlChart, props<{ id: string }>());

export const PostShareUrlChartSuccess = createAction(
  DataVisualizationActionTypes.PostShareUrlChartSuccess,
  props<any>()
);

export const PostShareUrlChartFailed = createAction(DataVisualizationActionTypes.PostShareUrlChartFailed, props<any>());
// top bar

// data for shared chart
interface SharedChartDataProps {
  title: any;
}

// shared chart data reducer
export const PostSharedChartData = createAction(
  DataVisualizationActionTypes.PostShareChartData,
  props<SharedChartDataProps>()
);

// menu builder
export const GetApplicationList = createAction(DataVisualizationActionTypes.GetApplicationList);

export const GetApplicationListSuccess = createAction(
  DataVisualizationActionTypes.GetApplicationListSuccess,
  props<any>()
);

export const GetApplicationListFailed = createAction(
  DataVisualizationActionTypes.GetApplicationListFailed,
  props<any>()
);

export const SetMenuBuilderDetail = createAction(DataVisualizationActionTypes.SetItemDataset, props<{ item: any }>());
export const SetMenuBuilderSelectedItem = createAction(
  DataVisualizationActionTypes.SetMenuBuilderSelectedItem,
  props<{ item: any }>()
);
export const SetMenuList = createAction(DataVisualizationActionTypes.SetMenuList, props<{ item: any }>());
export const FlagingDynamicComponent = createAction(
  DataVisualizationActionTypes.FlagingDynamicComponent,
  props<{ item: any }>()
);
// menu  bulder

export const SetOptionLeftbar = createAction(DataVisualizationActionTypes.SetOptionLeftbar, props<{ options: any }>());
export const SetActiveCollapseRightbar = createAction(
  DataVisualizationActionTypes.SetActiveCollapseRightbar,
  props<{ options: any }>()
);

export const SetInsertChartDashboard = createAction(
  DataVisualizationActionTypes.SetInsertChartDashboard,
  props<{ item: any }>()
);

export const DeleteChartDashboard = createAction(
  DataVisualizationActionTypes.DeleteChartDashboard,
  props<{ item: any }>()
);

export const SetFormData = createAction(DataVisualizationActionTypes.SetFormData, props<{ item: any }>());

export const PostDashboardChartData = createAction(
  DataVisualizationActionTypes.PostDashboardChartData,
  props<{ dashboardCharts: any }>()
);

export const SetExtraFilter = createAction(DataVisualizationActionTypes.SetExtraFilter, props<{ extraFilter: any }>());
export const isReloadCard = createAction(DataVisualizationActionTypes.isReloadCard, props<{ status: boolean }>());
export const setSelectedValueChart = createAction(
  DataVisualizationActionTypes.setSelectedValueChart,
  props<{ item: string }>()
);

export const setApplicationById = createAction(DataVisualizationActionTypes.setApplicationById, props<{ item: any }>());
