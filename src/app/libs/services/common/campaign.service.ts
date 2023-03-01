// Angular
import { Injectable } from '@angular/core';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// Models
import { Campaign } from 'src/app/libs/models';
import { ApiService } from './api.service';

@Injectable({
	providedIn: 'root'
})
export class CampaignService {
	/**
	 * Service Constructor
	 *
	 * @param _apicall: ApiService
	 */
	public API_URL = '/twitter-campaigns';
	public isLoading = new BehaviorSubject<boolean>(false);
	public dataList = new BehaviorSubject<any>([]);
	public pageLength = new BehaviorSubject<number>(0);
	public sizeLength = new BehaviorSubject<number>(10);
	public totalData = new BehaviorSubject<number>(0);

	constructor(private _apicall: ApiService) { }

	/**
	 * Returns data from fake server
	 */
	getAll(params?) {
		let url = `${this.API_URL}?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		if(params) url += params;
		return this._apicall.getApi(url);
	}
	find(id: string, params?): Observable<any> {
		let url = `${this.API_URL}/${id}?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		if(params) url += params;
		return this._apicall.get(url);
	}
	create(payload: Campaign): Observable<Campaign> {
		return this._apicall.post(`${this.API_URL}`,payload);
	}
	update(payload: Campaign, id: string): Observable<Campaign>{
		return this._apicall.put(`${this.API_URL}/${id}`,payload);
	}
	delete(id: string):  Observable<{}>{
		return this._apicall.delete(`${this.API_URL}/${id}`);
	}
	createApi(payload: any) {
		return this._apicall.postApi(`${this.API_URL}`,payload);
	}
	updateApi(payload: any, id: string) {
		return this._apicall.putApi(`${this.API_URL}/${id}`,payload);
	}
	deleteApi(id: string){
		return this._apicall.deleteApi(`${this.API_URL}/${id}`, false);
	}
	// LADING
	get getLoading() {
		return this.isLoading.asObservable();
	  }

	setLoading(isShow: boolean) {
		this.isLoading.next(isShow);
	  }
	// DATA
	get getDataList() {
		return this.dataList.asObservable();
	}
	setDataList(value: any) {
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
	// TOTAL DATA
	get getTotalData(){
		return this.totalData.asObservable();
	}
	setTotalData(val) {
		this.totalData.next(val);
	}

}
