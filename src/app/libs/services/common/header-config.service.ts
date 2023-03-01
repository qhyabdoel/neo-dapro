// Angular
import { Injectable } from '@angular/core';
// RxJS
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable()
export class HeaderConfigService {
	// Public properties
	private isShowHeader: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

	constructor() {}

	get getShowHeader(){
		return this.isShowHeader.asObservable();
	}

	setHeader(param){
		this.isShowHeader.next(param);
	}

	setShowHeader(){
		this.isShowHeader.next(true);
	}

	setHideHeader(){
		this.isShowHeader.next(false);
	}
}
