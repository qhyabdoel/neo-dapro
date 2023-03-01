import { Component, Input, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { findTypeCheckByUrl } from 'src/app/libs/helpers/data-visualization-helper';

@Component({
  selector: 'modal-login-list',
  templateUrl: './modalGlossary.html',
})
export class ModalGlossaryComponent implements OnInit {
  @Input() glosaryInformation;
  route: string;
  text_information_glossary: string;
  constructor(
    public activeModal: NgbActiveModal,
    public configModal: NgbModalConfig,
    private modalService: NgbModal,
    @Optional() public dialogRef: MatDialogRef<ModalGlossaryComponent>
  ) {}

  ngOnInit() {
    this.initial();
  }
  initial = () => {
    this.route = findTypeCheckByUrl();
  };
  closeFormula = () => {
    this.modalService.dismissAll();
  };
  saveInformationGlosary = () => {
    this.activeModal.close(this.glosaryInformation);
  };
  onChange = (event) => {
    this.glosaryInformation = event;
  };
}
