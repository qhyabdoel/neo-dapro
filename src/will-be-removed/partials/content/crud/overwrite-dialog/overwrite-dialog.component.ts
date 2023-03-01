import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'pq-overwrite-dialog',
  templateUrl: './overwrite-dialog.component.html'
})
export class OverwriteDialogComponent implements OnInit {

  viewLoading = false;
  constructor(
    public dialogRef: MatDialogRef<OverwriteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


  ngOnInit() {
  }

  onNoClick(): void {
		this.dialogRef.close();
  }
  
  onYesClick() {
		/* Server loading imitation. Remove this */
		this.viewLoading = true;
		setTimeout(() => {
      this.dialogRef.close(true);
		}, 2500);
	}

}
