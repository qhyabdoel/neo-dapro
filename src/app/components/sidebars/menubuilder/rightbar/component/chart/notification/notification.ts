import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, Inject } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { ModalFormulaNotificationsComponent } from 'src/app/components/modals/modalFormulaNotifications/modal-formula-notifications.component';
import { ModalNotificationsComponent } from 'src/app/components/modals/modalNotifications/modal-notifications.component';
import { sharedChartDataSelector } from 'src/app/libs/store/selectors/datavisualization.selector';
import { AppState } from 'src/app/libs/store/states';
import { DOCUMENT } from "@angular/common";

@Component({
  selector: 'notification_chart',
  templateUrl: './notification.html',
})
export class NotificationChartComponent implements OnInit {
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  parameter: any = null;
  visualType: string;
  environtment: string;
  explore: any;
  modalReference: NgbModalRef;
  notificationId: string;
  notificactionFormula: any;
  constructor(
    private store: Store<AppState>,
    private changeDetector: ChangeDetectorRef,
    private modalService: NgbModal,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.store
      .select(sharedChartDataSelector)
      .pipe()
      .subscribe((result) => {
        if (result) {
          // share variable
          this.preparingData(result);
        }
      });
  }

  preparingData = (res) => {
    this.explore = res.explore;
    this.visualType = res.typeChart;
    this.setStateNotification(res.exploreJson);
    this.changeDetector.detectChanges();
  };

  ngOnInit() {}

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };

  setStateNotification = (exploreJson) => {
    if (exploreJson.form_data.notifications && exploreJson.form_data.notifications.length > 0) {
      const { id, condition, criterias } = exploreJson.form_data.notifications[0];
      this.notificationId = id;
      this.explore = {
        ...this.explore,
        form_data: {
          ...this.explore.form_data,
          notifications: criterias.map((x) => {
            const { id, col, op, val } = x;
            return { id, col, op, val };
          }),
          notifications2: this.explore.form_data.notifications2 ? this.explore.form_data.notifications2 : [],
        },
      };

      this.notificactionFormula = condition;
    }
  };
  openTemplate = (type) => {
    switch (type) {
      case 'formulaModalNotifications':
        this.modalReference = this.modalService.open(ModalFormulaNotificationsComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.chartLinks = this.explore;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.form_data = this.explore.form_data;
        this.modalReference.componentInstance.notifID = this.notificationId;
        this.modalReference.componentInstance.notifFormulaValue = this.notificactionFormula;
        // this.modalReference.componentInstance.loadChartData2 = this.loadChartData2;
        break;

      case 'modalNotifications':
        this.modalReference = this.modalService.open(ModalNotificationsComponent, {
          size: 'lg',
          centered: true,
        });
        this.modalReference.componentInstance.chartLinks = this.explore;
        this.modalReference.componentInstance.visualType = this.visualType;
        this.modalReference.componentInstance.form_data = this.explore.form_data;
        this.modalReference.componentInstance.notifID = this.notificationId;
        this.modalReference.componentInstance.notifFormulaValue = this.notificactionFormula;
        // this.modalReference.componentInstance.loadChartData2 = this.loadChartData2;
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
