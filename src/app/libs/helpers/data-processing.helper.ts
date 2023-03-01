import { Store } from '@ngrx/store';
import { AppState } from '../store/states';
import { last, lastValueFrom, skipWhile, take } from 'rxjs';
import { TreeviewItem } from 'ngx-treeview';
import _ from 'lodash';

import { DatasourceService } from 'src/app/libs/services';

import textCollections_EN from 'src/assets/data/config/messages/en.json';
import textCollections_ID from 'src/assets/data/config/messages/id.json';

import queryCmdUICfgs_EN from 'src/assets/data/dataprocessing/query-cmd-ui-cfgs_en.json';
import queryCmdUICfgs_ID from 'src/assets/data/dataprocessing/query-cmd-ui-cfgs_id.json';

import queryCmdProps from 'src/assets/data/dataprocessing/query-cmd-props.json';

import { ReplaceQueryCommandItemsPropertyAndValue, UpdateQueryCommandItemPropertyValue } from 'src/app/libs/store/actions/pds/dataprocessing.actions';

import { queryCommandItemsDragPositionSelector, queryCommandItemsPropertyAndValueSelector, queryCommandItemsSelector } from 'src/app/libs/store/selectors/dataprocessing.selectors';
import { QueryCommandItem } from '../models';

import shortHash from 'short-hash';

declare var LeaderLine: any;
declare var document: any;

export const getTextCollections = function (lang: string = 'en') {
  return lang && lang === 'en' ? textCollections_EN : textCollections_ID;
};

export const sortTreeviewItems = function (treeviewItems: TreeviewItem[]) {
  // console.log('treeviewItems', [...treeviewItems]);

  const folder = treeviewItems.filter((treeviewItem: TreeviewItem) => treeviewItem.value.isDir);
  const file = treeviewItems.filter((treeviewItem: TreeviewItem) => !treeviewItem.value.isDir);

  // console.log('folder', [...folder]);
  // console.log('file', [...file]);

  folder.sort(function (a, b) {
    if (a.text.toLowerCase() < b.text.toLowerCase()) {
      return -1;
    }

    if (a.text.toLowerCase() > b.text.toLowerCase()) {
      return 1;
    }

    return 0;
  });

  file.sort(function (a, b) {
    if (a.text.toLowerCase() < b.text.toLowerCase()) {
      return -1;
    }

    if (a.text.toLowerCase() > b.text.toLowerCase()) {
      return 1;
    }

    return 0;
  });

  
  // treeviewItems = folder.concat(file);

  // console.log('treeviewItems', [...treeviewItems]);
  return folder.concat(file);
};

export const convertDatasourceItemsToTreeviewItems = function (
  datasourceItems: DataSourceItemV2[],
  treeviewItems?: TreeviewItem[]
) {
  const folder = datasourceItems.filter((datasourceItem) => datasourceItem.isDir);
  const file = datasourceItems.filter((datasourceItem) => !datasourceItem.isDir);

  folder.sort(function (a, b) {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }

    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }

    return 0;
  });

  file.sort(function (a, b) {
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }

    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }

    return 0;
  });

  const sortedResourceItems = folder.concat(file);

  const newTreeviewItems = sortedResourceItems.map((sortedResourceItem: DataSourceItemV2) => {
    let collapsed = true;
    let children = null;

    if (treeviewItems) {
      const filteredTreeviewItemChildren = treeviewItems.filter(
        (item) => item && item.value && item.value.name === sortedResourceItem.name
      );
      if (filteredTreeviewItemChildren && filteredTreeviewItemChildren.length > 0) {
        collapsed = !!filteredTreeviewItemChildren[0].collapsed;
        children = filteredTreeviewItemChildren[0].children ? filteredTreeviewItemChildren[0].children : null;
      }
    }

    const newTreeviewItem = convertDatasourceItemToTreeviewItem(sortedResourceItem);
    newTreeviewItem.collapsed = collapsed;
    newTreeviewItem.children = children;

    return newTreeviewItem;
  });

  return newTreeviewItems && newTreeviewItems.length > 0 ? newTreeviewItems : null;
};

export const convertDatasourceItemToTreeviewItem = function (datasourceItem: DataSourceItemV2) {
  let item =  new TreeviewItem({
    collapsed: true,
    text: datasourceItem.name,
    value: datasourceItem,
    checked: false,
    disabled: false,
    children: null,
  });

  return item;
};

