import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'modal-duplicate-query',
  templateUrl: './modal-duplicate-query.component.html',
})
export class ModalDuplicateQueryComponent {
  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter();

  public newName: string;

  _close() {
    this.close.emit();
  }

  _save() {
    this.save.emit(this.newName);
  }
}
