import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { LayoutConfigService, LoaderService, ApiService } from 'src/app/libs/services';
import * as objectPath from 'object-path';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from 'src/app/components/modals/modal/modal.component';
import * as _moment from 'moment';
import { FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { default as _rollupMoment, Moment } from 'moment';
import {
  date_picker_handler,
  get_position,
  month_picker_handler,
  validate_date,
  year_picker_handler,
  on_click_overlay,
} from 'src/app/libs/helpers/utility';
import { alphabeth, setInitialDate } from './helperFilterBox.component';
import {
  helperGenerateExploreJsonUrl,
  helperGenerateExploreUrl,
  helperGetExplorerChart,
} from 'src/app/libs/helpers/data-visualization-helper';

const moment = _rollupMoment || _moment;
declare var $: any;

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: '[pq-filterbox-async]',
  templateUrl: './filterbox2.component.html',
  styleUrls: ['./filterbox2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class Filterbox2Component implements OnInit {
  @Input() cardID: string;
  @Input() myChartID: string;
  @Input() title: string;
  @Input() isTemplate: string;
  @Input() rowPosition: number;

  @Input() fdata: any;
  @Input() token: any;
  @Input() url: string;
  @Input() slug: string;
  @Input() mapGeoJSON: any;
  @Input() index: number;
  @Input() themes: any;
  @Input() autoResize: any;
  @Input() columns: any;
  @Input() records: any;
  @Input() explore: any;
  @Input() exploreJson: any;
  @Input() isDrag;
  @Input() isView: boolean;
  @Input() formdata: any;
  @Input() data: any;
  @Input() extraFilter: any;
  @Input() isFilter: boolean;
  @Input() sliceArr: any;
  @Input() isSearchResult: boolean;
  @Input() searchResultOptions: any;
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<string> = new EventEmitter<string>();
  @Output() download: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() width: EventEmitter<any> = new EventEmitter<any>();
  @Output() filter: EventEmitter<any> = new EventEmitter<any>();
  @Output() height: EventEmitter<any> = new EventEmitter<any>();
  @Output() searchResultJumpTo: EventEmitter<any> = new EventEmitter<any>();
  chartOption: any;
  sizeNumber: string;
  sizeText: string;
  theme: string;
  echartsInstance: any;
  det: any;
  dragHandle = false;
  dragBounds = true;
  canDownload = false;
  canOverwrite = false;
  filterList: any = [];
  dataFilter: any = [];
  timeColumn: any;
  dataFilterSince: any;
  dataFilterUntil: any;
  activeClass = '';
  date_filter = false;
  instant_filtering = true;
  meId$: any = [];
  noData: boolean = false;
  validate_messages: any = [];
  alphabetFilterList: any = [];
  filterCheckboxList: any = [];
  selectedFilterCheckboxList: any = [];
  isFullscreen: boolean = false;
  isCheckedAllItem: boolean = false;
  sinceDateFC: any;
  untilDateFC: any;
  regexColumn: string;
  selectedAlphabetFilter: any = [];
  constructor(
    private layoutConfigService: LayoutConfigService,
    private cdr: ChangeDetectorRef,
    private _apicall: ApiService,
    private loaderService: LoaderService,
    private modalService: NgbModal
  ) {}

  findExploreJsonWhenUndefined = async () => {
    var explore = {
      form_data: {},
    };
    let exploreUrl = helperGenerateExploreUrl(this.myChartID);
    let exploreJsonUrl = helperGenerateExploreJsonUrl(this.myChartID);
    if (this.token) {
      exploreUrl += '&token=' + this.token;
      exploreJsonUrl += '&token=' + this.token;
    }
    this.url = exploreUrl;
    this.explore = await helperGetExplorerChart(this.explore, '', this.token, exploreUrl, this._apicall, this.fdata);
    explore = this.explore;

    if (this.explore) {
      this.canDownload = this.explore.canDownload;
      this.canOverwrite = this.explore.canOverwrite;
    }

    let payload = explore.form_data ? explore.form_data : this.explore.form_data;
    let param = {
      form_data: payload,
    };
    param = setInitialDate(param, this.explore);
    param.form_data = JSON.stringify(param.form_data);
    this.data = await helperGetExplorerChart(
      this.explore,
      exploreJsonUrl,
      this.token,
      '',
      this._apicall,
      this.fdata,
      param
    );

    this.setExtraFilter();
  };
  async ngOnInit() {
    if (!this.isView) {
      this.sinceDateFC = new FormControl(moment());
      this.untilDateFC = new FormControl(moment());
    }

    const config = this.layoutConfigService.getConfig();
    let skin = objectPath.get(config, 'login.self.skin');
    this.meId$ = this.loaderService.getSpesifikID;
    let me = this;
    this.initial();

    if (!this.exploreJson) {
      // set result configurasi dari exploreJson ke series chart
      await this.findExploreJsonWhenUndefined();
    } else {
      this.data = this.exploreJson;
      this.explore = this.formdata;
      this.setExtraFilter();
    }

    var themes = this.explore.form_data.color_scheme != 'bnbColors' ? this.explore.form_data.color_scheme : 'palette1';
    this.theme = themes ? themes : 'palette1';
    if (skin == 'light') {
      this.theme = this.theme + 'L';
    }
    this.det = setTimeout(function () {
      me.meId$ = me.loaderService.spliceSpesifikID(this.myChartID);
      me.cdr.detectChanges();
    }, 1000);
  }

  setExtraFilter() {
    this.timeColumn = this.data.form_data.granularity_sqla;
    this.date_filter = this.data.form_data.date_filter;
    this.instant_filtering = this.data.form_data.instant_filtering;
    this.filterList = Object.keys(this.data.data);

    if (this.extraFilter) {
      if (this.filterList && this.filterList.length > 0) {
        let arrData = Object.keys(this.data.data);
        for (let index = 0; index < arrData.length; index++) {
          let arr = [];
          for (let i = 0; i < this.data.data[arrData[index]].length; i++) {
            this.extraFilter.forEach((item) => {
              if (item && item.val && item.val.length > 0 && item.col == arrData[index]) {
                if (Array.isArray(item.val)) {
                  for (let j = 0; j < item.val.length; j++) {
                    let obj = {
                      filter: item.col,
                      id: item.val[j],
                      text: item.val[j],
                    };
                    arr.push(obj);
                  }
                } else {
                  let obj = {
                    filter: item.col,
                    id: item.val,
                    text: item.val,
                  };
                  arr.push(obj);
                }
              }
            });
          }

          let result = [];
          const map = new Map();
          for (const item of arr) {
            if (item.id != '' && !map.has(item.id)) {
              map.set(item.id, true); // set any value to Map
              result.push({
                filter: item.filter,
                id: item.id,
                text: item.text,
              });
            }
          }

          this.dataFilter[arrData[index]] = result;
        }
      }

      let selectedTime = this.extraFilter.filter((v, idx) => {
        if (v.col == '__time_col') return v.val;
      });

      let dataFilterSince = this.extraFilter.filter((v, idx) => {
        if (v.col == '__from') return v.val;
      });

      let dataFilterUntil = this.extraFilter.filter((v, idx) => {
        if (v.col == '__to') return v.val;
      });

      if (this.isView && dataFilterSince[0] && dataFilterUntil[0]) {
        if (
          this.explore.form_data.thistial_date_filter == 'null' &&
          (dataFilterUntil[0].val._isAMomentObject || dataFilterSince[0].val._isAMomentObject)
        ) {
          this.sinceDateFC = new FormControl();
          this.untilDateFC = new FormControl();
        } else {
          this.sinceDateFC = new FormControl(moment());
          this.untilDateFC = new FormControl(moment());

          if (dataFilterSince.length > 0) {
            this.dataFilterSince = dataFilterSince[0].val;
          }

          if (dataFilterUntil.length > 0) {
            this.dataFilterUntil = dataFilterUntil[0].val;
          }
        }
      }

      if (selectedTime.length > 0) {
        this.timeColumn = selectedTime[0].val;
      }

      if (this.extraFilter.length > 0) {
        let filterArr = [];
        for (let i = 0; i < this.extraFilter.length; i++) {
          let key = this.extraFilter[i].col;
          let selectedColumn;
          if (this.dataFilter.length > 0) {
            if (this.dataFilter.length > 0 && Array.isArray(this.dataFilter[i].val)) {
              for (let j = 0; j < this.dataFilter[i].val.length; j++) {
                selectedColumn = this.dataFilter[i].val[j];
                let extraFilterObj = { filter: selectedColumn, id: selectedColumn, text: selectedColumn };
                filterArr.push(extraFilterObj);
              }
              this.dataFilter[key] = filterArr;
            } else {
              selectedColumn = this.extraFilter[i].val;
              this.dataFilter[key] = [{ filter: selectedColumn, id: selectedColumn, text: selectedColumn }];
            }
          }
        }
      }
    }

    //filter checkbox
    if (this.data.form_data.filter_checkbox) {
      let index = this.data.form_data.filter_control_checkbox;
      for (var i = 0; i < this.data.data[index].length; i++) {
        if (this.data.data[index][i].id !== '') {
          if (!this.exploreJson) {
            let isIdUtc = validate_date(this.data.data[index][i].id);
            let id = isIdUtc ? moment(this.data.data[index][i].id).format('YYYY-MM-DD') : this.data.data[index][i].id;
            let filteredColumn = this.dataFilter[index].filter((x) => x.id === id);

            if (filteredColumn.length > 0) {
              this.data.data[index][i] = {
                ...this.data.data[index][i],
                isChecked: true,
              };
            } else {
              this.data.data[index][i] = {
                ...this.data.data[index][i],
                isChecked: false,
              };
            }
          }
        }
        this.filterCheckboxList.push(this.data.data[index][i]);
      }

      let selectedFilterColumn = [];
      for (var i = 0; i < this.filterCheckboxList.length; i++) {
        if (this.filterCheckboxList[i].isChecked == true) {
          selectedFilterColumn.push(this.filterCheckboxList[i]);
        }
      }
      if (selectedFilterColumn.length == this.filterCheckboxList.length) {
        this.isCheckedAllItem = true;
      }
    }

    //alphabet filter
    if (this.data.form_data.alphabet_filter) {
      const self = this;
      let index = this.data.form_data.filter_control_alphabetic;
      if (typeof this.dataFilter[index] !== 'undefined') {
        if (this.dataFilter[index].length > 0) {
          for (let i = 0; i < this.dataFilter[index].length; i++) {
            let alphabethIndex = this.dataFilter[index][i].text.substring(5, 6);
            let currentAlphabetObj = {
              filter: index,
              id: alphabethIndex,
              text: '(?i)^' + alphabethIndex,
            };
            this.regexColumn = index;
            this.selectedAlphabetFilter.push(currentAlphabetObj);
            this.dataFilter[index] = [];
            this.dataFilter[index].push(currentAlphabetObj);
          }

          setTimeout(function () {
            self.setActiveAlphabethButton();
          }, 1000);
        }
      }
    }
  }
  //End configuration chart function

  setActiveAlphabethButton() {
    let index = this.data.form_data.filter_control_alphabetic;
    if (this.dataFilter[index].length > 0) {
      for (let i = 0; i < this.dataFilter[index].length; i++) {
        let alphabethIndex = this.dataFilter[index][i].text.substring(5, 6);
        document.getElementById('AlphabethBtn-' + alphabethIndex).classList.add('active');
      }
    }
  }

  initial() {
    this.alphabetFilterList = alphabeth;
  }

  addFilter(e?) {
    if (this.instant_filtering) {
      let param = {
        id: this.myChartID,
        data: this.explore,
        filter: {
          data: this.dataFilter,
          since: this.dataFilterSince,
          until: this.dataFilterUntil,
          timecolumn: this.timeColumn,
          regexColumn: this.regexColumn,
        },
        url: this.url,
        slug: this.slug,
      };
      this.filter.emit(param);
    }
  }

  clearFilter(e) {
    if (this.instant_filtering) {
      let param = {
        id: this.myChartID,
        data: this.explore,
        filter: {
          data: this.dataFilter,
          since: this.dataFilterSince,
          until: this.dataFilterUntil,
          timecolumn: this.timeColumn,
        },
        url: this.url,
        slug: this.slug,
      };
      this.filter.emit(param);
    }
  }

  removeFilter(e) {
    if (this.instant_filtering) {
      let param = {
        id: this.myChartID,
        data: this.explore,
        filter: {
          data: this.dataFilter,
          since: this.dataFilterSince,
          until: this.dataFilterUntil,
          timecolumn: this.timeColumn,
        },
        url: this.url,
        slug: this.slug,
      };
      this.filter.emit(param);
    }
  }

  onReset(id) {
    let param = {
      id: id,
      data: this.explore,
      filter: {
        data: [],
        since: undefined,
        until: undefined,
        timecolumn: undefined,
      },
      url: this.url,
      slug: this.slug,
    };
    this.filter.emit(param);
  }

  onRefresh(id) {
    this.loaderService.setSpesifikID([id]);
    this.meId$ = this.loaderService.getSpesifikID;
    this.cdr.detectChanges();
    this.ngOnInit();
  }

  onEdit(id) {
    this.edit.emit(id);
  }

  onFilter(id) {
    if (!this.instant_filtering) {
      if (typeof this.dataFilterSince !== typeof this.dataFilterUntil) {
        this.openModal('Warning', 'the since and until date fields must be filled in both');
        return;
      }

      let param = {
        id: id,
        data: this.explore,
        filter: {
          data: this.dataFilter,
          since: this.dataFilterSince,
          until: this.dataFilterUntil,
          timecolumn: this.timeColumn,
          regexColumn: this.regexColumn,
        },
        url: this.url,
        slug: this.slug,
      };
      this.filter.emit(param);
    }
  }

  onChartHeight(height) {
    let card = document.getElementById('myDiv-' + this.cardID);
    card.style.height = height + 'vh';
    this.height.emit(height);
    this.cdr.detectChanges();
  }

  setTimeColumn() {
    if (this.instant_filtering) {
      let param = {
        id: this.myChartID,
        data: this.explore,
        filter: {
          data: this.dataFilter,
          since: this.dataFilterSince,
          until: this.dataFilterUntil,
          timecolumn: this.timeColumn,
        },
        url: this.url,
        slug: this.slug,
      };
      this.filter.emit(param);
    }
  }

  onChartWidth(cls) {
    let card = document.getElementById(this.cardID);
    card.removeAttribute('class');
    card.className = cls;
    this.activeClass = cls;
    this.width.emit(get_position(cls));
    this.cdr.detectChanges();
  }

  onDownload(id) {
    this.download.emit({ id: id, url: this.url, data: this.explore });
  }

  onDelete() {
    this.delete.emit(this.index);
  }

  viewDetailChart(e) {
    this.searchResultJumpTo.emit(e);
  }

  onFullscreen() {
    let card = document.getElementById('myDiv-' + this.cardID);
    if (card.requestFullscreen) {
      card.requestFullscreen();
    }
  }

  onClickOverlay() {
    on_click_overlay(this.cardID);
  }

  openModal(title?, msg?, isFooter?, footerLeftText?, footerRightText?) {
    if (footerLeftText != null && footerRightText != null) {
      let modalRef;
      modalRef = this.modalService.open(ModalComponent, {
        centered: true,
        size: 'sm',
      });
      modalRef.componentInstance.title = title ? title : '';
      modalRef.componentInstance.msg = msg ? msg : 'Please contact administrator for this issue!';
      modalRef.componentInstance.isFooter = isFooter ? isFooter : false;
      modalRef.componentInstance.footerLeftText = footerLeftText ? footerLeftText : 'Yes';
      modalRef.componentInstance.footerRightText = footerRightText ? footerRightText : 'No';
    } else {
      this.validate_messages = [];
      let message = msg ? msg : 'Ups.. something wrong loaded data!';
      this.validate_messages.push(message);
      $('#alertDialogFilter').modal();
      this.cdr.detectChanges();
    }
  }

  onCheckboxFilter(item, isChecked) {
    let index = item.filter;
    if (isChecked) {
      this.dataFilter[index].push(item);
    } else {
      var removeFilter = this.dataFilter[index]
        .map(function (item) {
          return item.id;
        })
        .indexOf(item.id);
      this.dataFilter[index].splice(removeFilter, 1);
    }

    if (this.instant_filtering) this.addFilter();
  }

  checkUncheckAll() {
    let index = this.data.form_data.filter_control_checkbox;
    this.dataFilter[index] = [];
    if (this.isCheckedAllItem === true) {
      for (var i = 0; i < this.filterCheckboxList.length; i++) {
        this.filterCheckboxList[i].isChecked = true;
        this.dataFilter[index].push(this.filterCheckboxList[i]);
      }
    } else {
      for (var i = 0; i < this.filterCheckboxList.length; i++) {
        this.filterCheckboxList[i].isChecked = false;
        var removeFilter = this.dataFilter[index]
          .map(function (item) {
            return item.id;
          })
          .indexOf(this.filterCheckboxList[i].id);
        this.dataFilter[index].splice(removeFilter, 1);
      }
    }

    if (this.instant_filtering) this.addFilter();
  }

  onAlphabetFilter(item) {
    let index = this.data.form_data.filter_control_alphabetic;
    let selectedAlphabet = this.selectedAlphabetFilter.filter((x) => x.id === item)[0];

    let alphabetObj = {};
    if (!selectedAlphabet) {
      if (this.selectedAlphabetFilter.length > 0) {
        for (var i = 0; i < this.selectedAlphabetFilter.length; i++) {
          $('#AlphabethBtn-' + this.selectedAlphabetFilter[i].id).removeClass('active');
        }
        this.selectedAlphabetFilter = [];
        this.dataFilter[index] = [];
      }

      $('#AlphabethBtn-' + item).addClass('active');
      alphabetObj = {
        filter: index,
        id: item,
        text: '(?i)^' + item,
      };
      this.regexColumn = index;
      this.selectedAlphabetFilter.push(alphabetObj);
      this.dataFilter[index].push(alphabetObj);
    } else {
      $('#AlphabethBtn-' + item).removeClass('active');
      this.dataFilter[index] = [];
    }
    if (this.instant_filtering) this.addFilter();
  }

  yearPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    chosenDate.set({ date: 1 });
    if (type === 'since') this.dataFilterSince = chosenDate;
    else if (type === 'until') this.dataFilterUntil = chosenDate;
    let result = year_picker_handler(
      moment,
      this.dataFilterSince,
      this.dataFilterUntil,
      this.data.form_data.filter_date
    );
    this.dataFilterSince = result[0];
    this.dataFilterUntil = result[1];
    datepicker.close();
    if (this.dataFilterSince !== null && this.dataFilterUntil && this.instant_filtering) {
      this.addFilter();
    }
  }

  monthPickerHandler(chosenDate: Moment, datepicker: MatDatepicker<Moment>, type) {
    if (type === 'since') this.dataFilterSince = chosenDate;
    else if (type === 'until') this.dataFilterUntil = chosenDate;
    let result = month_picker_handler(
      moment,
      this.dataFilterSince,
      this.dataFilterUntil,
      this.data.form_data.filter_date
    );
    this.dataFilterSince = result[0];
    this.dataFilterUntil = result[1];
    datepicker.close();
    if (this.dataFilterSince !== null && this.dataFilterUntil && this.instant_filtering) {
      this.addFilter();
    }
  }

  datePickerHandler(chosenDate: Moment, type) {
    if (type === 'since') this.dataFilterSince = chosenDate;
    else if (type === 'until') this.dataFilterUntil = chosenDate;
    let result = date_picker_handler(
      moment,
      this.dataFilterSince,
      this.dataFilterUntil,
      this.data.form_data.filter_date
    );
    this.dataFilterSince = result[0];
    this.dataFilterUntil = result[1];
    if (this.dataFilterSince !== null && this.dataFilterUntil && this.instant_filtering) {
      this.addFilter();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.echartsInstance) this.echartsInstance.resize();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    this.cdr.detectChanges();
  }

  @HostListener('fullscreenchange', ['$event'])
  @HostListener('webkitfullscreenchange', ['$event'])
  @HostListener('mozfullscreenchange', ['$event'])
  @HostListener('MSFullscreenChange', ['$event'])
  screenChange() {
    if (window.innerHeight === screen.height) this.isFullscreen = true;
    else this.isFullscreen = false;
  }
}
