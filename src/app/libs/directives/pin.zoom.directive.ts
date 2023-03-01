import { Directive, HostListener, Input, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { clamp } from 'lodash';
@Directive({
  selector: '[appPinchZoom]',
})
export class PinchZoomDirective implements OnInit {
  @Input() scaleFactor: number = 0.08;
  @Input() zoomThreshold: number = 9;
  @Input() initialZoom: number = 5;
  @Input() debounceTime: number = 100; // in ms
  scale: number;
  @Output() onPinch$: Subject<number> = new Subject<number>();
  constructor() {

  }
  ngOnInit(): void {
    this.scale = this.initialZoom;
  }
  calculatePinch(scale: number) {
    this.scale = scale;
    this.onPinch$.next(this.scale);
  }
  @HostListener('wheel', ['$event'])
  onWheel($event: WheelEvent) {
    if (!$event.ctrlKey) return;
    $event.preventDefault();
    let scale = this.scale - $event.deltaY * this.scaleFactor;
    scale = clamp(scale, 1, this.zoomThreshold);
    this.calculatePinch(scale);
  }

  @HostListener('gesturestart', ['$event'])
  @HostListener('gesturechange', ['$event'])
  @HostListener('gestureend', ['$event'])
  onGesture($event: any) {
    $event.preventDefault();
    let pinchAmount = $event.scale - 1;
    let scale = this.scale + pinchAmount * this.scaleFactor;
    scale = clamp(scale, 1, this.zoomThreshold);
    this.calculatePinch(scale);
  }
}
