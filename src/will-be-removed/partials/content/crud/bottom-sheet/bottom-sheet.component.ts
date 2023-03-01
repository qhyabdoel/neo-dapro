import { Component, OnInit, Input } from "@angular/core";
import {
	MatBottomSheet,
	MatBottomSheetRef,
} from "@angular/material/bottom-sheet";

@Component({
	selector: "pq-bottom-sheet",
	templateUrl: "bottom-sheet.component.html",
})
export class BottomSheetComponent {
	@Input() data;

	constructor(
		private _bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>
	) {}
	ngOnInit() {}

	openLink(event: MouseEvent): void {
		this._bottomSheetRef.dismiss();
		event.preventDefault();
	}
}
