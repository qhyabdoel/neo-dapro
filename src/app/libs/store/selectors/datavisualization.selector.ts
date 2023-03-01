import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DataVisualizationState } from 'src/app/libs/store/states/datavisualization.state';

const dataVisualizationSelector = createFeatureSelector<DataVisualizationState>('datavisualization');

export const chartListSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.chartList
);

export const dashboardListSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.dashboardList
);

export const chartDatasourceSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.chartDatasource
);

export const chartExploreSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.chartExplore
);

export const colorPalleteListSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.colorPalleteList
);

export const deleteDashboardSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.deleteDashboard
);

export const deleteChartSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.deleteChart
);
export const postShareChartSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.postShareChart
);

export const postShareUrlChartSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.postShareUrlChart
);

export const detailChartSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.detailChart
);

export const datasetItemSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.datasetItem
);
export const runQuerySelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.runQuery
);

export const exploreJSONSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.exploreJSON
);
export const loadChartByIdSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.loadChartById
);

export const sharedChartDataSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.sharedChartData
);

export const applicationListSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.applicationList
);

export const menuBuilderSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.menuBuilder
);

export const menuBuilderSelectedItemSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.menuBuilderSelectedItem
);

export const menuListSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.menuList
);

export const flagingDynamicSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.flagingDynamic
);

export const leftbarOptionSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.leftbarOptions
);

export const rightbarActiveCollapseSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.rightbarActiveCollapse
);

export const insertChartDashboardSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.insertChatDashboard
);
export const deleteChartDashboardSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.deleteChartDashboard
);

export const formDataChartSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.formDataChart
);

// selector for dashboard
export const sharedDashboardDataSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.sharedDashboardData
);

export const extraFilterSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.extraFilter
);

export const isReloadCardSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.isReloadCard
);

export const selectedValueChartSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.selectedValueChart
);

export const setApplicationByIdSelector = createSelector(
  dataVisualizationSelector,
  (datavisualization) => datavisualization.setApplicationById
);
