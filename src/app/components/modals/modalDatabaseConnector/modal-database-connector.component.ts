import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { convStringToArr } from 'src/app/libs/helpers/data-processing.helper';
import { ApiService } from 'src/app/libs/services';

@Component({
  selector: 'modal-database-connector',
  templateUrl: './modal-database-connector.component.html',
})
export class ModalDatabaseConnectorComponent implements OnInit, AfterViewInit {
  @Output() close = new EventEmitter();

  public databaseConnectionForm: FormGroup;
  public databaseOptionList: any;
  public database_queryStrings: any = [];
  public db_connection_form_data: any = {};
  public isEditDbForm: boolean = false;
  public loadingApi: boolean = false;

  constructor(private dbFormBuilder: FormBuilder, private apiService: ApiService) {}

  ngOnInit() {
    this.databaseOptionList = [
      {
        type_id: '0',
        test_connection_name: 'mssql',
        add_connection_name: 'MSSql',
        name: 'MS SQL SERVER',
        search_from: 'search_from_sqlserver',
      },
      {
        type_id: '1',
        test_connection_name: 'oracle',
        add_connection_name: 'Oracle',
        name: 'Oracle',
        search_from: 'search_from_oracle',
      },
      {
        type_id: '2',
        test_connection_name: 'postgresql',
        add_connection_name: 'Postgresql',
        name: 'PostgreSQL',
        search_from: 'search_from_postgre',
      },
      {
        type_id: '3',
        test_connection_name: 'mysql',
        add_connection_name: 'MySQL',
        name: 'MySQL',
        search_from: 'search_from_mysql',
      },
      {
        type_id: '4',
        test_connection_name: 'db2',
        add_connection_name: 'DB2',
        name: 'DB2',
        search_from: 'search_from_db2',
      },
    ];

    this.databaseConnectionForm = this.dbFormBuilder.group({
      c_name: [
        {
          value: this.db_connection_form_data.c_name,
          disabled: this.isEditDbForm,
        },
        Validators.required,
      ],
      c_type: [
        {
          value: this.db_connection_form_data.c_type,
          disabled: this.isEditDbForm,
        },
        Validators.required,
      ],
      host: [this.db_connection_form_data.host, Validators.required],
      port: [this.db_connection_form_data.port, Validators.required],
      username: [this.db_connection_form_data.username, Validators.required],
      password: [this.db_connection_form_data.password, Validators.required],
      database: [this.db_connection_form_data.database],
      instance: [this.db_connection_form_data.instance],
      sid: [this.db_connection_form_data.sid],
      key: [this.db_connection_form_data.key],
    });

    // this.databaseConnectionForm.setValue({
    //   c_name: '192.168.210.80',
    //   c_type: '3',
    //   host: '192.168.210.80',
    //   port: '3306',
    //   username: 'albert',
    //   password: 'albert',
    //   database: 'albert',
    //   instance: null,
    //   sid: null,
    //   key: null,
    // });
  }

  _close() {
    this.close.emit();
  }

  ngAfterViewInit() {}

  onDbOptionSelect(val: any) {}

  prepareDbForm() {
    const control = this.databaseConnectionForm.controls;
    this.db_connection_form_data = {
      c_name: control.c_name.value || '',
      c_type: control.c_type.value || '',
      database: control.database.value || '',
      host: control.host.value || '',
      instance: control.instance.value || '',
      password: control.password.value || '',
      port: control.port.value || null,
      sid: control.sid.value || '',
      username: control.username.value || '',
      key: control.key.value || '',
    };

    return this.db_connection_form_data;
  }

  saveDbConnection() {}

  setDatabaseQueryString() {}

  async testDbConnection() {
    // console.log('testDbConnection');

    let url = '/api/dbconfig/test-config';

    const controls = this.databaseConnectionForm.controls;

    if (this.databaseConnectionForm.invalid) {
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
      });
      return;
    } else {
      let configForm = this.prepareDbForm();

      if (configForm.key) {
        url = '/api/dbconfig/test-config?key=' + configForm.key;
      }

      let selectedConnectionType = this.databaseOptionList.filter((x) => x.type_id === configForm.c_type.toString())[0];
      let encodedPassword = btoa(configForm.password);
      let query_strings = convStringToArr(this.database_queryStrings);

      let param = {
        c_type: selectedConnectionType.test_connection_name,
        host: configForm.host,
        port: configForm.port,
        username: configForm.username,
        password: encodedPassword,
      };

      switch (selectedConnectionType.test_connection_name) {
        case 'mysql':
        case 'postgresql':
        case 'db2':
          param['query_string'] = query_strings;
          param['database'] = configForm.database;
          break;
        case 'mssql':
          param['instance'] = configForm.instance;
          param['database'] = configForm.database;
          break;
        case 'oracle':
          param['sid'] = configForm.sid;
          break;
        default:
      }

      if (configForm.key) param['key'] = configForm.key;

      const rest: any = await lastValueFrom(this.apiService.post(url, param));
      // console.log('rest', rest);

      if (rest.status) {
        let result = rest.result && rest.result.response ? rest.result.response : rest.result;
        // this.openModal(this.messages.DATA_PROCESSING.S, this.messages.DATA_PROCESSING.TCS);
        this.loadingApi = false;
      } else {
        // this.openModal(this.messages.DATA_PROCESSING.F, this.messages.DATA_PROCESSING.TCF);
        this.loadingApi = false;
      }
    }
  }
}
