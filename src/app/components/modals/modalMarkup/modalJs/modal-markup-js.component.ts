import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-markup-js',
  templateUrl: './modal-markup-js.component.html',
})
export class ModalMarkupJSComponent implements OnInit {
  @Output() public form_data;
  editorOptions = {
    language: 'sql',
    automaticLayout: true,
  };

  constructor(@Optional() public dialogRef: MatDialogRef<ModalMarkupJSComponent>, private modalService: NgbModal) {}

  ngOnInit() {}
  closeModal = () => {
    this.modalService.dismissAll();
  };
}
