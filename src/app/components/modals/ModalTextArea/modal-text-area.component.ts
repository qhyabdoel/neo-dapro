import { Component, EventEmitter, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'modal-formula-editor',
  templateUrl: './modal-text-area.component.html',
})
export class ModalTextAreaComponent {
  @Output() onChange = new EventEmitter<string>();
  @Output() onClose = new EventEmitter<any>();

  public editorOptions = {
    language: 'sql',
    automaticLayout: true,
  };
  public formulaDataSource: MatTableDataSource<{ description: string; formula: string }>;
  public formulaDisColumns: string[];
  public formulaValue: string;
  public functionName: string;
  public formulaFilter: string;

  addFormulaToEditor(row: any) {
    this.formulaValue = `${this.formulaValue}${row.formula}`;

    this.onChange.emit(this.formulaValue);
  }

  searchFormulaFilter() {
    this.formulaDataSource.filter = this.formulaFilter.trim().toLowerCase();
  }

  _onChange(txt) {
    this.formulaValue = txt;

    this.onChange.emit(this.formulaValue);
  }

  _onClose() {
    this.onClose.emit();
  }
}
