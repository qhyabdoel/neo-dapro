import { QueryCommandItem } from '../../models';

export interface DataProcessingState {
  libs: {
    queryCommands: any;
  };
  workspace: {
    queryCommandItems: QueryCommandItem[];
    queryCommandItemsPropertyAndValue: QueryCommandItemPropertyAndValue[];
    queryCommandItemsOnFocus: QueryCommandItemOnFocus[];
    queryCommandItemsEndpoint: QueryCommandItemEndpoint[];
    queryCommandItemsDragPosition: QueryCommandItemDragPosition[];

    pqlString: string;
    nodesModel: any;
    lines: Line[];
    queryResult: QueryResult;
    queryObject: QueryObject;
    metadatas: MetadataDatasetWrapper[];
    activeTable: string;

    isQueryRequestTriggered: boolean;
    isQueryRequestTriggeredSubscriber: string[];

    isQueryRequestFailed: boolean;
    isQuerySaveSucceeded: boolean;
    isMetadataSaveSucceeded: boolean;

    isNodesModelToPql: boolean;
    isQueryCommandItemRemoveTriggered: boolean;
    isDataSourceListReloadRequestTriggered: boolean;
    isDatasetListReloadRequestTriggered: boolean;
    isWorkspaceResetIsTriggered: boolean;
    isLineRedrawingNeeded: boolean;
    isZoomInOutTriggered: boolean;
    isDragEnded: boolean;
    isResultExpanded: boolean;
    isPanzoomResetTriggered: boolean;

    scaleValue: number;
    drawingDelay: number;
  };
  message: {
    title: string;
    text: string;
  };
  toastrMessages: ToastrMessage[];
  isProgressActive: boolean;
}
