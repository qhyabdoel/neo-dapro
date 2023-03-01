// Angular
import { Injectable } from '@angular/core';
// RxJS
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';


const API_ARTICLE = '/v1/article';

@Injectable({
	providedIn: 'root'
})
export class ArticleService {
	/**
	 * Service Constructor
	 *
	 * @param _apicall: ApiService
	 */
	private isLoading = new BehaviorSubject<boolean>(false);
	private dataList = new BehaviorSubject<any>([]);
	private pageLength = new BehaviorSubject<number>(0);
	private sizeLength = new BehaviorSubject<number>(10);
	private totalData = new BehaviorSubject<number>(0);
	private startDate = new BehaviorSubject<string>('');
	private endDate = new BehaviorSubject<string>('');

	constructor(private _apicall: ApiService) { }

	/**
	 * Returns data from fake server
	 */
	getTopics(params?: any, hasPages?: boolean) {
		let url = `${API_ARTICLE}/topics?start=${this.startDate.getValue()}&end=${this.endDate.getValue()}`;
		if(params) url += params;
		if(hasPages) url += `&page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		return this._apicall.getApi(url);
	}
	getEntityLocation(params?: any, hasPages?: boolean) {
		let url = `${API_ARTICLE}/entity/location?start=${this.startDate.getValue()}&end=${this.endDate.getValue()}`;
		if(params) url += params;
		if(hasPages) url += `&page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		return this._apicall.getApi(url);
	}
	getEntityOrganization(params?: any, hasPages?: boolean) {
		let url = `${API_ARTICLE}/entity/organization?start=${this.startDate.getValue()}&end=${this.endDate.getValue()}`;
		if(params) url += params;
		if(hasPages) url += `&page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		return this._apicall.getApi(url);
	}
	getEntityPerson(params?: any, hasPages?: boolean) {
		let url = `${API_ARTICLE}/entity/person?start=${this.startDate.getValue()}&end=${this.endDate.getValue()}`;
		if(params) url += params;
		if(hasPages) url += `&page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		return this._apicall.getApi(url);
	}
	find(id: string, params?): Observable<any> {
		let url = `${API_ARTICLE}/${id}?page=${this.pageLength.getValue()}&size=${this.sizeLength.getValue()}`;
		if(params) url += params;
		return this._apicall.get(url);
	}
	create(payload: any): Observable<any> {
		return this._apicall.post(`${API_ARTICLE}`,payload);
	}
	update(payload: any, id: string): Observable<any>{
		return this._apicall.put(`${API_ARTICLE}/${id}`,payload);
	}
	delete(id: string):  Observable<{}>{
		return this._apicall.delete(`${API_ARTICLE}/${id}`);
	}
	createApi(payload: any) {
		return this._apicall.postApi(`${API_ARTICLE}`,payload);
	}
	updateApi(payload: any, id: string) {
		return this._apicall.putApi(`${API_ARTICLE}/${id}`,payload);
	}
	deleteApi(id: string){
		return this._apicall.deleteApi(`${API_ARTICLE}/${id}`, false);
	}
	// Start Date & End Date
	get getStartDate() {
		return this.startDate.asObservable();
	  }

	setStartDate(startDate: string) {
		this.startDate.next(startDate);
	  }
	get getEndDate() {
		return this.endDate.asObservable();
	  }

	setEndDate(endDate: string) {
		this.endDate.next(endDate);
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
