import { MatDialogRef } from '@angular/material/dialog';
import { Component, Input, OnInit, Optional, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-tooltips',
  templateUrl: './modal-tooltips.component.html',
})
export class ModalTooltipsComponent implements OnInit {
  @Output() public explore;
  // @Input() public data;
  // @Output() public onDelData;
  // @Output() onDelData: (any) => void;
  // @Output() public hasFlagingControl;

  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalTooltipsComponent>,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {}
  ngOnInit() {}
  closeModal = () => {
    this.modalService.dismissAll();
  };

  onDelData(index) {
    this.explore.form_data.point_comparations.splice(index, 1);
  }
}
