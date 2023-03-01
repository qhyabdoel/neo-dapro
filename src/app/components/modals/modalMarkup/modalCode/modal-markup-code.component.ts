import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-markup-code',
  templateUrl: './modal-markup-code.component.html',
})
export class ModalMarkupCodeComponent implements OnInit {
  @Input() public code;
  @Input() public type;
  editorOptions = {
    language: 'sql',
    automaticLayout: true,
  };

  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalMarkupCodeComponent>,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {}
  closeModal = () => {
    this.modalService.dismissAll();
  };
}
