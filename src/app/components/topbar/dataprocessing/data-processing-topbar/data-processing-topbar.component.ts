import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { BehaviorSubject, lastValueFrom, Observable, skipWhile, Subject, Subscription, take, timer } from 'rxjs';
import { DialogCommonComponent } from 'src/app/components/dialogs/dialog-common/dialog-common.component';
import { QueryCommandItem, User } from 'src/app/libs/models';
import { openDialog } from 'src/app/libs/helpers/common';
import { getTextCollections } from 'src/app/libs/helpers/data-processing.helper';
import { TranslationService, WorkspaceService } from 'src/app/libs/services';
import {
  ExecuteQuery,
  ResetWorkspace,
  SetIsDatasetListReloadRequestTriggered,
  SetIsPanzoomResetTriggered,
  SetIsProgressActive,
  SetIsQueryRequestFailed,
  SetIsQueryRequestTriggered,
  SetIsQueryRequestTriggeredSubscribed,
  SetIsZoomInOutTriggered,
  SetScaleValue,
  SetToastrMessage,
} from 'src/app/libs/store/actions/pds/dataprocessing.actions';
import { UserSelector } from 'src/app/libs/store/selectors/authentication.selectors';
import {
  isQueryRequestFailedSelector,
  isQueryRequestTriggeredSelector,
  isWorkspaceResetIsTriggeredSelector,
  queryCommandItemsSelector,
  queryObjectSelector,
  queryResultSelector,
  scaleValueSelector,
} from 'src/app/libs/store/selectors/dataprocessing.selectors';
import { AppState } from 'src/app/libs/store/states';
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'data-processing-topbar',
  templateUrl: 'data-processing-topbar.component.html',
  styleUrls: ['data-processing-topbar.component.scss'],
})
export class DataProcessingTopbarComponent implements OnInit, OnDestroy {
  @Output() queryRun = new EventEmitter<{ isPreview: boolean }>();

  private lang: string;
  private subscriptions: Subscription[] = [];
  private textCollections: any;
  private timeBegan: any;

  public loadingPreview$: Subject<boolean> = new Subject<boolean>();
  public loadingRun$: Subject<boolean> = new Subject<boolean>();

  public mytime = '00:00:00.000';

  public queryCommandItems: any = [];

  public scaleValuePctg: number = 100;

  public quid: string = '';
  public title: string = '';

  public user: User = null;

  /* OBSERVABLES */
  private timerStarted$: Subject<boolean> = new Subject<boolean>();
  private timerObs$: Observable<number> = null;

  /* SUBSCRIPTIONS */
  private isQueryRequestTriggeredSubscription: Subscription;
  private isQueryHasResultAfterTriggeredSubscription: Subscription;
  private isWorkspaceResetIsTriggeredSubscription: Subscription;
  private isQueryRequestFailedSubscription: Subscription;
  private queryCommandItemsSubscription: Subscription;
  private queryObjectSubscription: Subscription;
  private timerSubscription: Subscription;
  private timerStartedSubscription: Subscription;
  private userSubscription: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private store: Store<AppState>,
    private translationService: TranslationService,
    private workspaceService: WorkspaceService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    this.lang = this.translationService.getSelectedLanguage();
    this.textCollections = getTextCollections(this.lang);

    this.title = this.textCollections.DATA_PROCESSING.U;

    this.subscriptions.push(
      this.store.select(UserSelector).subscribe((user: User) => (this.user = user))
    );

    this.subscriptions.push(
      this.store
        .select(queryCommandItemsSelector)
        .subscribe((queryCommandItems: QueryCommandItem[]) => (this.queryCommandItems = queryCommandItems))
    );

    this.subscriptions.push(
      this.store.select(queryObjectSelector).subscribe((queryObject) => {
        // console.log('queryObject', queryObject)
        if (queryObject) {
          this.quid = queryObject.quid;
          this.title = queryObject.title;
        }
      })
    );

    this.timerObs$ = timer(0, 10);

    this.subscriptions.push(
      this.timerStarted$.subscribe((isStarted) => {
        if (isStarted) {
          this.timerSubscription = this.timerObs$.subscribe(() => {
            // console.log("timerSubscription", this.timeBegan)
            if (this.timeBegan) {
              const currentTime: any = new Date();
              const timeElapsed = new Date(currentTime - this.timeBegan);
              const hour = timeElapsed.getUTCHours();
              const min = timeElapsed.getUTCMinutes();
              const sec = timeElapsed.getUTCSeconds();
              const ms = timeElapsed.getUTCMilliseconds();

              this.mytime =
                (hour > 9 ? hour : '0' + hour) +
                ':' +
                (min > 9 ? min : '0' + min) +
                ':' +
                (sec > 9 ? sec : '0' + sec) +
                '.' +
                (ms > 99 ? ms : ms > 9 ? '0' + ms : '00' + ms);

              this.cdr.detectChanges();
            }
          });
        } else {
          this.timeBegan = null;
        }
      })
    );

