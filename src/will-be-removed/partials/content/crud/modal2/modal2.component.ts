import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModalConfig, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'pq-modal2',
  templateUrl: './modal2.component.html',
  styleUrls: ['./modal2.component.scss']
})
export class Modal2Component implements OnInit {
  @Input() title;
  @Input() msg;
  @Input() footerLeftText;
  @Input() footerRightText;
  @Input() isFooter;

  constructor(public activeModal: NgbActiveModal, public configModal : NgbModalConfig) {}

  ngOnInit() {
    //this.configModal.windowClass = 'dark-modal'
  }

}
