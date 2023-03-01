// Angular
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslationService, JsonService } from 'src/app/libs/services';

@Component({
	selector: 'pq-save-entity-dialog',
	templateUrl: './save-entity-dialog.component.html'
})
export class SaveEntityDialogComponent implements OnInit {
	// Public properties
	viewLoading = false;

	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<SaveEntityDialogComponent>
	 * @param data: any
	 */
	constructor(
		private translationService: TranslationService,
		private jsonService: JsonService,
		public dialogRef: MatDialogRef<SaveEntityDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	async ngOnInit() {
		this.translationService.setLanguage(this.translationService.getSelectedLanguage());
		if(this.data.isthirdButton == null){
			this.data['isthirdButton'] = true;
		}
	}

	/**
	 * Close dialog with false result
	 */
	onNoClick(): void {
		this.dialogRef.close();
	}

	/**
	 * Close dialog with true result
	 */
	onYesClick(): void {
		/* Server loading imitation. Remove this */
		this.viewLoading = true;
		setTimeout(() => {
			this.dialogRef.close(true); // Keep only this row
		}, 2500);
	}

	onLoadAnywayClick(): void {
		/* Server loading imitation. Remove this */
		this.dialogRef.close('load');
		// setTimeout(() => {
		// 	this.dialogRef.close('load'); // Keep only this row
		// }, 1000);
	}
}
