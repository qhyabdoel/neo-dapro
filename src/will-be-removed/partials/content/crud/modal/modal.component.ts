import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModalConfig, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'pq-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
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
