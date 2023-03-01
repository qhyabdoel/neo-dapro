import { Component, OnInit, Output, EventEmitter, Input, Inject } from '@angular/core';
import { JsonService } from 'src/app/libs/services';
import { environment } from 'src/environments/environment';
import { DOCUMENT } from "@angular/common";

@Component({
  selector: 'sub_topbar_option',
  templateUrl: './sub_topbar_option.html',
})
export class SubTopbarOptionComponent implements OnInit {
  @Input() formData;
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() checkboxAction: EventEmitter<any> = new EventEmitter<any>();
  environtmentType: any;
  constructor(private jsonService: JsonService, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    this.jsonService
      .retEnvironment(environment.type)
      .then(() => {
        this.environtmentType = environment.type;
      })
      .catch((error) => {
        console.log('Promise rejected with ' + JSON.stringify(error));
      });
  }
  checkBoxHandling = (type) => {
    this.checkboxAction.emit(type);
  };

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }
}
