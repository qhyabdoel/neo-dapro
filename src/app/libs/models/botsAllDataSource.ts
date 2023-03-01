import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { BotsService } from "..";

export class BotsAllDataSource implements DataSource<any[]> {
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

	loadAllBots(pageNumber: number, pageSize: number, search) {

		this.loadingSubject.next(true);

		this.botsService.findAllBots(pageNumber, pageSize, search).pipe(
			catchError(() => of([])),
			finalize(() => this.loadingSubject.next(false))
		)
			.subscribe(resp => {
				this.dataSubject.next(resp['results']);
				this.dataTotal.next(resp['total']);
			});
	}
}
