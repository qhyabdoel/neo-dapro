import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { static_cols, static_cols_notification } from 'src/app/libs/helpers/constant_datavisualization';

@Component({
  selector: 'modal-notifications',
  templateUrl: './modal-notifications.component.html',
})
export class ModalNotificationsComponent implements OnInit {
  @Input() public chartLinks;
  @Input() public visualType;
  @Input() public notifID;
  @Input() public notifFormulaValue;
  // function
  @Output() public form_data;
  @Output() loadChartData2: (url: string, params: any) => void;
  public slice: any = {};
  list_cols;
  list_cols_notification;
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalNotificationsComponent>,
    private modalService: NgbModal,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initial();
    this.route.queryParams.subscribe((params) => {
      if (params.slice_id != undefined) {
        this.slice = { slice_id: params.slice_id };
      }
    });
  }
  initial = () => {
    this.list_cols_notification = static_cols_notification;
    this.list_cols = static_cols;
    if (this.form_data.notifications == undefined || this.form_data.notifications.length == 0) {
      let column = '';
      if (['dist_bar', 'horizontal_bar', 'line', 'dual_line', 'bubble', 'predictive'].includes(this.form_data.viz_type))
        column = this.form_data.metrics[0];
      let duplicateArr = [...this.form_data.notifications];
      duplicateArr.push({
        col: column,
        op: '==',
        val: 0,
      });
      this.form_data = { ...this.form_data, notifications: duplicateArr };
    }
    if (
      ['country_map', 'pie'].includes(this.form_data.viz_type) &&
      (this.form_data.notifications2 == undefined || this.form_data.notifications2.length == 0)
    ) {
      let duplicateArr = [...this.form_data.notifications2];
      duplicateArr.push({
        col: '',
        op: '==',
        val: 0,
      });
      this.form_data = { ...this.form_data, notifications2: duplicateArr };
    }
  };
  closeFormula = () => {
    this.modalService.dismissAll();
  };

  async saveNotifications() {
    this.modalService.dismissAll();
    if (
      ['gauge', 'big_number_total', 'country_map', 'pie'].includes(this.form_data.viz_type) ||
      ['gauge', 'big_number_total', 'country_map', 'pie'].includes(this.visualType)
    )
      this.form_data.notifications[0].col = this.form_data.metric;
    let param = {};
    if (this.form_data.notifications2 && this.form_data.notifications2.length > 0) {
      this.form_data.notifications2 = [
        {
          col: this.form_data.notifications2[0].col,
          op: this.form_data.notifications2[0].op,
          val: Number(this.form_data.notifications2[0].val),
          chart_id: this.slice.slice_id,
          slice: this.slice,
        },
      ];
      param = Object.assign({}, this.form_data.notifications[0], this.form_data.notifications2[0]);
    } else {
      let criterias = Object.assign([], this.form_data.notifications);
      for (var i = 0; i < criterias.length; i++) {
        var object = criterias[i];
        for (var prop in object)
          if (object.hasOwnProperty(prop) && object[prop] !== null && !isNaN(object[prop]))
            object[prop] = +object[prop];
      }
      param = {
        criterias: criterias,
        chart_id: this.slice.slice_id,
        slice: this.slice,
      };
    }
    if (['table'].includes(this.form_data.viz_type) || ['table'].includes(this.visualType)) {
      param['condition'] = this.notifFormulaValue;
    }
    if (this.notifID) {
      param['criterias'] = param['criterias'].map((c) => {
        return {
          ...c,
          notification_id: this.notifID,
        };
      });
      await this.loadChartData2(`/api/notification/update?id=${this.notifID}`, param);
    } else {
      await this.loadChartData2('api/notification/create', param);
    }
    // this.isFormValidate = false;
    // this.validate_messages = ["successfully saved notifications"];
    // $("#alertModal").modal();
    this.cdRef.detectChanges();
  }
  onDelNotifications(index) {
    this.form_data.notifications.splice(index, 1);
  }
  addTagFn(val) {
    return val;
  }

  onAddNotifications() {
    let col = null;

    if (['dist_bar'].includes(this.form_data.viz_type) || ['dist_bar'].includes(this.visualType))
      col = this.form_data.metrics[0];
    if (
      ['gauge', 'big_number_total', 'country_map', 'pie'].includes(this.form_data.viz_type) ||
      ['gauge', 'big_number_total', 'country_map', 'pie'].includes(this.visualType)
    )
      col = this.form_data.metric;
    let duplicateArr = [...this.form_data.notifications];
    duplicateArr.push({
      key: Number(Number(this.form_data.notifications.length) + 1),
      col: col,
      op: null,
      val: null,
    });
    this.form_data = { ...this.form_data, notifications: duplicateArr };
    this.cdRef.detectChanges();
    return;
  }
}
