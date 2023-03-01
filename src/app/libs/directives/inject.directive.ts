import { Directive, ViewContainerRef, ElementRef } from '@angular/core';

@Directive({
  selector: '[appInject]'
})
export class InjectDirective {

  constructor(
    public viewContainerRef: ViewContainerRef, 
    private el: ElementRef
    ) { }
}
