import { MatDialogRef } from '@angular/material/dialog';
import { ChangeDetectorRef, Component, Input, OnInit, Optional, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { getUrl, helperGenerateExploreUrl, loadChartData } from 'src/app/libs/helpers/data-visualization-helper';
import { ApiService, JsonService } from 'src/app/libs/services';
import {
  GetChartList,
  LoadChartById,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';

@Component({
  selector: 'modal-duplicate-chart',
  templateUrl: './modal-duplicate-chart.component.html',
})
export class ModalDuplicateChartComponent implements OnInit {
  @Output() public loadChart;
  @Output() handleSelectOption: (type: string, id: any) => void;
  @Input() public data;

  messages: any;
  slice_chart_name: string = '';

  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalDuplicateChartComponent>,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private jsonService: JsonService,
    private service: ApiService,
    private changeDetector: ChangeDetectorRef,
    private store: Store<AppState>
  ) {}
  async ngOnInit() {
    this.messages = await this.jsonService.retMessage();
    this.slice_chart_name = this.data.hasOwnProperty('name') ? `${this.data.name}` : 'duplicate';
  }
  closeModal = () => {
    this.modalService.dismissAll();
  };

  async duplicateChart() {
    this.messages = await this.jsonService.retMessage();
    let chart_name = '';
    if (this.data.name.replace(/\s+/g, '-') == this.slice_chart_name.replace(/\s+/g, '-')) {
      chart_name = this.slice_chart_name + '-duplicate';
    } else {
      chart_name = this.slice_chart_name;
    }
    const query = {
      form_data: '%7B%22slice_id%22%3A' + this.data.id + '%7D',
      action: 'saveas',
      slice_id: this.data.id,
      slice_name: chart_name,
      add_to_dash: 'noSave',
      goto_dash: false,
    };
    this.modalService.dismissAll();
    const queryString = Object.keys(query)
      .map((key) => key + '=' + query[key])
      .join('&');
    const url = helperGenerateExploreUrl(this.data.id);
    let explore = await loadChartData(url, {}, this.messages, this.service);
    if (typeof explore == 'string' || explore == undefined) {
      // this.isLoadingContent = false;
      // this.errors = true;
      // this.errorMessage = explore;
      this.changeDetector.detectChanges();
      return false;
    }
    let parameter = { form_data: JSON.stringify(explore.form_data) };
    let urlQueryString = `${getUrl(explore)}?${queryString}`;
    await await loadChartData(urlQueryString, parameter, this.messages, this.service);
    await this.store.dispatch(GetChartList());
    await this.store.dispatch(LoadChartById({ data: this.data.id }));
    await this.handleSelectOption('chart', 0);
    await this.service.openModal(this.messages.CHART.S, this.messages.CHART.MSG_ASP);
  }

  initial = async () => {};
}