const _getItemPosition = function (
  treeViewItems: TreeviewItem[],
  itemSubject: TreeviewItem
) {
  if (!treeViewItems) {
    return null;
  }

  let found = false;
  let itemFound: TreeviewItem = null;
  const iLen = treeViewItems.length;

  // console.log("treeViewItems", iLen, treeViewItems);
  // console.log("itemSubject", itemSubject);
  // console.log("====================================================");

  let i = 0;
  while (!found && treeViewItems[i] && i < iLen) {
    // console.log(
    //   "treeViewItems[i]",
    //   treeViewItems[i],
    //   treeViewItems[i].children
    // );
    if (treeViewItems[i].children) {
      let j = 0;
      let jLen = treeViewItems[i].children.length;

      while (!found && treeViewItems[i].children[j] && j < jLen) {
        // console.log(
        //   "treeViewItems[i].children[j]",
        //   treeViewItems[i].children[j],
        //   treeViewItems[i].children[j].children
        // );

        if (treeViewItems[i].children[j].value.id === itemSubject.value.id) {
          found = true;
          itemFound = treeViewItems[i];
          // console.log("Found!", itemFound);
        }

        if (!found && treeViewItems[i].children) {
          // console.log("continue!");
          itemFound = _getItemPosition(treeViewItems[i].children, itemSubject);
        }

        j++;
      }
    }

    i++;
  }

  return itemFound;
};

export const getItemPosition = function (
  treeViewItems: TreeviewItem[],
  itemSubject: TreeviewItem
) {
  // console.log('treeViewItems', treeViewItems);
  return _getItemPosition(treeViewItems, itemSubject);
};

const _pushDsItemToChildren = function (
  treeViewItems: TreeviewItem[],
  currentTreeItem: TreeviewItem,
  treeviewItemToAdd: TreeviewItem
) {
  let found = false;
  let i = 0;

  // console.log('treeViewItems', treeViewItems);
  if (currentTreeItem.value.isRoot) {
    found = true;
    
    if (!treeViewItems[0].children) {
      treeViewItems[0].children = [treeviewItemToAdd];
    } else {
      treeViewItems[0].children.push(treeviewItemToAdd);
      treeViewItems[0].children = sortTreeviewItems(treeViewItems[0].children);
    }
  }

  /*
  while (!found && treeViewItems[i]) {
    const treeViewItem = treeViewItems[i];
    // console.log('treeViewItem', treeViewItem);
    // console.log('currentTreeItem', currentTreeItem);

    if (treeViewItem.value.name === currentTreeItem.value.name) {
      found = true;
      if (!treeViewItem.children) {
        treeViewItem.children = [treeviewItemToAdd];
      } else {
        treeViewItem.children.push(treeviewItemToAdd);
        treeViewItem.children = sortTreeviewItems(treeViewItem.children);
      }
      // console.log('treeViewItem.children 1', treeViewItem.children);
    } else {
      if (treeViewItem.children && treeViewItem.children.length > 0) {
        _pushDsItemToChildren(treeViewItem.children, currentTreeItem, treeviewItemToAdd);
        treeViewItem.children = sortTreeviewItems(treeViewItem.children);
        // console.log('treeViewItem.children 2', treeViewItem.children);
      }
    }

    i++;
  }
  */
};

export const pushDsItemToChildren = function (
  treeViewItems: TreeviewItem[],
  currentTreeItem: TreeviewItem,
  itemToAdd: DataSourceItemV2
) {
  const treeviewItem = convertDatasourceItemToTreeviewItem(itemToAdd);
  // console.log('treeviewItem', treeviewItem, itemToAdd)

  // console.log('treeViewItems', [...treeViewItems]);
  // console.log('currentTreeItem', {...currentTreeItem});
  // console.log('itemToAdd', {...treeviewItem});

  _pushDsItemToChildren(treeViewItems, currentTreeItem, treeviewItem);

  return treeViewItems;
};

