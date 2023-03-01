import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ModalCustomConditionComponent } from 'src/app/components/modals/modalCustomCondition/modal-custom-condition.component';
import {
  staticfontFamilyList,
  static_charge,
  static_line_interpolation,
  static_link_length,
  static_list_area_map,
  static_page_length2,
  static_pandas_aggfunc,
  static_rotation,
  static_row_limit,
  static_scale,
  static_spiral,
  static_style_tooltips,
} from 'src/app/libs/helpers/constant_datavisualization';
import { JsonService } from 'src/app/libs/services';
import { SetFormData } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { formDataChartSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { list_of_field_general } from '../helperChartOptions';

@Component({
  selector: 'chart_general',
  templateUrl: './chart_general.html',
})
export class ChartGeneralComponent implements OnInit {
  @Input() activeColapse;
  @Input() visualType;
  @Input() form_data;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() applyQuery: EventEmitter<any> = new EventEmitter<any>();
  @Input() explore;
  parameter: any = null;
  list_of_field: Array<any> = [];
  id: string;
  messages: any;
  modalReference: NgbModalRef;
  listAreaMap = static_list_area_map;
  constructor(
    private store: Store<AppState>,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,
    private jsonService: JsonService
  ) {
    this.store.select(formDataChartSelector).subscribe((res) => {
      if (res) {
        this.form_data = res;
        this.visualType = res.viz_type;
        this.intialPage();
      }
    });
  }

  async ngOnInit() {
    this.intialPage();
    this.activeRoute.queryParams.subscribe((params) => {
      if (params.slice_id) {
        this.id = params.slice_id;
      } else {
        this.id = params.link;
      }
    });
    this.messages = await this.jsonService.retMessage();
  }

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  handleChange = (event) => {
    this.onChange.emit(event);
  };
  intialPage = () => {
    this.list_of_field = list_of_field_general(this.form_data);
  };
  openModal = (type) => {
    switch (type) {
      case 'modalCustomCondition':
        if (this.form_data.custom_condition_arr == undefined || this.form_data.custom_condition_arr.length == 0) {
          this.form_data = {
            ...this.form_data,
            custom_condition_arr: Array.from(Array(2), (_, i) => {
              return {
                label: `Condition ${i + 1}`,
                mode: this.form_data.gauge_label_type || 'value',
                size_from: 0,
                size_to: '',
                status: '',
                colorpicker: '#808080',
              };
            }),
          };
        }

        this.modalReference = this.modalService.open(ModalCustomConditionComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.result.then(async (res: any) => {
          this.form_data = {
            ...this.form_data,
            custom_condition_arr: res,
          };
          await this.store.dispatch(SetFormData({ item: this.form_data }));
          this.applyQuery.emit();
        });
        break;
      default:
        break;
    }
  };

  handleOptionsDropdown = (name) => {
    switch (name) {
      case 'rotation':
        return static_rotation;
      case 'spiral':
        return static_spiral;
      case 'scale':
        return static_scale;
      case 'font_family':
        return staticfontFamilyList;
      case 'page_size':
        return static_row_limit;
      case 'max_bubble_size':
        return static_page_length2;
      case 'pandas_aggfunc':
        return static_pandas_aggfunc;
      case 'line_interpolation':
        return static_line_interpolation;
      case 'style_tooltips':
        return static_style_tooltips;
      case 'link_length':
        return static_link_length;
      case 'charge':
        return static_charge;
      default:
        break;
    }
  };
}
