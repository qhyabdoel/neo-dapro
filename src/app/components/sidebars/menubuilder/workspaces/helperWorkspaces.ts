import moment from 'moment';
import { addChildren } from 'src/app/libs/helpers/data-visualization-helper';

export const getParentNodeId = (id: string, nodesToSearch, parentId: string): string => {
  for (let node of nodesToSearch) {
    if (node.id == id) return parentId;
    let ret = getParentNodeId(id, node.children || [], node.id);
    if (ret) return ret;
  }
  return null;
};

export const addMenuSetup = (menu, apps) => {
  let maxNumber = menu.length;
  const obj = Object.assign({}, { ...apps.menu_default, children: [] });
  menu.forEach((element) => {
    const n = element.id.split('_');
    if (maxNumber < Number(n[1])) {
      maxNumber = Number(n[1]);
    }
  });
  maxNumber++;
  obj.id = moment().unix() + '-' + obj.id + maxNumber;
  obj.title = obj.title + maxNumber;
  return obj;
};

export const prepareDragDrop = (menus) => {
  let obj = [];
  let nodeLookup = {};
  let dropTargetIds = {};
  menus.map((data) => {
    obj.push({ ...data, children: data.children ? addChildren(data.children) : [] });
  });
  obj.forEach((node) => {
    nodeLookup[node.id] = node;
    prepareDragDrop(node.children);
  });
  dropTargetIds = Object.entries(nodeLookup).map(([key]) => key);
  return {
    menu: obj,
    nodeLookup,
    dropTargetIds,
  };
};

export const handleUpdateMenuExpand = (menuId:string, menuList:Array<any>) => {
  return menuList.map((item) => {
    if (item.id === menuId) item = { ...item, expanded: !item.expanded };
    else {
      if (item.children?.length > 0) { 
        item = {
          ...item,
          children: handleUpdateMenuExpand(menuId, item.children)
        };
      };
    }
   
    return item
  })
}
