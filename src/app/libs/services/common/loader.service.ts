import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  public isLoading = new BehaviorSubject(false);
  public isLoadingPage = new BehaviorSubject(false);
  public isLoadingUpload = new BehaviorSubject(false);
  public spesifikID = new BehaviorSubject([]);

  constructor() {}

  get getLoading() {
    return this.isLoading.asObservable();
  }

  get getLoadingUpload() {
    return this.isLoadingUpload.asObservable();
  }

  get getSpesifikID() {
    return this.spesifikID.getValue();
  }

  get getLoadingPage() {
    return this.isLoadingPage.asObservable();
  }

  setLoading(isShow) {
    this.isLoading.next(isShow);
  }

  setLoadingPage(isShow) {
    this.isLoadingPage.next(isShow);
  }

  setLoadingUpload(isShow) {
    this.isLoadingUpload.next(isShow);
  }

  setSpesifikID(id) {
    this.spesifikID.next(id);
  }
  spliceSpesifikID(id) {
    const arr: any[] = this.spesifikID.getValue();
    arr.forEach((item, index) => {
      if (item === id) {
        arr.splice(index, 1);
      }
    });
    this.spesifikID.next(arr);
  }
}