    this.subscriptions.push(
      this.store
        .select(isQueryRequestTriggeredSelector)
        .subscribe((isQueryRequestTriggered) => {
          // console.log('isQueryRequestTriggered', isQueryRequestTriggered);
          if (isQueryRequestTriggered) {
            this.timeBegan = new Date();
            this.mytime = '00:00:00.000';

            this.timerStarted$.next(true);
            this.loadingRun$.next(true);

            // console.log('SetIsQueryRequestTriggeredSubscribed DP-TOPBAR-1');
            this.store.dispatch(SetIsQueryRequestTriggeredSubscribed({ id: 'DP-TOPBAR-1' }));
          }
          // else {
          //   this.timeBegan = null;

          //   this.timerStarted$.next(false);
          //   this.loadingRun$.next(false);
          // }
        })
    );

    this.subscriptions.push(
      this.store
        .select(queryResultSelector)
        .subscribe((queryResult) => {
          if (queryResult) {
            if(queryResult.quid.done || queryResult.quid.state === "error") {
              this.timeBegan = null;
              this.timerStarted$.next(false);
              this.loadingRun$.next(false);
            }

            if(queryResult.quid.state === "error") {
              this.store.dispatch(
                SetToastrMessage({
                  toastrMessage: {
                    toastrType: 'error',
                    message: queryResult.quid.message,
                  },
                })
              );
            }
          }
        })
    );

    this.subscriptions.push(
      this.store
        .select(isWorkspaceResetIsTriggeredSelector)
        .subscribe((isWorkspaceResetIsTriggered) => {
          if (isWorkspaceResetIsTriggered) {
            this.title = this.textCollections.DATA_PROCESSING.U;
            this.mytime = '00:00:00.000';
          }
        })
    );

    this.subscriptions.push(
      this.store
        .select(isQueryRequestFailedSelector)
        .pipe(skipWhile((isQueryRequestFailed) => !isQueryRequestFailed))
        .subscribe((isQueryRequestFailed) => {
          if (isQueryRequestFailed) {
            this.timeBegan = null;
            this.timerStarted$.next(false);
            this.mytime = '00:00:00.000';

            this.store.dispatch(SetIsQueryRequestTriggered({ isQueryRequestTriggered: false }));
            this.store.dispatch(SetIsQueryRequestFailed({ isQueryRequestFailed: false }));

            this.loadingRun$.next(false);
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  buttonNew() {
    const dialogRef = openDialog(
      this.dialog,
      DialogCommonComponent,
      this.textCollections.DATA_PROCESSING.C,
      this.textCollections.DATA_PROCESSING.AYSCNQ,
      '',
      true
    );
    dialogRef.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }

      this.title = this.textCollections.DATA_PROCESSING.U;

      this.store.dispatch(ResetWorkspace({ needToastr: true }));
    });
  }

  async buttonPreview() {
    this.store.dispatch(ExecuteQuery({ title: this.title, isPreview: true }));
  }

  async buttonRun() {
    this.store.dispatch(ExecuteQuery({ title: this.title, isPreview: false }));
  }

  async buttonSave() {
    this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

    const saveResult = await this.workspaceService.saveQuery(this.title);
    
    if (saveResult && saveResult.success) {
      this.store.dispatch(SetToastrMessage({
        toastrMessage: {
          toastrType: 'info',
          message: this.textCollections.DATA_PROCESSING.DSS,
        }
      }));  
    } else {
      this.store.dispatch(SetToastrMessage({
        toastrMessage: {
          toastrType: 'error',
          message: saveResult.err.message,
        }
      }));
    }

    this.store.dispatch(SetIsDatasetListReloadRequestTriggered({ isDatasetListReloadRequestTriggered: true }));
    this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
  }

  toTresHoldZoom(val: number): number {
		let num = 0;
		if (val < 0.5) num = 0.5;
		else if (val > 2) num = 2.0;
		else num = val;
		return num;
	}

  resetScale() {
    this.scaleValuePctg = 100;

    this.store.dispatch(SetScaleValue({ scaleValue: 1 }));
    this.store.dispatch(SetIsZoomInOutTriggered({ isZoomInOutTriggered: true }));
  }

	async onChangeScale(value: number, opt: string): Promise<any> {
    // console.log('ok!')
    let scaleValue = await lastValueFrom(this.store.select(scaleValueSelector).pipe(take(1)));
    // console.log('scaleValue', scaleValue);

    switch (opt) {
      case 'inc':
        scaleValue += value
        break;
      case 'dec':
        scaleValue -= value
        break;
      default:
  			scaleValue = value;
    }

    scaleValue = this.toTresHoldZoom(scaleValue);
    this.scaleValuePctg = Math.abs(scaleValue * 100);

    this.store.dispatch(SetScaleValue({ scaleValue }))
    this.store.dispatch(SetIsZoomInOutTriggered({ isZoomInOutTriggered: true }));
	}

  resetCanvas() {
    this.store.dispatch(SetIsPanzoomResetTriggered({ isPanzoomResetTriggered: true }));
  }

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }
}
