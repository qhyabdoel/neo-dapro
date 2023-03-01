import { Component, Input, Optional, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ApiService, JsonService } from 'src/app/libs/services';

@Component({
  selector: 'modal-login-list',
  templateUrl: './modalLoginList.html',
})
export class ModalLoginListComponent {
  @Input() assetJsonData;
  @Input() formData;
  @Input() menu;
  messages: any;
  constructor(
    public activeModal: NgbActiveModal,
    public configModal: NgbModalConfig,
    private modalService: NgbModal,
    private jsonService: JsonService,
    private service: ApiService,
    @Optional() public dialogRef: MatDialogRef<ModalLoginListComponent>
  ) {}
  closeFormula = () => {
    this.modalService.dismissAll();
  };

  saveLoginStyle = async (style) => {
    this.messages = await this.jsonService.retMessage();
    if (this.menu.length === 0) {
      this.service.openModal(this.messages.APPLICATIONS.W, this.messages.APPLICATIONS.MSG_VAMDIFM);
      return;
    }
    this.formData = {
      ...this.formData,
      options: {
        ...this.formData.options,
        login_style: style.login_style,
        label_style: style.label_style,
        image_style: style.image_style,
        logo_login: style.logo_login,
        background_image: style.background_image,
      },
    };
    this.activeModal.close(this.formData);
  };
}
