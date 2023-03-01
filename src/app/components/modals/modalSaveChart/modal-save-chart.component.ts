import { MatDialogRef } from '@angular/material/dialog';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-save-chart',
  templateUrl: './modal-save-chart.component.html',
})
export class ModalSaveChartComponent implements OnInit {
  @Input() public slice;
  @Input() public data;
  @Output() public hasFlaging;
  @Output() public hasFlagingControl;
  @Output() title: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalSaveChartComponent>,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal // private changeDetector: ChangeDetectorRef
  ) {}
  ngOnInit() {}
  closeModal = () => {
    this.modalService.dismissAll();
  };

  onYesClick = () => {
    this.activeModal.close({ hasFlaging: this.hasFlaging, title: this.data.title });
  };
}
