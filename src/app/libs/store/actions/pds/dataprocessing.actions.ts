import { createAction, props } from '@ngrx/store';
import { QueryCommandItem } from 'src/app/libs/models';

/*
 * LIBS
 */

export const GetQueryCommands = createAction('[GetQueryCommands] Action');
export const GetQueryCommandsSucceed = createAction(
  '[GetQueryCommandsSucceed] Action',
  props<{ queryCommands: any }>()
);
export const GetQueryCommandsFailed = createAction('[GetQueryCommandsFailed] Action');

export const GetTextCollections = createAction('[GetTextCollections] Action');
export const GetTextCollectionsSucceed = createAction(
  '[GetTextCollectionsSucceed] Action',
  props<{ textCollections: any }>()
);
export const GetTextCollectionsFailed = createAction('[GetTextCollectionsFailed] Action');

/*
 * WORKSPACE
 */

export const ResetWorkspace = createAction('[ResetWorkspace] Action', props<{ needToastr: boolean }>());

export const ResetWorkspaceDoUpdate = createAction('[ResetWorkspaceDoUpdate] Action');

export const AddWorkspaceItem = createAction(
  '[AddWorkspaceItem] Action',
  props<{
    queryCommandItem: QueryCommandItem;
    queryCommandItemPropertyValue: QueryCommandItemPropertyAndValue;
    queryCommandItemOnFocus: QueryCommandItemOnFocus;
    queryCommandItemDragPosition: QueryCommandItemDragPosition;
    // queryCommandItemSequence: QueryCommandItemSequence;
  }>()
);
export const AddQueryCommandItemEndpoint = createAction('[AddQueryCommandItemEndpoint] Action', props<{ itemEndpoint: QueryCommandItemEndpoint }>());
export const AddQueryCommandItemEndpointActual = createAction('[AddQueryCommandItemEndpointActual] Action', props<{ itemEndpoint: QueryCommandItemEndpoint }>());
export const SetWorkspaceItems = createAction(
  '[SetWorkspaceItems] Action',
  props<{
    queryCommandItems: QueryCommandItem[];
    queryCommandItemsPropertyAndValue: QueryCommandItemPropertyAndValue[];
    queryCommandItemsOnFocus: QueryCommandItemOnFocus[];
    queryCommandItemsEndpoint: QueryCommandItemEndpoint[];
    queryCommandItemsDragPosition: QueryCommandItemDragPosition[];
  }>()
);
export const UpdateWorkspaceItem = createAction(
  '[UpdateWorkspaceItem] Action',
  props<{
    queryCommandItemPropertyAndValue: QueryCommandItemPropertyAndValue;
    queryCommandItemEndpoint: QueryCommandItemEndpoint;
  }>()
);
export const RemoveWorkspaceItem = createAction(
  '[RemoveWorkspaceItem] Action',
  props<{ queryCommandItem: QueryCommandItem }>()
);
export const RemoveAllWorkspaceItem = createAction('[RemoveAllWorkspaceItem] Action', props<{ itemsOnly: boolean }>());
export const SetWorkspaceItemDragPosition = createAction(
  '[SetWorkspaceItemDragPosition] Action',
  props<{ id: string; dragPosition: QueryCommandItemPosition }>()
);
export const SetWorkspaceItemOnFocus = createAction('[SetWorkspaceItemOnFocus] Action', props<{ id: string }>());
export const ResetWorkspaceItemOnFocus = createAction('[ResetWorkspaceItemOnFocus] Action');

export const AddQueryCommandPropertyValue = createAction(
  '[AddQueryCommandPropertyValue] Action',
  props<{ lang: string; queryItem: QueryCommandItem; commandProperty: QueryCommandProperty; value: any }>()
);
export const UpdateQueryCommandItemPropertyValue = createAction(
  '[UpdateQueryCommandItemPropertyValue] Action',
  props<{ item: QueryCommandItemPropertyAndValue; propName: string; propValue: any }>()
);
export const ReplaceQueryCommandItemsPropertyAndValue = createAction(
  '[ReplaceQueryCommandItemsPropertyAndValue] Action',
  props<{ queryCommandItemsPropertyAndValue: QueryCommandItemPropertyAndValue[] }>()
);

export const UpdateQueryCommandItemsEndpoint = createAction(
  '[UpdateQueryCommandItemsEndpoint] Action',
  props<{ queryCommandItemsEndpoint: QueryCommandItemEndpoint[] }>()
);
export const UpdateQueryCommandItemEndpoint = createAction(
  '[UpdateQueryCommandItemEndpoint] Action',
  props<{ id: string; objs: KeyValue[] }>()
);


// export const UpdateQueryCommandItemSequences = createAction(
//   '[UpdateQueryCommandItemSequences] Action',
//   props<{ queryCommandItemsSequence: QueryCommandItemSequence[] }>()
// );

export const ExecuteQuery = createAction('[ExecuteQuery] Action', props<{ title: string; isPreview: boolean }>());
export const ExecuteQuerySucceed = createAction('[ExecuteQuerySucceed] Action');
export const ExecuteQueryFailed = createAction('[ExecuteQueryFailed] Action');

export const GetQueryMetadata = createAction(
  '[GetQueryMetadata] Action',
  props<{ quid: string; userQueryID: number }>()
);
export const GetQueryMetadataSucceed = createAction(
  '[GetQueryMetadataSucceed] Action',
  props<{ metadatas: MetadataDatasetWrapper[] }>()
);
export const GetQueryMetadataFailed = createAction('[GetQueryMetadataFailed] Action');

