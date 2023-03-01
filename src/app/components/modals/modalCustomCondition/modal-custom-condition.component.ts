import { MatDialogRef } from '@angular/material/dialog';
import { Component, Input, OnInit, Optional, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerService } from 'ngx-color-picker';

@Component({
  selector: 'modal-custom-condition',
  templateUrl: './modal-custom-condition.component.html',
})
export class ModalCustomConditionComponent implements OnInit {
  @Input() public form_data;
  public rgbaText: string = 'rgba(165, 26, 214, 0.2)';
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalCustomConditionComponent>,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private colorPickerService: ColorPickerService
  ) {}
  ngOnInit() {}
  closeModal = () => {
    this.modalService.dismissAll();
  };
  onDelValueCustomCondition(index) {
    let copyArr = [...this.form_data.custom_condition_arr];
    copyArr.splice(index, 1);
    this.form_data = {
      ...this.form_data,
      custom_condition_arr: copyArr,
    };
  }

  onAddValueCustomCondition() {
    let copyArr = [...this.form_data.custom_condition_arr];
    copyArr.push({
      label: 'Condition ' + Number(Number(this.form_data.custom_condition_arr.length) + 1),
      mode: this.form_data.gauge_label_type || 'value',
      size_from: 0,
      size_to: '',
      status: '',
      colorpicker: '#808080',
    });
    this.form_data = { ...this.form_data, custom_condition_arr: copyArr };
  }

  onChange = (event, name, index) => {
    let copyArr = [...this.form_data.custom_condition_arr];
    let obj = copyArr.find((_, i) => i === index);
    obj = {
      ...obj,
      [name]: event.target.value,
    };
    copyArr = copyArr.map((data, i) => {
      if (i === index) {
        data = obj;
      }
      return data;
    });
    this.form_data = {
      ...this.form_data,
      custom_condition_arr: copyArr,
    };
  };

  applyChange() {
    this.activeModal.close(this.form_data.custom_condition_arr);
  }
}
