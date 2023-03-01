import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import * as introJs from 'intro.js/intro.js';
import { TranslationService, JsonService, ApiService, LayoutUtilsService } from 'src/app/libs/services';
import {
  LoadChartById,
  PostDetailChartExporeFormDataChart,
  PostShareChart,
  PostShareUrlChart,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import {
  datasetItemSelector,
  detailChartSelector,
  postShareChartSelector,
  postShareUrlChartSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import * as FileSaver from 'file-saver';
import { helperValidateFormVisualType, loadChartData } from 'src/app/libs/helpers/data-visualization-helper';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalSaveChartComponent } from 'src/app/components/modals/modalSaveChart/modal-save-chart.component';
import { FormControl, Validators } from '@angular/forms';
import { DialogAlertComponent } from 'src/app/components/dialogs/dialogAlert/dialog-alert.component';
import { ClipboardService } from 'ngx-clipboard';
@Component({
  selector: 'topbar-datavisualization',
  templateUrl: './topbardatavisualization.component.html',
})
export class TopbarChartVisualizationComponent implements OnInit {
  @Input() removeComp: () => void;
  // variable string
  datasourceTitle: string = '';
  visualType: string = '';
  hasFlaging: string = 'overwrite';
  // variable any
  sharedData: any;
  messages: any;
  slice: any = {};
  modalReference: NgbModalRef;
  form_data: any = {};
  master_data: any = {};
  row: any = {};
  hasFlagingControl = new FormControl('', Validators.required);
  validate_messages: Array<any> = [];
  chartLinks: Array<any> = [];
  //variable boolean
  stateloadDataset: boolean = false;
  isFormValidate: boolean = false;
  constructor(
    private translationService: TranslationService,
    private jsonService: JsonService,
    private service: ApiService,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private layoutUtilsService: LayoutUtilsService,
    private router: Router,
    private detectorChange: ChangeDetectorRef,
    private clipboardService: ClipboardService
  ) {
    this.store.select(datasetItemSelector).subscribe((res) => {
      if (res) {
        this.stateloadDataset = true;
        this.datasourceTitle = 'Untitled';
        this.visualType = res.type;
      }
    });
    this.store
      .select(detailChartSelector)
      .pipe()
      .subscribe((res) => {
        if (res) {
          this.setData(res);
        }
      });
  }

  introJS = introJs();
  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
    this.initial();
    this.route.queryParams.subscribe((params) => {
      if (params.slice_id != undefined) {
        this.slice = { slice_id: params.slice_id };
        this.getData();
      }
    });
  }

  initial = () => {
    this.stateloadDataset = false;
    this.slice = {};
    this.datasourceTitle = '';
    this.visualType = '';
  };

  setData = (result) => {
    this.stateloadDataset = true;
    this.datasourceTitle = result.slice ? result.slice.slice_name : 'Untitled';
    this.visualType = result.form_data.viz_type;
    this.form_data = result.form_data;
    this.master_data = result;
  };
  getData = () => {
    this.store
      .select(detailChartSelector)
      .pipe()
      .subscribe((res) => {
        if (res) {
          this.setData(res);
        }
      });
  };
  async getIntro(user?: any) {
    if (!user.isFirst.isListVisualizationChart) return;
    user.isFirst = { ...user.isFirst, isListVisualizationChart: false };
    let intro: any = await this.jsonService.retIntro(this.translationService.getSelectedLanguage());
    this.introJS
      .setOptions({
        steps: intro.listchart,
        skipLabel: 'Skip',
        showBullets: true,
        hintButtonLabel: 'OK',
        showProgress: false,
        hidePrev: true,
        hideNext: false,
      })
      .start();
  }

  async onChartDownload(id) {
    if (id == undefined) return;
    let mydata = await loadChartData(
      '/api/chart/explore/?form_data=%7B%22slice_id%22%3A' + Number(id) + '%7D',
      {},
      this.messages,
      this.service
    );
    let urlnext = '/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A' + id + '%7D&csv=true';
    let param = { form_data: JSON.stringify(mydata.form_data) };
    this.service.postDownload(urlnext, param).subscribe((resp: any) => {
      FileSaver.saveAs(resp, mydata.slice.datasource + ' ' + mydata.slice.slice_name + `.csv`);
    });
  }
  async copyUrl(slice_id) {
    if (slice_id == undefined) return;
    this.store.dispatch(PostShareChart({ id: slice_id }));
    this.store
      .select(postShareChartSelector)
      .pipe()
      .subscribe((result) => {
        let url = `${location.origin}/pdsshare/sharevisualization?${result.response ? result.response : result}`;
        this.sharedData = url;
        this.clipboardService.copyFromContent(url);
        this.service.openModal(this.messages.CHART.S, this.messages.CHART.MSG_CUS);
      });
  }
  async getShareApi(slice_id) {
    if (slice_id == undefined) return;
    this.store.dispatch(PostShareChart({ id: slice_id }));
    this.store
      .select(postShareChartSelector)
      .pipe()
      .subscribe((result) => {
        let url = `${location.origin}/api/chart/api?${result.response ? result.response : result}`;
        this.sharedData = url;
        this.clipboardService.copyFromContent(url);
        this.service.openModal(this.messages.CHART.S, this.messages.CHART.MSG_SAS);
      });
  }

  async getShareEmbed(slice_id) {
    if (slice_id == undefined) return;
    this.store.dispatch(PostShareUrlChart({ id: slice_id }));
    this.store
      .select(postShareUrlChartSelector)
      .pipe()
      .subscribe((result) => {
        let url = `<iframe width="600" height="400" seamless frameBorder="0" scrolling="no"
        src="${location.origin}/chart/shared?${result.response ? result.response : result}&height=400">
     </iframe>`;
        this.sharedData = url;
        this.clipboardService.copyFromContent(url);
        this.service.openModal(this.messages.CHART.S, this.messages.CHART.MSG_SES);
      });
  }

  openModalTemplateCustom() {
    this.row = {
      slice_chart_name: this.datasourceTitle,
    };
    this.modalReference = this.modalService.open(ModalSaveChartComponent, {
      size: 'md',
      centered: true,
    });
    this.modalReference.componentInstance.hasFlaging = this.hasFlaging;
    this.modalReference.componentInstance.slice = this.slice;
    this.modalReference.componentInstance.data = this.row;
    this.modalReference.componentInstance.hasFlagingControl = this.hasFlagingControl;
    this.modalReference.result.then(
      (res) => {
        this.hasFlaging = res;
        this.saveChartsName([this.row]);
        this.modalService.dismissAll();
      },
      (reason: any) => {}
    );
  }
  async buttonNew() {
    this.messages = await this.jsonService.retMessage();
    if (!this.stateloadDataset) return;
    const dialogRef = this.layoutUtilsService.saveElement(
      this.messages.CHART.MSG_DWC,
      this.messages.CHART.MSG_YWCSABC,
      this.messages.CHART.MSG_CIS
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (res === true || res === 'load') {
        if (res === true) {
          this.hasFlaging = 'slice_id' in this.slice ? 'overwrite' : 'saveas';
          await this.saveChartsName([this.row]);
        }
        this.stateloadDataset = false;
        this.removeComp();
        this.initial();
        this.router.navigate(['/pds/newdatavisualization']);
        return;
      }
    });
  }

  async saveChartsName(flag: any = []) {
    this.messages = await this.jsonService.retMessage();
    if (this.form_data.viz_type == '' || this.form_data.viz_type == 'preview') {
      await this.service.openModal(this.messages.CHART.W, this.messages.CHART.MSG_PCVT, 'sm');
      this.detectorChange.detectChanges();
      return false;
    }
    var query = {};
    let slice_chart_name = (this.datasourceTitle || '').replace(/\s+/g, '+');
    if (flag.length > 0 && flag[0].hasOwnProperty('slice_chart_name')) {
      slice_chart_name = flag[0].slice_chart_name;
    }

    if (!this.slice || this.slice.slice_id == undefined) {
      query = {
        action: 'saveas',
        slice_name: slice_chart_name,
      };
    } else {
      if (this.hasFlaging == 'saveas') {
        query = {
          form_data: '%7B%22slice_id%22%3A' + this.slice.slice_id + '%7D',
          action: 'saveas',
          slice_id: this.slice.slice_id,
          slice_name: slice_chart_name,
          add_to_dash: 'noSave',
          goto_dash: false,
        };
      } else {
        query = {
          form_data: '%7B%22slice_id%22%3A' + this.slice.slice_id + '%7D',
          action: 'overwrite',
          slice_id: this.slice.slice_id,
          slice_name: slice_chart_name,
          add_to_dash: 'noSave',
          goto_dash: false,
        };
      }
    }
    var queryString = Object.keys(query)
      .map((key) => key + '=' + query[key])
      .join('&');

    let vizType = this.form_data.viz_type;
    if (this.form_data.viz_type2 != undefined) vizType = this.form_data.viz_type2;
    this.validate_messages = helperValidateFormVisualType(
      vizType,
      false,
      this.form_data,
      this.messages,
      this.validate_messages
    );
    if (this.validate_messages.length > 0) {
      this.isFormValidate = false;
      this.alertDialog();
      this.detectorChange.detectChanges();
      return;
    }
    if (!this.slice || this.slice.slice_id == undefined) {
      var datasource = localStorage.getItem('exploreJson') ? JSON.parse(localStorage.getItem('exploreJson')) : [];
      const [ds, dsType] = datasource.form_data.datasource.split('__');
      var url = `api/chart/explore/${dsType}/${ds}?${queryString}`;
      var params = localStorage.getItem('runQuery') ? JSON.parse(localStorage.getItem('runQuery')) : [];
      this.modalService.dismissAll();
      if (params.length > 0) {
        params[0].since = '';
        params[0].until = '';
        if (this.form_data.set_default_series) params[0].set_default_series = this.form_data.set_default_series;
        if (this.form_data.colorpickers && this.form_data.colorpickers.length > 0)
          params[0].colorpickers = this.form_data.colorpickers;
        let param = { form_data: JSON.stringify(params[0]) };
        let slice_chart = await loadChartData(url, param, this.messages, this.service);
        this.form_data = Object.assign({}, this.form_data, slice_chart.data.form_data);
        this.store.dispatch(PostDetailChartExporeFormDataChart({ param: slice_chart }));
        var url =
          'api/chart/explore/?form_data=%7B%22slice_id%22%3A' + parseInt(slice_chart.data.slice.slice_id) + '%7D';
        this.chartLinks = await loadChartData(url, {}, this.messages, this.service);
        localStorage.setItem('slice_chart', JSON.stringify([slice_chart]));

        if (this.chartLinks['can_add'] != null) {
          this.store.dispatch(LoadChartById({ data: slice_chart.data.slice.slice_id }));
          await this.service.openModal(this.messages.CHART.S, this.messages.CHART.MSG_ASP);
        } else {
          this.store.dispatch(LoadChartById({ data: slice_chart.data.slice.slice_id }));
          await this.service.openModal(this.messages.CHART.F, this.messages.CHART.MSG_PF);
        }
      } else {
        this.service.openModal(this.messages.CHART.F, this.messages.CHART.MSG_PF);
      }
    } else {
      const [ds, dsType] = this.form_data.datasource.split('__');
      var url = `api/chart/explore/${dsType}/${ds}?${queryString}`;
      var params = localStorage.getItem('runQuery') != undefined ? JSON.parse(localStorage.getItem('runQuery')) : [];
      params[0].since = '';
      params[0].until = '';
      if (this.form_data.set_default_series) params[0].set_default_series = this.form_data.set_default_series;
      if (this.form_data.colorpickers && this.form_data.colorpickers.length > 0)
        params[0].colorpickers = this.form_data.colorpickers;
      this.modalService.dismissAll();
      let param = { form_data: JSON.stringify(params[0]) };
      let slice_chart = await loadChartData(url, param, this.messages, this.service);
      this.form_data = Object.assign({}, this.form_data, slice_chart.data.form_data);
      var url = 'api/chart/explore/?form_data=%7B%22slice_id%22%3A' + parseInt(this.slice.slice_id) + '%7D';
      let explore = await loadChartData(url, {}, this.messages, this.service);
      this.store.dispatch(PostDetailChartExporeFormDataChart({ param: explore }));
      this.chartLinks = explore;
      localStorage.setItem('slice_chart', JSON.stringify([slice_chart]));
      if (this.chartLinks['can_add'] != null) {
        this.store.dispatch(LoadChartById({ data: this.slice.slice_id }));
        this.loadChartTo(this.slice.slice_id);
        await this.service.openModal(this.messages.CHART.S, this.messages.CHART.MSG_ASP);
      } else {
        this.store.dispatch(LoadChartById({ data: this.slice.slice_id }));
        await this.service.openModal(this.messages.CHART.F, this.messages.CHART.MSG_PF);
      }
    }
    return;
  }
  alertDialog = () => {
    this.modalReference = this.modalService.open(DialogAlertComponent, {
      centered: true,
    });
    this.modalReference.componentInstance.isFormValidate = this.isFormValidate;
    this.modalReference.componentInstance.validate_messages = this.validate_messages;
  };

  async loadChartTo(slice_id) {
    return this.router.navigate(['/pds/newdatavisualization'], {
      queryParams: { slice_id: slice_id },
    });
  }
}
