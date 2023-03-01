import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/libs/services';
import { lastValueFrom } from 'rxjs';
import { Action, Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';

import {
    SetToastrMessage
} from 'src/app/libs/store/actions/pds/dataprocessing.actions';

@Component({
    selector: 'modal-hadoop-connector',
    templateUrl: './modal-hadoop-connector.component.html',
})
export class ModalHadoopConnectorComponent implements OnInit {
    @Output() close = new EventEmitter();
    @Output() getHdfsList = new EventEmitter();
    
    public hadoopConnectionForm: FormGroup;
    public hadoop_connection_form_data: any = {};

    constructor(private dbFormBuilder: FormBuilder, private apiService: ApiService, private store$: Store<AppState>,) {}

    ngOnInit() {
        this.hadoopConnectionForm = this.dbFormBuilder.group({
            connection_name: [this.hadoop_connection_form_data.connection_name, Validators.required],
            port: [this.hadoop_connection_form_data.port, Validators.required],
            node_name: [this.hadoop_connection_form_data.node_name, Validators.required],
            token: [this.hadoop_connection_form_data.token]
        });
    }

    async saveHadoopConnection() {
        let url = '/api/hdfs-connection';
        const rest: any = await lastValueFrom(this.apiService.post(url, this.hadoopConnectionForm.value));

        console.log('HDFS Connection Response', rest);

        if (rest.status) {
            if (rest.status === 'ok') {
                this.store$.dispatch(
                    SetToastrMessage({
                      toastrMessage: {
                        toastrType: 'info',
                        message: 'HDFS Connection Successfully Added',
                      },
                    })
                );
                
                this._close();
                this.getHadoopFileList(rest.response.connection_name)
            } else {
                this.store$.dispatch(
                    SetToastrMessage({
                      toastrMessage: {
                        toastrType: 'error',
                        message: 'HDFS Connection Error',
                      },
                    })
                );
            }
        } 
    }

    async getHadoopFileList(connectionName:string) {
        let url = `/api/hdfs-connection/${connectionName}/list?path=/`;
        const rest: any = await lastValueFrom(this.apiService.get(url));
        // console.log('HDFS Connection File List Response', rest);
        this.getHdfsList.emit(rest.response);
    }

    _close() {
        this.close.emit();
    }
}