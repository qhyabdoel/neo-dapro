import {
    ChangeDetectionStrategy,
    SkipSelf,
    Host,
    HostListener,
    EventEmitter,
    Component,
    ElementRef,
    OnInit,
    Output,
    ViewChild,
    Directive,
  } from '@angular/core';
  
  @Directive({
    selector: '[resizable]'
  })
  export class ResizableDirective {
    _host: HTMLElement;
    _startWidth = 0;
    _startHeight = 0;
    constructor(private elm: ElementRef) { }
    ngOnInit() {
      this._host = this.elm.nativeElement;
    }
    dragStart() {
      const style = window.getComputedStyle(this._host, undefined);
      this._startWidth = style.width ? parseInt(style.width, 0) : 0;
      this._startHeight = style.height ? parseInt(style.height, 0) : 0;
    }
    dragging(diffX: number, diffY : number) {
      this._host.style.width = this._startWidth + diffX + 'px';
      this._host.style.height = this._startHeight + diffY + 'px';
    }
    dragEnd() {
      this._startWidth = 0;
      this._startHeight = 0;
      window.dispatchEvent(new Event('resize'));
    }
  }
  
  @Directive({
    selector: '[grabber]',
  })
  export class GrabberDirective {
  
    @HostListener('mousedown', ['$event']) mousedown = (e: MouseEvent) => {
      this._startOffsetX = e.clientX;
      this._startOffsetY = e.clientY;
      document.addEventListener('mousemove', this._boundDragging);
      document.addEventListener('mouseup', this._boundDragEnd);
      this.resizable.dragStart();
    }
  
    _startOffsetX = 0;
    _startOffsetY = 0;
    readonly _boundDragging = (e) => this._dragging(e);
    readonly _boundDragEnd = (e) => this._dragEnd(e);
  
    constructor(
      private elm: ElementRef,
      @Host() @SkipSelf() private resizable: ResizableDirective,
      ) { }
  
    private _dragging(e: MouseEvent) {
      const diffX = e.clientX - this._startOffsetX;
      const diffY = e.clientY - this._startOffsetY;
      this.resizable.dragging(diffX, diffY);
    }
  
    private _dragEnd(e: MouseEvent) {
      this._startOffsetX = 0;
      document.removeEventListener('mousemove', this._boundDragging);
      document.removeEventListener('mouseup', this._boundDragEnd);
      this.resizable.dragEnd();
    }
  }
  
  