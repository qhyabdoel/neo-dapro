import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'modal-rename-file-folder',
  templateUrl: './modal-rename-file-folder.component.html',
})
export class ModalRenameFileFolderComponent implements AfterViewInit {
  @ViewChild('folderName') folderName: ElementRef<HTMLInputElement>;

  @Output() close = new EventEmitter();
  @Output() save = new EventEmitter();

  public fileFolderName: string;

  constructor() {}

  ngAfterViewInit(): void {
    this.folderName.nativeElement.focus();
  }

  _close() {
    this.close.emit();
  }

  _save() {
    this.save.emit(this.fileFolderName);
  }
}
