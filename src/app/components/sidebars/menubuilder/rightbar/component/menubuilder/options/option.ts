import { Component, OnInit, Output, EventEmitter, Input, Inject, OnChanges } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ModalIconDefault } from 'src/app/components/modals/modalIconDefault/modalIconDefault';
import {
  SetInsertChartDashboard,
  SetMenuList,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { AppState } from 'src/app/libs/store/states';
import { DOCUMENT } from "@angular/common";
import { menuListSelector } from 'src/app/libs/store/selectors/datavisualization.selector';

@Component({
  selector: 'application_option',
  templateUrl: './option.html',
})
export class OptionComponent implements OnInit, OnChanges {
  @Input() formData;
  @Input() activeColapse;
  @Input() propertyMenuSelected;
  @Input() menuContentSelected;
  @Input() isCheckedProtectModule;
  @Input() isDisabledProtectModule;
  @Input() dashboardList;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleChange: EventEmitter<any> = new EventEmitter<any>();
  // @Output() iconMenuChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() updateMenu: EventEmitter<any> = new EventEmitter<any>();
  @Output() checkboxActionMenu: EventEmitter<any> = new EventEmitter<any>();
  modalReference: NgbModalRef;
  menuList: Array<any>;
  menuIcon: string = "";
  menuCustomIconLink: string = "";
  enableIconDefault: boolean;

  constructor(private store: Store<AppState>, private modalService: NgbModal, @Inject(DOCUMENT) private document: Document) {
    this.store.select(menuListSelector).subscribe((res) => {
      if (res) {
        this.menuList = res;
      }
    });
  }

  ngOnInit() {}

  ngOnChanges() {
    this.enableIconDefault = this.propertyMenuSelected.options.enable_icon_default;

    if (this.propertyMenuSelected.options.enable_icon_default) {
      this.menuIcon = this.propertyMenuSelected.options.icon;
    } else {
      this.menuIcon = "";
      this.menuCustomIconLink = this.propertyMenuSelected.options.icon;
    }
  }

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };

  onChange = (event) => {
    this.handleChange.emit(event);
  };
  iconChange = (event) => {
    this.iconMenuChange(event);
  };
  menuUpdate = (type?, item?) => {
    this.updateMenu.emit(item);
  };

  storeSelectedMenu() {
    let menuList = this.updateMenuList(this.menuList, this.propertyMenuSelected)    
    this.store.dispatch(SetMenuList({ item: menuList }));
  }

  updateMenuList(menuList, propertyMenuSelected) {
    return menuList.map((data) => {
      if (data.id === propertyMenuSelected.id) {
        data = propertyMenuSelected;
      } else {
        if (data.children.length > 0) 
          data = {
            ...data, 
            children: this.updateMenuList(data.children, propertyMenuSelected)
          };
      }
      return data;
    })
  }

  iconMenuChange(e) {
    const value = e.target.value === 'true' ? true : false;
    this.propertyMenuSelected = {
      ...this.propertyMenuSelected,
      icon: '',
      options: {
        ...this.propertyMenuSelected.options,
        icon: '',
      },
    };

    this.propertyMenuSelected.enable_icon_default = value;
    this.propertyMenuSelected.options.enable_icon_default = value;  
    
    this.storeSelectedMenu();
  }

  deleteMenuIcon() {
    this.propertyMenuSelected = {
      ...this.propertyMenuSelected,
      icon: "",
      options: {
        ...this.propertyMenuSelected.options,
        icon: "",
      },
    };

    this.storeSelectedMenu();
    this.menuIcon = "";
  }

  customIconChange(event) {
    this.propertyMenuSelected = {
      ...this.propertyMenuSelected,
      icon: event,
      options: {
        ...this.propertyMenuSelected.options,
        icon: event,
      },
    };

    this.storeSelectedMenu();
  }

  openIconModal() {
    this.modalReference = this.modalService.open(ModalIconDefault, {
      centered: true,
    });
    this.modalReference.result.then(
      async (res: any) => {
        this.propertyMenuSelected = {
          ...this.propertyMenuSelected,
          icon: res,
          options: {
            ...this.propertyMenuSelected.options,
            icon: res,
          },
        };

        this.storeSelectedMenu()
        this.menuIcon = res;
      },
      (reason: any) => {}
    );
  }

  checkProtectModule = () => {
    this.checkboxActionMenu.emit();
  };

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }
}
