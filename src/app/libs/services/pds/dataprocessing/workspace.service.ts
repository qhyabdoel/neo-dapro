import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { Subscription, filter, lastValueFrom, take } from 'rxjs';
import _ from 'lodash';

import { QueryCommand, QueryCommandItem, User } from 'src/app/libs/models';
import {
  AddWorkspaceItem,
  ResetQueryResult,
  ResetPqlString,
  RemoveWorkspaceItem,
  SetIsQueryRequestTriggered,
  SetPqlString,
  SetWorkspaceItems,
  UpdateQueryCommandItemEndpoint,
  UpdateWorkspaceItem,
  SetIsProgressActive,
  SetIsDatasetListReloadRequestTriggered,
  SetQueryObject,
  UpdateQueryObject,
  SetToastrMessage,
  UpdateQueryCommandItemPropertyValue,
  SetDrawingDelay,
  UpdateQueryCommandItemsEndpoint,
  AddQueryCommandItemEndpoint,
  SetIsNodesModelToPql,
  AddLine,
  RemoveAllLine,
  RemoveLine,
  AddLines,
  SetIsLineRedrawingNeeded,
} from 'src/app/libs/store/actions/pds/dataprocessing.actions';
import { AppState } from 'src/app/libs/store/states';
import { ApiService, TranslationService } from 'src/app/libs/services';
import {
  queryObjectSelector,
  isNodesModelToPqlSelector,
  pqlStringSelector,
  queryCommandItemsDragPositionSelector,
  queryCommandItemsEndpointSelector,
  queryCommandItemsPropertyAndValueSelector,
  queryCommandItemsSelector,
  queryCommandsSelector,
  metadatasSelector,
  activeTableSelector,
  linesSelector,
} from 'src/app/libs/store/selectors/dataprocessing.selectors';

import queryCmdProps from 'src/assets/data/dataprocessing/query-cmd-props.json';
import queryCmdBtnCfgs_EN from 'src/assets/data/dataprocessing/query-cmd-cfgs_en.json';
import queryCmdBtnCfgs_ID from 'src/assets/data/dataprocessing/query-cmd-cfgs_id.json';
import queryCmdUICfgs_EN from 'src/assets/data/dataprocessing/query-cmd-ui-cfgs_en.json';
import queryCmdUICfgs_ID from 'src/assets/data/dataprocessing/query-cmd-ui-cfgs_id.json';
import { getTextCollections, queryCommandItemPropertyAndValueIsValid, updateQueryCommandItemPropertyAndValue } from 'src/app/libs/helpers/data-processing.helper';
import { UserSelector } from 'src/app/libs/store/selectors/authentication.selectors';
import { timezoneOffset } from 'src/app/libs/helpers/utility';
import { v4 as uuid } from 'uuid';

declare var LeaderLine: any;
declare var document: any;

@Injectable()
export class WorkspaceService implements OnDestroy {
  private activeTable: string;
  private isNodesModelToPql: boolean;
  private itemsDragPosition: QueryCommandItemDragPosition[];
  private itemsEndpoint: QueryCommandItemEndpoint[];
  private itemsPropertyAndValue: QueryCommandItemPropertyAndValue[];
  private lang: string;
  private lines: Line[];
  private metadatas: MetadataDatasetWrapper[];
  private pqlString: string;
  private queryCommands: QueryCommand[];
  private queryCommandItems: QueryCommandItem[];
  private queryObject: QueryObject;
  private subscriptions: Subscription[] = [];
  private textCollections: any = null;
  private user: User;

