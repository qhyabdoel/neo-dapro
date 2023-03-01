// Angular
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	OnInit,
	HostListener
} from '@angular/core';

@Component({
	selector: 'pq-menu-vertical',
	templateUrl: './menu-vertical.component.html',
	styleUrls: ['./menu-vertical.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuVerticalComponent implements OnInit, AfterViewInit {
	
	constructor() {
	}

	ngAfterViewInit(): void {
	}

	ngOnInit(): void {

	}

	handleAsideClick(event: Event) {
		event.stopPropagation(); // Stop the propagation to prevent reaching document
	  }

	@HostListener('document:click', ['$event']) clickout(event) {
		// Click outside of the menu was detected
		document.getElementById('menuLeftFloat').classList.remove('open');
	  }
}
