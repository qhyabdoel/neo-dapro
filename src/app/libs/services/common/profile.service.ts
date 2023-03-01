// Angular
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
// Models
import { ProfileCategories } from 'src/app/libs/models';

const API_URL = '/profile-categories';

@Injectable({
	providedIn: 'root'
})
export class ProfileService {
	/**
	 * Service Constructor
	 *
	 * @param _apicall: _apicallClient
	 */
	public isLoading = new BehaviorSubject<boolean>(false);
	public dataList = new BehaviorSubject<any>([]);
	public pageLength = new BehaviorSubject<number>(0);
	public sizeLength = new BehaviorSubject<number>(10);

	constructor(private _apicall: ApiService) { }

	/**
	 * Returns data from fake server
	 */
	getAll(params?) {
		let url = `${API_URL}?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		if(params) url += params;
		return this._apicall.get(url);
	}
	find(id: string, params?): Observable<any> {
		let url = `${API_URL}/${id}?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		if(params) url += params;
		return this._apicall.get(url);
	}
	create(payload: ProfileCategories): Observable<ProfileCategories> {
		return this._apicall.post(`${API_URL}`,payload);
	}
	update(payload: ProfileCategories, id: string): Observable<ProfileCategories>{
		return this._apicall.put(`${API_URL}/${id}`,payload);
	}
	deleteObservable(id): Observable<{}>{
		return this._apicall.delete(`${API_URL}/${id}`);
	}
	delete(id: number){
		return this._apicall.deleteApi(`${API_URL}/${id}`, false);
	}
	generateBots(id, params){
		return this._apicall.postApi(`${API_URL}/${id}/attach-bot`, params);
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
	get getPageLength(){
		return this.pageLength.asObservable();
	}
	setPageLength(val) {
		this.pageLength.next(val);
	}
	// SIZE
	get getSizeLength(){
		return this.sizeLength.asObservable();
	}
	setSizeLength(val) {
		this.sizeLength.next(val);
	}

}
