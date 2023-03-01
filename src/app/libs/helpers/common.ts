import { MatDialog } from '@angular/material/dialog';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import { DialogCommonComponent } from 'src/app/components/dialogs/dialog-common/dialog-common.component';
import { ModalComponent } from 'src/app/components/modals/modal/modal.component';

export const openModal = function (
  ngbModal: NgbModal,
  messages: any,
  title?: string,
  msg?: string,
  isFooter?: string,
  footerLeftText?: string,
  footerRightText?: string
) {
  const modalRef = ngbModal.open(ModalComponent, {
    centered: true,
    size: 'sm',
  });
  modalRef.componentInstance.title = title ? title : '';
  modalRef.componentInstance.msg = msg ? msg : messages.DATA_PROCESSING.PCAFTI;
  modalRef.componentInstance.isFooter = isFooter ? isFooter : false;
  modalRef.componentInstance.footerLeftText = footerLeftText ? footerLeftText : messages.DATA_PROCESSING.Y || 'Yes';
  modalRef.componentInstance.footerRightText = footerRightText ? footerRightText : messages.DATA_PROCESSING.N || 'No';

  return modalRef;
};

export const openDialog = function (
  dialog: MatDialog,
  dialogComponent: any,
  title: string,
  description: string,
  waitDescription: string = '',
  needCancel: boolean = false
) {
  const dialogRef = dialog.open(dialogComponent, {
    data: { title, description, waitDescription, needCancel },
    width: '440px',
  });

  return dialogRef;
};

export const confirmationDialogWithCallback = function (
  dialogService: MatDialog,
  title: string,
  description: string,
  awaitedCallback?: any,
  options?: {
    needCancel: boolean;
  }
) {
  const dialogRef = dialogService.open(DialogCommonComponent, {
    data: { title, description, hasCallback: !!awaitedCallback, ...options },
    width: '440px',
  });

  dialogRef.afterClosed().subscribe((dialogResult) => {
    if (dialogResult) {
      awaitedCallback();
    }
  });
};
