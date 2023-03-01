import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerService } from 'ngx-color-picker';

@Component({
  selector: 'modal-color-picker',
  templateUrl: './modal-color-picker.component.html',
})
export class ModalColorPickerComponent implements OnInit {
  @Input() public form_data;
  @Output() saveAndRunQuery;
  @Input() visualType;
  @Input() messages;
  @Input() data_charts;
  public rgbaText: string = 'rgba(165, 26, 214, 0.2)';
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalColorPickerComponent>,
    private modalService: NgbModal,
    private cdRef: ChangeDetectorRef,
    private colorPickerService: ColorPickerService,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.initial();
  }
  initial = () => {
    if (this.form_data.colorpickers.length === 0) {
      this.mappingColorPickerIfEmpty();
    }
  };
  closeModal = () => {
    this.modalService.dismissAll();
  };
  public onEventLog(event: string, data: any, index): void {
    [...this.form_data.colorpickers].map((_, i) => {
      if (i === index) {
        _.colorpicker = data.color;
      }
    });
    // this.form_data.colorpickers[index].colorpicker = data.color;
  }
  public onChangeColorHex8(color: string): string {
    const hsva = this.colorPickerService.stringToHsva(color, true);
    if (hsva) {
      return this.colorPickerService.outputFormat(hsva, 'rgba', null);
    }
    return '';
  }
  onAddColorPickers() {
    if (this.form_data.viz_type == 'country_map' || this.form_data.viz_type == 'map') {
      this.onPushObject(this.messages.CHART.CIR);
    } else {
      this.onPushObject(this.messages.CHART.C);
    }
    this.cdRef.detectChanges();
    return;
  }
  onPushObject = (message) => {
    let copyArr = [...this.form_data.colorpickers];
    copyArr.push({
      entity: message + Number(Number(this.form_data.colorpickers.length) + 1),
      colorpicker: '#808080',
    });
    this.form_data = { ...this.form_data, colorpickers: copyArr };
  };
  onDelColorPickers(index) {
    this.form_data.colorpickers.splice(index, 1);
  }
  onChange = (event, index) => {
    let modifyColorPicker = [...this.form_data.colorpickers].map((data, i) => {
      if (i === index) {
        data = {
          entity: data.entity,
          colorpicker: event.target.value,
        };
      }
      return data;
    });
    this.form_data = { ...this.form_data, colorpickers: modifyColorPicker };
  };

  apply = () => {
    this.activeModal.close(this.form_data.colorpickers);
  };

  mappingColorPickerIfEmpty = () => {
    switch (this.visualType) {
      case 'big_number_total':
      case 'histogram':
      case 'osmmap':
        let obj = [
          {
            entity: 'Value',
            colorpicker: '#808080',
          },
          {
            entity: 'Label Name',
            colorpicker: '#808080',
          },
        ];
        this.form_data = {
          ...this.form_data,
          colorpickers: obj,
        };
        break;

      default:
        break;
    }
  };
}