const _addRemoveItemInTree = function(
  treeViewItems: TreeviewItem[],
  treePosition: TreeviewItem,
  itemSubject: TreeviewItem,  
) {
  let foundAdd = false;
  let foundRemove = false;
  let i = 0;
  while ((!foundAdd || !foundRemove) && treeViewItems[i]) {
    // console.log('treeViewItem', {...treeViewItems[i]});

    if (!foundRemove && treeViewItems[i] && treeViewItems[i].value.id === itemSubject.value.id) {
      // console.log('### found item to remove ', treeViewItems[i].value.path);
      foundRemove = true;
      treeViewItems.splice(i, 1);    
    }

    if (!foundRemove && treeViewItems[i] && treeViewItems[i].value.id !== treePosition.value.id && treeViewItems[i].children) {
      treeViewItems[i].children.forEach((_treeviewItem: TreeviewItem, j) => {
        if (_treeviewItem.value.id === itemSubject.value.id) {
          // console.log('### found item to remove at path ', treeViewItems[i].value.path);
          foundRemove = true;
          treeViewItems[i].children.splice(j, 1);    
        }
      });
    }

    if (!foundAdd && treeViewItems[i] && treeViewItems[i].value.id === treePosition.value.id) {
      // console.log('### position to add found at ', treeViewItems[i].value.path);
      foundAdd = true;

      // add
      if (treeViewItems[i].children) {
        // console.log('here 1')
        treeViewItems[i].children.push(itemSubject);
        treeViewItems[i].children = sortTreeviewItems(treeViewItems[i].children);
      } else {
        // console.log('here 2')
        treeViewItems[i].children = [itemSubject];
      }

      // console.log('treeViewItem.children', [...treeViewItems[i].children]);
    }
    
    if ((!foundAdd || !foundRemove) && treeViewItems[i] && treeViewItems[i].children) {
      // console.log('### continue to children of ', treeViewItems[i].value.path);
      if (treeViewItems[i].children && treeViewItems[i].children.length > 0) {
        _addRemoveItemInTree(treeViewItems[i].children, treePosition, itemSubject);
      }
    }

    i++;
  }
};

export const addRemoveItemInTree = function(
  treeViewItems: TreeviewItem[],
  treePosition: TreeviewItem,
  itemSubject: TreeviewItem,  
) {
  _addRemoveItemInTree(treeViewItems, treePosition, itemSubject);

  // console.log('treeViewItems', [...treeViewItems])

  return treeViewItems;
};

const _addItemToTree = function(
  treeViewItems: TreeviewItem[],
  treePosition: TreeviewItem,
  itemToAdd: TreeviewItem,
) {
  if (!treePosition) return;

  let found = false;
  let i = 0;
  while (!found && treeViewItems[i]) {
    if (treeViewItems[i].value.id === treePosition.value.id) {
      // console.log('### found!');
      found = true;
      
      if (treeViewItems[i].children) {
        // console.log('here 1')
        treeViewItems[i].children.push(itemToAdd);
        treeViewItems[i].children = sortTreeviewItems(treeViewItems[i].children);
      } else {
        // console.log('here 2')
        treeViewItems[i].children = [itemToAdd];
      }

      // console.log('treeViewItem.children', [...treeViewItems[i].children]);
    } else {
      const children = treeViewItems[i].children;
      // console.log('has children', children);
      if (children && children.length > 0) {
        _addItemToTree(children, treePosition, itemToAdd);
      }
    }

    i++;
  }
};

export const addItemToTree = function(
  treeViewItems: TreeviewItem[],
  treePosition: TreeviewItem,
  itemToAdd: TreeviewItem,
) {
  _addItemToTree(treeViewItems, treePosition, itemToAdd);

  // console.log('treeViewItems', [...treeViewItems])

  return treeViewItems;
};

const _removeItemFromTree = function (
  treeViewItems: TreeviewItem[],
  treePosition: TreeviewItem,
  currentTreeItem: TreeviewItem
) {
  if (!treePosition) return;

  let found = false;
  let i = 0;
  const iLen = treeViewItems.length;

  while (!found && treeViewItems[i] && i < iLen) {
    const treeViewItem = treeViewItems[i];
    if (treeViewItem.value.id === treePosition.value.id) {
      if (treeViewItems[i].children) {
        let j = 0;
        const jLen = treeViewItems[i].children.length;

        while (!found && treeViewItems[i].children[j] && j < jLen) {
          if (
            treeViewItems[i].children[j].value.id === currentTreeItem.value.id
          ) {
            found = true;
            treeViewItems[i].children.splice(j, 1);
          }

          j++;
        }
      }
      // treeViewItems[i] = null;
    } else {
      const children = treeViewItem.children;
      // console.log('has children', children);
      if (children && children.length > 0) {
        _removeItemFromTree(children, treePosition, currentTreeItem);
      }
    }

    i++;
  }
};

export const removeItemFromTree = function (treeViewItems: TreeviewItem[], treePosition: TreeviewItem, itemToRemove: TreeviewItem) {
  _removeItemFromTree(treeViewItems, treePosition, itemToRemove);

  return treeViewItems;
};

