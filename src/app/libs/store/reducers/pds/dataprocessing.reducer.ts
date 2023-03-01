import { ActionCreator, createReducer, Creator, on } from '@ngrx/store';
import _ from 'lodash';

import { DataProcessingState } from 'src/app/libs/store/states/dataprocessing.state';

import {
  AddWorkspaceItem,
  SetWorkspaceItemDragPosition,
  SetWorkspaceItemOnFocus,
  RemoveAllWorkspaceItem,
  RemoveWorkspaceItem,
  ResetWorkspaceItemOnFocus,
  SetWorkspaceItems,
  SetQueryObject,
  GetQueryCommandsSucceed,
  UpdateQueryCommandItemPropertyValue,
  // UpdateQueryCommandItemSequences,
  ResetQueryResult,
  ResetPqlString,
  SetPqlString,
  AddQueryCommandPropertyValue,
  SetIsNodesModelToPql,
  UpdateQueryCommandItemEndpoint,
  UpdateWorkspaceItem,
  SetIsQueryCommandItemRemoveTriggered,
  SetMessage,
  ResetMessage,
  SetIsQueryRequestTriggered,
  SetQueryResult,
  SetIsDatasetListReloadRequestTriggered,
  SetIsWorkspaceResetIsTriggered,
  ResetWorkspace,
  GetQueryResultSucceed,
  SetActiveTable,
  UpdateMetadata,
  SetMetadata,
  SetIsQueryRequestTriggeredSubscribed,
  ResetIsQueryRequestTriggeredSubscribed,
  SetIsQueryRequestFailed,
  SetIsProgressActive,
  RemoveToastrMessage,
  SetToastrMessage,
  SetIsLineRedrawingNeeded,
  UpdateQueryObject,
  SetScaleValue,
  SetIsZoomInOutTriggered,
  SetIsDragEnded,
  ResetMetadata,
  UpdateQueryObjectScheduler,
  ReplaceQueryCommandItemsPropertyAndValue,
  SetDrawingDelay,
  SetIsResultExpanded,
  UpdateQueryCommandItemsEndpoint,
  SetQueryCommandItemEndpoint,
  AddQueryCommandItemEndpointActual,
  SetIsPanzoomResetTriggered,
  AddLine,
  RemoveLine,
  RemoveAllLine,
  AddLines,
} from 'src/app/libs/store/actions/pds/dataprocessing.actions';

const initialDataProcessingState: DataProcessingState = {
  libs: {
    queryCommands: null,
  },
  workspace: {
    queryCommandItems: null,
    queryCommandItemsPropertyAndValue: null,
    queryCommandItemsOnFocus: null,
    queryCommandItemsEndpoint: null,
    queryCommandItemsDragPosition: null,
    // queryCommandItemsSequence: null,

    pqlString: null,
    nodesModel: null,
    lines: null,
    queryResult: null,
    queryObject: null,
    metadatas: null,
    activeTable: null,

    isQueryRequestTriggered: null,
    isQueryRequestTriggeredSubscriber: null,

    isQueryRequestFailed: null,
    isQuerySaveSucceeded: null,
    isMetadataSaveSucceeded: null,

    isNodesModelToPql: null,
    isQueryCommandItemRemoveTriggered: null,
    isDataSourceListReloadRequestTriggered: null,
    isDatasetListReloadRequestTriggered: null,
    isWorkspaceResetIsTriggered: null,
    isLineRedrawingNeeded: null,
    isZoomInOutTriggered: null,
    isDragEnded: null,
    isResultExpanded: null,
    isPanzoomResetTriggered: null,

    scaleValue: 1,
    drawingDelay: 0,
  },
  message: {
    title: '',
    text: '',
  },
  toastrMessages: null,
  isProgressActive: false,
};

