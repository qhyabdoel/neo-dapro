import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, Inject } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { DialogAlertComponent } from 'src/app/components/dialogs/dialogAlert/dialog-alert.component';
import { JsonService, TranslationService } from 'src/app/libs/services';
import { PostSharedChartData } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { sharedChartDataSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { setValRequiredForm, validateForm } from '../../../helperRightbar';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'visualization_type',
  templateUrl: './visualization_type.html',
})
export class VisualizationTypeComponent implements OnInit {
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  explore: any = null;
  exploreJson: any = null;
  listVisualType: any = [];
  displaySelected: string;
  messages: any;
  modalReference: NgbModalRef;
  isFormValidate: boolean = false;
  validate_messages: Array<any> = [];
  shareChartData: any;
  constructor(
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef,
    private jsonService: JsonService,
    private translationService: TranslationService,
    private modalService: NgbModal,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.store
      .select(sharedChartDataSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          this.preparingData(result);
          this.changeDetector.detectChanges();
        }
      });
  }

  async ngOnInit() {
    this.messages = await this.jsonService.retMessage();
    let resultApi = await this.jsonService.retVisual(this.translationService.getSelectedLanguage());
    this.listVisualType = resultApi[0].visual_type.filter((data)=> data.value!=='predictive');
  }
  preparingData = (res) => {
    this.explore = res.explore;
    this.exploreJson = res.exploreJson;
    this.displaySelected = res.typeChart;
    this.shareChartData = res;
  };

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };

  handleIcon = (row) => {
    let link = '';
    if (row.value === 'country_map') {
      link = `./.${row.image}`;
    } else {
      link = `./${row.image}`;
    }
    return link;
  };

  setVisualType = async (event) => {
    this.displaySelected = event.value;
    if (!this.exploreJson) {
      this.isFormValidate = false;
      this.validate_messages.push(this.messages.CHART.MSG_PCD);
    } else {
      try {
        await setValRequiredForm(this.displaySelected, this.explore, this.exploreJson);
      } catch (e) {
        let result = null;
        result = await validateForm(this.displaySelected, this.explore.form_data, this.messages);
        this.isFormValidate = result.isFormValidate;
        this.validate_messages = result.validate_messages;
      }
    }
    // this.store.dispatch(PostSharedChartData({ ...this.shareChartData, typeChart: this.displaySelected }));
    this.store.dispatch(
      PostSharedChartData({
        ...this.shareChartData,
        exploreJson: {
          ...this.shareChartData.exploreJson,
          form_data: {
            ...this.shareChartData.exploreJson.form_data,
            viz_type: this.displaySelected,
          },
        },
        typeChart: this.displaySelected,
      })
    );
    this.alertDialog();
  };

  alertDialog = () => {
    if (this.validate_messages.length > 0) {
      this.modalReference = this.modalService.open(DialogAlertComponent, {
        centered: true,
      });
      this.modalReference.componentInstance.isFormValidate = this.isFormValidate;
      this.modalReference.componentInstance.validate_messages = this.validate_messages;
      this.validate_messages = [];
    }
  };

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }
}
