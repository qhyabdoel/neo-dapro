import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-markup-ccs',
  templateUrl: './modal-markup-css.component.html',
})
export class ModalMarkupCSSComponent implements OnInit {
  @Output() public css;
  editorOptions = {
    language: 'sql',
    automaticLayout: true,
  };
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalMarkupCSSComponent>,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {}
  closeModal = () => {
    this.modalService.dismissAll();
  };
}
