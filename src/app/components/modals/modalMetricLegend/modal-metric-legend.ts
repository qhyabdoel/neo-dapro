import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, Output, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, JsonService, NotificationService } from 'src/app/libs/services';
import { loadChartData, loadExploreJson } from 'src/app/libs/helpers/data-visualization-helper';
import { PostSharedChartData } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'modal-metric-legend',
  templateUrl: './modal-metric-legend.component.html',
})
export class ModalMetricLegendComponent implements OnInit {
  @Input() public metric;
  @Input() public showVerboseName;
  @Input() public slice;
  @Input() public form_data;
  @Input() public visualType;
  @Input() public explore;

  // func
  @Output() loadChartbyId: (any) => void;
  @Output() loadDatasetTo: (any) => void;

  searchVs: any = '';
  messages: any;
  verbose_name: string;
  id: string;
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalMetricLegendComponent>,
    private modalService: NgbModal,
    private service: ApiService,
    private jsonService: JsonService,
    private store: Store<AppState>,
    private activeRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef
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

  closeFormula = () => {
    this.modalService.dismissAll();
  };
  editMetricName(row) {
    this.metric = row;
    this.verbose_name = row.verbose_name;
    this.closeMetric();
  }

  closeMetric() {
    this.showVerboseName = !this.showVerboseName;
  }

  handleChange = (event) => {
    this.verbose_name = event.value;
  };

  async saveVerboseName(row) {
    const [dsID, dsType] = this.explore.form_data.datasource.split('__');
    var params = {
      dsID: dsID,
      key: row.metric_name,
      name: this.verbose_name,
    };
    await loadChartData('/api/query/metadata/editmetric', params, this.messages, this.service);
    await this.getDataChart({ id: this.id });
    this.closeMetric();
  }

  getDataChart = async (params) => {
    // code for get explore for create chart on card
    const exploreObj = params ? await loadExploreJson(params, this.service, this.messages) : null;
    const sharedChartDataObj = {
      themes: exploreObj && params.id ? exploreObj.explore.form_data.color_scheme : [],
      title: exploreObj && params.id ? exploreObj.explore.slice.slice_name : 'Untitled',
      hasActivity: true,
      index: null,
      myChartID: params && params.id ? params.slice_id || params.id : '',
      data: null,
      typeChart: exploreObj ? exploreObj.explore.form_data.viz_type : '',
      mapGeoJSON: null,
      url: null,
      explore: exploreObj.explore,
      exploreJson: exploreObj ? exploreObj.exploreJson : null,
    };
    this.explore = exploreObj.explore;
    this.store.dispatch(PostSharedChartData(sharedChartDataObj));
    this.changeDetector.detectChanges();
  };
}