const _attachChildrenToItem = function (
  treeViewItems: TreeviewItem[],
  currentTreeItem: TreeviewItem,
  childRawTreeItems: DataSourceItemV2[]
) {
  let found = false;
  let i = 0;
  while (!found && treeViewItems[i]) {
    const treeViewItem = treeViewItems[i];
    if (treeViewItem.value.name === currentTreeItem.value.name) {
      found = true;

      const folder = childRawTreeItems.filter((dst) => dst.isDir);
      const file = childRawTreeItems.filter((dst) => !dst.isDir);

      folder.sort(function (a, b) {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1;
        }

        if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1;
        }

        return 0;
      });

      file.sort(function (a, b) {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return -1;
        }

        if (a.name.toLowerCase() > b.name.toLowerCase()) {
          return 1;
        }

        return 0;
      });

      const dataSourceChildTreeItems = folder.concat(file);

      const children = convertDatasourceItemsToTreeviewItems(dataSourceChildTreeItems);
      if (children && children.length > 0) {
        treeViewItem.children = children;
      }
    } else {
      const children = treeViewItem.children;
      // console.log('has children', children);
      if (children && children.length > 0) {
        _attachChildrenToItem(children, currentTreeItem, childRawTreeItems);
      }
    }

    i++;
  }
};

export const attachChildrenToItem = function (
  treeViewItems: TreeviewItem[],
  currentTreeItem: TreeviewItem,
  childRawTreeItems: DataSourceItemV2[]
) {
  _attachChildrenToItem(treeViewItems, currentTreeItem, childRawTreeItems);

  return treeViewItems;
};

export const _syncTreeviewItems = async function (
  datasourceService: DatasourceService,
  path: string,
  treeviewItems: TreeviewItem[]
) {
  const apiResult: ApiResult = await new Promise((resolve) =>
    datasourceService.list(path).subscribe({
      next: (res) => resolve(res),
    })
  );
  if (apiResult && apiResult.status === 'success' && apiResult.response && apiResult.response.length > 0) {
    if (!treeviewItems) {
      treeviewItems = [];
    }

    const childDataSourceItems: DataSourceItemV2[] = apiResult.response;

    // console.log('treeviewItems', [...treeviewItems]);
    // console.log('childDataSourceItems', [...childDataSourceItems]);

    if (childDataSourceItems && childDataSourceItems.length > 0) {
      childDataSourceItems.forEach(async (childDataSourceItem: DataSourceItemV2) => {

        // find EXISTING treeviewItem with the same ID as childDataSourceItem
        const treeviewItemIndex = _.findIndex(
          treeviewItems,
          (treeviewItem) => treeviewItem.value.id === childDataSourceItem.id
        );

        // console.log('childDataSourceItem', childDataSourceItem);
        // console.log('treeviewItemIndex', treeviewItemIndex);

        if (treeviewItemIndex < 0) {
          // DOESN'T EXIST
          // console.log('Added to tree')
          treeviewItems.push(convertDatasourceItemToTreeviewItem(childDataSourceItem));
        } else {
          // DOES EXIST
          treeviewItems[treeviewItemIndex].value = childDataSourceItem;
        }

        treeviewItems = sortTreeviewItems(treeviewItems);

        // console.log('treeviewItems 1', [...treeviewItems]);

        // check if child folder is expanded 
        const isExpanded = treeviewItems[treeviewItemIndex] 
          ? !treeviewItems[treeviewItemIndex].collapsed : false;

        if (childDataSourceItem.isDir && isExpanded) {
          const tmpTreeviewItem = await _syncTreeviewItems(
            datasourceService,
            getCompletePath(childDataSourceItem),
            treeviewItemIndex > -1
              ? treeviewItems[treeviewItemIndex].children
              : treeviewItems[treeviewItems.length - 1].children
          );

          if (treeviewItemIndex > -1) {
            treeviewItems[treeviewItemIndex].children = tmpTreeviewItem;
          } else {
            treeviewItems[treeviewItems.length - 1].children = tmpTreeviewItem;
          }
        }
      });

      const _treeviewItems = [...treeviewItems];
      _treeviewItems.forEach((treeviewItem: TreeviewItem, i) => {
        const childDataSourceIndex = _.findIndex(
          childDataSourceItems,
          (dataSourceItem) => dataSourceItem.id === treeviewItem.value.id
        );

        if (childDataSourceIndex < 0) {
          // console.log('REMOVED treeviewitem!', treeviewItem);
          treeviewItems.splice(i, 1);
        }
      });

      // console.log('treeviewItems 2', [...treeviewItems]);
    }
  }


  return treeviewItems;
};

