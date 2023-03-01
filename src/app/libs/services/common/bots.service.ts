// Angular
import { Injectable } from '@angular/core';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// Models
import { Bots } from 'src/app/libs/models';
import { ApiService } from './api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

const API_URL = '/twitter-credentials';

@Injectable({
	providedIn: 'root'
})
export class BotsService {
	/**
	 * Service Constructor
	 *
	 * @param _apicall: ApiService
	 */
	public isLoading = new BehaviorSubject<boolean>(false);
	public dataList = new BehaviorSubject<any>([]);
	public pageLength = new BehaviorSubject<number>(0);
	public sizeLength = new BehaviorSubject<number>(10);

	constructor(private _apicall: ApiService, private http: HttpClient) { }

	/**
	 * Returns data from fake server
	 */
	getAll(params?) {
		let url = `${API_URL}?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		if (params && params != "") url += params;
		return this._apicall.getApi(url);
	}
	find(id: string, params?): Observable<any> {
		let url = `${API_URL}/${id}?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		if (params) url += params;
		return this._apicall.get(url);
	}
	create(payload: Bots): Observable<Bots> {
		return this._apicall.post(`${API_URL}`, payload);
	}
	update(payload: Bots, id: string): Observable<Bots> {
		return this._apicall.put(`${API_URL}/${id}`, payload);
	}
	delete(id: number) {
		return this._apicall.deleteApi(`${API_URL}/${id}`, false);
	}
	getBigNumber() {
		return this._apicall.getApi(`${API_URL}/big-number`);
	}
	// LADING
	get getLoading() {
		return this.isLoading.asObservable();
	}

	setLoading(isShow) {
		this.isLoading.next(isShow);
	}
	// DATA
	get getDataList() {
		return this.dataList.asObservable();
	}
	setDataList(value) {
		this.dataList.next(value);
	}
	// PAGE
	get getPageLength() {
		return this.pageLength.asObservable();
	}
	setPageLength(val) {
		this.pageLength.next(val);
	}
	// SIZE
	get getSizeLength() {
		return this.sizeLength.asObservable();
	}
	setSizeLength(val) {
		this.sizeLength.next(val);
	}

	findBotManual(profileId: number, pageNumber, pageSize, sortDir: string, search: string, type: string): Observable<any[]> {
		let params = new HttpParams()
			.set('page', pageNumber.toString())
			.set('size', pageSize.toString());

		if (sortDir != '') {
			params = params.set('sortBy', 'nickname');
			params = params.set('sortDir', sortDir);
		}

		if (search != '') {
			params = params.set('search', search);
		}

		if (type != '') {
			params = params.set('type', type);
		}

		return this.http.get(`/profile-categories/${profileId}/attach-bot`, {
			params: params
		}).pipe(
			map(res => res['data'])
		);
	}

	findAllBots(pageNumber: number, pageSize: number, search: string): Observable<any[]> {
		let params = new HttpParams()
			.set('page', pageNumber.toString())
			.set('size', pageSize.toString());

		if (search != '') {
			params = params.set('search', search);
		}

		return this.http.get('/twitter-credentials', {
			params: params
		}).pipe(
			map(res => res['data'])
		);
	}

	findUploadFailedHistory(pageNumber: number, pageSize: number, search: string): Observable<any[]> {
		let params = new HttpParams()
			.set('page', pageNumber.toString())
			.set('size', pageSize.toString());

		if (search != '') {
			params = params.set('filter[0][filter_type]', 'like');
			params = params.set('filter[0][field_type]', 'string');
			params = params.set('filter[0][field_name]', 'username');
			params = params.set('filter[0][filter_value]', search.toString());

			// params = params.set('filter[1][filter_type]', 'like');
			// params = params.set('filter[1][field_type]', 'string');
			// params = params.set('filter[1][field_name]', 'error');
			// params = params.set('filter[1][filter_value]', search.toString());
		}

		return this.http.get('/twitter-credentials/csv', {
			params: params
		}).pipe(
			map(res => res['data'])
		);
	}

}
