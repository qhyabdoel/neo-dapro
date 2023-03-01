import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { ActionNotificationComponent,
	SaveEntityDialogComponent,
	DeleteEntityDialogComponent,
	ConfirmEntityDialogComponent,
	FetchEntityDialogComponent,
	UpdateStatusDialogComponent,
	ChooseRadioDialogComponent,
	OverwriteDialogComponent,
	ChangepasswordDialogComponent,
	RequestResetPasswordDialogComponent
} from 'src/will-be-removed/partials/content';

export enum MessageType {
	Create,
	Read,
	Update,
	Delete,
	Overwrite
}

@Injectable()
export class LayoutUtilsService {
	/**
	 * Service constructor
	 *
	 * @param snackBar: MatSnackBar
	 * @param dialog: MatDialog
	 */
	constructor(private snackBar: MatSnackBar,
				   private dialog: MatDialog,
				   private modalService: NgbModal,) { }

	/**
	 * Showing (Mat-Snackbar) Notification
	 *
	 * @param message: string
	 * @param type: MessageType
	 * @param duration: number
	 * @param showCloseButton: boolean
	 * @param showUndoButton: boolean
	 * @param undoButtonDuration: number
	 * @param verticalPosition: 'top' | 'bottom' = 'top'
	 */
	showActionNotification(
		_message: string,
		_type: MessageType = MessageType.Create,
		_duration: number = 10000,
		_showCloseButton: boolean = true,
		_showUndoButton: boolean = true,
		_undoButtonDuration: number = 3000,
		_verticalPosition: 'top' | 'bottom' = 'bottom'
	) {
		const _data = {
			message: _message,
			snackBar: this.snackBar,
			showCloseButton: _showCloseButton,
			showUndoButton: _showUndoButton,
			undoButtonDuration: _undoButtonDuration,
			verticalPosition: _verticalPosition,
			type: _type,
			action: 'Undo'
		};
		return this.snackBar.openFromComponent(ActionNotificationComponent, {
			duration: _duration,
			data: _data,
			verticalPosition: _verticalPosition
		});
	}

	/**
	 * Showing Confirmation (Mat-Dialog) before Entity Removing
	 *
	 * @param title: stirng
	 * @param description: stirng
	 * @param waitDesciption: string
	 */
	saveElement(title: string = '', description: string = '', waitDesciption: string = '', thirdButton? : string, isthirdButton : boolean = true) {
		return this.dialog.open(SaveEntityDialogComponent, {
			data: { title, description, waitDesciption, thirdButton, isthirdButton },
			width: '440px'
		});
	}

	overwriteElement(title: string ='', description: string ='', waitDesciption: string = '', textYes: string = '') {
		return this.dialog.open(OverwriteDialogComponent, {
			data: { title, description, waitDesciption, textYes },
			width: '440px'
		})
	}

	deleteElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(DeleteEntityDialogComponent, {
			data: { title, description, waitDesciption },
			width: '440px'
		});
	}

	confirmElement(title: string = '', description: string = '', waitDesciption: string = '') {
		return this.dialog.open(ConfirmEntityDialogComponent, {
			data: { title, description, waitDesciption },
			width: '440px'
		});
	}

	chooseElement(title: string = '', description: string = '', waitDesciption: string = '', data:any) {
		return this.dialog.open(ChooseRadioDialogComponent, {
			data: { title, description, waitDesciption, data },
			width: '440px'
		});
	}

	/**
	 * Showing Fetching Window(Mat-Dialog)
	 *
	 * @param _data: any
	 */
	fetchElements(_data) {
		return this.dialog.open(FetchEntityDialogComponent, {
			data: _data,
			width: '400px'
		});
	}

	changePasswordElement(title: string = '', data:any) {
		return this.dialog.open(ChangepasswordDialogComponent, {
			data: { title, data },
			width: '440px'
		});
	}

	requestResetPasswordElement(title: string = '', data:any) {
		return this.dialog.open(RequestResetPasswordDialogComponent, {
			data: { title, data },
			width: '440px'
		});
	}

	/**
	 * Showing Update Status for Entites Window
	 *
	 * @param title: string
	 * @param statuses: string[]
	 * @param messages: string[]
	 */
	updateStatusForEntities(title, statuses, messages) {
		return this.dialog.open(UpdateStatusDialogComponent, {
			data: { title, statuses, messages },
			width: '480px'
		});
	}

	openModalTemplate(content, type?) {
		let options = {
		  centered: true
		}
		if(type){
		  options['size'] = type;
		}
		const modalRef = this.modalService.open(content, options);
	}

	addRemoveBodyClass(type, isleft, isRight) {
		let isChange = type == 'left'? isleft : isRight;
		let clasname = type +'_icon_toggle';
		if (isChange) {
			document.body.classList.add(clasname);
		} else {
			document.body.classList.remove(clasname);
		}
		window.dispatchEvent(new Event("resize"));
		return;
	  }
}