export const GetQueryResult = createAction(
  '[GetQueryResult] Action',
  props<{ quid: string; userQueryID: number; size: number; skip?: number }>()
);
export const GetQueryResultSucceed = createAction(
  '[GetQueryResultSucceed] Action',
  props<{ queryResult: QueryResult; needReloadDatasetList: boolean; needMetadata: boolean }>()
);
export const GetQueryResultFailed = createAction('[GetQueryResultFailed] Action');

export const SetQueryResult = createAction('[SetQueryResult] Action', props<{ queryResult: QueryResult }>());
export const ResetQueryResult = createAction('[ResetQueryResult] Action');

export const SetPqlString = createAction('[SetPqlString] Action', props<{ pql: string }>());
export const ResetPqlString = createAction('[ResetPqlString] Action');

export const AddLine = createAction('[AddLine] Action', props<{ line: Line }>());
export const AddLines = createAction('[AddLines] Action', props<{ lines: Line[] }>());
export const RemoveLine = createAction('[RemoveLine] Action', props<{ line: Line }>());
export const RemoveAllLine = createAction('[RemoveAllLine] Action');

export const SetQueryObject = createAction('[SetQueryObject] Action', props<{ queryObject: QueryObject }>());
export const UpdateQueryObject = createAction('[UpdateQueryObject] Action', props<{ queryObject: QueryObject }>());
export const UpdateQueryObjectScheduler = createAction(
  '[UpdateQueryObjectScheduler] Action',
  props<{ interval?: RefreshInterval; additionalIntervals?: RefreshInterval[] }>()
);
export const SetActiveTable = createAction('[SetActiveTable] Action', props<{ activeTable: string }>());

export const ResetMetadata = createAction('[ResetMetadata] Action');
export const SetMetadata = createAction(
  '[SetMetadata] Action',
  props<{ dataset: string; columnName: string; metadata: Metadata }>()
);
export const UpdateMetadata = createAction(
  '[UpdateMetadata] Action',
  props<{ dataset: string; columnName: string; metadata: Metadata }>()
);

export const SetIsNodesModelToPql = createAction(
  '[SetIsNodesModelToPql] Action',
  props<{ isNodesModelToPql: boolean }>()
);

export const SetIsQueryCommandItemRemoveTriggered = createAction(
  '[SetIsQueryCommandItemRemoveTriggered] Action',
  props<{ isQueryCommandItemRemoveTriggered: boolean }>()
);

export const SetIsQueryRequestTriggered = createAction(
  '[SetIsQueryRequestTriggered] Action',
  props<{ isQueryRequestTriggered: boolean }>()
);

export const SetIsQueryRequestTriggeredSubscribed = createAction(
  '[SetIsQueryRequestTriggeredSubscribed] Action',
  props<{ id: string }>()
);

export const ResetIsQueryRequestTriggeredSubscribed = createAction('[ResetIsQueryRequestTriggeredSubscribed]');

export const SetIsDatasetListReloadRequestTriggered = createAction(
  '[SetIsDatasetListReloadRequestTriggered] Action',
  props<{ isDatasetListReloadRequestTriggered: boolean }>()
);

export const SetIsQueryRequestFailed = createAction(
  '[SetIsQueryRequestFailed] Action',
  props<{ isQueryRequestFailed: boolean }>()
);

export const SetIsWorkspaceResetIsTriggered = createAction(
  '[SetIsWorkspaceResetIsTriggered] Action',
  props<{ isWorkspaceResetIsTriggered: boolean }>()
);

export const SetIsLineRedrawingNeeded = createAction(
  '[SetIsLineRedrawingNeeded] Action',
  props<{ isLineRedrawingNeeded: boolean }>()
);

export const SetDrawingDelay = createAction('[SetDrawingDelay] Action', props<{ drawingDelay: number }>());

export const SetIsZoomInOutTriggered = createAction(
  '[SetIsZoomInOutTriggered] Action',
  props<{ isZoomInOutTriggered: boolean }>()
);

export const SetIsDragEnded = createAction('[SetIsDragEnded] Action', props<{ isDragEnded: boolean }>());

export const SetScaleValue = createAction('[SetScaleValue] Action', props<{ scaleValue: number }>());

export const SetIsResultExpanded = createAction('[SetIsResultExpanded] Action', props<{ isResultExpanded: boolean }>());

export const SetIsPanzoomResetTriggered = createAction('[SetIsPanzoomResetTriggered] Action', props<{ isPanzoomResetTriggered: boolean }>());

/*
 * MESSAGE
 */

export const SetMessage = createAction('[SetMessage] Action', props<{ title: string; text: string }>());
export const ResetMessage = createAction('[ResetMessage] Action');

export const SetToastrMessage = createAction('[SetToastrMessage] Action', props<{ toastrMessage: ToastrMessage }>());
export const RemoveToastrMessage = createAction('[RemoveToastrMessage] Action', props<{ index: number }>());

export const StartTimeoutTrigger = createAction('[StartTimeoutTrigger] Action');
export const StopTimeoutTrigger = createAction('[StopTimeoutTrigger] Action');

export const SetIsProgressActive = createAction('[SetIsProgressActive] Action', props<{ isProgressActive: boolean }>());
export const SetQueryCommandItemEndpoint = createAction(
  '[SetQueryCommandItemEndpoint] Action',
  props<{ queryCommandItemsEndpoint: Array<any> }>()
);
