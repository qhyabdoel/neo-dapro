import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { DialogAlertComponent } from 'src/app/components/dialogs/dialogAlert/dialog-alert.component';
import { ModalMetricLegendComponent } from 'src/app/components/modals/modalMetricLegend/modal-metric-legend';
import { findTypeCheckByUrl } from 'src/app/libs/helpers/data-visualization-helper';
import { ApiService, JsonService } from 'src/app/libs/services';
import {
  chartDatasourceSelector,
  menuBuilderSelector,
  sharedChartDataSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { DOCUMENT } from "@angular/common";

@Component({
  selector: 'datasource_chart',
  templateUrl: './datasource.html',
})
export class DatasourceChartComponent implements OnInit {
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() itemto: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  datasetList: Array<any> = [];
  isLoading: boolean = true;
  modalReference: NgbModalRef;
  messages: any;
  id: string;
  queryName: string;
  constructor(
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef,
    private modalService: NgbModal,
    private jsonService: JsonService,
    private activeRoute: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.activeRoute.queryParams.subscribe((params) => {
      if (params.slice_id) {
        this.id = params.slice_id;
      } else {
        this.id = params.link;
      }
    });
    this.store
      .select(chartDatasourceSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.datasetList = result.response;
          this.isLoading = false;
          this.changeDetector.detectChanges();
        }
      });
    this.store
      .select(sharedChartDataSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          // share variable
          this.parameter = result.explore;
          // get data right bar & has error if metadata changed
          // let datasource = this.datasetList.filter((a) =>
          //   [a.name.toLowerCase(), a.dataset_alias.toLowerCase()].includes(result.explore.form_data.datasource)
          // );
          let datasource = this.datasetList.find((data) => data.uid.includes(result.explore.form_data.datasource));
          this.queryName = datasource ? datasource.query : '';
          this.changeDetector.detectChanges();
        }
      });
  }

  async ngOnInit() {
    this.messages = await this.jsonService.retMessage();
  }

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };
  loadDatasetToProps = (item) => {
    let obj = {
      ...item,
      from: findTypeCheckByUrl(),
      action: 'dataset',
    };
    // this.setSelectedItem(obj);
    this.itemto.emit(obj);
  };
  buttonNew = () => {};
  openModal = (type) => {
    switch (type) {
      case 'EditMetricLegend':
        this.modalReference = this.modalService.open(ModalMetricLegendComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.metric = this.parameter.datasource.metrics;
        // this.modalReference.componentInstance.showVerboseName = this.showVerboseName;
        this.modalReference.componentInstance.slice = this.id;
        this.modalReference.componentInstance.form_data = this.parameter.form_data;
        this.modalReference.componentInstance.visualType = this.parameter.form_data.viz_type;
        // this.modalReference.componentInstance.loadChartbyId = this.loadChartbyId;
        // this.modalReference.componentInstance.loadDatasetTo = this.loadDatasetTo;
        this.modalReference.componentInstance.explore = this.parameter;
        break;
      case 'validation_edit_metric':
        this.modalReference = this.modalService.open(DialogAlertComponent, {
          centered: true,
        });
        this.modalReference.componentInstance.isFormValidate = false;
        this.modalReference.componentInstance.validate_messages = [this.messages.CHART.MSG_EM];
        break;

      default:
        break;
    }
  };

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }
}
