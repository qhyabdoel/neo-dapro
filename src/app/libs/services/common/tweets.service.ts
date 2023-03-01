// Angular
import { Injectable } from '@angular/core';
// RxJS
import { Observable, BehaviorSubject } from 'rxjs';
// Models
import { ApiService } from './api.service';

const API_URL = '/tweets';

@Injectable({
	providedIn: 'root'
})
export class TweetsService {
	/**
	 * Service Constructor
	 *
	 * @param _apicall: _apicallClient
	 */
	public isLoading = new BehaviorSubject<boolean>(false);
	public dataList = new BehaviorSubject<any>([]);
	public pageLength = new BehaviorSubject<number>(0);
	public sizeLength = new BehaviorSubject<number>(10);
	public totalData = new BehaviorSubject<number>(0);

	constructor(private _apicall: ApiService) { }

	/**
	 * Returns data from fake server
	 */
	findAll(params?): Observable<any> {
		let url = `${API_URL}?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		if(params) url += params;
		return this._apicall.get(url);
	}
	find(id: string, params?): Observable<any> {
		let url = `${API_URL}/${id}?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		if(params) url += params;
		return this._apicall.get(url);
	}
	postCounterHashtags(name, payload: any, params?, hasPages?: boolean) {
		let url = `${API_URL}/hashtags/attach-campaign/${name}`;
		if(params) url += params;
		if(hasPages) url += `?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		return this._apicall.postApi(url, payload);
	}
	getTweets(params?, hasPages?: boolean) {
		let url = `${API_URL}`;
		if(params) url += params;
		if(hasPages) url += `?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		return this._apicall.getApi(url);
	}
	getHashtags(params?, hasPages?: boolean) {
		let url = `${API_URL}/hashtags`;
		if(params) url += params;
		if(hasPages) url += `?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		return this._apicall.getApi(url);
	}
	getInfo(params?, hasPages?: boolean) {
		let url = `${API_URL}/info`;
		if(params) url += params;
		if(hasPages) url += `?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		return this._apicall.getApi(url);
	}
	getSentiments(params?, hasPages?: boolean) {
		let url = `${API_URL}/sentiments`;
		if(params) url += params;
		if(hasPages) url += `?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		return this._apicall.getApi(url);
	}
	// DATA
	get getDataList() {
		return this.dataList.asObservable();
	}
	setDataList(value: any) {
		this.dataList.next(value);
	}
	// LADING
	get getLoading() {
		return this.isLoading.asObservable();
	  }

	setLoading(isShow: boolean) {
		this.isLoading.next(isShow);
	  }
	// PAGE
	get getPageLength(){
		return this.pageLength.asObservable();
	}
	setPageLength(val : number) {
		this.pageLength.next(val);
	}
	// SIZE
	get getSizeLength(){
		return this.sizeLength.asObservable();
	}
	setSizeLength(val : number) {
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
