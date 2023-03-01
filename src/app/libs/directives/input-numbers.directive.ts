import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[inputNumber]',
  exportAs: 'inputNumber',
})
export class InputNumbersDirective {

  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(ev) {
    const initalValue = this._el.nativeElement.value;
	let val = String(initalValue).match(/[+-]?[0-9]*[.]?[0-9]*/g);
    if ( val[0]!="" && Number(val[0])!=0) {
		this._el.nativeElement.value = String(val[0]);
	}else{
		if(Number(val[0])==0) this._el.nativeElement.value = String(val[0]);
		else this._el.nativeElement.value = String(val[0]).slice(0,-1);
		ev.stopPropagation();
	}
  }

}
