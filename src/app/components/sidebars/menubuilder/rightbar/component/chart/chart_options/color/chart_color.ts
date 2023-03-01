import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { DialogAlertComponent } from 'src/app/components/dialogs/dialogAlert/dialog-alert.component';
import { ModalColorPickerComponent } from 'src/app/components/modals/modalColorPicker/modal-color-picker.component';
import { ModalCustomColorComponent } from 'src/app/components/modals/modalCustomColor/modal-custom-color.component';
import { JsonService } from 'src/app/libs/services';
import { SetFormData } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { AppState } from 'src/app/libs/store/states';
import { static_color_scheme } from '../helperChartOptions';

@Component({
  selector: 'chart_color',
  templateUrl: './chart_color.html',
})
export class ChartColorComponent implements OnInit {
  @Input() activeColapse;
  @Input() visualType;
  @Input() form_data;
  @Input() exploreJson;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() applyQuery: EventEmitter<any> = new EventEmitter<any>();

  parameter: any = null;
  id: string;
  index: number = 0;
  colorScheme: Array<any> = static_color_scheme;
  modalReference: NgbModalRef;
  messages: any;
  constructor(
    private store: Store<AppState>,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,
    private jsonService: JsonService
  ) {}

  async ngOnInit() {
    this.messages = await this.jsonService.retMessage();
    this.activeRoute.queryParams.subscribe((params) => {
      if (params.slice_id) {
        this.id = params.slice_id;
      } else {
        this.id = params.link;
      }
    });
  }

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  handleChange = (event) => {
    this.onChange.emit(event);
  };
  chooseColor(palette, idx) {
    this.form_data = {
      ...this.form_data,
      color_scheme: palette,
    };
    this.index = idx;
    this.handleOpenDropdownColor();
    this.handleChange({ name: 'color_scheme', type: 'ng-select', value: palette });
  }
  openDropdownColor: boolean;
  handleOpenDropdownColor = () => {
    this.openDropdownColor = !this.openDropdownColor;
  };
  openModal = (type) => {
    switch (type) {
      case 'modalColorPicker':
        this.modalReference = this.modalService.open(ModalColorPickerComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.messages = this.messages;
        this.modalReference.result.then(
          async (res) => {
            this.form_data = {
              ...this.form_data,
              colorpickers: res,
            };
            await this.store.dispatch(SetFormData({ item: this.form_data }));
            this.applyQuery.emit();
            this.modalService.dismissAll();
          },
          (reason: any) => {}
        );
        break;
      case 'custom_color':
        this.modalReference = this.modalService.open(DialogAlertComponent, {
          centered: true,
        });
        this.modalReference.componentInstance.isFormValidate = false;
        this.modalReference.componentInstance.validate_messages = [this.messages.CHART.MSG_EM];
        break;
      case 'custom_field_color':
        // this.resetFormula();
        // this.isAction = 'a';
        this.modalReference = this.modalService.open(ModalCustomColorComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.exploreJson = this.exploreJson;
        this.modalReference.result.then(async (res: any) => {
          this.form_data = {
            ...this.form_data,
            column_styles: res,
          };
          await this.store.dispatch(SetFormData({ item: this.form_data }));
          this.applyQuery.emit();
        });

        break;
      default:
        break;
    }
  };
}
