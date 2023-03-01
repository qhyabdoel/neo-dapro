import { QueryCommandItem } from './app/libs/models';

declare global {
  interface EndpointModelItem {
    id: string;
    in?: string[];
    out?: string[];
  }

  interface DataSourceItem {
    name: string;
    modified: string;
    isDir: boolean;
    path: string;
    ext: string;
    id: string;
    key: number;
    hasCaret: boolean;
    icon: string;
    label: string;
    secondaryLabel: string;
    searchMode: boolean;
    isConnection?: boolean;
    connectionName?: string;
  }

  interface DataSourceItemV2 {
    filetype: string;
    id: string;
    isDir: boolean;
    location: string;
    name: string;
    size: string;
    timestamp: string;
  }

  interface RefreshInterval {
    Advance?: string;
    Basic?: number;
    Expr?: string;
  }

  interface QueryObject {
    ID: number;
    additionalRefreshInterval?: RefreshInterval[];
    advanceMode?: boolean;
    createdDate?: string;
    datasetAlias?: any;
    first_quid?: string;
    lastRun?: string;
    model?: string;
    pql?: string;
    quid?: string;
    refreshInterval?: RefreshInterval;
    title?: string;
    updatedDate?: string;
    userID?: string;
  }

  interface QueryFileWrapper {
    queryFile: QueryObject;
    isChecked: boolean;
  }
  interface QueryCommandItemPosition {
    x: number;
    y: number;
  }

  interface QueryCommandItemSequence {
    key: string;
    count: number;
  }

  interface DataProcessingCollapsible {
    queryCommands: boolean;
    queryProperty: boolean;
    queryInformation: boolean;
    queryScheduler: boolean;
  }

  interface KeyValue {
    key: string;
    value: any;
  }

  interface Line {
    id: string;
    itemOutId: string;
    itemOutSlot: string;
    itemInId: string;
    itemInSlot: string;
    label: string;
  }

  interface RenderedLine {
    id: string;
    from: string; // slotBoxOutId, HTML id
    fromName: string; // slotBoxOutName, QueryCommandItem id
    fromSlot: string;
    fromItem: QueryCommandItemEndpoint;
    to: string; // slotBoxInId, HTML id
    toName: string; // slotBoxInName, QueryCommandItem id
    toSlot: string;
    toItem: QueryCommandItemEndpoint;
    line: any;
    datetime?: number;
  }

  interface QueryParams {
    id?: number;
    pql?: string;
    userID?: string;
    title?: string;
    quid?: string;
    model?: string;
    advanceMode?: boolean;
    query?: string;
    user?: string;
    userQueryID?: number;
    refreshIntervals?: any[];
  }

  interface QuidObject {
    quid: string;
    done: boolean;
    elapsed: number;
    createdDate: string;
    updatedDate: string;
    markDelete: boolean;
    userQueryID: number;
    source: string[];
    sourceRowCount: any;
    state: string;
    message: string;
    rowtotal: number;
  }

  interface QueryResult {
    total: any;
    quid: QuidObject;
    datasets: any;
  }

  interface Metadata {
    id?: number;
    quid?: string;
    table_id?: string;
    column_name?: string;
    is_dttm: boolean;
    groupby: boolean;
    count_distinct?: boolean;
    sum: boolean;
    max: boolean;
    min: boolean;
    avg: boolean;
    filterable: boolean;
    fast_index: boolean;
    verbose_name?: string;
    indexable: boolean;
  }

  interface MetadataColumnWrapper {
    columnName: string;
    metadata: Metadata;
  }

  interface MetadataDatasetWrapper {
    dataset: string;
    columns: MetadataColumnWrapper[];
  }

  interface QueryCommandProperty {
    id?: string;
    commandShow?: string;
    dataContent?: string;
    dataOptions?: any;
    isValueObject: boolean;
    isDisable?: boolean;
    isRequired?: boolean;
    label?: string;
    maxLength?: number;
    minLength?: number;
    name: string;
    placeholder?: string;
    properties: QueryCommandProperty[];
    prefix?: string;
    sufix?: string;
    tooltip?: string;
    tooltipPosition?: string;
    tooltipType?: string;
    toggled_onChange?: string;
    toggledBySelectedValue?: string;
    type?: string;
    value?: any;
    valuetype?: any;
    trigger_from?: any;
    elementId?: any;
    invisible?: any;
    isOnChange?: boolean;
    root_change?: any;
    icon?: any;
    isTriggerOnSelect: boolean;
    subKeyPrefix: string;
    toggledOnCheck: string;
    reversedToggle: boolean;
    triggeredPropValues: any;
    displayed: boolean;
    jsonFile: string;
    readOnly: boolean;
    hasPreSelectedValue: boolean;
  }

  interface QueryCommandItemPropertyAndValue {
    id: string;
    name: string;
    commandProperties: QueryCommandProperty[];
  }

  interface QueryCommandItemOnFocus {
    id: string;
    name: string;
    onFocus: boolean;
  }

  interface EndpointSlot {
    itemName: string;
    slotName: string;
  }

  interface QueryCommandItemEndpointSlotIn {
    isExist: boolean;
    isActive: boolean;
    from?: EndpointSlot[];
  }

  interface QueryCommandItemEndpointSlotOut {
    isExist: boolean;
    isActive: boolean;
    to?: EndpointSlot[];
  }

  interface QueryCommandItemEndpoint {
    id: string;
    name: string;
    resultName: string;
    in: QueryCommandItemEndpointSlotIn;
    multiIn: QueryCommandItemEndpointSlotIn;
    out: QueryCommandItemEndpointSlotOut;
    branch: QueryCommandItemEndpointSlotOut;
    multiOut: QueryCommandItemEndpointSlotOut;
  }

  interface QueryCommandItemDragPosition {
    id: string;
    name: string;
    dragPosition: QueryCommandItemPosition;
  }

  interface QueryCommandItemsWrapper {
    items: QueryCommandItem[];
    propertyAndValues: QueryCommandItemPropertyAndValue[];
    endpoints: QueryCommandItemEndpoint[];
    dragPositions: QueryCommandItemDragPosition[];
  }

  interface ToastrMessage {
    toastrType: string;
    message: string;
    top?: number;
  }

  interface ActionParam {
    paramKey: string;
    paramValue: any;
  }

  interface ActionToDispatch {
    actionName: string;
    actionParams: ActionParam[];
  }
}
