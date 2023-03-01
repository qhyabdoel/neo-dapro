import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import {
  GetChartList,
  GetChartListSuccess,
  GetChartListFailed,
  GetDashboardList,
  GetDashboardListSuccess,
  GetDashboardListFailed,
  GetChartDatasourceSuccess,
  GetChartDatasourceFailed,
  GetChartDatasource,
  GetChartExplore,
  GetChartExploreSuccess,
  GetChartExploreFailed,
  GetColorPallete,
  GetColorPalleteSuccess,
  GetColorPalleteFailed,
  DeleteDashboard,
  DeleteDashboardSuccess,
  DeleteChart,
  DeleteChartSuccess,
  PostShareChart,
  PostShareChartSuccess,
  PostShareChartFailed,
  PostShareUrlChart,
  PostShareUrlChartSuccess,
  PostShareUrlChartFailed,
  GetApplicationListSuccess,
  GetApplicationListFailed,
  GetApplicationList,
} from 'src/app/libs/store/actions/pds/datavisualization/datavisualization.actions';
import { DataVisualizationService } from 'src/app/libs/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from 'src/app/components/modals/modal/modal.component';
@Injectable()
export class DataVisualizationEffects {
  constructor(
    private actions$: Actions,
    private dataVisualizationService: DataVisualizationService,
    private modalService: NgbModal
  ) {}

  openModal(title?, msg?, isFooter?, footerLeftText?, footerRightText?) {
    let modalRef;
    modalRef = this.modalService.open(ModalComponent, {
      centered: true,
      size: 'md',
    });
    modalRef.componentInstance.title = title ? title : '';
    modalRef.componentInstance.msg = msg ? msg : 'Please contact administrator for this issue!';
    modalRef.componentInstance.isFooter = isFooter ? isFooter : false;
    if (footerLeftText && isFooter) {
      modalRef.componentInstance.footerLeftText = footerLeftText ? footerLeftText : 'Yes';
    }
    if (footerRightText && isFooter) {
      modalRef.componentInstance.footerRightText = footerRightText ? footerRightText : 'No';
    }
  }

  getTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetChartList),
      mergeMap((action) =>
        this.dataVisualizationService.getChartListApi().pipe(
          map((result) => {
            return GetChartListSuccess(result);
          }),
          catchError((error: any) => of(GetChartListFailed(error)))
        )
      )
    )
  );

  getDashboardList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetDashboardList),
      mergeMap((action) =>
        this.dataVisualizationService.getDashboardListApi().pipe(
          map((result) => {
            return GetDashboardListSuccess(result);
          }),
          catchError((error: any) => of(GetDashboardListFailed(error)))
        )
      )
    )
  );
  // start
  getChartDatasource$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetChartDatasource),
      mergeMap((action) =>
        this.dataVisualizationService.getChartDatasourceApi().pipe(
          map((result) => {
            return GetChartDatasourceSuccess(result);
          }),
          catchError((error: any) => of(GetChartDatasourceFailed(error)))
        )
      )
    )
  );

  getChartExplore$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetChartExplore),
      mergeMap((action) =>
        this.dataVisualizationService.getChartExploreApi(action.url, action.param).pipe(
          map((result) => {
            return GetChartExploreSuccess(result);
          }),
          catchError((error: any) => of(GetChartExploreFailed(error)))
        )
      )
    )
  );

  getColorPallete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetColorPallete),
      mergeMap((action) =>
        this.dataVisualizationService.getColorPalleteApi().pipe(
          map((result) => {
            return GetColorPalleteSuccess(result);
          }),
          catchError((error: any) => of(GetColorPalleteFailed(error)))
        )
      )
    )
  );

  deleteDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DeleteDashboard),
      mergeMap((action) =>
        this.dataVisualizationService.deleteDashboardApi(action.id).pipe(
          map((result) => {
            this.openModal('Success', 'This action sucessfully to process!');
            return DeleteDashboardSuccess(result);
          }),
          catchError((error: any) => of(this.openModal('Failed', 'This action failed to process!')))
        )
      )
    )
  );

  deleteChart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DeleteChart),
      mergeMap((action) =>
        this.dataVisualizationService.deleteChartApi({ id: Number(action.id) }).pipe(
          map((result) => {
            this.openModal('Success', 'This action sucessfully to process!');
            return DeleteChartSuccess(result);
          }),
          catchError((error: any) => of(this.openModal('Failed', 'This action failed to process!')))
        )
      )
    )
  );

  postShareChart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostShareChart),
      mergeMap((action) =>
        this.dataVisualizationService.postShareChartApi({ id: Number(action.id) }).pipe(
          map((result) => {
            return PostShareChartSuccess(result);
          }),
          catchError((error: any) => of(PostShareChartFailed(error)))
        )
      )
    )
  );

  postShareUrlChart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PostShareUrlChart),
      mergeMap((action) =>
        this.dataVisualizationService.postShareUrlChartApi({ id: Number(action.id) }).pipe(
          map((result) => {
            return PostShareUrlChartSuccess(result);
          }),
          catchError((error: any) => of(PostShareUrlChartFailed(error)))
        )
      )
    )
  );

  //end

  // menu builder
  getApplicationList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GetApplicationList),
      mergeMap((action) =>
        this.dataVisualizationService.getApplicationListApi().pipe(
          map((result) => {
            return GetApplicationListSuccess(result);
          }),
          catchError((error: any) => of(GetApplicationListFailed(error)))
        )
      )
    )
  );
  // menu builder
}
