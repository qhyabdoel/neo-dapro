import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'loading-component',
  templateUrl: './loading.component.html',
})
export class LoadingComponent implements OnInit {
  @Input() public loading;
  @Input() public shimmer;
  @Input() public width;
  @Input() public height;
  @Input() public margin;
  @Input() public isApplication;

  ngOnInit() {}
}
