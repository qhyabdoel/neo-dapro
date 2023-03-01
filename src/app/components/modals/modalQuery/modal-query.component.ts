import { MatDialogRef } from '@angular/material/dialog';
import { ChangeDetectorRef, Component, Input, OnInit, Optional, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-query',
  templateUrl: './modal-query.component.html',
})
export class ModalQueryComponent implements OnInit {
  @Output() applyFormula: () => void;
  @Output() public formulaValue;
  listFormula: any = {
    description: null,
    expression: 'Sum(column_name)',
    metric_name: 'sum__column_name',
    verbose_name: 'column_name (Sum)',
    warning_text: null,
    is_formula: true,
  };
  editorOptions = {
    language: 'sql',
    automaticLayout: true,
  };
  constructor(@Optional() public dialogRef: MatDialogRef<ModalQueryComponent>, private modalService: NgbModal) {}

  ngOnInit() {}

  closeFormula = () => {
    this.modalService.dismissAll();
  };
}
