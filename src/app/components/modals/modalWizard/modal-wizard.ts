import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutConfigModel } from 'src/app/libs/models';
import { JsonService, LayoutConfigService, TranslationService } from 'src/app/libs/services';
import { Router } from '@angular/router';

@Component({
  selector: 'modal-wizard',
  templateUrl: './modal-wizard.html',
})
export class ModalWizardComponent implements OnInit {
  model: LayoutConfigModel;
  srcExplorer = '';
  messages: any;
  fileName: string;
  file: File;
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalWizardComponent>,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private layoutConfigService: LayoutConfigService,
    private translationService: TranslationService,
    private jsonService: JsonService,
    private router: Router
  ) {}
  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.model = this.layoutConfigService.getConfig();
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.messages = await this.jsonService.retMessage();
  }
  closeModal = () => {
    this.modalService.dismissAll();
  };
  changeSkin(e): void {
    this.model.login.self.skin = e;
    this.layoutConfigService.setConfig(this.model, true);
    document.body.className = '';
    document.body.className =
      e == 'dark'
        ? 'theme-light-pqs theme-pds theme-dark theme-cyan kt-page--loaded'
        : 'theme-light-pqs theme-pds kt-page--loaded';
  }
  uploadFileInit() {
    this.srcExplorer = '√://';
    let element = document.getElementById('upload_file') as HTMLInputElement;
    element.click();
    this.closeModal();
  }
  changeFile: any;
  async onChange(file) {
    this.messages = await this.jsonService.retMessage();
    this.changeFile = file;
    this.file = file.files[0];
    this.fileName = file.files[0].name;
    this.fileName = this.fileName.replace(/[`~!\s@#$%^&*()|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '_');
  }

  handleDirectLink = (url) => {
    this.router.navigate([url]);
    this.closeModal();
  };
}
