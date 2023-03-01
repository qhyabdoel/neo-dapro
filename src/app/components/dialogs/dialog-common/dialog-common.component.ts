import { Component, EventEmitter, Inject, Optional, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog-common',
  templateUrl: './dialog-common.component.html',
  styleUrls: ['./dialog-common.component.scss'],
})
export class DialogCommonComponent {
  constructor(
    @Optional() public dialogRef: MatDialogRef<DialogCommonComponent>,
    @Inject(MAT_DIALOG_DATA)
    public dialogData: {
      title: string;
      description: string;
      needCancel: boolean;
    }
  ) {}

  btnOk() {
    this.dialogRef.close(true);
  }

  btnCancel() {
    this.dialogRef.close(false);
  }
}
