import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'dialog-alert',
  templateUrl: './dialog-alert.component.html',
})
export class DialogAlertComponent implements OnInit {
  @Input() public isFormValidate;
  @Input() public validate_messages;
  constructor(@Optional() public dialogRef: MatDialogRef<DialogAlertComponent>, private modalService: NgbModal) {}

  ngOnInit() {
    this.initial();
  }
  initial = () => {};
  closeFormula = () => {
    this.modalService.dismissAll();
  };
}
