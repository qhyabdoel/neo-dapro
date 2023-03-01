import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'modal-add-value',
  templateUrl: './modal-add-value.component.html',
})
export class ModalAddValueComponent implements OnInit {
  @Input() public chartLinks;
  // function
  @Output() public form_data;
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalAddValueComponent>,
    private cdRef: ChangeDetectorRef,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.initial();
  }
  initial = () => {
    if (this.form_data.groupby_arrs == undefined && this.form_data.groupby_arrs.length == 0) {
      this.onPushObject();
    }
  };
  closeFormula = () => {
    this.activeModal.close(this.form_data);
  };

  onDelValueMarkup(index) {
    this.form_data = {
      ...this.form_data,
      groupby_arrs: this.form_data.groupby_arrs.filter((_, i) => index !== i),
    };
  }

  onAddValueMarkup() {
    this.onPushObject();
    this.cdRef.detectChanges();
  }
  onPushObject = () => {
    let copyArr = [...this.form_data.groupby_arrs];
    copyArr.push({
      key: 'Value' + Number(this.form_data.groupby_arrs.length),
      value: '',
    });
    this.form_data = { ...this.form_data, groupby_arrs: copyArr };
  };
}
