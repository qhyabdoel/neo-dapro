import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { BotsService } from "..";

export class BotsManualDataSource implements DataSource<any[]> {

	public dataSubject = new BehaviorSubject<any[]>([]);
	public dataTotal = new BehaviorSubject<number>(0);
	public dataUnusedOfficial = new BehaviorSubject<number>(0);
	public dataUnusedUnofficial = new BehaviorSubject<number>(0);
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

	loadBotManual(profileId: number, pageNumber: number, pageSize: number, sortDir = 'desc', search: string, type:string) {

		this.loadingSubject.next(true);

		this.botsService.findBotManual(profileId, pageNumber, pageSize, sortDir, search, type).pipe(
			catchError(() => of([])),
			finalize(() => this.loadingSubject.next(false))
		)
			.subscribe(resp => {
				this.dataSubject.next(resp['results']);
				this.dataTotal.next(resp['total']);
				this.dataUnusedOfficial.next(resp['unused_official']);
				this.dataUnusedUnofficial.next(resp['unused_unofficial']);
			});
	}
}
