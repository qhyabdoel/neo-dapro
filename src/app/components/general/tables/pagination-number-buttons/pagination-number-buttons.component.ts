import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  template: `
		<div class="btn_custom-paging-container">
			<button mat-button class="mat-icon-button"
					*ngFor="let page of pageNumbers"
					[ngClass]="{'active': page === activeNumber}"
					[disabled]="!(page | typeCheck:'number') || page === activeNumber"
					(click)="click.emit(page)">
				{{ (page | typeCheck: 'number') ? page + 1 : page}}
			</button>
		</div>
	`,
})
export class PaginationNumberButtonsComponent {
  @Input() pageNumbers: any[];
  @Input() activeNumber: number;
  @Output() click: EventEmitter<number> = new EventEmitter<number>();
}

