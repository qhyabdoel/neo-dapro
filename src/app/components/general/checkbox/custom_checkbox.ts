import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'custom_checkbox',
  templateUrl: './custom_checkbox.html',
})
export class CustomCheckboxComponent implements OnInit {
  @Input() value;
  @Input() name;
  @Input() title;
  @Output() onChangeValue: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {}
  onChange = (event) => {
    this.onChangeValue.emit({ name: this.name, value: event, type: 'checkbox' });
  };
}
