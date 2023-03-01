// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// RxJS
import { Observable } from 'rxjs';
// Models
import { DataTableItemModel } from 'src/app/libs/models';
import { BehaviorSubject } from 'rxjs';

const API_DATATABLE_URL = 'api/cars';

@Injectable()
export class DataTableService {
	/**
	 * Service Constructor
	 *
	 * @param http: HttpClient
	 */
	public pageLength = new BehaviorSubject<number>(0);

	constructor(private http: HttpClient) { }

	/**
	 * Returns data from fake server
	 */
	getAllItems(): Observable<DataTableItemModel[]> {
		return this.http.get<DataTableItemModel[]>(API_DATATABLE_URL);
	}

	getPageLength(){
		return this.pageLength.asObservable();
	}

	setPageLength(val : number) {
		this.pageLength.next(val);
	}
}
