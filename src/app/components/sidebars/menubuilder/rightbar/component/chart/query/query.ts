import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, Inject } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ModalAddValueComponent } from 'src/app/components/modals/modalAddValue/modal-add-value.component';
import { ModalMarkupCodeComponent } from 'src/app/components/modals/modalMarkup/modalCode/modal-markup-code.component';
import { ModalMarkupCSSComponent } from 'src/app/components/modals/modalMarkup/modalCss/modal-markup-css.component';
import { ModalQueryComponent } from 'src/app/components/modals/modalQuery/modal-query.component';
import { JsonService } from 'src/app/libs/services';
import {
  staticfilterDateList,
  staticfilterDateTypeList,
  staticinitialFilterDateList,
  static_active_tabs_table_chart,
  static_bar_type_query,
  static_bar_with_line_query,
  static_line_type_query,
  static_list_formula,
  static_map_type_query,
  static_row_limit,
  static_table_type_query,
  static_time_grain_sqla,
} from 'src/app/libs/helpers/constant_datavisualization';
import { getDismissReason } from 'src/app/libs/helpers/data-visualization-helper';
import {
  PostSharedChartData,
  SetFormData,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import {
  formDataChartSelector,
  sharedChartDataSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { bubble_form_initial, heatmap_form_initial, predictive_form_initial } from '../../../helperRightbar';
import { DOCUMENT } from '@angular/common';
import { ModalComparisonComponent } from 'src/app/components/modals/modalComparison/modal-comparison.component';

@Component({
  selector: 'query_chart',
  templateUrl: './query.html',
})
export class QueryComponent implements OnInit {
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() runQuery: EventEmitter<any> = new EventEmitter<any>();
  modalReference: NgbModalRef;
  explore: any = null;
  exploreJson: any = null;
  form_data: any = null;
  visualType: string;
  list_row_limit = static_row_limit;
  formulaValue: string = '';
  listFormula: any = static_list_formula;
  actionQuery: any;
  intial_form_select: any;
  predictive_intial_form: any;
  typeChartQuery: any = [];
  optionsWithLine: any = [];
  toggleTable: any = [];
  list_time_grain_sqla: any = [];
  list_granularity_sqla: any = [];
  messages: any;
  active = 'group';
  filterDateList: any = [];
  filterDateTypeList: any = [];
  initialFilterDateList: any = [];
  listFormulaOld: string = '';
  sharedData: any;
  heatmap_intial_form: Array<any> = [];
  constructor(
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef,
    private modalService: NgbModal,
    private jsonService: JsonService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.store
      .select(sharedChartDataSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          // share variable
          this.sharedData = result;
          this.visualType = result.typeChart;
          this.explore = result.explore;
          this.exploreJson = result.exploreJson;
          this.form_data = result.exploreJson.form_data;
          this.initFormData();
          this.changeDetector.detectChanges();
        }
      });
    this.store.select(formDataChartSelector).subscribe((res) => {
      if (res) {
        this.form_data = res;
        this.visualType = res.viz_type;
      }
    });
  }

  async ngOnInit() {
    this.messages = await this.jsonService.retMessage();
    this.list_granularity_sqla = [];
    this.list_time_grain_sqla = static_time_grain_sqla(this.messages);
  }

  setLimitedLoopingForm = async () => {
    this.messages = await this.jsonService.retMessage();
    switch (this.visualType) {
      case 'heatmap':
        this.heatmap_intial_form = heatmap_form_initial(this.form_data, this.explore, this.list_row_limit);
        break;
      case 'bubble':
        this.intial_form_select = bubble_form_initial(this.form_data, this.explore, this.list_row_limit);
        break;
      case 'predictive':
        this.intial_form_select = predictive_form_initial(this.form_data, this.explore);
        break;

      case 'filter_box':
        if (
          this.filterDateList.length === 0 &&
          this.filterDateTypeList.length === 0 &&
          this.initialFilterDateList.length === 0 &&
          this.list_time_grain_sqla.length === 0
        ) {
          this.filterDateList = staticfilterDateList(this.messages);
          this.filterDateTypeList = staticfilterDateTypeList(this.messages);
          this.initialFilterDateList = staticinitialFilterDateList;
        }

        break;
      case 'line':
      case 'dual_line':
        this.list_granularity_sqla = this.explore?.datasource?.granularity_sqla;
        break;

      default:
        break;
    }
  };

  setTypeChartQuery = () => {
    switch (this.visualType) {
      case 'horizontal_bar':
      case 'dist_bar':
        this.typeChartQuery = static_bar_type_query;
        this.optionsWithLine = static_bar_with_line_query;
        break;
      case 'line':
      case 'dual_line':
        this.typeChartQuery = static_line_type_query;
        break;
      case 'map':
      case 'country_map':
      case 'country_map2':
        this.typeChartQuery = static_map_type_query;
        break;
      case 'table':
      case 'pivot_table':
        this.typeChartQuery = static_table_type_query;
        this.toggleTable = static_active_tabs_table_chart;
        break;

      default:
        break;
    }
  };

  handleActiveTab = (event) => {
    this.active = event;
    if (event === 'not_group') {
      this.form_data = {
        ...this.form_data,
        sort_aggregate_column: 'option2',
      };
    }
  };
  async initFormData() {
    let metricOpts = [
      'horizontal_bar',
      'dist_bar',
      'pie',
      'line',
      'treemap',
      'big_number_total',
      'directed_force',
      'gauge',
      'map',
      'country_map',
      'country_map2',
      'sunburst',
      'word_cloud',
      'table',
      'pivot_table',
      'filter_box',
      'dual_line',
      'heatmap',
    ].includes(this.visualType)
      ? this.explore.datasource.metrics
      : this.explore.datasource.columns;
    if (this.explore.form_data.metrics) {
      metricOpts = [
        ...metricOpts,
        ...this.explore.form_data.metrics
          .filter((x) => {
            // fix duplicate value dropdown
            const findMetric = metricOpts.find((metric) => metric.expression === x);
            return !findMetric;
          })
          .map((x) => ({
            description: null,
            expression: x,
            metric_name: x,
            verbose_name: x,
            warning_text: null,
          })),
      ];
    }

    await this.setLimitedLoopingForm();

    /**
     * set option for type chart
     */
    this.setTypeChartQuery();
    this.active = 'group';
    if (this.explore.form_data.metric) {
      metricOpts = [
        ...metricOpts,
        {
          description: null,
          expression: this.explore.form_data.metric,
          metric_name: this.explore.form_data.metric,
          verbose_name: this.explore.form_data.metric,
          warning_text: null,
        },
      ];
    }
    this.explore = { ...this.explore, datasource: { ...this.explore.datasource, metrics: metricOpts } };
    if (this.visualType === 'table') {
      if (this.form_data.all_columns.length > 0) {
        this.active = 'not_group';
        this.form_data = {
          ...this.form_data,
          sort_aggregate_column: 'option2',
        };
      }
      if (this.form_data.all_columns.length === 0) {
        this.active = 'group';
      }
    }

    this.form_data = {
      ...this.form_data,
      viz_type: this.visualType || 'preview',
      groupby: this.visualType === 'word_cloud' ? this.explore.form_data.series : this.explore.form_data.groupby || [],
      metrics: this.explore.form_data.metrics || [],
      columns: this.explore.form_data.columns || [],
      row_limit: this.explore.form_data.row_limit || 100,
      tooltips: this.explore.form_data.tooltips || [],
      with_line: this.explore.form_data.with_line || false,
      series: this.explore.form_data.series || '',
      since: this.explore.form_data.since,
      until: this.explore.form_data.until,
    };
    this.store.dispatch(SetFormData({ item: this.form_data }));
  }
  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  remappingColorpicker = (event1, event2) => {};

  showFormula(item, opt?) {
    this.formulaValue = item.verbose_name;
    this.actionQuery = opt;
    this.modalReference = this.modalService.open(ModalQueryComponent, {
      size: 'lg',
      centered: true,
    });
    this.modalReference.componentInstance.actionQuery = this.actionQuery;
    this.modalReference.componentInstance.visualType = this.visualType;
    this.modalReference.componentInstance.chartLinks = this.explore;
    this.modalReference.componentInstance.form_data = this.form_data;
    this.modalReference.componentInstance.applyFormula = this.applyFormula;
    this.modalReference.componentInstance.formulaValue = this.formulaValue;
  }
  openModal = (type) => {
    switch (type) {
      case 'formulaModal':
        this.resetFormula();
        this.actionQuery = 'a';
        this.modalReference = this.modalService.open(ModalQueryComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.actionQuery = this.actionQuery;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.explore = this.explore;
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.applyFormula = this.applyFormula;
        this.modalReference.componentInstance.formulaValue = this.formulaValue;
        this.modalReference.componentInstance.changeDetector = this.changeDetector;
        this.modalReference.componentInstance.setDataChart = this.setDataChart;
        break;
      case 'modalAddValue':
        this.modalReference = this.modalService.open(ModalAddValueComponent, {
          size: 'md',
          centered: true,
        });
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.componentInstance.chartLinks = this.explore;
        this.modalReference.result.then(
          async (res: any) => {
            this.form_data = res;
            await this.store.dispatch(SetFormData({ item: this.form_data }));
          },
          (reason: any) => {
            getDismissReason(reason);
          }
        );
        break;
      case 'codeModal':
        this.modalReference = this.modalService.open(ModalMarkupCodeComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.type = this.form_data.markup_type;
        this.modalReference.componentInstance.code = this.form_data.code;
        this.modalReference.result.then(
          async (code: any) => {
            this.form_data = {
              ...this.form_data,
              code,
            };
            await this.store.dispatch(SetFormData({ item: this.form_data }));
            this.runQuery.emit();
          },
          (reason: any) => {
            getDismissReason(reason);
          }
        );

        break;
      case 'cssModal':
        this.modalReference = this.modalService.open(ModalMarkupCSSComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.css = this.form_data.css;
        this.modalReference.result.then(
          async (css: any) => {
            this.form_data = {
              ...this.form_data,
              css,
            };
            await this.store.dispatch(SetFormData({ item: this.form_data }));
            this.runQuery.emit();
          },
          (reason: any) => {
            getDismissReason(reason);
          }
        );
        break;
      case 'modalComparison':
        this.modalReference = this.modalService.open(ModalComparisonComponent, {
          size: 'xl',
          centered: true,
        });
        this.modalReference.componentInstance.chartLinks = this.explore;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.form_data = this.form_data;
        this.modalReference.result.then(
          async (res: any) => {
            this.form_data = {
              ...this.form_data,
              base_columns: res.base_columns,
              comparison: res.comparison,
            };
            await this.store.dispatch(SetFormData({ item: this.form_data }));
            this.runQuery.emit();
          },
          (reason: any) => {
            getDismissReason(reason);
          }
        );
        break;

      default:
        break;
    }
  };
  resetFormula() {
    this.formulaValue = '';
  }
  applyFormula() {
    // todo logic here for this.formulaValue
    let obj = {
      description: this.listFormula.description,
      expression: this.formulaValue || this.listFormula.expression,
      metric_name: this.formulaValue || this.listFormula.metric_name,
      verbose_name: this.formulaValue || this.listFormula.verbose_name,
      warning_text: this.listFormula.warning_text,
      is_formula: this.listFormula.is_formula,
    };
    if (this.actionQuery == 'e') {
      if (this.visualType == 'histogram' || this.visualType == 'osmmap') {
        this.explore.datasource.columns.splice(this.explore.datasource.columns.indexOf(this.listFormulaOld), 1);
        this.explore.datasource.columns.push(obj);
        this.explore.datasource.columns = this.explore.datasource.columns.slice(0);
      } else {
        this.explore.datasource.metrics.splice(this.explore.datasource.metrics.indexOf(this.listFormulaOld), 1);
        this.explore.datasource.metrics.push(obj);
        this.explore.datasource.metrics = this.explore.datasource.metrics.slice(0);
      }
      if (this.visualType == 'heatmap') this.form_data.heat_map.metric_heat_map = this.formulaValue;
      else if (this.visualType == 'histogram') this.form_data.column_target = this.formulaValue;
      else if (this.visualType == 'osmmap') this.form_data.column_target = this.formulaValue;
      else if (['big_number_total', 'gauge', 'filter_box', 'directed_force'].includes(this.visualType))
        this.form_data.metric = this.formulaValue;
      else {
        this.form_data.metrics.splice(this.form_data.metrics.indexOf(this.listFormulaOld), 1);
        this.form_data.metrics.push(this.formulaValue);
        this.form_data.metrics = this.form_data.metrics.slice(0);
      }
    } else {
      if (this.visualType == 'histogram' || this.visualType == 'osmmap') {
        this.explore.datasource.columns.push(obj);
        this.explore.datasource.columns = this.explore.datasource.columns.slice(0);
      } else {
        this.explore.datasource.metrics.push(obj);
        this.explore.datasource.metrics = this.explore.datasource.metrics.slice(0);
      }
      if (this.visualType == 'heatmap') {
        // if (!this.form_data.heat_map) this.form_data.heat_map = this.heat_map;
        this.form_data.heat_map.metric_heat_map = this.formulaValue;
      } else if (this.visualType == 'histogram') this.form_data.column_target = this.formulaValue;
      else if (this.visualType == 'osmmap') this.form_data.column_target = this.formulaValue;
      else if (['big_number_total', 'gauge', 'filter_box', 'directed_force', 'pie'].includes(this.visualType)) {
        if (this.visualType === 'big_number_total') {
          this.form_data = {
            ...this.form_data,
            metrics: [this.formulaValue],
            metric: this.formulaValue,
          };
        } else if (this.visualType === 'pie') {
          this.form_data = {
            ...this.form_data,
            metrics: [this.formulaValue],
          };
        } else {
          this.form_data = {
            ...this.form_data,

            metric: this.formulaValue,
          };
        }
      } else {
        if (!this.form_data.metrics) this.form_data.metrics = [];
        let data = [...this.form_data.metrics];
        data.push(this.formulaValue);
        this.form_data = {
          ...this.form_data,
          metrics: data,
        };
      }
    }
    this.setDataChart(this.form_data);
    this.modalService.dismissAll();
    this.changeDetector.markForCheck();
    this.changeDetector.detectChanges();
  }
  handleSelect = (event) => {
    const { type, value, name } = event;
    this.onchange(value, name, ['since', 'until'].includes(type) ? 'date' : type);

    this.store.dispatch(SetFormData({ item: this.form_data }));
  };
  onchange = (event?, name?, type?) => {
    let state;
    switch (type) {
      case 'select':
      case 'select_specific_object':
        if (this.visualType === 'heatmap') {
          this.form_data = {
            ...this.form_data,
            heat_map: {
              ...this.form_data.heat_map,
              [name]: event.target.value,
            },
          };
        } else {
          this.form_data = {
            ...this.form_data,
            [name]: event.target.value,
          };
          if (name === 'viz_type' && ['table', 'pivot_table', 'preview'].includes(this.visualType)) {
            this.visualType = event.target.value;
            this.active = 'group';
          }
        }

        break;
      case 'checkbox':
        if (this.visualType === 'heatmap') {
          this.form_data = {
            ...this.form_data,
            heat_map: {
              ...this.form_data.heat_map,
              [name]: event.target.checked,
            },
          };
        } else {
          this.form_data = {
            ...this.form_data,
            [name]: event.target.checked,
            filter_control_checkbox:
              name === 'filter_checkbox' && !event.target.checked ? null : this.form_data.filter_control_checkbox,
          };
        }

        break;
      case 'radio':
        this.form_data = {
          ...this.form_data,
          [name]: event.value,
        };
        break;
      case 'date':
        this.form_data = {
          ...this.form_data,
          [name]: event,
        };

        break;
      case 'input':
        this.form_data = {
          ...this.form_data,
          [name]: event,
        };
        break;
      default:
        if (name === 'column_target') {
          state = event.column_name;
        } else if (name === 'metric') {
          state = event ? event.metric_name : null;
        } else if (['heatmap'].includes(this.visualType)) {
          if (['x_heat_map', 'y_heat_map'].includes(name)) {
            state = event.value;
          } else {
            state = event.metric_name;
          }
        } else if (['big_number_total'].includes(this.visualType)) {
          state = event.metric_name;
        } else if (['pie'].includes(this.visualType) && name === 'metrics') {
          state = [event.metric_name];
        } else if (
          ['map', 'country_map', 'country_map2', 'filter_box'].includes(this.visualType) &&
          name === 'metrics'
        ) {
          state = event.metric_name;
        } else if (['filter_control_checkbox', 'filter_control_alphabetic', 'series'].includes(name)) {
          state = event.value;
        } else {
          state = event.map(({ value, metric_name, column_name }) => value || metric_name || column_name);
          if (name === 'metrics') {
            this.form_data = {
              ...this.form_data,
              tooltips: state,
            };
          }
        }
        if (this.visualType === 'heatmap') {
          this.form_data = {
            ...this.form_data,
            heat_map: {
              ...this.form_data.heat_map,
              [name]: state,
            },
          };
        } else {
          this.form_data = {
            ...this.form_data,
            [name]: state,
          };
        }

        break;
    }

    this.store.dispatch(SetFormData({ item: this.form_data }));
  };

  setDataChart = async (params) => {
    // code for get explore for create chart on card
    const sharedChartDataObj = {
      ...this.sharedData,

      explore: {
        ...this.explore,
        form_data: params,
      },
    };
    this.store.dispatch(PostSharedChartData(sharedChartDataObj));

    this.changeDetector.detectChanges();
  };

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }
}