export const dataProcessingReducer = createReducer(
  initialDataProcessingState,

  /*
   * LIBS
   */
  on(GetQueryCommandsSucceed, (state: DataProcessingState, props: any) => {
    const libs = { ...state.libs };

    libs.queryCommands = props.queryCommands;

    return {
      ...state,
      libs,
    };
  }),

  /*
   * WORKSPACE
   */
  on(ResetWorkspace, (state) => {
    const workspace = { ...state.workspace };

    workspace.queryCommandItems = null;
    workspace.queryCommandItemsPropertyAndValue = null;
    workspace.queryCommandItemsOnFocus = null;
    workspace.queryCommandItemsEndpoint = null;
    workspace.queryCommandItemsDragPosition = null;
    // workspace.queryCommandItemsSequence = null;

    workspace.nodesModel = null;
    workspace.pqlString = null;
    workspace.queryResult = null;
    workspace.queryObject = null;
    workspace.metadatas = null;
    workspace.activeTable = null;

    workspace.isQueryRequestTriggered = null;
    workspace.isQueryRequestTriggeredSubscriber = null;

    workspace.isQueryRequestFailed = null;
    workspace.isQuerySaveSucceeded = null;
    workspace.isMetadataSaveSucceeded = null;

    workspace.isNodesModelToPql = null;
    workspace.isQueryCommandItemRemoveTriggered = null;
    workspace.isDatasetListReloadRequestTriggered = null;
    workspace.isWorkspaceResetIsTriggered = true;

    return {
      ...state,
      workspace,
    };
  }),
  on(AddWorkspaceItem, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    const queryCommandItems =
      workspace.queryCommandItems && workspace.queryCommandItems.length > 0 ? [...workspace.queryCommandItems] : [];
    queryCommandItems.push(props.queryCommandItem);

    const queryCommandItemsPropertyAndValue =
      workspace.queryCommandItemsPropertyAndValue && workspace.queryCommandItemsPropertyAndValue.length > 0
        ? [...workspace.queryCommandItemsPropertyAndValue]
        : [];
    queryCommandItemsPropertyAndValue.push(props.queryCommandItemPropertyValue);

    const queryCommandItemsOnFocus =
      workspace.queryCommandItemsOnFocus && workspace.queryCommandItemsOnFocus.length > 0
        ? [...workspace.queryCommandItemsOnFocus]
        : [];
    queryCommandItemsOnFocus.push(props.queryCommandItemOnFocus);

    const queryCommandItemsDragPosition =
      workspace.queryCommandItemsDragPosition && workspace.queryCommandItemsDragPosition.length > 0
        ? [...workspace.queryCommandItemsDragPosition]
        : [];
    queryCommandItemsDragPosition.push(props.queryCommandItemDragPosition);

    // console.log('workspace.queryCommandItemsSequence', workspace.queryCommandItemsSequence);

    // let queryCommandItemsSequence = null;
    // if (workspace.queryCommandItemsSequence && workspace.queryCommandItemsSequence.length > 0) {
    //   let isExists = false;
    //   queryCommandItemsSequence = workspace.queryCommandItemsSequence.map((queryCommandItemSequence) => {
    //     if (props.queryCommandItemSequence.key === queryCommandItemSequence.key) {
    //       isExists = true;
    //       return {
    //         ...queryCommandItemSequence,
    //         count: props.queryCommandItemSequence.count,
    //       };
    //     }

    //     return {
    //       ...queryCommandItemSequence,
    //     };
    //   });

    //   if (!isExists) {
    //     queryCommandItemsSequence.push(props.queryCommandItemSequence);
    //   }
    // } else {
    //   queryCommandItemsSequence = [props.queryCommandItemSequence];
    // }

    // console.log('queryCommandItemsSequence', queryCommandItemsSequence)

    workspace.queryCommandItems = queryCommandItems;
    workspace.queryCommandItemsPropertyAndValue = queryCommandItemsPropertyAndValue;
    workspace.queryCommandItemsOnFocus = queryCommandItemsOnFocus;
    workspace.queryCommandItemsDragPosition = queryCommandItemsDragPosition;
    // workspace.queryCommandItemsSequence = queryCommandItemsSequence;

    return {
      ...state,
      workspace,
    };
  }),
  on(AddQueryCommandItemEndpointActual, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    const queryCommandItemsEndpoint =
    workspace.queryCommandItemsEndpoint && workspace.queryCommandItemsEndpoint.length > 0
      ? [...workspace.queryCommandItemsEndpoint]
      : [];
    queryCommandItemsEndpoint.push(props.itemEndpoint);

    workspace.queryCommandItemsEndpoint = queryCommandItemsEndpoint;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetWorkspaceItems, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    workspace.queryCommandItems = props.queryCommandItems;
    workspace.queryCommandItemsPropertyAndValue = props.queryCommandItemsPropertyAndValue;
    workspace.queryCommandItemsOnFocus = props.queryCommandItemsOnFocus;
    workspace.queryCommandItemsDragPosition = props.queryCommandItemsDragPosition;
    // workspace.queryCommandItemsSequence = props.queryCommandItemsSequence;
    workspace.queryCommandItemsEndpoint = props.queryCommandItemsEndpoint;

    return {
      ...state,
      workspace,
    };
  }),
  on(UpdateWorkspaceItem, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    const queryCommandItemsPropertyAndValue = workspace.queryCommandItemsPropertyAndValue.map(
      (queryCommandItemPropertyAndValue) => {
        if (queryCommandItemPropertyAndValue.id === props.queryCommandItemPropertyAndValue.id) {
          return {
            ...queryCommandItemPropertyAndValue,
            commandProperties: props.queryCommandItemPropertyAndValue.commandProperties,
          } as QueryCommandItemPropertyAndValue;
        }

        return {
          ...queryCommandItemPropertyAndValue,
        } as QueryCommandItemPropertyAndValue;
      }
    );

    const queryCommandItemsEndpoint = workspace.queryCommandItemsEndpoint.map((queryCommandItemEndpoint) => {
      if (queryCommandItemEndpoint.id === props.queryCommandItemEndpoint.id) {
        return {
          ...queryCommandItemEndpoint,
          in: props.queryCommandItemEndpoint.in,
          multiIn: props.queryCommandItemEndpoint.multiIn,
          out: props.queryCommandItemEndpoint.out,
          branch: props.queryCommandItemEndpoint.branch,
          multiOut: props.queryCommandItemEndpoint.multiOut,
        } as QueryCommandItemEndpoint;
      }

      return {
        ...queryCommandItemEndpoint,
      } as QueryCommandItemEndpoint;
    });

    // console.log('queryCommandItemsEndpoint', queryCommandItemsEndpoint)

    workspace.queryCommandItemsPropertyAndValue = queryCommandItemsPropertyAndValue;
    workspace.queryCommandItemsEndpoint = queryCommandItemsEndpoint;

    return {
      ...state,
      workspace,
    };
  }),
  on(RemoveWorkspaceItem, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    const _queryCommandItems = _.cloneDeep(workspace.queryCommandItems);
    const _queryCommandItemsPropertyAndValue = _.cloneDeep(workspace.queryCommandItemsPropertyAndValue);
    const _queryCommandItemsOnFocus = _.cloneDeep(workspace.queryCommandItemsOnFocus);
    const _queryCommandItemsEndpoint = _.cloneDeep(workspace.queryCommandItemsEndpoint);
    const _queryCommandItemsDragPosition = _.cloneDeep(workspace.queryCommandItemsDragPosition);

    // const _queryCommandItemsSequence = _.cloneDeep(workspace.queryCommandItemsSequence);

    // workspace.pqlString = null;
    workspace.nodesModel = null;
    workspace.isNodesModelToPql = false;
    workspace.isQueryCommandItemRemoveTriggered = true;
    workspace.queryResult = null;

    if (_queryCommandItems && _queryCommandItems.length > 0) {
      const queryCommandItems = _queryCommandItems.filter((item) => item.id !== props.queryCommandItem.id);
      workspace.queryCommandItems = queryCommandItems;
    }

    if (_queryCommandItemsPropertyAndValue && _queryCommandItemsPropertyAndValue.length > 0) {
      const queryCommandItemsPropertyAndValue = _queryCommandItemsPropertyAndValue.filter(
        (item) => item.id !== props.queryCommandItem.id
      );
      workspace.queryCommandItemsPropertyAndValue = queryCommandItemsPropertyAndValue;
    }

    if (_queryCommandItemsOnFocus && _queryCommandItemsOnFocus.length > 0) {
      const queryCommandItemsOnFocus = _queryCommandItemsOnFocus.filter(
        (item) => item.id !== props.queryCommandItem.id
      );
      workspace.queryCommandItemsOnFocus = queryCommandItemsOnFocus;
    }

    if (_queryCommandItemsEndpoint && _queryCommandItemsEndpoint.length > 0) {
      const queryCommandItemsEndpoint = _queryCommandItemsEndpoint.filter(
        (item) => item.id !== props.queryCommandItem.id
      );
      workspace.queryCommandItemsEndpoint = queryCommandItemsEndpoint;
    }

    if (_queryCommandItemsDragPosition && _queryCommandItemsDragPosition.length > 0) {
      const queryCommandItemsDragPosition = _queryCommandItemsDragPosition.filter(
        (item) => item.id !== props.queryCommandItem.id
      );
      workspace.queryCommandItemsDragPosition = queryCommandItemsDragPosition;
    }

    // const _matches = props.queryCommandItem.id.match(/^([A-Z]+)_([0-9]+)$/);
    // workspace.queryCommandItemsSequence = _queryCommandItemsSequence.map((_itemSequence: QueryCommandItemSequence) => {
    //   if (_itemSequence.key === _matches[1]) {
    //     return {
    //       ..._itemSequence,
    //       count: _itemSequence.count - 1
    //     };
    //   }

    //   return _itemSequence;
    // });

    return {
      ...state,
      workspace,
    };
  }),
  on(RemoveAllWorkspaceItem, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    workspace.queryCommandItems = null;
    workspace.queryCommandItemsPropertyAndValue = null;
    workspace.queryCommandItemsOnFocus = null;
    workspace.queryCommandItemsEndpoint = null;
    workspace.queryCommandItemsDragPosition = null;
    // workspace.queryCommandItemsSequence = null;

    if (!props.itemsOnly) {
      workspace.pqlString = null;
      workspace.nodesModel = null;

      workspace.queryResult = null;

      workspace.isNodesModelToPql = null;
    }

    return {
      ...state,
      workspace,
    };
  }),
  on(SetWorkspaceItemDragPosition, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    const _queryCommandItemsDragPosition = _.cloneDeep(workspace.queryCommandItemsDragPosition);
    const queryCommandItemsDragPosition = _queryCommandItemsDragPosition.map(
      (itemDragPosition: QueryCommandItemDragPosition) => {
        if (itemDragPosition.id === props.id) {
          itemDragPosition.dragPosition = props.dragPosition;
        }

        return { ...itemDragPosition };
      }
    );
    workspace.queryCommandItemsDragPosition = queryCommandItemsDragPosition;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetWorkspaceItemOnFocus, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    const _queryCommandItemsOnFocus = _.cloneDeep(workspace.queryCommandItemsOnFocus);
    const queryCommandItemsOnFocus = _queryCommandItemsOnFocus.map((item: QueryCommandItemOnFocus) => {
      item.onFocus = false;

      if (item.id === props.id) {
        item.onFocus = true;
      }

      return { ...item };
    });
    workspace.queryCommandItemsOnFocus = queryCommandItemsOnFocus;

    return {
      ...state,
      workspace,
    };
  }),
  on(ResetWorkspaceItemOnFocus, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    if (workspace.queryCommandItemsOnFocus) {
      const _queryCommandItemsOnFocus = _.cloneDeep(workspace.queryCommandItemsOnFocus);
      const queryCommandItemsOnFocus = _queryCommandItemsOnFocus.map((item: QueryCommandItemOnFocus) => {
        return {
          ...item,
          onFocus: false,
        };
      });
      workspace.queryCommandItemsOnFocus = queryCommandItemsOnFocus;

      return {
        ...state,
        workspace,
      };
    }

    return state;
  }),
  // on(UpdateQueryCommandItemSequences, (state: DataProcessingState, props: any) => {
  //   const workspace = { ...state.workspace };
  //   workspace.queryCommandItemsSequence = props.queryCommandItemsSequence;

  //   return {
  //     ...state,
  //     workspace,
  //   };
  // }),
  on(AddQueryCommandPropertyValue, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    const _queryCommandItemPropertyValues = workspace.queryCommandItemsPropertyAndValue
      ? [...workspace.queryCommandItemsPropertyAndValue]
      : [];
    const existingQueryCommandItemPropertyValue = _.find(
      _queryCommandItemPropertyValues,
      (_queryCommandItemPropertyValue) => _queryCommandItemPropertyValue.name === props.queryItem.name
    );
    // console.log('existingQueryCommandItemPropertyValue', props.queryItem.name, existingQueryCommandItemPropertyValue)

    let queryCommandItemsPropertyAndValue = [];
    if (existingQueryCommandItemPropertyValue) {
      queryCommandItemsPropertyAndValue = _queryCommandItemPropertyValues.map((_queryCommandItemPropertyValue) => {
        if (_queryCommandItemPropertyValue.name === props.queryItem.name) {
          const existingCommandProperty = _.find(
            _queryCommandItemPropertyValue.commandProperties,
            (commandProperty) => commandProperty.name === props.commandProperty.name
          );

          // console.log('existingCommandProperty', props.commandProperty.name, existingCommandProperty)

          if (existingCommandProperty) {
            const commandProperties = _queryCommandItemPropertyValue.commandProperties.map((commandProperty) => {
              if (commandProperty.name === props.commandProperty.name) {
                return {
                  ...commandProperty,
                  value: props.value,
                };
              }

              return commandProperty;
            });

            return {
              ...existingQueryCommandItemPropertyValue,
              commandProperties,
            };
          } else {
            return {
              ...existingQueryCommandItemPropertyValue,
              commandProperties: [
                ..._queryCommandItemPropertyValue.commandProperties,
                {
                  ...props.commandProperty,
                  value: props.value,
                },
              ],
            };
          }
        }
      });
    } else {
      queryCommandItemsPropertyAndValue.push({
        ...props.queryItem,
        commandProperties: [
          {
            ...props.commandProperty,
            value: props.value,
          },
        ],
      });
    }

    // console.log('queryCommandItemsPropertyAndValue', queryCommandItemsPropertyAndValue)

    workspace.queryCommandItemsPropertyAndValue = queryCommandItemsPropertyAndValue;

    return {
      ...state,
      workspace,
    };
  }),
  on(UpdateQueryCommandItemPropertyValue, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    if (workspace.queryCommandItemsPropertyAndValue) {
      const _queryCommandItemPropertyValues = [...workspace.queryCommandItemsPropertyAndValue];
      // console.log('_queryCommandItemPropertyValues', _queryCommandItemPropertyValues)
      const queryCommandItemsPropertyAndValue = _queryCommandItemPropertyValues.map(
        (queryCommandPropertyValue: any) => {
          if (queryCommandPropertyValue.name === props.item.name) {
            const _queryCommandProperties = [...queryCommandPropertyValue.commandProperties];
            const queryCommandProperties = _queryCommandProperties.map((queryCommandProperty: any) => {
              if (queryCommandProperty.name === props.propName) {
                // console.log('value changed!', props.propValue)
                return {
                  ...queryCommandProperty,
                  value: props.propValue,
                };
              }

              return { ...queryCommandProperty };
            });

            return {
              ...queryCommandPropertyValue,
              commandProperties: queryCommandProperties,
            };
          }

          return {
            ...queryCommandPropertyValue,
          };
        }
      );

      workspace.queryCommandItemsPropertyAndValue = queryCommandItemsPropertyAndValue;
    }

    return {
      ...state,
      workspace,
    };
  }),
  on(ReplaceQueryCommandItemsPropertyAndValue, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    workspace.queryCommandItemsPropertyAndValue = props.queryCommandItemsPropertyAndValue;

    return {
      ...state,
      workspace,
    };
  }),
  on(UpdateQueryCommandItemsEndpoint, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    let queryCommandItemsEndpoint = [...workspace.queryCommandItemsEndpoint];

    props.queryCommandItemsEndpoint.forEach((_updatedItemEndpoint) => {
      queryCommandItemsEndpoint = queryCommandItemsEndpoint.map((_itemEndpoint) => {
        if (_itemEndpoint.id === _updatedItemEndpoint.id) {
          return {..._itemEndpoint, ..._updatedItemEndpoint};
        }

        return {..._itemEndpoint};
      });

    });

    workspace.queryCommandItemsEndpoint = queryCommandItemsEndpoint;

    return {
      ...state,
      workspace,
    };
  }),
  on(UpdateQueryCommandItemEndpoint, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    const queryCommandItemsEndpoint = workspace.queryCommandItemsEndpoint ? workspace.queryCommandItemsEndpoint.map((item: QueryCommandItemEndpoint) => {
      if (item.id === props.id) {
        const _item = _.cloneDeep(item);

        props.objs.forEach((keyValue) => {
          _item[keyValue.key] = keyValue.value;
        });

        return {
          ..._item,
        };
      }

      return { ...item };
    }) : [];

    workspace.queryCommandItemsEndpoint = queryCommandItemsEndpoint;

    return {
      ...state,
      workspace,
    };
  }),
  on(GetQueryResultSucceed, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.queryResult = props.queryResult;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetQueryResult, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    const datasets = { ...workspace.queryResult.datasets };
    const { quid, total } = props.queryResult;
    for (const key in props.queryResult.datasets) {
      if (key in workspace.queryResult.datasets) {
        datasets[key] = props.queryResult.datasets[key];
      }
    }
    workspace.queryResult = { datasets, quid, total };

    return {
      ...state,
      workspace,
    };
  }),
  on(ResetQueryResult, (state: DataProcessingState) => {
    const workspace = { ...state.workspace };

    workspace.queryResult = null;
    // workspace.queryObject = null;
    // workspace.metadatas = null;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetPqlString, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.pqlString = props.pql;

    return {
      ...state,
      workspace,
    };
  }),
  on(ResetPqlString, (state: DataProcessingState) => {
    const workspace = { ...state.workspace };
    workspace.pqlString = null;

    return {
      ...state,
      workspace,
    };
  }),
  on(AddLine, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    if (!workspace.lines) {
      workspace.lines = [];
    }

    workspace.lines = [...workspace.lines, ...[props.line]];

    return {
      ...state,
      workspace,
    };
  }),
  on(AddLines, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    if (!workspace.lines) {
      workspace.lines = [];
    }

    workspace.lines = [...workspace.lines, ...props.lines];

    return {
      ...state,
      workspace,
    };
  }),
  on(RemoveLine, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    
    workspace.lines = workspace.lines.filter((_line: Line) => _line.id !== props.line.id);

    // console.log('workspace.lines', workspace.lines)

    return {
      ...state,
      workspace,
    };
  }),
  on(RemoveAllLine, (state: DataProcessingState) => {
    const workspace = { ...state.workspace };
    
    workspace.lines = [];

    return {
      ...state,
      workspace,
    };
  }),
  on(ResetMetadata, (state: DataProcessingState) => {
    const workspace = { ...state.workspace };
    workspace.metadatas = null;
    return {
      ...state,
      workspace,
    };
  }),
  on(SetMetadata, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    const { columnName, dataset, metadata } = props;

    let metadatas: MetadataDatasetWrapper[] = [];
    metadatas = workspace.metadatas && workspace.metadatas.length > 0 ? [...workspace.metadatas] : [];
    const dsExist = metadatas.find((x) => x.dataset === dataset);
    if (dsExist) {
      metadatas = metadatas.map((md) => {
        if (md.dataset === dataset) {
          if (!md.columns.some((col) => col.columnName === columnName)) {
            return {
              ...md,
              columns: [...md.columns, { columnName, metadata }],
            };
          }
        }
        return { ...md };
      });
    } else {
      metadatas.push({
        dataset,
        columns: [{ columnName, metadata }],
      });
    }

    workspace.metadatas = metadatas;

    return {
      ...state,
      workspace,
    };
  }),
  on(UpdateMetadata, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    const metadatas =
      workspace.metadatas && workspace.metadatas.length > 0
        ? workspace.metadatas.map((metadata: MetadataDatasetWrapper) => {
            if (metadata.dataset === props.dataset) {
              const columns = metadata.columns.map((column) => {
                if (column.columnName === props.columnName) {
                  return {
                    ...column,
                    metadata: props.metadata,
                  };
                }

                return {
                  ...column,
                };
              });

              return {
                ...metadata,
                columns,
              };
            }

            return {
              ...metadata,
            };
          })
        : null;

    workspace.metadatas = metadatas;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsNodesModelToPql, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isNodesModelToPql = props.isNodesModelToPql;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsQueryCommandItemRemoveTriggered, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isQueryCommandItemRemoveTriggered = props.isQueryCommandItemRemoveTriggered;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsQueryRequestTriggered, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isQueryRequestTriggered = props.isQueryRequestTriggered;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsQueryRequestTriggeredSubscribed, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    const isQueryRequestTriggeredSubscriber =
      workspace.isQueryRequestTriggeredSubscriber && workspace.isQueryRequestTriggeredSubscriber.length > 0
        ? [...workspace.isQueryRequestTriggeredSubscriber]
        : [];

    if (isQueryRequestTriggeredSubscriber.indexOf(props.id) < 0) isQueryRequestTriggeredSubscriber.push(props.id);

    workspace.isQueryRequestTriggeredSubscriber = isQueryRequestTriggeredSubscriber;

    return {
      ...state,
      workspace,
    };
  }),
  on(ResetIsQueryRequestTriggeredSubscribed, (state) => {
    const workspace = { ...state.workspace };
    workspace.isQueryRequestTriggeredSubscriber = null;

    return {
      ...state,
      workspace,
    };
  }),
  on(
    { type: 'SetIsDataSourceListReloadRequestTriggered' } as ActionCreator,
    (state, props: { type: string; isDataSourceListReloadRequestTriggered: boolean }) => {
      const workspace = { ...state.workspace };
      workspace.isDataSourceListReloadRequestTriggered = props.isDataSourceListReloadRequestTriggered;

      return {
        ...state,
        workspace,
      };
    }
  ),
  on(SetIsDatasetListReloadRequestTriggered, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isDatasetListReloadRequestTriggered = props.isDatasetListReloadRequestTriggered;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsQueryRequestFailed, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isQueryRequestFailed = props.isQueryRequestFailed;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsWorkspaceResetIsTriggered, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isWorkspaceResetIsTriggered = props.isWorkspaceResetIsTriggered;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsLineRedrawingNeeded, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isLineRedrawingNeeded = props.isLineRedrawingNeeded;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetDrawingDelay, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.drawingDelay = props.drawingDelay;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsZoomInOutTriggered, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isZoomInOutTriggered = props.isZoomInOutTriggered;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsDragEnded, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isDragEnded = props.isDragEnded;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsResultExpanded, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isResultExpanded = props.isResultExpanded;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetIsPanzoomResetTriggered, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.isPanzoomResetTriggered = props.isPanzoomResetTriggered;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetQueryObject, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.queryObject = props.queryObject;

    return {
      ...state,
      workspace,
    };
  }),
  on(UpdateQueryObject, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    const queryObject = {
      ID: props.queryObject.ID ? props.queryObject.ID : workspace.queryObject.ID,
      title: props.queryObject.title ? props.queryObject.title : workspace.queryObject.title,
      quid: props.queryObject.quid ? props.queryObject.quid : workspace.queryObject.quid,
      lastRun: props.queryObject.lastRun ? props.queryObject.lastRun : workspace.queryObject.lastRun,
    };

    workspace.queryObject = { ...workspace.queryObject, ...queryObject };

    return {
      ...state,
      workspace,
    };
  }),
  on(UpdateQueryObjectScheduler, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };

    const queryObject: QueryObject = {
      ...workspace.queryObject,
    };

    if (props.interval) {
      queryObject.refreshInterval = props.interval;
    }

    if (props.additionalIntervals) {
      queryObject.additionalRefreshInterval = props.additionalIntervals;
    }

    workspace.queryObject = queryObject;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetActiveTable, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.activeTable = props.activeTable;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetScaleValue, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.scaleValue = props.scaleValue;

    return {
      ...state,
      workspace,
    };
  }),
  on(SetMessage, (state: DataProcessingState, props: any) => {
    return {
      ...state,
      message: {
        title: props.title,
        text: props.text,
      },
    };
  }),
  on(ResetMessage, (state) => {
    return {
      ...state,
      message: {
        title: '',
        text: '',
      },
    };
  }),
  on(SetToastrMessage, (state: DataProcessingState, props: any) => {
    let toastrMessages = state.toastrMessages && state.toastrMessages.length > 0 ? [...state.toastrMessages] : null;
    if (!toastrMessages || (toastrMessages && toastrMessages.length === 0)) {
      toastrMessages = [];
    }
    toastrMessages.push(props.toastrMessage);

    return {
      ...state,
      toastrMessages,
    };
  }),
  on(RemoveToastrMessage, (state: DataProcessingState, props: any) => {
    const _toastrMessages = [...state.toastrMessages];
    const toastrMessages = _toastrMessages.filter((_toastrMessage, i) => i !== props.index);

    return {
      ...state,
      toastrMessages,
    };
  }),
  on(SetIsProgressActive, (state: DataProcessingState, props: any) => {
    return {
      ...state,
      isProgressActive: props.isProgressActive,
    };
  }),
  on(SetQueryCommandItemEndpoint, (state: DataProcessingState, props: any) => {
    const workspace = { ...state.workspace };
    workspace.queryCommandItemsEndpoint = props.queryCommandItemsEndpoint;

    return {
      ...state,
      workspace,
    };
  })
);
