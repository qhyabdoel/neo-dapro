import { Component, Inject, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'dialog-progress',
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.scss'],
})
export class ProgressDialogComponent {
  public viewLoading: boolean = true;

  constructor(
    @Optional() public dialogRef: MatDialogRef<ProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public dialogData: {
      message: string;
    }
  ) {}
}
