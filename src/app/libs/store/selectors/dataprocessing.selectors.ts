import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DataProcessingState } from 'src/app/libs/store/states/dataprocessing.state';

const dataProcessingSelector = createFeatureSelector<DataProcessingState>('dataprocessing');

/*
 * LIBS
 */
const dataProcessinglibsSelector = createSelector(dataProcessingSelector, (dataprocessing) => dataprocessing.libs);

export const queryCommandsSelector = createSelector(
  dataProcessinglibsSelector,
  (dataProcessingLibs) => dataProcessingLibs.queryCommands
);

/*
 * WORKSPACE
 */
const dataProcessingWorkspaceSelector = createSelector(
  dataProcessingSelector,
  (dataprocessing) => dataprocessing.workspace
);

export const queryCommandItemsSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.queryCommandItems
);

export const queryCommandItemsPropertyAndValueSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.queryCommandItemsPropertyAndValue
);

export const queryCommandItemsOnFocusSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.queryCommandItemsOnFocus
);

export const queryCommandItemsEndpointSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.queryCommandItemsEndpoint
);

export const queryCommandItemsDragPositionSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.queryCommandItemsDragPosition
);

// export const queryCommandItemsSequenceSelector = createSelector(
//   dataProcessingWorkspaceSelector,
//   (dataProcessingWorkspace) => dataProcessingWorkspace.queryCommandItemsSequence
// );

export const queryResultSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.queryResult
);

export const pqlStringSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.pqlString
);

export const linesSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.lines
);

export const queryObjectSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.queryObject
);

export const metadatasSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.metadatas
);

export const activeTableSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.activeTable
);

export const isNodesModelToPqlSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isNodesModelToPql
);

export const isQueryCommandItemRemovedSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isQueryCommandItemRemoveTriggered
);

export const isQueryRequestTriggeredSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isQueryRequestTriggered
);

export const isQueryRequestTriggeredSubscriberSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isQueryRequestTriggeredSubscriber
);

export const isDataSourceListReloadRequestTriggeredSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isDataSourceListReloadRequestTriggered
);

export const isDatasetListReloadRequestTriggeredSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isDatasetListReloadRequestTriggered
);

export const isWorkspaceResetIsTriggeredSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isWorkspaceResetIsTriggered
);

export const isQueryRequestFailedSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isQueryRequestFailed
);

export const isLineRedrawingNeededSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isLineRedrawingNeeded
);

export const drawingDelaySelector = createSelector(dataProcessingWorkspaceSelector, (dataProcessingWorkspace) => dataProcessingWorkspace.drawingDelay);

export const isZoomInOutTriggeredSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isZoomInOutTriggered
);

export const isDragEndedSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isDragEnded
);

export const isResultExpandedSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isResultExpanded
);

export const isPanzoomResetTriggeredSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.isPanzoomResetTriggered
);

export const scaleValueSelector = createSelector(
  dataProcessingWorkspaceSelector,
  (dataProcessingWorkspace) => dataProcessingWorkspace.scaleValue
);

/*
 * OTHERS
 */

export const dataProcessingMessageSelector = createSelector(
  dataProcessingSelector,
  (dataprocessing) => dataprocessing.message
);

export const toastrMessagesSelector = createSelector(
  dataProcessingSelector,
  (dataprocessing) => dataprocessing.toastrMessages
);

export const isProgressActiveSelector = createSelector(
  dataProcessingSelector,
  (dataprocessing) => dataprocessing.isProgressActive
);
