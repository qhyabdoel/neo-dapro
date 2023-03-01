import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'modal-add-folder',
  templateUrl: './modal-add-folder.component.html',
})
export class ModalAddFolderComponent implements AfterViewInit {
  @ViewChild('folderName') folderName: ElementRef<HTMLInputElement>;

  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter();

  public fileName: string;

  constructor() {}

  ngAfterViewInit(): void {
    this.folderName.nativeElement.focus();
  }

  _close() {
    this.close.emit();
  }

  _save() {
    this.save.emit(this.fileName);
  }
}
