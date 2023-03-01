import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import moment from 'moment';
import { NestableSettings } from 'ngx-nestable/lib/nestable.models';
import { InjectDirective } from 'src/app/libs/directives';
import {
  addChildren,
  findNestedObj,
  handleExpandedNestedObject,
  handleMovedNestedObject,
  removeChildren,
} from 'src/app/libs/helpers/data-visualization-helper';
import { ApiService, JsonService, LayoutUtilsService, TranslationService } from 'src/app/libs/services';
import {
  FlagingDynamicComponent,
  SetMenuBuilderSelectedItem,
  SetMenuList,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import {
  flagingDynamicSelector,
  menuBuilderSelectedItemSelector,
  menuBuilderSelector,
  menuListSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import apps from './../../../../../assets/data/applications.json';
import { addMenuSetup, getParentNodeId, handleUpdateMenuExpand } from './helperWorkspaces';

@Component({
  selector: 'workspaces-application',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss'],
})
export class WorkspacesApplicationComponent implements OnInit {
  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;
  loadUrl: any;
  slugId: any;
  messages: any;
  formData: any = {};
  propertyMenuSelected: any = {};
  menuContentSelected = '';
  dashboardSelected: any;
  isLoadingContent = false;
  menu: any = [];
  shareUrl: string;
  public options = {
    fixedDepth: false,
    maxDepth: 3,
  } as NestableSettings;
  dropTargetIds = [];
  nodeLookup = {};
  dropActionTodo: any = null;
  isDashboardExist: boolean = false;
  loadingDashboard: boolean = false;
  listVisualType: any = [];

  constructor(
    private route: Router,
    private translationService: TranslationService,
    private jsonService: JsonService,
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef,
    private layoutUtilsService: LayoutUtilsService,
    private service: ApiService,
    public viewContainerRef: ViewContainerRef,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.loadUrl = this.route.url.replace('pds', 'api');
    const split = this.loadUrl.split('?');
    this.slugId = split.length > 1 ? split[1].split('=')[1] : '';
    this.store.select(menuBuilderSelector).subscribe((res) => {
      if (res) {
        this.dashboardSelected = null;
        this.setMenuBuilder(res);
      }
    });
    this.store.select(flagingDynamicSelector).subscribe((res) => {
      if (res.shareUrl) {
        this.setFlagingDynamic(res);
      }
    });
    this.store.select(menuBuilderSelectedItemSelector).subscribe((res) => {
      if (res) {
        this.propertyMenuSelected = { ...this.propertyMenuSelected, title: res.title };
      }
    });
    this.store.select(menuListSelector).subscribe((res) => {
      if (res) {
        this.prepareDragDrop(res);
      }
    });
  }

  findMenuItem(menu) {
    let menuItemFound = menu.find((data) => data.id === this.propertyMenuSelected.id);
    if (!menuItemFound) {
      menu.map((item:any) => {
        if (item.children.length > 0) menuItemFound = this.findMenuItem(item.children);
      });
    }
    return menuItemFound;
  }

  setMenuBuilder = (res) => {
    this.formData = res;
    this.menu = res.options.menu;
    let findMenuAvailable = this.findMenuItem(res.menu);
    if (findMenuAvailable) {
      this.activateOption(findMenuAvailable);
    }
    this.prepareDragDrop(this.menu);
  };

  setFlagingDynamic = async (res) => {
    this.menu = res.menu;
    setTimeout(() => {
      this.getShareUrl(res.shareUrl);
    }, 100);
  };

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.store.dispatch(
      FlagingDynamicComponent({
        item: {
          shareUrl: '',
          menu: [],
        },
      })
    );
    this.intialPage();
  }

  intialPage = async () => {
    this.dashboardSelected = null;
    this.menuContentSelected = '';
    let resultApi = await this.jsonService.retVisual(this.translationService.getSelectedLanguage());
    this.listVisualType = resultApi[0].visual_type;
  };

  errorHandler(event) {
    event.target.src = '/assets/images/logo_paques.svg';
  }
  async deleteMenu(menu) {
    this.messages = await this.jsonService.retMessage();
    const dialogRef = this.layoutUtilsService.deleteElement(
      this.messages.APPLICATIONS.C,
      this.messages.APPLICATIONS.MSG_DM,
      this.messages.APPLICATIONS.DN
    );

    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      if (this.propertyMenuSelected.id === menu.id) {
        this.propertyMenuSelected = {};
        this.dashboardSelected = null;
      }
      // level 1
      this.menu = this.menu.filter((obj) => obj.id !== menu.id);
      // level 2
      this.menu.forEach((o) => {
        if (o.children) {
          // copy array
          // o.children = o.children.filter((s) => s.id !== menu.id);
          let child = Object.assign([], o.children);
          child = o.children.filter((s) => s.id !== menu.id);
          // level 3
          child.forEach((p) => {
            if (p.children) {
              // p.children = p.children.filter((t) => t.id !== menu.id);
              let grandchild = Object.assign([], p.children);
              grandchild = p.children.filter((t) => t.id !== menu.id);
              p.children = grandchild;
            }
          });
          o.children = child;
        }
        this.changeDetector.detectChanges();
      });

      this.menuContentSelected = '';
      this.store.dispatch(SetMenuList({ item: this.menu }));
      this.changeDetector.detectChanges();
    });
  }
  activateOption = (item) => {
    this.dashboardSelected = null;
    this.store.dispatch(SetMenuBuilderSelectedItem({ item }));

    this.propertyMenuSelected = item;

    this.menuContentSelected = item.title;
    if (this.propertyMenuSelected.slug) {
      this.isLoadingContent = true;
      this.getShareUrl();
    }
    if (!this.propertyMenuSelected.dashboard_id) {
      this.isDashboardExist = false;
    }
    this.changeDetector.detectChanges();
  };

  async getShareUrl(share_url?) {
    if (share_url) {
      this.shareUrl = share_url;
    } else {
      if (Object.entries(this.propertyMenuSelected).length !== 0) {
        const rest = await this.service.getApi(`api/dashboard/view?link=${this.propertyMenuSelected.slug}`);
        const result = rest.status ? (rest.result.response ? rest.result.response : rest.result) : rest;
        this.shareUrl = result.dashboard_data.share_url;
        this.dashboardSelected = rest.result.response ? rest.result.response.dashboard_data : rest.result;
      }
      this.isLoadingContent = false;
    }
    this.isDashboardExist = true;
    this.changeDetector.detectChanges();
  }

  addNewMenu() {
    let obj = addMenuSetup(this.menu, apps);
    this.menu = this.menu.concat([obj]);
    this.prepareDragDrop(this.menu);
    this.store.dispatch(SetMenuList({ item: this.menu }));
    this.changeDetector.detectChanges();
    this.scrollContentToId(obj.id);
  }
  scrollContentToId(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  handleClickMenu = (event) => {
    let objectChanged = findNestedObj(this.menu, 'id', event.id);
    this.menu = handleExpandedNestedObject(this.menu, objectChanged, objectChanged.id);
  };

  prepareDragDrop(menus) {
    let obj = [];
    menus.map((data) => {
      obj.push({ ...data, children: data.children ? addChildren(data.children) : [] });
    });
    obj.forEach((node) => {
      this.nodeLookup[node.id] = node;
      this.prepareDragDrop(node.children);
    });
    this.dropTargetIds = Object.entries(this.nodeLookup).map(([key]) => key);
    this.menu = obj;
  }

  dragMoved(event) {
    let e = this.document.elementFromPoint(event.pointerPosition.x, event.pointerPosition.y);

    if (!e) {
      this.clearDragInfo();
      return;
    }
    let container = e.classList.contains('node-item') ? e : e.closest('.node-item');
    if (!container) {
      this.clearDragInfo();
      return;
    }
    this.dropActionTodo = {
      targetId: container.getAttribute('data-id'),
    };
    const targetRect = container.getBoundingClientRect();
    const oneThird = targetRect.height / 3;

    if (event.pointerPosition.y - targetRect.top < oneThird) {
      // before
      this.dropActionTodo['action'] = 'before';
    } else if (event.pointerPosition.y - targetRect.top > 2 * oneThird) {
      // after
      this.dropActionTodo['action'] = 'after';
    } else {
      // inside
      this.dropActionTodo['action'] = 'inside';
    }
    this.showDragInfo();
  }

  drop(event) {
    if (!this.dropActionTodo) return;
    const draggedItemId = event.item.data;
    const parentItemId = event.previousContainer.id;
    const targetListId = getParentNodeId(this.dropActionTodo.targetId, this.menu, 'main');
    const draggedItem = this.nodeLookup[draggedItemId];
    let oldItemContainer = this.menu;
    const newContainer = targetListId != 'main' ? this.nodeLookup[targetListId].children : this.menu;
    let i = oldItemContainer.findIndex((c) => c.id === draggedItemId);
    if (draggedItem.slug) {
      oldItemContainer = oldItemContainer.filter((_, index) => index !== i);
      oldItemContainer = removeChildren(oldItemContainer, draggedItemId);
      handleMovedNestedObject(this.menu, oldItemContainer, parentItemId);
      let copyContainer = [...oldItemContainer];
      switch (this.dropActionTodo.action) {
        case 'before':
        case 'after':
          const targetIndex = newContainer.findIndex((c) => c.id === this.dropActionTodo.targetId);
          if (this.dropActionTodo.action == 'before') {
            copyContainer.splice(targetIndex, 0, draggedItem);
          } else {
            copyContainer.splice(targetIndex + 1, 0, draggedItem);
          }
          if (targetListId === 'main') {
            this.menu = copyContainer;
          } else {
            let b = handleMovedNestedObject(
              oldItemContainer, draggedItem, this.dropActionTodo.targetId, this.dropActionTodo.action
            );
            this.prepareDragDrop(b);
          }
          break;
        case 'inside':
          let x = handleMovedNestedObject(copyContainer, draggedItem, this.dropActionTodo.targetId, 'inside');
          this.prepareDragDrop(x);
          this.nodeLookup[this.dropActionTodo.targetId].expanded = true;
          break;
      }
    } else {
      oldItemContainer = oldItemContainer.filter((_, index) => index !== i);
      oldItemContainer = removeChildren(oldItemContainer, draggedItemId);
      switch (this.dropActionTodo.action) {
        case 'before':
        case 'after':
          const targetIndex = newContainer.findIndex((c) => c.id === this.dropActionTodo.targetId);
          if (targetListId === 'main') {
            if (this.dropActionTodo.action == 'before') {
              oldItemContainer.splice(targetIndex, 0, draggedItem);
            } else {
              oldItemContainer.splice(targetIndex + 1, 0, draggedItem);
            }
            this.menu = oldItemContainer;
          } else {
            let b = handleMovedNestedObject(
              oldItemContainer, draggedItem, this.dropActionTodo.targetId, this.dropActionTodo.action
            );
            this.prepareDragDrop(b);
          }
          break;
        case 'inside':
          let x = handleMovedNestedObject(oldItemContainer, draggedItem, this.dropActionTodo.targetId, 'inside');
          this.prepareDragDrop(x);
          this.nodeLookup[this.dropActionTodo.targetId].expanded = true;
          break;
      }
    }

    this.store.dispatch(SetMenuList({ item: this.menu }));
    this.clearDragInfo(true);
  }

  showDragInfo() {
    this.clearDragInfo();
    if (this.dropActionTodo) {
      this.document
        .getElementById('node-' + this.dropActionTodo.targetId)
        .classList.add('drop-' + this.dropActionTodo.action);
    }
  }
  clearDragInfo(dropped = false) {
    if (dropped) {
      this.dropActionTodo = null;
    }
    this.document.querySelectorAll('.drop-before').forEach((element) => element.classList.remove('drop-before'));
    this.document.querySelectorAll('.drop-after').forEach((element) => element.classList.remove('drop-after'));
    this.document.querySelectorAll('.drop-inside').forEach((element) => element.classList.remove('drop-inside'));
  }

  formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
  };

  handleIcon = (visualType) => {
    switch (visualType) {
      case 'horizontal_bar':
        visualType = 'dist_bar';
        break;
      case 'dual_line':
        visualType = 'line';
        break;
      case 'pivot_table':
        visualType = 'table';
        break;

      default:
        break;
    }
    let link = this.listVisualType.find((data) => data.value === visualType);
    return `./.${link.image}`;
  };

  handleLabelType = (visualType) => {
    switch (visualType) {
      case 'horizontal_bar':
        visualType = 'dist_bar';
        break;
      case 'dual_line':
        visualType = 'line';
        break;
      case 'pivot_table':
        visualType = 'table';
        break;

      default:
        break;
    }
    let link = this.listVisualType.find((data) => data.value === visualType);
    return `${link.label}`;
  };

  // function for expand menu
  handleClickExpand = (menuId:string) => {
    this.menu = handleUpdateMenuExpand(menuId, this.menu);
    this.store.dispatch(SetMenuList({ item: this.menu }));
  }
}
