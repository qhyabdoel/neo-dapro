import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog-delete-entity',
  templateUrl: './dialog-delete-entity.component.html',
})
export class DialogDeleteEntityComponent {
  viewLoading = false;

  constructor(public dialogRef: MatDialogRef<DialogDeleteEntityComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onYesClick(): void {
    this.viewLoading = true;
    setTimeout(() => {
      this.dialogRef.close(true);
    }, 2500);
  }
}
