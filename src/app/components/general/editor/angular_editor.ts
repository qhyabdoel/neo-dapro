import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'custom-editor-component',
  templateUrl: './angular_editor.html',
})
export class CustomEditorComponent {
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  @Input() htmlContent;
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    toolbarHiddenButtons: [
      [
        'undo',
        'redo',
        'strikeThrough',
        'subscript',
        'superscript',
        'customClasses',
        'insertImage',
        'insertVideo',
        'textColor',
        'backgroundColor',
        'toggleEditorMode',
      ],
    ],
  };
  onChange = (event) => {
    this.change.emit(event);
  };
}