export const syncTreeviewItems = async function (
  datasourceService: DatasourceService,
  path: string,
  treeviewItems: TreeviewItem[]
) {
  return await _syncTreeviewItems(datasourceService, path, treeviewItems);
};

export const queryCommandItemPropertyAndValueIsValid = function(queryCommandItemPropertyAndValue: QueryCommandItemPropertyAndValue) {
  let isValid = true;
  let isTriggerOnSelect = false;
  let triggerValue = null;
  let subKeyPrefix = '';

  const key = queryCommandItemPropertyAndValue.id.replace(/_[0-9]+/g, '').toUpperCase();
  const queryCmdProp = queryCmdProps[key];

  // each commandProperties of queryCommandItems
  queryCommandItemPropertyAndValue.commandProperties.forEach((commandProperty: QueryCommandProperty) => {
    const slicedQueryCmdProp = queryCmdProp.properties[commandProperty.name];

    // if it is required, then check for empty values
    if (slicedQueryCmdProp && slicedQueryCmdProp.required) {
      // console.log('commandProperty', commandProperty, slicedQueryCmdProp);

      if (slicedQueryCmdProp.field_type === 'boolean') {
        if (commandProperty.value == null) {
          isValid = isValid && false;
        }
      }

      if (slicedQueryCmdProp.field_type === 'string') {
        if (!commandProperty.value) {
          isValid = isValid && false;
        }
      }

      if (slicedQueryCmdProp.field_type === 'string[]') {
        if (!commandProperty.value) {
          isValid = isValid && false;
        }
      }

      if (slicedQueryCmdProp.field_type === 'integer') {
        if (commandProperty.value === '' || isNaN(commandProperty.value)) {
          isValid = isValid && false;
        }
      }

      if (slicedQueryCmdProp.field_type === 'object') {
        if (commandProperty.name === 'src' && commandProperty.value && commandProperty.value.length > 0) {
          // console.log('commandProperty', commandProperty);
          const [filteredValueSrcTable]: QueryCommandProperty[] = commandProperty.value.filter((_value: QueryCommandProperty) => _value.name === 'table');
          const [filteredValueSrcCols]: QueryCommandProperty[] = commandProperty.value.filter((_value: QueryCommandProperty) => _value.name === 'cols');

          // console.log('filteredValueSrcTable', filteredValueSrcTable);
          // console.log('filteredValueSrcCols', filteredValueSrcCols);

          if (filteredValueSrcTable && filteredValueSrcCols && (!filteredValueSrcTable.value || !filteredValueSrcCols.value)) {
            // console.log('SRC invalid!')
            isValid = isValid && false;
          }
        }

        if (commandProperty.name === 'ref' && commandProperty.value && commandProperty.value.length > 0) {
          // console.log('commandProperty', commandProperty);
          const [filteredValueRefTable]: QueryCommandProperty[] = commandProperty.value.filter((_value: QueryCommandProperty) => _value.name === 'table');
          const [filteredValueRefCols]: QueryCommandProperty[] = commandProperty.value.filter((_value: QueryCommandProperty) => _value.name === 'cols');

          // console.log('filteredValueRefTable', filteredValueRefTable);
          // console.log('filteredValueRefCols', filteredValueRefCols);

          if (filteredValueRefTable && filteredValueRefCols && (!filteredValueRefTable.value || !filteredValueRefCols.value)) {
            // console.log('REF invalid!')
            isValid = isValid && false;
          }
        }
      }

      // console.log('####', commandProperty.name, slicedQueryCmdProp.required, commandProperty.value, isValid)
    }

    if (commandProperty.isTriggerOnSelect) {
      isTriggerOnSelect = isTriggerOnSelect || commandProperty.isTriggerOnSelect;
      triggerValue = isTriggerOnSelect ? commandProperty.value : null;
      subKeyPrefix = commandProperty.subKeyPrefix;
    }
  });

  if (isTriggerOnSelect && triggerValue && subKeyPrefix) {
    // console.log('queryCmdProp.properties', queryCmdProp.properties)
    const subKey = `${subKeyPrefix}_${triggerValue.toLowerCase()}`;
    // console.log('subKey', subKey);
    const subQryCmdProp = queryCmdProp.properties[subKey];
    // console.log('subQryCmdProp', subQryCmdProp);
    if (subQryCmdProp) {
      const propKeys = Object.keys(subQryCmdProp.properties);
      propKeys.forEach((propKey) => {
        const propObj = subQryCmdProp.properties[propKey];

        // if it is required, then check for empty values
        if (propObj && propObj.required) {
          const filteredCommandProperties: QueryCommandProperty[] = queryCommandItemPropertyAndValue.commandProperties.filter(
            (commandProperty: QueryCommandProperty) => commandProperty.name === propKey
          );
          if (filteredCommandProperties && filteredCommandProperties.length > 0) {
            if (propObj.field_type === 'string') {
              if (!filteredCommandProperties[0].value) {
                isValid = isValid && false;
              }
            }

            if (propObj.field_type === 'string[]') {
              if (!filteredCommandProperties[0].value) {
                isValid = isValid && false;
              }
            }

            if (propObj.field_type === 'integer') {
              if (filteredCommandProperties[0].value === '' && isNaN(filteredCommandProperties[0].value)) {
                isValid = isValid && false;
              }
            }
          }
        }
      });
    }
  }

  return isValid;
};

