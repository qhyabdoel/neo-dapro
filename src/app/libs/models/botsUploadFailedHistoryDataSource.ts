import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { BotsService } from "..";

export class BotsUploadFailedHistoryDataSource implements DataSource<any[]> {
	public dataSubject = new BehaviorSubject<any[]>([]);
	public dataTotal = new BehaviorSubject<number>(0);
	private loadingSubject = new BehaviorSubject<boolean>(false);

	public loading$ = this.loadingSubject.asObservable();

	constructor(private botsService: BotsService) { }

	connect(collectionViewer: CollectionViewer): Observable<any[]> {
		return this.dataSubject.asObservable();
	}

	disconnect(collectionViewer: CollectionViewer): void {
		this.dataSubject.complete();
		this.loadingSubject.complete();
	}

	loadUploadFailedHistory(pageNumber: number, pageSize: number, search:string) {

		this.loadingSubject.next(true);

		this.botsService.findUploadFailedHistory(pageNumber, pageSize, search).pipe(
			catchError(() => of([])),
			finalize(() => this.loadingSubject.next(false))
		)
			.subscribe(resp => {
				this.dataSubject.next(resp['results']);
				this.dataTotal.next(resp['total']);
			});
	}
}
