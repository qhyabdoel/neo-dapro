// Angular
import { Component, Inject, OnInit, HostListener} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'pq-choose-radio-dialog',
	templateUrl: './choose-radio-dialog.component.html'
})
export class ChooseRadioDialogComponent implements OnInit {
	// Public properties
	viewLoading = false;
	position: any = null;
	isOpenModal = false;
	isFirstCondition = false;
	isSecondCondition = false;
	isThirdCondition = false;
	meData : any;
	/**
	 * Component constructor
	 *
	 * @param dialogRef: MatDialogRef<ChooseRadioDialogComponent>
	 * @param data: any
	 */
	constructor(
		public dialogRef: MatDialogRef<ChooseRadioDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) { }

	/**
	 * @ Lifecycle sequences => https://angular.io/guide/lifecycle-hooks
	 */

	/**
	 * On init
	 */
	ngOnInit() {
		this.position = null;
		this.meData = {
			col : 12,
			row : 7
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
			this.dialogRef.close(this.meData); // Keep only this row
		}, 100);
	}

	radioChange(event) {
		this.onYesClick();
	}


	@HostListener('document:click', ['$event', '$event.target'])
	onClick(event: MouseEvent, targetElement: HTMLElement): void {
		if (!targetElement) {
			return;
		};
		const cls = targetElement.classList;
		if(cls[0] == "modal"){
			this.onNoClick()
		}
	  }
}