export const updateQueryCommandItemPropertyAndValue = function(queryCommandItemPropertyAndValue: QueryCommandItemPropertyAndValue, propValue: any) {
  const itemPropertyAndValue = {...queryCommandItemPropertyAndValue};

  // console.log('=============================================================================')
  // console.log('itemPropertyAndValue', itemPropertyAndValue)
  // console.log('propValue', propValue)

  let isTriggerOnSelect = false;
  let triggerValue = null;
  let subKeyPrefix = '';

  const match = itemPropertyAndValue.id.match(/(^[A-Z]+)_([0-9]+$)/);
  const queryCmdProp = queryCmdProps[match[1]];
  // console.log('queryCmdProp', queryCmdProp)

  const propKeys = Object.keys(queryCmdProp.properties);
  propKeys.forEach((propKey) => {
    itemPropertyAndValue.commandProperties = itemPropertyAndValue.commandProperties.map((commandProperty: QueryCommandProperty) => {
      if (commandProperty.isTriggerOnSelect) {
        isTriggerOnSelect = isTriggerOnSelect || commandProperty.isTriggerOnSelect;
        triggerValue = isTriggerOnSelect ? commandProperty.value : null;
        subKeyPrefix = commandProperty.subKeyPrefix;
      }

      if (commandProperty.name === propKey) {
        return {
          ...commandProperty,
          value: propValue[propKey],
        };
      }
      
      return commandProperty;
    });
  });

  if (isTriggerOnSelect && triggerValue && subKeyPrefix) {
    // console.log('queryCmdProp.properties', queryCmdProp.properties)
    const subKey = `${subKeyPrefix}_${triggerValue.toLowerCase()}`;
    // console.log('subKey', subKey);
    const subQryCmdProp = queryCmdProp.properties[subKey];
    // console.log('subQryCmdProp', subQryCmdProp);
    if (subQryCmdProp) {
      const propKeys = Object.keys(subQryCmdProp.properties);
      propKeys.forEach((propKey) => {
        itemPropertyAndValue.commandProperties = itemPropertyAndValue.commandProperties.map((commandProperty: QueryCommandProperty) => {
          if (commandProperty.name === propKey) {
            return {
              ...commandProperty,
              value: propValue[subKey][propKey]
            };
          }

          return commandProperty;
        });
      });
    }
  }

  // console.log('itemPropertyAndValue', itemPropertyAndValue)
  // console.log('=============================================================================')
  // console.log(' ')

  return itemPropertyAndValue;
};

