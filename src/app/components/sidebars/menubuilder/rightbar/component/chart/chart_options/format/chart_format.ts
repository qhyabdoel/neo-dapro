import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ModalCustomColumnFormatComponent } from 'src/app/components/modals/modalColumnFormat/modal-column-format.component';
import { ModalColumnWidthSettingComponent } from 'src/app/components/modals/modalColumWidthSetting/modal-column-width-setting.component';
import {
  static_format_number_chart_options,
  static_table_timestamp_format,
  static_y_axis_format,
} from 'src/app/libs/helpers/constant_datavisualization';
import { SetFormData } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { AppState } from 'src/app/libs/store/states';
import { static_format_bar } from '../helperChartOptions';

@Component({
  selector: 'chart_format',
  templateUrl: './chart_format.html',
})
export class ChartFormatComponent implements OnInit {
  @Input() activeColapse;
  @Input() visualType;
  @Input() form_data;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() applyQuery: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  looping_select_format: Array<any> = [];
  list_y_axis_format: Array<any> = static_y_axis_format;
  list_format_number: Array<any> = static_format_number_chart_options;
  list_table_timestamp_format: Array<any> = static_table_timestamp_format;
  modalReference: NgbModalRef;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private modalService: NgbModal,
    private store: Store<AppState>
  ) {}

  ngOnInit() {
    this.intialPage();
  }

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  handleChange = (event) => {
    this.onChange.emit(event);
  };
  intialPage = () => {
    this.looping_select_format = static_format_bar(this.form_data);
  };
  openModal = (type) => {
    switch (type) {
      case 'column_format':
        this.modalReference = this.modalService.open(ModalCustomColumnFormatComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.result.then(async (res: any) => {
          this.form_data = {
            ...this.form_data,
            custom_column_format_arr: res,
          };
          await this.store.dispatch(SetFormData({ item: this.form_data }));
          this.applyQuery.emit();
        });
        break;
      case 'column_width_setting':
        this.modalReference = this.modalService.open(ModalColumnWidthSettingComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.result.then(async (res: any) => {
          this.form_data = {
            ...this.form_data,
            custom_width_column_arr: res,
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
