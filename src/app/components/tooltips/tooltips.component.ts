import { Component, Input } from '@angular/core';

@Component({
  selector: 'tooltips',
  templateUrl: 'tooltips.component.html',
  styleUrls: ['tooltips.component.scss'],
})
export class TooltipsComponent {
  @Input() title: string;
  @Input() content: string;
}
