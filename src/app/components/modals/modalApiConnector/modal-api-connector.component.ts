import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'modal-api-connector',
  templateUrl: './modal-api-connector.component.html',
})
export class ModalApiConnectorComponent {
  @Output() close = new EventEmitter();

  public apiConnectionForm: FormGroup;
  public loadingApi: boolean = false;
  public api_connection_form_data: any = {};

  constructor(private apiFormBuilder: FormBuilder) {}

  ngOnInit() {
    this.apiConnectionForm = this.apiFormBuilder.group({
      name: [this.api_connection_form_data.name, Validators.required],
      protocol: [
        this.api_connection_form_data.protocol,
        Validators.required,
      ],
      host: [this.api_connection_form_data.host, Validators.required],
      port: [this.api_connection_form_data.port, Validators.required],
      path: [this.api_connection_form_data.path, Validators.required],
      id: [this.api_connection_form_data.id],
    });
  }

  _close() {
    this.close.emit();
  }

  setApiHeaders() {}

  setApiQueryString() {}

  testApiConnection() {}

  saveApiConnection() {}
}