export const updateFromProperty = function(store: Store<AppState>, queryCommandItemsPropertyAndValue: QueryCommandItemPropertyAndValue[], renderedLine: RenderedLine) {
  // modify FROM props of IN slot, First get CommandProperty Values from OUT ENDPOINT and IN ENDPOINT
  const [filteredQueryCommandItemsPropertyAndValueOutEndpoint]: QueryCommandItemPropertyAndValue[] = queryCommandItemsPropertyAndValue.filter((_queryCommandItemPropertyAndValue: QueryCommandItemPropertyAndValue) => _queryCommandItemPropertyAndValue.id === renderedLine.fromItem.id);
  const [filteredQueryCommandItemsPropertyAndValueInEndpoint]: QueryCommandItemPropertyAndValue[] = queryCommandItemsPropertyAndValue.filter((_queryCommandItemPropertyAndValue: QueryCommandItemPropertyAndValue) => _queryCommandItemPropertyAndValue.id === renderedLine.toItem.id);

  // console.log('filteredQueryCommandItemsPropertyAndValueOutEndpoint', filteredQueryCommandItemsPropertyAndValueOutEndpoint);
  // console.log('filteredQueryCommandItemsPropertyAndValueInEndpoint', filteredQueryCommandItemsPropertyAndValueInEndpoint);

  if (filteredQueryCommandItemsPropertyAndValueOutEndpoint && filteredQueryCommandItemsPropertyAndValueInEndpoint) {
    let propName = '';

    // get INTO command property of OUT ENDPOINT
    const filteredCommandPropertiesInto: QueryCommandProperty[] = filteredQueryCommandItemsPropertyAndValueOutEndpoint.commandProperties.filter((commandProperty) => commandProperty.name === 'into' || commandProperty.name === 'label');
    const propIntoValue = filteredCommandPropertiesInto ? filteredCommandPropertiesInto[0].value : null;

    // get FROM/FROMS/SRC/REF command property of IN ENDPOINT
    let propFromValue = null;
    const filteredCommandPropertiesFrom: QueryCommandProperty[] = filteredQueryCommandItemsPropertyAndValueInEndpoint.commandProperties.filter((commandProperty) => commandProperty.name === 'from' || commandProperty.name === 'froms' || commandProperty.name === 'src' || commandProperty.name === 'ref');
    // console.log('filteredCommandPropertiesFrom', filteredCommandPropertiesFrom)
    if (filteredCommandPropertiesFrom) {
      if (filteredCommandPropertiesFrom.length === 1) {
        // console.log('here!');
        propName = filteredCommandPropertiesFrom[0].name;

        // prop from
        propFromValue = '';

        // prop froms
        if (filteredCommandPropertiesFrom[0].name === 'froms') {
          const existingPropertyValue = _.find(filteredCommandPropertiesFrom, (item) => item.name === 'froms');
          const arrValue = existingPropertyValue.value.split(',');
          const newArrValue = arrValue.filter((fromText) => fromText !== propIntoValue);
          propFromValue = newArrValue.join(',');
        }
        // console.log('propFromValue', propFromValue)
      } else if (filteredCommandPropertiesFrom.length === 2) {
        let existingPropertyValue;

        // prop src
        if (renderedLine.toSlot === 'in') {
          propName = 'src';
          existingPropertyValue = _.find(filteredCommandPropertiesFrom, (item) => item.name === 'src');
        }

        // prop ref
        if (renderedLine.toSlot === 'multiIn') {
          propName = 'ref';
          existingPropertyValue = _.find(filteredCommandPropertiesFrom, (item) => item.name === 'ref');
        }

        propFromValue = existingPropertyValue.value.map((_propValue) => {
          if (_propValue.name === 'table') {
            return {
              ..._propValue,
              value: '',
            };
          }

          return _propValue;
        });
      }

      store.dispatch(
        UpdateQueryCommandItemPropertyValue({
          item: filteredQueryCommandItemsPropertyAndValueInEndpoint,
          propName,
          propValue: propFromValue,
        })
      );
    }
  }
};

export const convStringToArr = function (arr) {
  let obj = {};
  let arr_value = [];
  arr_value = arr;
  if (arr_value.length == 0 || (arr_value.length < 2 && arr_value[0]['property'] == '' && arr_value[0]['value'] == ''))
    return null;
  for (let i = 0; i < arr_value.length; i++) {
    let prop = arr_value[i]['property'];
    let val = arr_value[i]['value'].split(',');
    obj[prop] = val;
  }
  return obj;
};

export const convObjToArr = function (obj) {
  let arr = [];
  if (obj == null || obj == undefined) return [];
  for (const [key, val] of Object.entries(obj)) {
    let value: any = [];
    value = val;
    arr.push({
      property: key,
      value: value.join(','),
    });
  }
  return arr;
};

