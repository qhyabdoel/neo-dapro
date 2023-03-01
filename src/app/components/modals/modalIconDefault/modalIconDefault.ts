import { Component, Input, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import apps from '../../../../assets/data/applications.json';
@Component({
  selector: 'modal-icon-default',
  templateUrl: './modalIconDefault.html',
})
export class ModalIconDefault implements OnInit {
  assetJsonData: any;
  constructor(
    public activeModal: NgbActiveModal,
    public configModal: NgbModalConfig,
    private modalService: NgbModal,
    @Optional() public dialogRef: MatDialogRef<ModalIconDefault>
  ) {}

  ngOnInit() {
    this.initial();
  }
  initial = () => {
    this.assetJsonData = apps;
  };
  closeFormula = () => {
    this.modalService.dismissAll();
  };
  setValueIcon = (e) => {
    this.activeModal.close(e);
  };
}
