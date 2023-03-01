import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-formula-notifications',
  templateUrl: './modal-formula-notifications.component.html',
})
export class ModalFormulaNotificationsComponent implements OnInit {
  @Input() public chartLinks;
  @Input() public visualType;
  @Input() public notifID;
  @Input() public notifFormulaValue;
  // function
  @Output() public form_data;
  @Output() loadChartData2: (url: string, params: any) => void;
  public slice: any = {};
  public notifFormulaEditorOpts = {
    language: 'sql',
    automaticLayout: true,
  };

  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalFormulaNotificationsComponent>,
    private modalService: NgbModal,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {}
  closeFormula = () => {
    this.modalService.dismissAll();
  };

  async saveNotifications() {
    this.modalService.dismissAll();
    $('button#btn-danger').trigger('click');

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
}