export const reloadQueryCommandItemsPropertyAndValue = async function(store: Store<AppState>, lang: string) {
  const queryCmdUICfgs = lang && lang === 'en' ? queryCmdUICfgs_EN : queryCmdUICfgs_ID;

  const queryCommandItems: QueryCommandItem[] = await lastValueFrom(store.select(queryCommandItemsSelector).pipe(take(1)));
  const queryCommandItemsPropertyAndValue: QueryCommandItemPropertyAndValue[] = await lastValueFrom(store.select(queryCommandItemsPropertyAndValueSelector).pipe(take(1)));

  const newQueryCommandItemsPropertyAndValue: QueryCommandItemPropertyAndValue[] = queryCommandItemsPropertyAndValue.map((itemPropertyAndValue: QueryCommandItemPropertyAndValue) => {
    const [filteredQueryCommandItem]: QueryCommandItem[] = queryCommandItems.filter((item: QueryCommandItem) => item.id === itemPropertyAndValue.id);

    const queryCmdUICfg = queryCmdUICfgs[filteredQueryCommandItem.nodeType.toUpperCase()];

    const commandProperties = itemPropertyAndValue.commandProperties.map((cmdProp: any) => {
      const [filteredProperty] = queryCmdUICfg.properties.filter((prop: any) => prop.name === cmdProp.name);

      return {
        ...filteredProperty,
        value: cmdProp.value,
      };
    });

    return {
      ...itemPropertyAndValue,
      commandProperties,
    };
  });

  store.dispatch(ReplaceQueryCommandItemsPropertyAndValue({ queryCommandItemsPropertyAndValue: newQueryCommandItemsPropertyAndValue }));
};

const _getOutputNodeSequence = function(model, node) {
  if (!node || !node.out) return null;

  // console.log('=== node', node);
  let seq = node.out;

  node.out.forEach((nodeId) => {
    const traversedNode = _.find(model, (_node) => _node.id === nodeId);

    const traversedSeq = _getOutputNodeSequence(model, traversedNode);
    if (traversedSeq) {
      traversedSeq.forEach((_nodeId) => {
        if (seq.indexOf(_nodeId) < 0) {
          seq.push(_nodeId);
        }
      });
    }
  });

  return seq;  
};

export const rearrangeModel = function(model) {
  //console.log('model', model)
  // search for non-endpoint nodes
  const nonEndpointNodes = model.filter((_node) => {
    return !_node.in && !_node.out;
  });
  // console.log('nonEndpointNodes', [...nonEndpointNodes]);

  let modelSequence = nonEndpointNodes.map((_node) => _node.id);

  // search for non-input nodes
  const nonInputNodes = model.filter((_node) => {
    return !_node.in && _node.out;
  });
  // console.log('nonInputNodes', nonInputNodes);

  // the cycle is nonInputNodes.length
  let i = 0;
  let loop = 0;
  while (loop < model.length) {
    // console.log('nonInputNodes[i]', nonInputNodes[i])
    if (modelSequence.indexOf(nonInputNodes[i].id) < 0) {
      modelSequence.push(nonInputNodes[i].id);
    }

    const traversedSeq = _getOutputNodeSequence(model, nonInputNodes[i]);
    // console.log('traversedSeq', traversedSeq);
    if (traversedSeq) {
      traversedSeq.forEach((_nodeId) => {
        //console.log('_nodeId 1', _nodeId, [...modelSequence])
        if (_nodeId) {
          const [theNode] = model.filter((_node) => _node.id === _nodeId);
          if (modelSequence.indexOf(_nodeId) < 0) {
            modelSequence.push(_nodeId);
          }

          if (theNode && theNode.in) {
            //console.log('INPUT node = ', theNode.in, [...modelSequence]);
            const indexCurrentNode = modelSequence.indexOf(_nodeId);
            theNode.in.forEach((_inputNodeId) => {
              const indexInputNode = modelSequence.indexOf(_inputNodeId);
              if (indexInputNode > indexCurrentNode) {
                //console.log('indexInputNode', indexInputNode)
                //console.log('modelSequence 1', [...modelSequence]);
                modelSequence.splice(indexCurrentNode - 1, 0, _inputNodeId);
                modelSequence.splice(indexInputNode + 1, 1);
                //console.log('modelSequence 2', [...modelSequence]);
              }
            });
          }
        }
      });
    }

    i++;

    if (i >= nonInputNodes.length) {
      i = 0;
    }

    loop++;
  }

  // console.log('modelSequence', modelSequence)
  return modelSequence.map((nodeId) => {
    const [theNode] = model.filter((_node) => _node && _node.id === nodeId);
    // console.log('theNode', theNode)

    return theNode;
  }).filter((_nodeItem) => typeof _nodeItem !== 'undefined');
};

export const getCompletePath = (item: DataSourceItemV2): string => {
  if(item.location === "√://") {
    return `${item.location}${item.name}`
  }
  return `${item.location}/${item.name}`
};
