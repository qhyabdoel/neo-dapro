import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'custom_input',
  templateUrl: './custom_input.html',
  styleUrls: ['./style.scss'],
})
export class CustomInputComponent implements OnInit {
  @Input() value;
  @Input() name;
  @Input() title;
  @Input() type;
  @Input() required;
  @Input() placeholder;
  @Input() disabled;
  @Output() onChangeValue: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {}
  onChange = (event) => {
    this.onChangeValue.emit({ name: this.name, value: event.target.value, type: 'input' });
  };
}
