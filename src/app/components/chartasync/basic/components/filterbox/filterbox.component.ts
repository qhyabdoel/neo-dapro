import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { checked_unchecked_all } from 'src/app/libs/helpers/utility';
import { SetExtraFilter } from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { AppState } from 'src/app/libs/store/states';
import { alphabeth } from '../../../filterbox/helperFilterBox.component';

@Component({
  selector: 'filterbox-component',
  templateUrl: './filterbox.component.html',
})
export class ChartFilterBoxComponent {
  @Input() myChartID: string;
  @Input() explore: any;
  @Input() exploreJson: any;
  @Input() chartOption: any;
  @Input() since: any;
  @Input() until: any;
  @Input() listOfChartOnDashboard: any;
  @Input() filterCheckboxList: any;
  @Input() isExtraFilter: any;

  @Output() handleSetData: EventEmitter<any> = new EventEmitter<any>();
  @Output() applyFunction: EventEmitter<any> = new EventEmitter<any>();

  activeAlphabet: any;
  alphabethList: any = alphabeth;
  constructor(private store: Store<AppState>) {}
  filter_function(e, index) {
    let collectSelectedValue = e.reduce(function (s, a) {
      s.push(a.id);
      return s;
    }, []);
    this.setValueFilterDashboard(collectSelectedValue, index);
  }

  setValueFilterDashboard = (collectValue, index) => {
    let extraFilter = Object.assign([], this.isExtraFilter);
    extraFilter = extraFilter.map((data, i) => {
      let modify = { ...data };
      if (i === index) {
        modify.val = collectValue;
      }
      return modify;
    });
    this.isExtraFilter = extraFilter;
    this.store.dispatch(SetExtraFilter({ extraFilter: this.isExtraFilter }));
    if (this.explore.form_data.instant_filtering) {
      this.applyFunction.emit();
      //   this.handleApplyFilter();
      //   this.isApplyDashboard = true;
    }
  };

  onCheckboxFilter(event, name) {
    if (name === 'all') {
      checked_unchecked_all(!event.target.checked, this.filterCheckboxList);
    } else {
      let listChecked = [];
      this.filterCheckboxList.map((item) => {
        if (name === item.id) {
          item = {
            ...item,
            isChecked: event.target.checked,
          };
        }
        listChecked.push(item);
      });
      this.filterCheckboxList = listChecked;
    }
    let data = [];
    let index = this.isExtraFilter.findIndex((item) => item.col === this.explore.form_data.filter_control_checkbox);
    this.filterCheckboxList.map((obj) => {
      if (obj.isChecked) {
        data.push(obj.id);
      }
    });
    this.setValueFilterDashboard(data, index);
  }

  //   handleApplyFilter = () => {
  //     let dashboardList = Object.assign([], this.listOfChartOnDashboard);
  //     dashboardList.map(async (data) => {
  //       if (data.exploreJson.form_data.viz_type !== 'filter_box') {
  //         data = {
  //           ...data,
  //           exploreJson: {
  //             ...data.exploreJson,
  //             form_data: {
  //               ...data.exploreJson.form_data,
  //               extra_filters: this.isExtraFilter,
  //             },
  //           },
  //         };
  //         // await this.handleGenerate(data.exploreJson.form_data, data.exploreJson.form_data.viz_type);
  //       }
  //     });
  //     // this.store.dispatch(isApplyFilter({ status: false }));
  //     // this.isApplyDashboard = false;
  //   };

  onAlphabetFilter = (event) => {
    this.activeAlphabet = event === this.activeAlphabet ? '' : event;
  };

  setState = (event) => {
    this.handleSetData.emit(event);
  };
}
