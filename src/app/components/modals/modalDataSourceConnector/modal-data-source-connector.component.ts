import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'modal-data-source-connector',
  templateUrl: './modal-data-source-connector.component.html',
})
export class ModalDataSourceConnectorComponent {
  @Output() addDbConnection = new EventEmitter();
  @Output() addAPIConnection = new EventEmitter();
  @Output() addHadoopConnection = new EventEmitter();
  @Output() close = new EventEmitter();

  _addDbConnection() {
    this.addDbConnection.emit();
  }

  _addAPIConnection() {
    this.addAPIConnection.emit();
  }

  _addHadoopConnection() {
    this.addHadoopConnection.emit();
    this._close();
  }

  _close() {
    this.close.emit();
  }
}
