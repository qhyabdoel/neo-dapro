import { KeyValue } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'custom_select_component',
  templateUrl: './select.component.html',
})
export class CustomSelectComponent implements OnInit {
  @Output() onChangeValue: EventEmitter<any> = new EventEmitter<any>();
  @Input() selectedValue: any;
  @Input() name: any;
  @Input() options: any;
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() defaultValue: string = '';
  @Input() required;
  @Input() title;
  @Input() type;
  @Input() multiple;
  @Input() bindLabel;
  @Input() bindValue;
  @Input() placeholder;
  @Input() visualType;

  ngOnInit() {}
  onChange = (event) => {
    let state = '';
    switch (this.type) {
      case 'select_specific_object':
      case 'select':
        this.selectedValue = event.target.value;
        break;
      default:
        break;
    }
    state = event;
    this.onChangeValue.emit({ name: this.name, value: state, type: this.type });
  };
  remappingColorpicker = (event1, event2) => {};

  originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  };
}