  constructor(
    private apiService: ApiService,
    private store: Store<AppState>,
    private translationService: TranslationService
  ) {
    this.lang = this.translationService.getSelectedLanguage();
    this.textCollections = getTextCollections();

    // UserSelector
    this.subscriptions.push(
      this.store.select(UserSelector).subscribe((_user: User) => this.user = _user)
    );

    // isNodesModelToPqlSelector
    this.subscriptions.push(
      this.store.select(isNodesModelToPqlSelector).subscribe((_isNodesModelToPql) => this.isNodesModelToPql = _isNodesModelToPql)
    );

    // pqlStringSelector
    this.subscriptions.push(
      this.store.select(pqlStringSelector).subscribe((_pqlString) => this.pqlString = _pqlString)
    );

    // queryCommandItemsEndpointSelector
    this.subscriptions.push(
      this.store.select(queryCommandItemsEndpointSelector).subscribe((_itemsEndpoint) => this.itemsEndpoint = _itemsEndpoint)
    );

    // linesSelector
    this.subscriptions.push(
      this.store.select(linesSelector).subscribe((_lines) => this.lines = _lines)
    );

    // queryCommandItemsPropertyAndValueSelector
    this.subscriptions.push(
      this.store.select(queryCommandItemsPropertyAndValueSelector).subscribe((_itemsPropertyAndValue) => this.itemsPropertyAndValue = _itemsPropertyAndValue)
    );

    // queryCommandItemsDragPositionSelector
    this.subscriptions.push(
      this.store.select(queryCommandItemsDragPositionSelector).subscribe((_itemsDragPosition) => this.itemsDragPosition = _itemsDragPosition)
    );

    // queryCommandsSelector
    this.subscriptions.push(
      this.store.select(queryCommandsSelector).subscribe((_queryCommands) => this.queryCommands = _queryCommands)
    );

    // queryCommandItemsSelector
    this.subscriptions.push(
      this.store.select(queryCommandItemsSelector).subscribe((_queryCommandItems) => {
        this.queryCommandItems = [];

        if (_queryCommandItems && _queryCommandItems.length > 0) {
          this.queryCommandItems = _queryCommandItems;
        }
      })
    );

    // queryObjectSelector
    this.subscriptions.push(
      this.store.select(queryObjectSelector).subscribe((_queryObject) => this.queryObject = _queryObject)
    );

    // activeTableSelector
    this.subscriptions.push(
      this.store.select(activeTableSelector).subscribe((_activeTable) => this.activeTable = _activeTable)
    );

    // metadatasSelector
    this.subscriptions.push(
      this.store.select(metadatasSelector).subscribe((_metadatas) => this.metadatas = _metadatas)
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((_subscription) => _subscription.unsubscribe());
  }

  createQueryCommandItem(queryCommand: QueryCommand, wrappedNode: any = null, models: any = null) {
    let commandPropertyValue = null;
    let neighbourItems: QueryCommandItemEndpoint[] = [];

    if (wrappedNode) {
      commandPropertyValue = wrappedNode.props;
    }
    // console.log('commandPropertyValue', commandPropertyValue);

    const btnCfgs = this.lang === 'en' ? queryCmdBtnCfgs_EN : queryCmdBtnCfgs_ID;
    const uiCfgs = this.lang === 'en' ? queryCmdUICfgs_EN : queryCmdUICfgs_ID;

    // console.log('wrappedNode', wrappedNode);

    let itemSeq = 0;
    if (wrappedNode && wrappedNode.id) {
      const matches = wrappedNode.id.match(/^([A-Z]+)_([0-9]+)$/);
      itemSeq = parseInt(matches[2]);
    } else {
      const filteredQueryCommandItems: QueryCommandItem[] = this.queryCommandItems.filter((_item) => {
        const matches = _item.id.match(/^([A-Z]+)_([0-9]+)$/);
        return matches && matches[1] === queryCommand.name.toUpperCase();
      });
      // console.log('filteredQueryCommandItems', filteredQueryCommandItems)
      if (filteredQueryCommandItems && filteredQueryCommandItems.length > 0) {
        let biggestTmp = 0;
        for (const _item of filteredQueryCommandItems) {
          const matches = _item.id.match(/^([A-Z]+)_([0-9]+)$/);
          const _num = parseInt(matches[2]);
          if (_num > biggestTmp) {
            biggestTmp = _num;
          }
        };
        itemSeq = biggestTmp + 1;
      }
    }
    // console.log('itemSeq', itemSeq);

    const id = `${queryCommand.name.toUpperCase()}_${itemSeq}`;
    const name = `${queryCommand.alias}${itemSeq}_${moment(new Date()).format('YYYYMMDDhhmmssSS')}`;
    const alias = `${queryCommand.alias}${itemSeq}`;

    const queryCommandItem: QueryCommandItem = new QueryCommandItem();
    queryCommandItem.id = id;
    queryCommandItem.idNum = queryCommand.idNum;
    queryCommandItem.name = name;
    queryCommandItem.nodeType = queryCommand.name;
    queryCommandItem.alias = alias;
    queryCommandItem.title = queryCommand.title;
    queryCommandItem.text = queryCommand.text;
    queryCommandItem.label = queryCommand.label;
    queryCommandItem.image = queryCommand.image;
    queryCommandItem.buttonClass = queryCommand.buttonClass;
    queryCommandItem.labelLine = queryCommand.label;
    queryCommandItem.tooltip = queryCommand.description;
    queryCommandItem.isNotifyOnQuerySuccess = !!queryCommand.isNotifyOnQuerySuccess;
    queryCommandItem.actionToDispatchOnQuerySuccess = queryCommand.actionToDispatchOnQuerySuccess;

    // console.log('queryCommandItem', queryCommandItem)

    const commandProperties = uiCfgs[queryCommand.name.toUpperCase()]
      ? uiCfgs[queryCommand.name.toUpperCase()].properties
      : [];
    // console.log('commandProperties', commandProperties)

    const queryCommandItemPropertyValue: QueryCommandItemPropertyAndValue = {
      id: queryCommandItem.id,
      name: queryCommandItem.name,
      commandProperties: [],
    };

    // commandProperties is filtered JSON properties lib
    if (commandProperties && commandProperties.length > 0) {
      commandProperties.forEach((commandProperty, i) => {
        // console.log('commandProperty', commandProperty);
        // console.log('commandPropertyValue', commandPropertyValue);

        const newCommandProperty = {
          ...commandProperty,
        };
        // console.log('newCommandProperty', newCommandProperty);

        // gives default value to 'into' prop
        if (commandProperty.name === 'into') {
          newCommandProperty.value = `${queryCommand.alias}result_${itemSeq}`;
        }

        // if query command is SEARCH gives default value to 'label' prop
        if (queryCommand.name === 'search' && commandProperty.name === 'label') {
          newCommandProperty.value = `${queryCommand.alias}result_${itemSeq}`;
        }

        // override all values
        if (commandPropertyValue) {
          if (commandPropertyValue[commandProperty.name]) {
            // not null | not empty string
            // console.log('prop does exist in level 1', commandProperty.name);
            newCommandProperty.value = commandPropertyValue[commandProperty.name];

            if (commandProperty.name === 'src' || commandProperty.name === 'ref') {
              newCommandProperty.value = commandProperty.value.map((_cmdProp) => {
                return {
                  ..._cmdProp,
                  value: commandPropertyValue[commandProperty.name][_cmdProp.name]
                };
              });
            }
          } else {
            // hmmm maybe it is an object
            // console.log('prop does not exist in level 1')
            Object.keys(commandPropertyValue).forEach((keyProp) => {
              if (
                typeof commandPropertyValue[keyProp] === 'object' &&
                commandPropertyValue[keyProp] &&
                commandPropertyValue[keyProp][commandProperty.name]
              ) {
                // console.log('prop does exist in level 2', commandProperty.name)
                newCommandProperty.value = commandPropertyValue[keyProp][commandProperty.name];
              }
            });
          }
        }

        // pushed all arranged props into queryCommandItemPropertyValue
        queryCommandItemPropertyValue.commandProperties.push(newCommandProperty);
      });
    }

    const queryCommandItemOnFocus: QueryCommandItemOnFocus = {
      id: queryCommandItem.id,
      name: queryCommandItem.name,
      onFocus: false,
    };

    let endpoint = {
      in: {
        isExist: btnCfgs[queryCommand.name.toUpperCase()].in,
        isActive: false,
        from: null,
      },
      multiIn: {
        isExist: btnCfgs[queryCommand.name.toUpperCase()].multiIn,
        isActive: false,
        from: null,
      },
      out: {
        isExist: btnCfgs[queryCommand.name.toUpperCase()].out,
        isActive: false,
        to: null,
      },
      branch: {
        isExist: btnCfgs[queryCommand.name.toUpperCase()].branch,
        isActive: false,
        to: null,
      },
      multiOut: {
        isExist: btnCfgs[queryCommand.name.toUpperCase()].multiOut,
        isActive: false,
        to: null,
      },
    };

    if (models && models.length > 0) {
      const filteredModels = models.filter((model) => {
        // const matches = model.id.match(/^([A-Z]+)_([0-9]+)$/);
        // return matches[1] === queryCommand.name.toUpperCase();
        return model.id === wrappedNode.id;
      });

      if (filteredModels.length > 0) {
        // console.log('filteredModels', filteredModels);
        let outFilteredModels = null;
        let inFilteredModels = null;
        let inFromItem: QueryCommandItemEndpoint = null;
        let inFromSlot = '';
        let multiInFromSlot = '';
        let outToItem: QueryCommandItemEndpoint = null;
        let outToSlot = '';
        let multiOutToSlot = '';
        let branchToSlot = '';

        if (filteredModels[0].in && filteredModels[0].in.length > 0) {
          if (filteredModels[0].in[0]) {
            // IN
            [inFromItem] = this.itemsEndpoint.filter((_itemEndpoint) => _itemEndpoint.id === filteredModels[0].in[0]);
            outFilteredModels = models.filter((treeItemModel) => treeItemModel.id === filteredModels[0].in[0]);
            if (outFilteredModels.length > 0) {
              if (outFilteredModels[0].out && outFilteredModels[0].out.length > 0) {
                if (outFilteredModels[0].out[0] && outFilteredModels[0].out[0] === filteredModels[0].id) {
                  inFromSlot = 'out';
                }
  
                if (outFilteredModels[0].out[1] && outFilteredModels[0].out[1] === filteredModels[0].id) {
                  inFromSlot = 'branch';
                }
  
                if (outFilteredModels[0].out[2] && outFilteredModels[0].out[2] === filteredModels[0].id) {
                  inFromSlot = 'multiOut';
                }
              }
            }
          }

          if (filteredModels[0].in[1]) {
            // MULTI-IN
            [inFromItem] = this.itemsEndpoint.filter((_itemEndpoint) => _itemEndpoint.id === filteredModels[0].in[1]);
            outFilteredModels = models.filter((treeItemModel) => treeItemModel.id === filteredModels[0].in[1]);
            if (outFilteredModels.length > 0) {
              if (outFilteredModels[0].out && outFilteredModels[0].out.length > 0) {
                if (outFilteredModels[0].out[0] && outFilteredModels[0].out[0] === filteredModels[0].id) {
                  multiInFromSlot = 'out';
                }
                if (outFilteredModels[0].out[1] && outFilteredModels[0].out[1] === filteredModels[0].id) {
                  multiInFromSlot = 'branch';
                }
                if (outFilteredModels[0].out[2] && outFilteredModels[0].out[2] === filteredModels[0].id) {
                  multiInFromSlot = 'multiOut';
                }
              }
            }
          }
        }

        if (filteredModels[0].out && filteredModels[0].out.length > 0) {
          // OUT
          inFilteredModels = models.filter((treeItemModel) => treeItemModel.id === filteredModels[0].out[0]);
          if (inFilteredModels.length > 0) {
            if (inFilteredModels[0].in && inFilteredModels[0].in.length > 0) {
              if (inFilteredModels[0].in[0] && inFilteredModels[0].in[0] === filteredModels[0].id) {
                outToSlot = 'in';
              }
              if (inFilteredModels[0].in[1] && inFilteredModels[0].in[1] === filteredModels[0].id) {
                outToSlot = 'multiIn';
              }
            }
          }

          // BRANCH
          inFilteredModels = models.filter((treeItemModel) => treeItemModel.id === filteredModels[0].out[1]);
          // console.log('### inFilteredModels', inFilteredModels);
          if (inFilteredModels.length > 0) {
            if (inFilteredModels[0].in && inFilteredModels[0].in.length > 0) {
              if (inFilteredModels[0].in[0] && inFilteredModels[0].in[0] === filteredModels[0].id) {
                branchToSlot = 'in';
              }
              if (inFilteredModels[0].in[1] && inFilteredModels[0].in[1] === filteredModels[0].id) {
                branchToSlot = 'multiIn';
              }
            }
          }

          // MULTI-OUT
          inFilteredModels = models.filter((treeItemModel) => treeItemModel.id === filteredModels[0].out[2]);
          if (inFilteredModels.length > 0) {
            if (inFilteredModels[0].in && inFilteredModels[0].in.length > 0) {
              if (inFilteredModels[0].in[0] && inFilteredModels[0].in[0] === filteredModels[0].id) {
                multiOutToSlot = 'in';
              }
              if (inFilteredModels[0].in[1] && inFilteredModels[0].in[1] === filteredModels[0].id) {
                multiOutToSlot = 'multiIn';
              }
            }
          }
        }

        if (inFromItem && inFromSlot) {
          // console.log('inFromSlot - inFromItem', inFromSlot, inFromItem)
          const newSlot = {
            itemName: inFromItem.id,
            slotName: inFromSlot,
          };

          const neighbourItem: QueryCommandItemEndpoint = _.cloneDeep(inFromItem);
          // console.log('neighbourItem', neighbourItem)
          if (!inFromItem[inFromSlot].isActive) {
            neighbourItem[inFromSlot].isActive = true;  
          }

          neighbourItem[inFromSlot].to = inFromItem.out.to && inFromItem.out.to.length > 0 ? [...inFromItem.out.to, newSlot] : [newSlot];

          neighbourItems.push(neighbourItem);
        }

        endpoint.in = {
          isExist: !!filteredModels[0].in && (!!filteredModels[0].in[0] || typeof filteredModels[0].in[0] === 'object'),
          isActive: filteredModels[0].in && !!filteredModels[0].in[0],
          from: [{
            itemName: filteredModels[0].in && filteredModels[0].in[0] ? filteredModels[0].in[0] : '',
            slotName: inFromSlot,
          } as EndpointSlot],
        };

        endpoint.multiIn = {
          isExist: !!filteredModels[0].in && (!!filteredModels[0].in[1] || typeof filteredModels[0].in[1] === 'object'),
          isActive: filteredModels[0].in && !!filteredModels[0].in[1],
          from: [{
            itemName: filteredModels[0].in && filteredModels[0].in[1] ? filteredModels[0].in[1] : '',
            slotName: multiInFromSlot,
          } as EndpointSlot],
        };

        endpoint.out = {
          isExist:
            !!filteredModels[0].out && (!!filteredModels[0].out[0] || typeof filteredModels[0].out[0] === 'object'),
          isActive: filteredModels[0].out && !!filteredModels[0].out[0],
          to: [{
            itemName: filteredModels[0].out && filteredModels[0].out[0] ? filteredModels[0].out[0] : '',
            slotName: outToSlot,
          } as EndpointSlot],
        };

        endpoint.branch = {
          isExist:
            !!filteredModels[0].out && (!!filteredModels[0].out[1] || typeof filteredModels[0].out[1] === 'object'),
          isActive: filteredModels[0].out && !!filteredModels[0].out[1],
          to: [{
            itemName: filteredModels[0].out && filteredModels[0].out[1] ? filteredModels[0].out[1] : '',
            slotName: branchToSlot,
          } as EndpointSlot],
        };

        endpoint.multiOut = {
          isExist:
            !!filteredModels[0].out && (!!filteredModels[0].out[2] || typeof filteredModels[0].out[2] === 'object'),
          isActive: filteredModels[0].out && !!filteredModels[0].out[2],
          to: [{
            itemName: filteredModels[0].out && filteredModels[0].out[2] ? filteredModels[0].out[2] : '',
            slotName: multiOutToSlot,
          } as EndpointSlot],
        };
      }
    }

    const queryCommandItemEndpoint: QueryCommandItemEndpoint = {
      id: queryCommandItem.id,
      name: queryCommandItem.name,
      resultName: '',
      ...endpoint,
    };

    let queryCommandItemDragPosition: QueryCommandItemDragPosition = {
      id: queryCommandItem.id,
      name: queryCommandItem.name,
      dragPosition: {
        x: 0,
        y: 0,
      },
    };

    queryCommandItemDragPosition.dragPosition = this._getDragPosition();
    // console.log('queryCommandItemDragPosition', queryCommandItemDragPosition)

    // queryCommandItemSequence.count += 1;

    // console.log('queryCommandItemDragPosition', queryCommandItemDragPosition);

    this.store.dispatch(
      AddWorkspaceItem({
        queryCommandItem,
        queryCommandItemPropertyValue,
        queryCommandItemOnFocus,
        queryCommandItemDragPosition,
        // queryCommandItemSequence,
      })
    );

    this.store.dispatch(AddQueryCommandItemEndpoint({ itemEndpoint: queryCommandItemEndpoint }));

    if (neighbourItems && neighbourItems.length > 0) {
      this.store.dispatch(UpdateQueryCommandItemsEndpoint({ queryCommandItemsEndpoint: neighbourItems }));
    }

    return queryCommandItem;
  }

  async updateQueryCommandItem(
    queryCommandItem: QueryCommandItem,
    queryCommand: QueryCommand,
    commandPropertyValue: any = null,
    models: EndpointModelItem[] = null
  ): Promise<any> {
    if (!queryCommandItem) return;

    const queryCmdBtnCfgs = this.lang === 'en' ? queryCmdBtnCfgs_EN : queryCmdBtnCfgs_ID;
    // const queryCmdUICfgs = this.lang === 'en' ? queryCmdUICfgs_EN : queryCmdUICfgs_ID;

    // already exists
    const [_queryCommandItemPropertyAndValue]: QueryCommandItemPropertyAndValue[] =
      this.itemsPropertyAndValue.filter(
        (queryCommandItemPropertyAndValue) => queryCommandItemPropertyAndValue.id === queryCommandItem.id
      );
    const queryCommandItemPropertyAndValue: QueryCommandItemPropertyAndValue = updateQueryCommandItemPropertyAndValue(_queryCommandItemPropertyAndValue, commandPropertyValue);

    let endpoint = {
      in: {
        isExist: queryCmdBtnCfgs[queryCommand.name.toUpperCase()].in,
        isActive: false,
        from: [],
      },
      multiIn: {
        isExist: queryCmdBtnCfgs[queryCommand.name.toUpperCase()].multiIn,
        isActive: false,
        from: [],
      },
      out: {
        isExist: queryCmdBtnCfgs[queryCommand.name.toUpperCase()].out,
        isActive: false,
        to: [],
      },
      branch: {
        isExist: queryCmdBtnCfgs[queryCommand.name.toUpperCase()].branch,
        isActive: false,
        to: [],
      },
      multiOut: {
        isExist: queryCmdBtnCfgs[queryCommand.name.toUpperCase()].multiOut,
        isActive: false,
        to: [],
      },
    } as QueryCommandItemEndpoint;

    // console.log('init endpoint', {...endpoint});

    // console.log('models', models);
    if (models && models.length > 0) {
      const [filteredModel]: EndpointModelItem[] = models.filter((model: EndpointModelItem) => model.id === queryCommandItem.id);

      // console.log('filteredModel', filteredModel);
      if (filteredModel) {
        const [, modelKey, ...rest] = filteredModel.id.match(/^([A-Z]+)_([0-9]+)$/);

        let outFilteredModels = null;
        let inFilteredModels = null;
        let inFrom = null;
        let multiInFrom = null;
        let outTo = null;
        let multiOutTo = null;
        let branchTo = null;

        if (modelKey === 'MERGE') {
          if (filteredModel.in && filteredModel.in.length > 0) {
            filteredModel.in.forEach((_id: string) => {
              outFilteredModels = models.filter((treeItemModel: EndpointModelItem) => treeItemModel.id === _id);
              if (outFilteredModels.length > 0) {
                let inFromSlot = '';
  
                if (outFilteredModels[0].out && outFilteredModels[0].out.length > 0) {
                  if (outFilteredModels[0].out[0] && outFilteredModels[0].out[0] === filteredModel.id) {
                    inFromSlot = 'out';
                  }
    
                  if (outFilteredModels[0].out[1] && outFilteredModels[0].out[1] === filteredModel.id) {
                    inFromSlot = 'branch';
                  }
    
                  if (outFilteredModels[0].out[2] && outFilteredModels[0].out[2] === filteredModel.id) {
                    inFromSlot = 'multiOut';
                  }
                }
  
                inFrom.push({
                  itemName: _id,
                  slotName: inFromSlot,
                } as EndpointSlot);
              }  
            });
          }
        } else {
          if (filteredModel.in && filteredModel.in.length > 0) {
            // IN
            outFilteredModels = models.filter((treeItemModel: EndpointModelItem) => treeItemModel.id === filteredModel.in[0]);
            if (outFilteredModels.length > 0) {
              let inFromSlot = '';

              if (outFilteredModels[0].out && outFilteredModels[0].out.length > 0) {
                if (outFilteredModels[0].out[0] && outFilteredModels[0].out[0] === filteredModel.id) {
                  inFromSlot = 'out';
                }
  
                if (outFilteredModels[0].out[1] && outFilteredModels[0].out[1] === filteredModel.id) {
                  inFromSlot = 'branch';
                }
  
                if (outFilteredModels[0].out[2] && outFilteredModels[0].out[2] === filteredModel.id) {
                  inFromSlot = 'multiOut';
                }
              }

              inFrom = [{
                itemName: filteredModel.in && filteredModel.in[0] ? filteredModel.in[0] : '',
                slotName: inFromSlot,
              } as EndpointSlot];
            }
  
            // MULTI-IN
            outFilteredModels = models.filter((treeItemModel: EndpointModelItem) => treeItemModel.id === filteredModel.in[1]);
            if (outFilteredModels.length > 0) {
              let multiInFromSlot = '';

              if (outFilteredModels[0].out && outFilteredModels[0].out.length > 0) {
                if (outFilteredModels[0].out[0] && outFilteredModels[0].out[0] === filteredModel.id) {
                  multiInFromSlot = 'out';
                }
                if (outFilteredModels[0].out[1] && outFilteredModels[0].out[1] === filteredModel.id) {
                  multiInFromSlot = 'branch';
                }
                if (outFilteredModels[0].out[2] && outFilteredModels[0].out[2] === filteredModel.id) {
                  multiInFromSlot = 'multiOut';
                }
              }

              multiInFrom = [{
                itemName: filteredModel.in && filteredModel.in[1] ? filteredModel.in[1] : '',
                slotName: multiInFromSlot,
              } as EndpointSlot];
            }
          }  
        }

        if (filteredModel.out && filteredModel.out.length > 0) {
          // OUT
          inFilteredModels = models.filter((treeItemModel: EndpointModelItem) => treeItemModel.id === filteredModel.out[0]);
          if (inFilteredModels.length > 0) {
            let outToSlot = '';

            if (inFilteredModels[0].in && inFilteredModels[0].in.length > 0) {
              if (inFilteredModels[0].in[0] && inFilteredModels[0].in[0] === filteredModel.id) {
                outToSlot = 'in';
              }
              if (inFilteredModels[0].in[1] && inFilteredModels[0].in[1] === filteredModel.id) {
                outToSlot = 'multiIn';
              }
            }

            outTo = [{
              itemName: filteredModel.out && filteredModel.out[0] ? filteredModel.out[0] : '',
              slotName: outToSlot,
            } as EndpointSlot];
          }

          // BRANCH
          inFilteredModels = models.filter((treeItemModel: EndpointModelItem) => treeItemModel.id === filteredModel.out[1]);
          // console.log('### inFilteredModels', inFilteredModels);
          if (inFilteredModels.length > 0) {
            let branchToSlot = '';

            if (inFilteredModels[0].in && inFilteredModels[0].in.length > 0) {
              if (inFilteredModels[0].in[0] && inFilteredModels[0].in[0] === filteredModel.id) {
                branchToSlot = 'in';
              }
              if (inFilteredModels[0].in[1] && inFilteredModels[0].in[1] === filteredModel.id) {
                branchToSlot = 'multiIn';
              }
            }

            branchTo = [{
              itemName: filteredModel.out && filteredModel.out[1] ? filteredModel.out[1] : '',
              slotName: branchToSlot,
            } as EndpointSlot];
          }

          // MULTI-OUT
          inFilteredModels = models.filter((treeItemModel: EndpointModelItem) => treeItemModel.id === filteredModel.out[2]);
          if (inFilteredModels.length > 0) {
            let multiOutToSlot = '';

            if (inFilteredModels[0].in && inFilteredModels[0].in.length > 0) {
              if (inFilteredModels[0].in[0] && inFilteredModels[0].in[0] === filteredModel.id) {
                multiOutToSlot = 'in';
              }
              if (inFilteredModels[0].in[1] && inFilteredModels[0].in[1] === filteredModel.id) {
                multiOutToSlot = 'multiIn';
              }
            }

            multiOutTo = [{
              itemName: filteredModel.out && filteredModel.out[2] ? filteredModel.out[2] : '',
              slotName: multiOutToSlot,
            } as EndpointSlot]
          }
        }

        endpoint.in = {
          isExist: !!filteredModel.in && (!!filteredModel.in[0] || typeof filteredModel.in[0] === 'object'),
          isActive: filteredModel.in && !!filteredModel.in[0],
          from: inFrom,
        };

        endpoint.multiIn = {
          isExist: !!filteredModel.in && (!!filteredModel.in[1] || typeof filteredModel.in[1] === 'object'),
          isActive: filteredModel.in && !!filteredModel.in[1],
          from: multiInFrom,
        };  

        endpoint.out = {
          isExist: !!filteredModel.out && (!!filteredModel.out[0] || typeof filteredModel.out[0] === 'object'),
          isActive: filteredModel.out && !!filteredModel.out[0],
          to: outTo,
        };

        endpoint.branch = {
          isExist: !!filteredModel.out && (!!filteredModel.out[1] || typeof filteredModel.out[1] === 'object'),
          isActive: filteredModel.out && !!filteredModel.out[1],
          to: branchTo,
        };

        endpoint.multiOut = {
          isExist: !!filteredModel.out && (!!filteredModel.out[2] || typeof filteredModel.out[2] === 'object'),
          isActive: filteredModel.out && !!filteredModel.out[2],
          to: multiOutTo,
        };
      }
    }

    const [_queryCommandItemEndpoint]: QueryCommandItemEndpoint[] = this.itemsEndpoint.filter(
      (queryCommandItemEndpoint) => queryCommandItemEndpoint.id === queryCommandItem.id
    );
    const queryCommandItemEndpoint = {...endpoint, ..._queryCommandItemEndpoint};  

    // console.log('queryCommandItemEndpoint', queryCommandItemEndpoint)

    this.store.dispatch(
      UpdateWorkspaceItem({
        queryCommandItemPropertyAndValue,
        queryCommandItemEndpoint,
      })
    );
  }
  
  async findPeerEndpointAndUncheckingSlot(sourceItemId: string, sourceSlotName: string) {
    // console.log('sourceItemId', sourceItemId);
    // console.log('sourceSlotName', sourceSlotName);
    // find peer endpointslot
    let newItemsEndpoint = [];

    if (['out', 'branch', 'multiOut'].indexOf(sourceSlotName) > -1) {
      this.itemsEndpoint.forEach((_itemEndpoint: QueryCommandItemEndpoint) => {
        if (_itemEndpoint.id !== sourceItemId) {
          if (_itemEndpoint.in.isExist && _itemEndpoint.in.isActive && _itemEndpoint.in.from && _itemEndpoint.in.from.length > 0) {
            const endpointChecks = _itemEndpoint.in.from.filter((_endpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName);

            if (endpointChecks && endpointChecks.length > 0) {
              const filteredInEndpointSlots = _itemEndpoint.in.from.filter((_endpointSlot: EndpointSlot) => _endpointSlot.itemName !== sourceItemId && _endpointSlot.itemName !== '' && _endpointSlot.slotName !== '');
              // console.log('filteredInEndpointSlots', _itemEndpoint.id, filteredInEndpointSlots)
              newItemsEndpoint.push({
                ..._itemEndpoint,
                in: {
                  isExist: _itemEndpoint.in.isExist,
                  isActive: _itemEndpoint.in.isActive && filteredInEndpointSlots.length > 0,
                  from: filteredInEndpointSlots,
                }
              });
            }
          }

          if (_itemEndpoint.multiIn.isExist && _itemEndpoint.multiIn.isActive && _itemEndpoint.multiIn.from && _itemEndpoint.multiIn.from.length > 0) {
            const endpointChecks = _itemEndpoint.multiIn.from.filter((_endpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName);

            if (endpointChecks && endpointChecks.length > 0) {
              const filteredMultiInEndpointSlots = _itemEndpoint.multiIn.from.filter((_endpointSlot: EndpointSlot) => _endpointSlot.itemName !== sourceItemId && _endpointSlot.itemName !== '' && _endpointSlot.slotName !== '');
              // console.log('filteredMultiInEndpointSlots', _itemEndpoint.id, filteredMultiInEndpointSlots)
              newItemsEndpoint.push({
                ..._itemEndpoint,
                multiIn: {
                  isExist: _itemEndpoint.multiIn.isExist,
                  isActive: _itemEndpoint.multiIn.isActive && filteredMultiInEndpointSlots.length > 0,
                  from: filteredMultiInEndpointSlots,
                }
              });
            }
          }
        }
      });
    }

    if (['in', 'multiIn'].indexOf(sourceSlotName) > -1) {
      this.itemsEndpoint.forEach((_itemEndpoint: QueryCommandItemEndpoint) => {
        if (_itemEndpoint.id !== sourceItemId) {
          if (_itemEndpoint.out.isExist && _itemEndpoint.out.isActive && _itemEndpoint.out.to && _itemEndpoint.out.to.length > 0) {
            const endpointChecks = _itemEndpoint.out.to.filter((_endpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName);

            if (endpointChecks && endpointChecks.length > 0) {
              const filteredOutEndpointSlots = _itemEndpoint.out.to.filter((_endpointSlot: EndpointSlot) => _endpointSlot.itemName !== sourceItemId && _endpointSlot.itemName !== '' && _endpointSlot.slotName !== '');
              // console.log('filteredOutEndpointSlots', _itemEndpoint.id, filteredOutEndpointSlots)
              newItemsEndpoint.push({
                ..._itemEndpoint,
                out: {
                  isExist: _itemEndpoint.out.isExist,
                  isActive: _itemEndpoint.out.isActive && filteredOutEndpointSlots.length > 0,
                  to: filteredOutEndpointSlots,
                }
              });
            }
          }

          if (_itemEndpoint.branch.isExist && _itemEndpoint.branch.isActive && _itemEndpoint.branch.to && _itemEndpoint.branch.to.length > 0) {
            const endpointChecks = _itemEndpoint.branch.to.filter((_endpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName);

            if (endpointChecks && endpointChecks.length > 0) {
              const filteredBranchEndpointSlots = _itemEndpoint.branch.to.filter((_endpointSlot: EndpointSlot) => _endpointSlot.itemName !== sourceItemId && _endpointSlot.itemName !== '' && _endpointSlot.slotName !== '');
              // console.log('filteredBranchEndpointSlots', _itemEndpoint.id, filteredBranchEndpointSlots)
              newItemsEndpoint.push({
                ..._itemEndpoint,
                branch: {
                  isExist: _itemEndpoint.branch.isExist,
                  isActive: _itemEndpoint.branch.isActive && filteredBranchEndpointSlots.length > 0,
                  to: filteredBranchEndpointSlots,
                }
              });
            }
          }

          if (_itemEndpoint.multiOut.isExist && _itemEndpoint.multiOut.isActive && _itemEndpoint.multiOut.to && _itemEndpoint.multiOut.to.length > 0) {
            const endpointChecks = _itemEndpoint.multiOut.to.filter((_endpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName);

            if (endpointChecks && endpointChecks.length > 0) {
              const filteredMultiOutEndpointSlots = _itemEndpoint.multiOut.to.filter((_endpointSlot: EndpointSlot) => (_endpointSlot.itemName !== sourceItemId && _endpointSlot.itemName !== '' && _endpointSlot.slotName !== ''));
              // console.log('filteredMultiOutEndpointSlots', _itemEndpoint.id, filteredMultiOutEndpointSlots)
              newItemsEndpoint.push({
                ..._itemEndpoint,
                multiOut: {
                  isExist: _itemEndpoint.multiOut.isExist,
                  isActive: _itemEndpoint.multiOut.isActive && filteredMultiOutEndpointSlots.length > 0,
                  from: filteredMultiOutEndpointSlots,
                }
              });
            }
          }
        }
      });
    }

    // console.log('newItemsEndpoint', newItemsEndpoint)

    this.store.dispatch(UpdateQueryCommandItemsEndpoint({ queryCommandItemsEndpoint: newItemsEndpoint }));
  }

  async findReferedDatasetAndClear(sourceItemId: string, sourceSlotName: string) {
      // console.log('sourceItemId', sourceItemId)
      // console.log('sourceSlotName', sourceSlotName)

      this.itemsEndpoint.forEach((_itemEndpoint: QueryCommandItemEndpoint) => {
      if (_itemEndpoint.id !== sourceItemId) {
        let isInRelated = false;
        let targetSlotName = '';

        // console.log('_itemEndpoint', _itemEndpoint)

        if (
          (_itemEndpoint.in.isExist && _itemEndpoint.in.isActive && _itemEndpoint.in.from && _itemEndpoint.in.from.length > 0) ||
          (_itemEndpoint.multiIn.isExist && _itemEndpoint.multiIn.isActive && _itemEndpoint.multiIn.from && _itemEndpoint.multiIn.from.length > 0)
        ) {
          const endpointChecksIn: EndpointSlot[] = _itemEndpoint.in.from && _itemEndpoint.in.from.length > 0 ? _itemEndpoint.in.from.filter((_endpointSlot: EndpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName) : null;
          const endpointChecksMultiIn: EndpointSlot[] = _itemEndpoint.multiIn.from && _itemEndpoint.multiIn.from.length > 0 ? _itemEndpoint.multiIn.from.filter((_endpointSlot: EndpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName) : null;

          // console.log('endpointChecksIn', endpointChecksIn)
          // console.log('endpointChecksMultiIn', endpointChecksMultiIn)

          if ((endpointChecksIn && endpointChecksIn.length > 0) || (endpointChecksMultiIn && endpointChecksMultiIn.length > 0)) {
            isInRelated = true;

            if (endpointChecksIn && endpointChecksIn.length > 0) {
              targetSlotName = 'in';
            }

            if (endpointChecksMultiIn && endpointChecksMultiIn.length > 0) {
              targetSlotName = 'multiIn';
            }
          }
        }

        // console.log('isInRelated', isInRelated)

        if (isInRelated) {
          const [filteredQueryCommandItemPropertyAndValue] = this.itemsPropertyAndValue.filter((_itemPropertyAndValue) => _itemPropertyAndValue.id === _itemEndpoint.id);

          if (filteredQueryCommandItemPropertyAndValue) {
            const filteredFromProps = filteredQueryCommandItemPropertyAndValue.commandProperties.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'from');
            if (filteredFromProps && filteredFromProps.length > 0) {
              this.store.dispatch(UpdateQueryCommandItemPropertyValue({
                item: filteredQueryCommandItemPropertyAndValue,
                propName: 'from',
                propValue: '',
              }));
            }
            
            const filteredFromsProps = filteredQueryCommandItemPropertyAndValue.commandProperties.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'froms');
            if (filteredFromsProps && filteredFromsProps.length > 0) {
              this.store.dispatch(UpdateQueryCommandItemPropertyValue({
                item: filteredQueryCommandItemPropertyAndValue,
                propName: 'froms',
                propValue: '',
              }));
            }

            const filteredTablesProps = filteredQueryCommandItemPropertyAndValue.commandProperties.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'tables');
            if (filteredTablesProps && filteredTablesProps.length > 0) {
              this.store.dispatch(UpdateQueryCommandItemPropertyValue({
                item: filteredQueryCommandItemPropertyAndValue,
                propName: 'tables',
                propValue: '',
              }));
            }

            const filteredSrcRefProps = filteredQueryCommandItemPropertyAndValue.commandProperties.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'src' || _cmdProp.name === 'ref');
            if (filteredSrcRefProps && filteredSrcRefProps.length > 0) {
              if (targetSlotName === 'in') {
                let [filteredSrcProp]: QueryCommandProperty[] = filteredSrcRefProps.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'src');

                if (filteredSrcProp) {
                  const filteredSrcPropValue = filteredSrcProp.value.map((_valueProp: QueryCommandProperty) => {
                    if (_valueProp.name === 'table' || _valueProp.name === 'cols') {
                      return {
                        ..._valueProp,
                        value: ''
                      };
                    }

                    return _valueProp;
                  });

                  this.store.dispatch(UpdateQueryCommandItemPropertyValue({
                    item: filteredQueryCommandItemPropertyAndValue,
                    propName: 'src',
                    propValue: filteredSrcPropValue,
                  }));
                }
              }

              if (targetSlotName === 'multiIn') {
                let [filteredRefProp]: QueryCommandProperty[] = filteredSrcRefProps.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'ref');

                if (filteredRefProp) {
                  const filteredRefPropValue = filteredRefProp.value.map((_valueProp: QueryCommandProperty) => {
                    if (_valueProp.name === 'table' || _valueProp.name === 'cols') {
                      return {
                        ..._valueProp,
                        value: ''
                      };
                    }

                    return _valueProp;
                  });

                  this.store.dispatch(UpdateQueryCommandItemPropertyValue({
                    item: filteredQueryCommandItemPropertyAndValue,
                    propName: 'ref',
                    propValue: filteredRefPropValue,
                  }));
                }
              }
            }
          }
        }

        let isOutRelated = false;
        if (
          (_itemEndpoint.out.isExist && _itemEndpoint.out.isActive && _itemEndpoint.out.to && _itemEndpoint.out.to.length > 0) ||
          (_itemEndpoint.branch.isExist && _itemEndpoint.branch.isActive && _itemEndpoint.branch.to && _itemEndpoint.branch.to.length > 0) ||
          (_itemEndpoint.multiOut.isExist && _itemEndpoint.multiOut.isActive && _itemEndpoint.multiOut.to && _itemEndpoint.multiOut.to.length > 0)
        ) {
          const endpointChecksOut: EndpointSlot[] = _itemEndpoint.out.to ? _itemEndpoint.out.to.filter((_endpointSlot: EndpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName) : null;
          const endpointChecksBranch: EndpointSlot[] = _itemEndpoint.branch.to ? _itemEndpoint.branch.to.filter((_endpointSlot: EndpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName) : null;
          const endpointChecksMultiOut: EndpointSlot[] = _itemEndpoint.multiOut.to ? _itemEndpoint.multiOut.to.filter((_endpointSlot: EndpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName) : null;

          if ((endpointChecksOut && endpointChecksOut.length > 0) || (endpointChecksBranch && endpointChecksBranch.length > 0) || (endpointChecksMultiOut && endpointChecksMultiOut.length > 0)) {
            isOutRelated = true;
          }
        }

        if (isOutRelated) {
          const [filteredQueryCommandItemPropertyAndValue] = this.itemsPropertyAndValue.filter((_itemPropertyAndValue: QueryCommandItemPropertyAndValue) => _itemPropertyAndValue.id === sourceItemId);

          if (filteredQueryCommandItemPropertyAndValue) {
            const filteredFromProps = filteredQueryCommandItemPropertyAndValue.commandProperties.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'from');

            if (filteredFromProps && filteredFromProps.length > 0) {
              this.store.dispatch(UpdateQueryCommandItemPropertyValue({
                item: filteredQueryCommandItemPropertyAndValue,
                propName: 'from',
                propValue: '',
              }));
            } else {
              const filteredFromsProps = filteredQueryCommandItemPropertyAndValue.commandProperties.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'froms');
              if (filteredFromsProps && filteredFromsProps.length > 0) {
                this.store.dispatch(UpdateQueryCommandItemPropertyValue({
                  item: filteredQueryCommandItemPropertyAndValue,
                  propName: 'froms',
                  propValue: '',
                }));

              } else {
                const filteredSrcRefProps = filteredQueryCommandItemPropertyAndValue.commandProperties.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'src' || _cmdProp.name === 'ref');
                if (filteredSrcRefProps && filteredSrcRefProps.length > 0) {
                  let [filteredSrcProp]: QueryCommandProperty[] = filteredSrcRefProps.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'src');
                  let [filteredRefProp]: QueryCommandProperty[] = filteredSrcRefProps.filter((_cmdProp: QueryCommandProperty) => _cmdProp.name === 'ref');

                  // console.log('filteredSrcProp', filteredSrcProp)
                  // console.log('filteredRefProp', filteredRefProp)

                  if (filteredSrcProp) {
                    const propValue = filteredSrcProp.value.map((_valueProp: QueryCommandProperty) => {
                      if (_valueProp.name === 'table' || _valueProp.name === 'cols') {
                        return {
                          ..._valueProp,
                          value: ''
                        };
                      }

                      return _valueProp;
                    });

                    this.store.dispatch(UpdateQueryCommandItemPropertyValue({
                      item: filteredQueryCommandItemPropertyAndValue,
                      propName: 'src',
                      propValue,
                    }));
                  }

                  if (filteredRefProp) {
                    const propValue = filteredRefProp.value.map((_valueProp: QueryCommandProperty) => {
                      if (_valueProp.name === 'table' || _valueProp.name === 'cols') {
                        return {
                          ..._valueProp,
                          value: ''
                        };
                      }

                      return _valueProp;
                    });

                    this.store.dispatch(UpdateQueryCommandItemPropertyValue({
                      item: filteredQueryCommandItemPropertyAndValue,
                      propName: 'ref',
                      propValue,
                    }));
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  getPeerQueryCommandItemFromInSlotAndRemoveLine(sourceItemId: string, sourceSlotName: string, lineObj: { renderedLines: RenderedLine[] }): Promise<void> {
    return new Promise<void>((resolve) => {
      this.itemsEndpoint.forEach((_itemEndpoint: QueryCommandItemEndpoint) => {
        if (_itemEndpoint.id !== sourceItemId) {
          if (_itemEndpoint.out.isExist && _itemEndpoint.out.isActive && _itemEndpoint.out.to && _itemEndpoint.out.to.length > 0) {
            const endpointChecks = _itemEndpoint.out.to.filter((_endpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName);
            if (endpointChecks && endpointChecks.length > 0) {
              // console.log('out', _itemEndpoint, endpointChecks)
              this.removeLine(_itemEndpoint.id, 'out', lineObj);
            }
          }
  
          if (_itemEndpoint.branch.isExist && _itemEndpoint.branch.isActive && _itemEndpoint.branch.to && _itemEndpoint.branch.to.length > 0) {
            const endpointChecks = _itemEndpoint.branch.to.filter((_endpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName);
            if (endpointChecks && endpointChecks.length > 0) {
              // console.log('branch', _itemEndpoint, endpointChecks)
              this.removeLine(_itemEndpoint.id, 'branch', lineObj);
            }
          }
  
          if (_itemEndpoint.multiOut.isExist && _itemEndpoint.multiOut.isActive && _itemEndpoint.multiOut.to && _itemEndpoint.multiOut.to.length > 0) {
            const endpointChecks = _itemEndpoint.multiOut.to.filter((_endpointSlot) => _endpointSlot.itemName === sourceItemId && _endpointSlot.slotName === sourceSlotName);
            if (endpointChecks && endpointChecks.length > 0) {
              // console.log('multiOut', _itemEndpoint, endpointChecks)
              this.removeLine(_itemEndpoint.id, 'multiOut', lineObj);
            }
          }
        }
      });

      resolve();
    });
  }

  async removeQueryCommandItem(item: QueryCommandItem, lineObj: { renderedLines: RenderedLine[] }) {
    if (this.itemsEndpoint && this.itemsEndpoint.length > 0) {
      const [itemEndpoint] = this.itemsEndpoint.filter((_itemEndpoint) => _itemEndpoint.id === item.id);
      if (itemEndpoint) {
        if (itemEndpoint.in.isExist && itemEndpoint.in.isActive) {
          // console.log('itemEndpoint.in.isExist && itemEndpoint.in.isActive')
          await this.getPeerQueryCommandItemFromInSlotAndRemoveLine(itemEndpoint.id, 'in', lineObj);

          this.findReferedDatasetAndClear(itemEndpoint.id, 'in');
          this.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'in');
        }

        if (itemEndpoint.multiIn.isExist && itemEndpoint.multiIn.isActive) {
          // console.log('itemEndpoint.multiIn.isExist && itemEndpoint.multiIn.isActive')
          await this.getPeerQueryCommandItemFromInSlotAndRemoveLine(itemEndpoint.id, 'multiIn', lineObj);

          this.findReferedDatasetAndClear(itemEndpoint.id, 'multiIn');
          this.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'multiIn');
        }

        if (itemEndpoint.out.isExist && itemEndpoint.out.isActive) {
          // console.log('itemEndpoint.out.isExist && itemEndpoint.out.isActive')
          this.removeLine(itemEndpoint.id, 'out', lineObj);

          this.findReferedDatasetAndClear(itemEndpoint.id, 'out');
          this.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'out');
        }

        if (itemEndpoint.branch.isExist && itemEndpoint.branch.isActive) {
          // console.log('itemEndpoint.branch.isExist && itemEndpoint.branch.isActive')
          this.removeLine(itemEndpoint.id, 'branch', lineObj);

          this.findReferedDatasetAndClear(itemEndpoint.id, 'branch');
          this.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'branch');
        }

        if (itemEndpoint.multiOut.isExist && itemEndpoint.multiOut.isActive) {
          // console.log('itemEndpoint.multiOut.isExist && itemEndpoint.multiOut.isActive')
          this.removeLine(itemEndpoint.id, 'multiOut', lineObj);

          this.findReferedDatasetAndClear(itemEndpoint.id, 'multiOut');
          this.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'multiOut');
        }
      }
    }

    this.store.dispatch(RemoveWorkspaceItem({ queryCommandItem: item }));
  }

  async loadFromQueryCommandItemsWrapper(queryCommandItemsWrapper: QueryCommandItemsWrapper): Promise<any> {
    // console.log('queryCommandItemsWrapper', queryCommandItemsWrapper);
    this.store.dispatch(SetDrawingDelay({ drawingDelay: 500 }));

    const {
      items: queryCommandItems,
      propertyAndValues: queryCommandItemsPropertyAndValue,
      endpoints: queryCommandItemsEndpoint,
      dragPositions: queryCommandItemsDragPosition,
    } = queryCommandItemsWrapper;

    if (queryCommandItems && queryCommandItems.length > 0) {
      const queryCommandItemsOnFocus: QueryCommandItemOnFocus[] = queryCommandItems.map((queryCommandItem) => {
        return {
          id: queryCommandItem.id,
          name: queryCommandItem.name,
          onFocus: false,
        } as QueryCommandItemOnFocus;
      });

      this.generateLineConnections();
      
      this.store.dispatch(
        SetWorkspaceItems({
          queryCommandItems,
          queryCommandItemsPropertyAndValue,
          queryCommandItemsOnFocus,
          queryCommandItemsEndpoint,
          queryCommandItemsDragPosition,
        })
      );

      setTimeout(async () => {
        await this.getPqlFromQueryCommandItems('');
      }, 1000);
    }
  }

  async getQueryCommandItemsFromPql(tag: string): Promise<any> {
    // console.log('getQueryCommandItemsFromPql - tag', tag);

    if (!this.isNodesModelToPql) {
      if (this.pqlString) {
        const strippedPqlString = this.pqlString.replace(/\n/gi, ' ');

        const result: ApiResult = await new Promise((resolve, reject) => {
          this.apiService.post('/api/query/parse', { pql: strippedPqlString }, true).subscribe({
            next: (res) => resolve(res),
            error: (err) => {
              this.store.dispatch(SetToastrMessage({
                toastrMessage: {
                  toastrType: 'error',
                  message: err.message || 'ERROR 502 - BAD GATEWAY',
                }
              }));
            },
          });
        });

        if (result && result.status === 'success') {
          const nodesModel = result.response;

          if (nodesModel.model && nodesModel.model.length > 0) {
            // temporary fix
            // const lines = document.getElementsByClassName('leader-line');
            // if (lines && lines.length > 0) {
            //   lines.forEach((_line) => _line.remove());
            // }

            let alreadyProcessedNodeItem = [];
            let nItems = 0;
            for await (const itemModel of nodesModel.model) {
              const nodeItem = nodesModel.nodes[itemModel.id];

              // console.log('nodeItem', nodeItem);

              const [filteredQueryCommand]: QueryCommand[] = this.queryCommands.filter(
                (item) => item.name === nodeItem.node_type.toLowerCase()
              );

              // console.log('filteredQueryCommand', filteredQueryCommand);

              if (filteredQueryCommand) {
                let filteredExistingQueryCommandItem: QueryCommandItem = null;
                if (this.queryCommandItems) {
                  [filteredExistingQueryCommandItem] = this.queryCommandItems.filter((item) => {
                    let itemId = 0;
                    const matches1 = item.id.match(/^([A-Z]+)_([0-9]+)$/);
                    if (matches1) {
                      itemId = parseInt(matches1[2]);
                    }
                    
                    let itemModelId = 0;
                    const matches2 = itemModel.id.match(/^([A-Z]+)_([0-9]+)$/);
                    if (matches2) {
                      itemModelId = parseInt(matches2[2]);
                    }

                    return item.nodeType === filteredQueryCommand.name && itemId <= itemModelId && alreadyProcessedNodeItem.indexOf(item.id) < 0;
                  });
                }

                // console.log('filteredExistingQueryCommandItem', filteredExistingQueryCommandItem)

                if (!filteredExistingQueryCommandItem) {
                  // console.log('await this.createQueryCommandItem');
                  const newQueryCommandItem = await this.createQueryCommandItem(
                    filteredQueryCommand,
                    { id: itemModel.id, ...nodeItem },
                    nodesModel.model
                  );

                  // console.log('newQueryCommandItem', newQueryCommandItem)

                  alreadyProcessedNodeItem.push(newQueryCommandItem.id);
                } else {
                  alreadyProcessedNodeItem.push(filteredExistingQueryCommandItem.id);

                  // console.log('await this.updateQueryCommandItem');
                  await this.updateQueryCommandItem(
                    filteredExistingQueryCommandItem,
                    filteredQueryCommand,
                    nodeItem.props,
                    nodesModel.model
                  );
                }

                this.store.dispatch(SetIsLineRedrawingNeeded({ isLineRedrawingNeeded: true }));
                // console.log('alreadyProcessedNodeItem', alreadyProcessedNodeItem)
              }

              nItems++;
            } // for

            this.generateLineConnections(); 

            // remove non-related query command items
            if (this.queryCommandItems) {
              const nodeKeys = Object.keys(nodesModel.nodes);

              this.queryCommandItems.forEach((_existingQueryCommandItem) => {
                const filteredModels = nodeKeys.filter((nodeKey) => {
                  return nodeKey === _existingQueryCommandItem.id;
                });

                // console.log('filteredModels', filteredModels)

                if (!filteredModels || (filteredModels && filteredModels.length === 0)) {
                  // console.log('Removing!');
                  this.store.dispatch(RemoveWorkspaceItem({ queryCommandItem: _existingQueryCommandItem }));
                }
              });

              /*
              * commented out, so PQL not updated after PQL being parsed
              */
              // this.store.dispatch(SetIsNodesModelToPql({ this.isNodesModelToPql: true }));
              // await this.getPqlFromQueryCommandItems('existingQueryCommandItems');
            }
          }
        }
      }
    }
  }

  async getPqlFromQueryCommandItems(tag: string): Promise<any> {
    //console.log('getPqlFromQueryCommandItems', tag)
    // validate all commandProperties
    // console.log('this.isNodesModelToPql', this.isNodesModelToPql);
    if (this.isNodesModelToPql) {
      // just exit if no queryCommandItemsPropertyAndValue
      // console.log('queryCommandItemsPropertyAndValue', queryCommandItemsPropertyAndValue);
      if (
        !this.itemsPropertyAndValue ||
        (this.itemsPropertyAndValue && this.itemsPropertyAndValue.length === 0)
      ) {
        this.store.dispatch(ResetPqlString());
        this.store.dispatch(ResetQueryResult());
        return;
      }

      // console.log('queryCommandItemsEndpoint', queryCommandItemsEndpoint);

      const nodesAndModels = {
        nodes: {},
        model: [],
      };

      let isPrevInvalid = false;
      this.itemsPropertyAndValue.forEach((queryCommandItemPropertyAndValue) => {
        const isValid = queryCommandItemPropertyAndValueIsValid(queryCommandItemPropertyAndValue);

        const matches = queryCommandItemPropertyAndValue.id.match(/([A-Z]+)_([0-9]+)/);
        const queryCmdPropKey = matches[1].toUpperCase();
        const nodeKey = `${queryCmdPropKey}_${matches[2]}`;

        if (isValid && !isPrevInvalid) {
          /*
          * NODES STRUCTURE CONSTRUCTION (the properties)
          */
          nodesAndModels.nodes[nodeKey] = {
            node_type: queryCmdPropKey,
            props: {},
          };

          const queryCmdProp = queryCmdProps[queryCmdPropKey];
          const queryCmdPropPropKeys = Object.keys(queryCmdProp.properties);

          queryCmdPropPropKeys.forEach((queryCmdPropPropKey) => {
            // console.log('queryCmdPropPropKey', queryCmdPropPropKey);
            const filteredPropertyAndValues = queryCommandItemPropertyAndValue.commandProperties.filter((commandProperty) => commandProperty.name === queryCmdPropPropKey);
            // console.log('filteredPropertyAndValues', filteredPropertyAndValues);
            // console.log('queryCmdProp.properties[queryCmdPropPropKey].field_type', queryCmdProp.properties[queryCmdPropPropKey].field_type);

            if (queryCmdProp.properties[queryCmdPropPropKey].field_type !== 'object') {
              let propValue = null;
              if (filteredPropertyAndValues && filteredPropertyAndValues.length > 0) {
                propValue = filteredPropertyAndValues[0].value;

                if (filteredPropertyAndValues[0].valuetype === 'number') {
                  propValue = Number(filteredPropertyAndValues[0].value);
                }
              }
              nodesAndModels.nodes[nodeKey].props[queryCmdPropPropKey] = propValue;
            }

            // console.log('queryCmdProp.properties', queryCmdProp.properties);

            if (queryCmdProp.properties[queryCmdPropPropKey].field_type === 'object') {
              const subQueryCmdPropPropKeys = Object.keys(queryCmdProp.properties[queryCmdPropPropKey].properties);
              nodesAndModels.nodes[nodeKey].props[queryCmdPropPropKey] = {};

              subQueryCmdPropPropKeys.forEach((subQueryCmdPropPropKey) => {
                let filteredSubPropertyAndValues = queryCommandItemPropertyAndValue.commandProperties.filter((commandProperty) => commandProperty.name === subQueryCmdPropPropKey);

                if (filteredSubPropertyAndValues[0]) {
                  nodesAndModels.nodes[nodeKey].props[queryCmdPropPropKey][subQueryCmdPropPropKey] =
                    filteredSubPropertyAndValues && filteredSubPropertyAndValues.length > 0
                      ? filteredSubPropertyAndValues[0].value
                      : null;
                }

                if (!filteredSubPropertyAndValues[0] && filteredPropertyAndValues[0]) {

                  if (filteredPropertyAndValues[0].value instanceof Array) {
                    let filteredSubPropertyAndValues = filteredPropertyAndValues[0].value.filter(
                      (commandProperty) => commandProperty.name === subQueryCmdPropPropKey
                    );

                    if (filteredSubPropertyAndValues[0]) {
                      nodesAndModels.nodes[nodeKey].props[queryCmdPropPropKey][subQueryCmdPropPropKey] =
                        filteredSubPropertyAndValues && filteredSubPropertyAndValues.length > 0
                          ? filteredSubPropertyAndValues[0].value
                          : null;
                    }
                  }

                  if (!(filteredPropertyAndValues[0].value instanceof Array) && filteredPropertyAndValues[0].value[subQueryCmdPropPropKey]) {
                    nodesAndModels.nodes[nodeKey].props[queryCmdPropPropKey][subQueryCmdPropPropKey] = filteredPropertyAndValues[0].value[subQueryCmdPropPropKey];
                  }
                }
              });
            }
          });

          /*
           * MODEL STRUCTURE CONSTRUCTION (the endpoints)
           */
          const newModel = {
            id: nodeKey,
          };

          let filteredQueryCommandItemsEndpoint: QueryCommandItemEndpoint[] = null;
          if (this.itemsEndpoint && this.itemsEndpoint.length > 0) {
            filteredQueryCommandItemsEndpoint = this.itemsEndpoint.filter(
              (queryCommandItemEndpoint) => queryCommandItemEndpoint.id === queryCommandItemPropertyAndValue.id
            );
          }

          // console.log('getPqlFromQueryCommandItems - filteredQueryCommandItemsEndpoint', filteredQueryCommandItemsEndpoint)
          if (filteredQueryCommandItemsEndpoint && filteredQueryCommandItemsEndpoint.length > 0) {
            if (
              filteredQueryCommandItemsEndpoint[0].in &&
              filteredQueryCommandItemsEndpoint[0].in.isExist
            ) {
              if (filteredQueryCommandItemsEndpoint[0].in.from) {
                newModel['in'] = filteredQueryCommandItemsEndpoint[0].in.from.map((item: EndpointSlot) => item.itemName);
              }
            }

            if (
              filteredQueryCommandItemsEndpoint[0].multiIn &&
              filteredQueryCommandItemsEndpoint[0].multiIn.isExist
            ) {
              if (!newModel['in']) {
                newModel['in'] = [];
              }
              
              if (filteredQueryCommandItemsEndpoint[0].multiIn.from) {
                newModel['in'] = [...newModel['in'], ...filteredQueryCommandItemsEndpoint[0].multiIn.from.map((item: EndpointSlot) => item.itemName)];
              }
            }

            if (
              filteredQueryCommandItemsEndpoint[0].out &&
              filteredQueryCommandItemsEndpoint[0].out.isExist
            ) {
              if (filteredQueryCommandItemsEndpoint[0].out.to) {
                newModel['out'] = filteredQueryCommandItemsEndpoint[0].out.to.map((item: EndpointSlot) => item.itemName);
              }
            }

            if (
              filteredQueryCommandItemsEndpoint[0].branch &&
              filteredQueryCommandItemsEndpoint[0].branch.isExist
            ) {
              if (!newModel['out']) {
                newModel['out'] = [];
              }

              if (filteredQueryCommandItemsEndpoint[0].branch.to) {
                newModel['out'] = [...newModel['out'], ...filteredQueryCommandItemsEndpoint[0].branch.to.map((item: EndpointSlot) => item.itemName)];
              }
            }

            if (
              filteredQueryCommandItemsEndpoint[0].multiOut &&
              filteredQueryCommandItemsEndpoint[0].multiOut.isExist
            ) {
              if (!newModel['out']) {
                newModel['out'] = [];
              }

              if (filteredQueryCommandItemsEndpoint[0].multiOut.to) {
                newModel['out'] = [...newModel['out'], ...filteredQueryCommandItemsEndpoint[0].multiOut.to.map((item: EndpointSlot) => item.itemName)];
              }
            }
          }

          nodesAndModels.model.push(newModel);
        }

        if (!isPrevInvalid) {
          isPrevInvalid = !isValid;
        }
      });

      // nodesAndModels.model = rearrangeModel(nodesAndModels.model);

      const result: ApiResult = await new Promise<ApiResult>((resolve) => {
        this.apiService.post('/api/query/render', nodesAndModels).subscribe({
          next: (res) => resolve(res),
          error: (err) => {
            if ("message" in err) {
              this.store.dispatch(SetToastrMessage({
                toastrMessage: {
                  toastrType: 'error',
                  message: err.message,
                }
              }));
            }
            resolve(null);
          },
        });
      });
      // console.log('result', result);
      if (result && result.response) {
        this.store.dispatch(SetPqlString({ pql: result.response }));
      }
    }
  }

  async saveQuery(title: string): Promise<any> {
    if (this.isNodesModelToPql) {
      this.getPqlFromQueryCommandItems('saveQuery');
    }

    if (!this.isNodesModelToPql && this.pqlString) {
      this.getQueryCommandItemsFromPql('workspace.service - saveQuery');
    }

    if (this.pqlString) {
      const queryStr = this.pqlString.replace('|', ';');
      const _queryObject = this.queryObject;
      
      if (_queryObject) {
        await new Promise((resolve) => {
          this.apiService.post('/api/query/setdataset', {
            quid: _queryObject.quid,
            id: _queryObject.ID,
          }).subscribe({
            next: (res) => resolve(res),
            error: (err) => {
              if (err) {
                this.store.dispatch(SetToastrMessage({
                  toastrMessage: {
                    toastrType: 'error',
                    message: err.message || 'ERROR 502 - BAD GATEWAY',
                  }
                }));
              }

              resolve(null);
            },
          });
        });
      }

      let id = 0;
      let url = '/api/query/create';
      let isEdit = false;
      if (_queryObject) {
        isEdit = true;

        id = _queryObject.ID;
        url = '/api/query/edit';

        this.store.dispatch(
          SetQueryObject({
            queryObject: {
              ..._queryObject,
              title,
            },
          })
        );
      }

      let refreshIntervals = [];
      if (_queryObject && _queryObject.refreshInterval) {
        refreshIntervals = [_queryObject.refreshInterval];
        if (_queryObject.additionalRefreshInterval && _queryObject.additionalRefreshInterval.length > 0) {
          refreshIntervals.push(..._queryObject.additionalRefreshInterval);
        }
      }

      // console.log('activeTable', activeTable);
      if (this.activeTable) {
        // console.log('metadatas', metadatas);
        if (this.metadatas) {
          let filteredMetadatas = this.metadatas.filter((metadata) => metadata.dataset === this.activeTable);
          if (!filteredMetadatas || (filteredMetadatas && filteredMetadatas.length === 0)) {
            filteredMetadatas = this.metadatas;
          }

          // console.log('filteredMetadatas', filteredMetadatas);

          const data = {};
          filteredMetadatas[0].columns.forEach((column: MetadataColumnWrapper) => {
            data[column.columnName] = column.metadata;
          });

          const metadataParams = {
            quid: _queryObject.quid,
            table_id: this.activeTable,
            userQueryID: _queryObject.ID,
            data,
          };

          await new Promise((resolve) => {
            this.apiService.post('/api/query/metadata/save', metadataParams).subscribe({
              next: (res) => resolve({ success: true, res, }),
              error: (err) => {
                this.store.dispatch(
                  SetIsDatasetListReloadRequestTriggered({ isDatasetListReloadRequestTriggered: true })
                );

                this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));

                this.store.dispatch(SetToastrMessage({
                  toastrMessage: {
                    toastrType: 'error',
                    message: err.message || 'ERROR 502 - BAD GATEWAY',
                  }
                }));
                // this.store.dispatch(
                //   SetMessage({
                //     title: this.textCollections.DATA_PROCESSING.E,
                //     text: err.message,
                //   })
                // );
                resolve({ success: false, err, });
              },
            });
          })
        }
      }

      let isRefreshIntervalSet = false;
      const filteredRefreshIntervals = refreshIntervals.filter((refreshInterval) => !!refreshInterval.Advance);
      if (filteredRefreshIntervals && filteredRefreshIntervals.length > 0) {
        isRefreshIntervalSet = true;
      }
      // console.log('isRefreshIntervalSet', isRefreshIntervalSet)

      const queryParams: QueryParams = {
        id,
        pql: queryStr,
        user: this.user.username,
        title: title ?? this.textCollections.DATA_PROCESSING.U,
        model: JSON.stringify({
          items: this.queryCommandItems,
          propertyAndValues: this.itemsPropertyAndValue,
          endpoints: this.itemsEndpoint,
          dragPositions: this.itemsDragPosition,
        } as QueryCommandItemsWrapper),
        userID: this.user ? this.user.uuid : null,
      };

      if (isRefreshIntervalSet) {
        queryParams.refreshIntervals = refreshIntervals
          .map(x => ({
            ...x,
            Advance: x.Advance.endsWith(timezoneOffset()) ? x.Advance : `${x.Advance}${timezoneOffset()}`
          }));
      }
      
      return new Promise((resolve) => {
          this.apiService.post(url, queryParams).subscribe({
            next: (res) => resolve({ success: true, res, }),
            error: (err) => {
              SetToastrMessage({
                toastrMessage: {
                  toastrType: 'error',
                  message: err.message,
                }
              });
              resolve({ success: false, err, });
            }
          });
        });
    }

    return new Promise((resolve) => resolve({ success: false, err: { message: 'No PQL string' }}));
  }

  async duplicateQuery(params): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.apiService.post('/api/query/duplicate', params).subscribe({
        next: (result) => {
          if (result && result.response) {
            resolve(true);
          }
        },
        error: (err) => reject(err),
      });
    });
  }

  async executeQuery(title: string, isPreview: boolean): Promise<ApiResult> {
    this.store.dispatch(ResetQueryResult());

    // console.log('this.isNodesModelToPql', this.isNodesModelToPql)
    if (this.isNodesModelToPql) {
    // console.log('getPqlFromQueryCommandItems');
      await this.getPqlFromQueryCommandItems('executeQuery');
    }

    // console.log('pqlString', pqlString);
    if (this.pqlString) {
      if (!this.isNodesModelToPql) {
        // console.log('getQueryCommandItemsFromPql');
        await this.getQueryCommandItemsFromPql('workspace.service - executeQuery');
      }

      this.store.dispatch(SetIsQueryRequestTriggered({ isQueryRequestTriggered: true }));

      const queryStr = this.pqlString.replace(/\n/g, '');

      let isNotifyOnQuerySuccessNeeded = false;
      let actionToDispatchOnQuerySuccess: ActionToDispatch = null;
      let querySuccessNotificationMesssage: string = null;

      if (this.queryCommandItems && this.queryCommandItems.length > 0) {
        this.queryCommandItems.forEach((queryCommandItem: QueryCommandItem) => {
          if (!isNotifyOnQuerySuccessNeeded && queryCommandItem.isNotifyOnQuerySuccess) {
            isNotifyOnQuerySuccessNeeded = true;
            if (queryCommandItem.nodeType === 'store') {
              querySuccessNotificationMesssage = this.textCollections.DATA_PROCESSING.QRSSF
            }
          }
  
          if (!actionToDispatchOnQuerySuccess && queryCommandItem.actionToDispatchOnQuerySuccess) {
            actionToDispatchOnQuerySuccess = queryCommandItem.actionToDispatchOnQuerySuccess;
          }
        });
  
      }

      const queryParams: QueryParams = {
        query: queryStr,
        user: this.user.username,
        title: title ?? this.textCollections.DATA_PROCESSING.U,
        model: JSON.stringify({
          items: this.queryCommandItems,
          propertyAndValues: this.itemsPropertyAndValue,
          endpoints: this.itemsEndpoint,
          dragPositions: this.itemsDragPosition,
        } as QueryCommandItemsWrapper),
        userQueryID: this.queryObject ? this.queryObject.ID : null,
        userID: this.user ? this.user.uuid : null,
      };

      // console.log('queryParams', queryParams);

      return new Promise<ApiResult>((resolve) => {
        this.apiService.post('/api/dataset/query', queryParams).subscribe({
          next: (res) => {
            resolve(res);

            if (!this.queryObject) {
              // setup queryObject minimalist
              this.store.dispatch(
                SetQueryObject({
                  queryObject: {
                    ID: res.response.quid.userQueryID,
                    quid: res.response.quid.quid,
                    title: title ?? this.textCollections.DATA_PROCESSING.U,
                  },
                })
              );
            } else {
              this.store.dispatch(
                UpdateQueryObject({
                  queryObject: {
                    ID: res.response.quid.userQueryID,
                    quid: res.response.quid.quid,
                    title: title ?? this.textCollections.DATA_PROCESSING.U,
                  },
                })
              );
            }

            if (isNotifyOnQuerySuccessNeeded) {
              this.store.dispatch(SetToastrMessage({
                toastrMessage: {
                  toastrType: 'info',
                  message: querySuccessNotificationMesssage,
                }
              }));
            }

            if (actionToDispatchOnQuerySuccess) {
              this.store.dispatch({ type: actionToDispatchOnQuerySuccess.actionName, ...actionToDispatchOnQuerySuccess.actionParams });
            }
          },
          error: (err) => {
            this.store.dispatch(SetToastrMessage({
              toastrMessage: {
                toastrType: 'error',
                message: err.message || 'ERROR 502 - BAD GATEWAY',
              }
            }));
            // this.store.dispatch(
            //   SetMessage({
            //     title: this.textCollections.DATA_PROCESSING.E,
            //     text: err.message || 'ERROR 502 - BAD GATEWAY',
            //   })
            // );

            resolve(null);
          },
        });
      });
    }

    return null;
  }

  async drawLine(line: Line, lineObj: { renderedLines: RenderedLine[] }) {
    // console.log('line', line)
    const slotBoxOutId = `${line.itemOutSlot}-${line.itemOutId}`;
    const slotBoxInId = `${line.itemInSlot}-${line.itemInId}`;
  
    let slotBoxOut: any;
    let slotBoxIn: any;

    await new Promise<void>((resolve) => {
      const slotBoxOutInterval = setInterval(() => {
        slotBoxOut = document.getElementById(slotBoxOutId);
        // console.log('slotBoxOut', slotBoxOut);
        if (slotBoxOut) {
          clearInterval(slotBoxOutInterval);
          resolve();
        }
      }, 1);
    });

    await new Promise<void>((resolve) => {
      const slotBoxInInterval = setInterval(() => {
        slotBoxIn = document.getElementById(slotBoxInId);
        // console.log('slotBoxIn', slotBoxIn);
        if (slotBoxIn) {
          clearInterval(slotBoxInInterval);
          resolve();
        }
      }, 1);
    });

    // console.log('slotBoxOutId', slotBoxOutId);
    // console.log('slotBoxInId', slotBoxInId);
  
    const datetime = new Date().getTime();
  
    const [OutItemEndpoint]: QueryCommandItemEndpoint[] = this.itemsEndpoint.filter((_itemEndpoint) => _itemEndpoint.id === line.itemOutId);
    const [InItemEndpoint]: QueryCommandItemEndpoint[] = this.itemsEndpoint.filter((_itemEndpoint) => _itemEndpoint.id === line.itemInId);
  
    const [existingRenderedLine] = lineObj.renderedLines.filter((_renderedLine) => _renderedLine.from === slotBoxOutId && _renderedLine.to === slotBoxInId);
    // console.log('existingRenderedLine #2', existingRenderedLine)
    if (!existingRenderedLine) {

      lineObj.renderedLines.push({
        id: line.id,
        from: slotBoxOutId,
        fromName: line.itemOutId,
        fromSlot: line.itemOutSlot,
        fromItem: OutItemEndpoint,
        to: slotBoxInId,
        toName: line.itemInId,
        toSlot: line.itemInSlot,
        toItem: InItemEndpoint,
        line: new LeaderLine(slotBoxOut, slotBoxIn, {
          path: 'fluid',
          color: '#e8e8e8',
          size: 2,
          middleLabel: LeaderLine.pathLabel(`${line.label}`),
          endPlugOutline: false,
          endPlugSize: 1,
          endPlug: 'arrow2',
          positionByWindowResize: true,
        }),
        datetime,
      });

      // console.log('line drawn!')
    }
  }

  async removeLine(outId: string, outSlot: string, lineObj: { renderedLines: RenderedLine[] }): Promise<void> {
    return new Promise<void>((resolve) => {
      // console.log('this.lines', this.lines);

      const [willBeRemovedLine]: Line[] = this.lines.filter((_line) => 
        _line.itemOutId === outId &&
        _line.itemOutSlot === outSlot
      );
      if (willBeRemovedLine) {
        // console.log('willBeRemovedLine', willBeRemovedLine);
        this.store.dispatch(RemoveLine({ line: willBeRemovedLine }));
    
        const [willBeRemovedRenderedLine]: RenderedLine[] = lineObj.renderedLines.filter((_renderedLine) => _renderedLine.id === willBeRemovedLine.id); 
        if (willBeRemovedRenderedLine) {
          // console.log('willBeRemovedRenderedLine', willBeRemovedRenderedLine)
          willBeRemovedRenderedLine.line.remove();
          // console.log('line removed!')
      
          lineObj.renderedLines = lineObj.renderedLines.filter((_renderedLine) => _renderedLine.id !== willBeRemovedLine.id);        
        }
      }  
      resolve();
    });
  }

  async removeAllLine(lineObj: { renderedLines: RenderedLine[] }): Promise<void> {
    // console.log('removeAllLine!!!')
    return new Promise((resolve) => {
      for (let i = lineObj.renderedLines.length - 1; i >= 0; i--) {
        lineObj.renderedLines[i].line.remove();
        lineObj.renderedLines.splice(i, 1);
      }  
    
      this.store.dispatch(RemoveAllLine());
      
      resolve();
    });
  };
  
  async triggerLineRemoval(targetItem: QueryCommandItem, lineObj: { renderedLines: RenderedLine[] }) {
    if (this.itemsEndpoint && this.itemsEndpoint.length > 0) {  
      // temporary fix
      const [itemEndpoint] = this.itemsEndpoint.filter((_itemEndpoint) => _itemEndpoint.id === targetItem.id);
      if (itemEndpoint) {
        if (itemEndpoint.in.isExist && itemEndpoint.in.isActive) {
          // console.log('itemEndpoint.in.isExist && itemEndpoint.in.isActive')
          await this.getPeerQueryCommandItemFromInSlotAndRemoveLine(itemEndpoint.id, 'in', lineObj);

          this.findReferedDatasetAndClear(itemEndpoint.id, 'in');
          this.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'in');
        }

        if (itemEndpoint.multiIn.isExist && itemEndpoint.multiIn.isActive) {
          // console.log('itemEndpoint.multiIn.isExist && itemEndpoint.multiIn.isActive')
          await this.getPeerQueryCommandItemFromInSlotAndRemoveLine(itemEndpoint.id, 'multiIn', lineObj);

          this.findReferedDatasetAndClear(itemEndpoint.id, 'multiIn');
          this.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'multiIn');
        }

        if (itemEndpoint.out.isExist && itemEndpoint.out.isActive) {
          // console.log('itemEndpoint.out.isExist && itemEndpoint.out.isActive')
          this.removeLine(itemEndpoint.id, 'out', lineObj);

          this.findReferedDatasetAndClear(itemEndpoint.id, 'out');
          this.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'out');
        }

        if (itemEndpoint.branch.isExist && itemEndpoint.branch.isActive) {
          // console.log('itemEndpoint.branch.isExist && itemEndpoint.branch.isActive')
          this.removeLine(itemEndpoint.id, 'branch', lineObj);

          this.findReferedDatasetAndClear(itemEndpoint.id, 'branch');
          this.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'branch');
        }

        if (itemEndpoint.multiOut.isExist && itemEndpoint.multiOut.isActive) {
          // console.log('itemEndpoint.multiOut.isExist && itemEndpoint.multiOut.isActive')
          this.removeLine(itemEndpoint.id, 'multiOut', lineObj);

          this.findReferedDatasetAndClear(itemEndpoint.id, 'multiOut');
          this.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'multiOut');
        }

        // self uncheck
        const newItemEndpoint = { ...itemEndpoint };
        if (itemEndpoint.in.isExist) {
          newItemEndpoint.in = {
            isExist: itemEndpoint.in.isExist,
            isActive: false,
            from: []
          };
        }

        if (itemEndpoint.multiIn.isExist) {
          newItemEndpoint.multiIn = {
            isExist: itemEndpoint.multiIn.isExist,
            isActive: false,
            from: []
          };
        }

        if (itemEndpoint.out.isExist) {
          newItemEndpoint.out = {
            isExist: itemEndpoint.out.isExist,
            isActive: false,
            to: []
          };
        }

        if (itemEndpoint.branch.isExist) {
          newItemEndpoint.branch = {
            isExist: itemEndpoint.branch.isExist,
            isActive: false,
            to: []
          };
        }

        if (itemEndpoint.multiOut.isExist) {
          newItemEndpoint.multiOut = {
            isExist: itemEndpoint.multiOut.isExist,
            isActive: false,
            to: []
          };
        }

        this.store.dispatch(UpdateQueryCommandItemEndpoint({
          id: newItemEndpoint.id,
          objs: [
            { key: 'in', value: newItemEndpoint.in },
            { key: 'multiIn', value: newItemEndpoint.multiIn },
            { key: 'out', value: newItemEndpoint.out },
            { key: 'branch', value: newItemEndpoint.branch },
            { key: 'multiOut', value: newItemEndpoint.multiOut },
          ]
        }));

        this.store.dispatch(SetIsNodesModelToPql({ isNodesModelToPql: true }));
        await this.getPqlFromQueryCommandItems('triggerLineRemoval');
      }
    }
  }

  generateLineConnections() {
    if (!this.itemsEndpoint) return;
    // console.log('this.itemsEndpoint', this.itemsEndpoint);

    const connections = [];
    const filteredQueryCommandItemsEndpoint = this.itemsEndpoint.filter((queryCommandItemEndpoint: QueryCommandItemEndpoint) => (
      (queryCommandItemEndpoint.out && queryCommandItemEndpoint.out.isActive && queryCommandItemEndpoint.out.to && queryCommandItemEndpoint.out.to.length > 0) ||
      (queryCommandItemEndpoint.branch && queryCommandItemEndpoint.branch.isActive && queryCommandItemEndpoint.branch.to && queryCommandItemEndpoint.branch.to.length > 0) ||
      (queryCommandItemEndpoint.multiOut && queryCommandItemEndpoint.multiOut.isActive && queryCommandItemEndpoint.multiOut.to && queryCommandItemEndpoint.multiOut.to.length > 0)
    ));
    // console.log('filteredQueryCommandItemsEndpoint', filteredQueryCommandItemsEndpoint)
    filteredQueryCommandItemsEndpoint.forEach((queryCommandItemEndpoint: QueryCommandItemEndpoint) => {
      // console.log('queryCommandItemEndpoint', {...queryCommandItemEndpoint});

      if (queryCommandItemEndpoint.out && queryCommandItemEndpoint.out.isActive) {
        const nextEndpointItemIn = _.find(this.itemsEndpoint, (_queryCommandItemEndpoint: QueryCommandItemEndpoint) => {
          const endpointItem = _queryCommandItemEndpoint.in && _queryCommandItemEndpoint.in.from && _queryCommandItemEndpoint.in.from.length > 0 ?
            _.find(_queryCommandItemEndpoint.in.from, (item: EndpointSlot) => item.itemName === queryCommandItemEndpoint.id && item.slotName === 'out') : null;
          // console.log('endpointItem in', endpointItem)
          return endpointItem && _queryCommandItemEndpoint.in && _queryCommandItemEndpoint.in.isExist && _queryCommandItemEndpoint.in.isActive;
        });

        const nextEndpointItemMultiIn = _.find(this.itemsEndpoint, (_queryCommandItemEndpoint: QueryCommandItemEndpoint) => {
          const endpointItem = _queryCommandItemEndpoint.multiIn && _queryCommandItemEndpoint.multiIn.from && _queryCommandItemEndpoint.multiIn.from.length > 0 ?
            _.find(_queryCommandItemEndpoint.multiIn.from, (item: EndpointSlot) => item.itemName === queryCommandItemEndpoint.id && item.slotName === 'out') : null;
          // console.log('endpointItem multiIn', endpointItem)
          return endpointItem && _queryCommandItemEndpoint.multiIn && _queryCommandItemEndpoint.multiIn.isExist && _queryCommandItemEndpoint.multiIn.isActive;
        });

        const connection = {
          keyOut: 'out',
          slotBoxOutId: `out-${queryCommandItemEndpoint.id}`,
          slotBoxOutName: queryCommandItemEndpoint.id,
          outItem: queryCommandItemEndpoint as QueryCommandItemEndpoint,
          keyIn: '',
          slotBoxInId: '',
          slotBoxInName: '',
          inItem: null,
          label: queryCommandItemEndpoint.name,
        };

        if (nextEndpointItemIn) {
          // console.log('nextEndpointItemIn', nextEndpointItemIn);
          connection.keyIn = 'in';
          connection.slotBoxInId = `in-${nextEndpointItemIn.id}`;
          connection.inItem = nextEndpointItemIn;
          connection.slotBoxInName = nextEndpointItemIn.id;
        }

        if (nextEndpointItemMultiIn) {
          // console.log('nextEndpointItemMultiIn', nextEndpointItemMultiIn);
          connection.keyIn = 'multiIn';
          connection.slotBoxInId = `multiIn-${nextEndpointItemMultiIn.id}`;
          connection.inItem = nextEndpointItemMultiIn;
          connection.slotBoxInName = nextEndpointItemMultiIn.id;
        }

        // console.log('### connection', connection);

        if (connection.outItem && connection.inItem && connection.outItem.id !== connection.inItem.id) {
          connections.push(connection);
        }
      }

      if (queryCommandItemEndpoint.branch && queryCommandItemEndpoint.branch.isActive) {
        // console.log('queryCommandItemEndpoint.branch.isActive');
        const nextEndpointItemIn = _.find(this.itemsEndpoint, (_queryCommandItemEndpoint: QueryCommandItemEndpoint) => {
          const endpointItem = _queryCommandItemEndpoint.in && _queryCommandItemEndpoint.in.from && _queryCommandItemEndpoint.in.from.length > 0 ?
            _.find(_queryCommandItemEndpoint.in.from, (item: EndpointSlot) => item.itemName === queryCommandItemEndpoint.id && item.slotName === 'branch') : null;
          return endpointItem && _queryCommandItemEndpoint.in && _queryCommandItemEndpoint.in.isExist && _queryCommandItemEndpoint.in.isActive;
        });

        const nextEndpointItemMultiIn = _.find(this.itemsEndpoint, (_queryCommandItemEndpoint: QueryCommandItemEndpoint) => {
          const endpointItem = _queryCommandItemEndpoint.multiIn && _queryCommandItemEndpoint.multiIn.from && _queryCommandItemEndpoint.multiIn.from.length > 0 ?
            _.find(_queryCommandItemEndpoint.multiIn.from, (item: EndpointSlot) => item.itemName === queryCommandItemEndpoint.id && item.slotName === 'branch') : null;
          return endpointItem && _queryCommandItemEndpoint.multiIn && _queryCommandItemEndpoint.multiIn.isExist && _queryCommandItemEndpoint.multiIn.isActive;
        });

        const connection = {
          keyOut: 'branch',
          slotBoxOutId: `branch-${queryCommandItemEndpoint.id}`,
          slotBoxOutName: queryCommandItemEndpoint.id,
          outItem: queryCommandItemEndpoint as QueryCommandItemEndpoint,
          keyIn: '',
          slotBoxInId: '',
          slotBoxInName: '',
          inItem: null,
          label: queryCommandItemEndpoint.name,
        };

        if (nextEndpointItemIn) {
          // console.log('nextEndpointItemIn', nextEndpointItemIn.name);
          connection.keyIn = 'in';
          connection.slotBoxInId = `in-${nextEndpointItemIn.id}`;
          connection.inItem = nextEndpointItemIn;
          connection.slotBoxInName = nextEndpointItemIn.id;
        }

        if (nextEndpointItemMultiIn) {
          // console.log('nextEndpointItemMultiIn', nextEndpointItemMultiIn.name);
          connection.keyIn = 'multiIn';
          connection.slotBoxInId = `multiIn-${nextEndpointItemMultiIn.id}`;
          connection.inItem = nextEndpointItemMultiIn;
          connection.slotBoxInName = nextEndpointItemMultiIn.id;
        }

        if (connection.outItem && connection.inItem && connection.outItem.id !== connection.inItem.id) {
          connections.push(connection);
        }
      }

      if (queryCommandItemEndpoint.multiOut && queryCommandItemEndpoint.multiOut.isActive) {
        // console.log('queryCommandItemEndpoint.multiOut.isActive');
        const nextEndpointItemIn = _.find(this.itemsEndpoint, (_queryCommandItemEndpoint: QueryCommandItemEndpoint) => {
          const endpointItem = _queryCommandItemEndpoint.in && _queryCommandItemEndpoint.in.from && _queryCommandItemEndpoint.in.from.length > 0 ?
            _.find(_queryCommandItemEndpoint.in.from, (item: EndpointSlot) => item.itemName === queryCommandItemEndpoint.id && item.slotName === 'multiOut') : null;
          return endpointItem && _queryCommandItemEndpoint.in && _queryCommandItemEndpoint.in.isExist && _queryCommandItemEndpoint.in.isActive;
        });

        const nextEndpointItemMultiIn = _.find(this.itemsEndpoint, (_queryCommandItemEndpoint: QueryCommandItemEndpoint) => {
          const endpointItem = _queryCommandItemEndpoint.multiIn && _queryCommandItemEndpoint.multiIn.from && _queryCommandItemEndpoint.multiIn.from.length > 0 ?
            _.find(_queryCommandItemEndpoint.multiIn.from, (item: EndpointSlot) => item.itemName === queryCommandItemEndpoint.id && item.slotName === 'multiOut') : null;
          return endpointItem && _queryCommandItemEndpoint.multiIn && _queryCommandItemEndpoint.multiIn.isExist && _queryCommandItemEndpoint.multiIn.isActive;
        });

        const connection = {
          keyOut: 'multiOut',
          slotBoxOutId: `multiOut-${queryCommandItemEndpoint.id}`,
          slotBoxOutName: queryCommandItemEndpoint.id,
          outItem: queryCommandItemEndpoint as QueryCommandItemEndpoint,
          keyIn: '',
          slotBoxInId: '',
          slotBoxInName: '',
          inItem: null,
          label: queryCommandItemEndpoint.name,
        };

        if (nextEndpointItemIn) {
          // console.log('nextEndpointItemIn', nextEndpointItemIn.name);
          connection.keyIn = 'in';
          connection.slotBoxInId = `in-${nextEndpointItemIn.id}`;
          connection.inItem = nextEndpointItemIn;
          connection.slotBoxInName = nextEndpointItemIn.id;
        }

        if (nextEndpointItemMultiIn) {
          // console.log('nextEndpointItemMultiIn', nextEndpointItemMultiIn.name);
          connection.keyIn = 'multiIn';
          connection.slotBoxInId = `multiIn-${nextEndpointItemMultiIn.id}`;
          connection.inItem = nextEndpointItemMultiIn;
          connection.slotBoxInName = nextEndpointItemMultiIn.id;
        }

        if (connection.outItem && connection.inItem && connection.outItem.id !== connection.inItem.id) {
          connections.push(connection);
        }
      }
    });

    // console.log('connections', connections)

    if (connections && connections.length > 0) {
      const lines = [];

      for (const connection of connections) {
        if (connection.slotBoxOutId && connection.slotBoxInId) {
          // console.log('(connection.inItem as QueryCommandItemEndpoint)', (connection.inItem as QueryCommandItemEndpoint))
          let labelAlias = '';
          if (this.itemsPropertyAndValue && this.itemsPropertyAndValue.length > 0) {
            const [queryCommandItemPropertyAndValue] = this.itemsPropertyAndValue.filter((itemPropertyAndValue) => itemPropertyAndValue.id === (connection.inItem as QueryCommandItemEndpoint).id);
            if (queryCommandItemPropertyAndValue) {
              // console.log('queryCommandItemPropertyAndValue', queryCommandItemPropertyAndValue)
              const [_fromDataset]: QueryCommandProperty[] = queryCommandItemPropertyAndValue.commandProperties.filter((commandProperty) => commandProperty.name === 'from');
              // console.log('_fromDataset', _fromDataset)
              if (_fromDataset) {
                labelAlias = _fromDataset.value;
              }

              const [_fromsDataset]: QueryCommandProperty[] = queryCommandItemPropertyAndValue.commandProperties.filter((commandProperty) => commandProperty.name === 'froms');
              if (_fromsDataset) {
                const [outItemPropertyAndValue] = this.itemsPropertyAndValue.filter((_itemPropertyAndValue) => _itemPropertyAndValue.id === (connection.outItem as QueryCommandItemEndpoint).id);
                const [outItemIntoCommandProperty] = outItemPropertyAndValue.commandProperties.filter((_commandProperty) => _commandProperty.name === 'into');
                labelAlias = outItemIntoCommandProperty.value;
              }

              const [_tablesDataset]: QueryCommandProperty[] = queryCommandItemPropertyAndValue.commandProperties.filter((commandProperty) => commandProperty.name === 'tables');
              if (_tablesDataset) {
                labelAlias = _tablesDataset.value;
              }

              let _correlateRef: QueryCommandProperty = null;
              if (connection.keyIn === 'in') {
                [_correlateRef] = queryCommandItemPropertyAndValue.commandProperties.filter((commandProperty) => commandProperty.name === 'src');
                if (_correlateRef && _correlateRef.value && _correlateRef.value.length > 0) {
                  const [_srcValue] = _correlateRef.value.filter((_item) => _item.name === 'table');
                  if (_srcValue) {
                    labelAlias = _srcValue.value;
                  }
                }
              }

              if (connection.keyIn === 'multiIn') {
                [_correlateRef] = queryCommandItemPropertyAndValue.commandProperties.filter((commandProperty) => commandProperty.name === 'ref');
                if (_correlateRef && _correlateRef.value && _correlateRef.value.length > 0) {
                  const [_refValue] = _correlateRef.value.filter((_item) => _item.name === 'table');
                  if (_refValue) {
                    labelAlias = _refValue.value;
                  }
                }
              }
            }
          }          
          
          const line = {
            id: uuid(),
            itemOutId: connection.slotBoxOutName,
            itemOutSlot: connection.keyOut,
            itemInId: connection.slotBoxInName,
            itemInSlot: connection.keyIn,
            label: labelAlias
          };

          const [existingLine]: Line[] = this.lines.filter((_line: Line) =>
            _line.itemOutId === line.itemOutId &&
            _line.itemOutSlot === line.itemOutSlot &&
            _line.itemInId === line.itemInId &&
            _line.itemInSlot === line.itemInSlot
          );
          // console.log('existingLine', existingLine)
          if (!existingLine) {
            lines.push(line);
          }
        }
      };

      this.store.dispatch(AddLines({ lines }));
    }
  }

  _getDragPosition() {
    // console.log('this.itemsDragPosition', this.itemsDragPosition)
    if (this.itemsDragPosition && this.itemsDragPosition.length > 0) {
      let lastFarestX = 0;
      let lastFarestY = 0;
      let lastItemId = null;
  
      for (const _itemDragPosition of this.itemsDragPosition) {
        if (lastFarestX < _itemDragPosition.dragPosition.x) {
          lastFarestX = _itemDragPosition.dragPosition.x;
        }
      };
  
      const filteredItems = this.itemsDragPosition.filter((_itemDragPosition) => _itemDragPosition.dragPosition.x >= lastFarestX - 79 && _itemDragPosition.dragPosition.x <= lastFarestX);
      for (const _itemDragPosition of filteredItems) {
        // console.log('_itemDragPosition', _itemDragPosition)
        if (lastFarestY < _itemDragPosition.dragPosition.y) {
          // console.log('got it!')
          lastFarestY = _itemDragPosition.dragPosition.y;
          lastItemId = _itemDragPosition.id;
        }
      };
  
      // console.log('lastFarestX', lastFarestX);
      // console.log('lastFarestY', lastFarestY);
      // console.log('lastItemId', lastItemId);
  
      const [filteredItemDragPosition]: QueryCommandItemDragPosition[] = this.itemsDragPosition.filter(
        (queryCommandItemDragPosition) => queryCommandItemDragPosition.id === lastItemId
      );
      // console.log('filteredItemDragPosition', filteredItemDragPosition);
      if (filteredItemDragPosition) {
        let xShift = 0;
        let yShift = 0;
        if (filteredItemDragPosition.dragPosition.y >= 460) {
          xShift = 80;
          yShift = 560;
        }
        // console.log('xShift', xShift);
        // console.log('yShift', yShift);
        return {
          x: filteredItemDragPosition.dragPosition.x + xShift,
          y: filteredItemDragPosition.dragPosition.y + 80 - yShift,
        };
      }
    }
  
    return {
      x: 260,
      y: 40,
    };
  };
}
