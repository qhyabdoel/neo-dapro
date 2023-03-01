// import {AfterViewInit, ViewChild} from '@angular/core';
// import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
// import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject, ChangeDetectorRef } from '@angular/core';
// import { TranslationService } from '../../../../core/_base/layout';
// import {AuditTrail, AuditTrailService} from '../../../../core/notification-center';
import { take, tap } from 'rxjs/operators';
import { saveAs } from 'file-saver';

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AuditTrail } from 'src/app/libs/models/audit-trail.model';
import { AuditTrailService, TranslationService } from 'src/app/libs/services';

@Component({
  selector: 'pq-audit-trail',
  templateUrl: './audit-trail-component.html',
  styles: ['.mat-column-logged_at {flex: 0 0 25%}'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AuditTrailComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumns: string[] = ['logged_at', 'text'];
  dataSource: MatTableDataSource<AuditTrail>;
  generalSearch: string;
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<AuditTrailComponent>,
    @Inject(MAT_DIALOG_DATA)
    public user: { uuid: string; firstname: string; groups: { groupname: string; roles: { rolename: string }[] }[] },
    private auditTrailService: AuditTrailService,
    private cdr: ChangeDetectorRef,
    private translationService: TranslationService
  ) {}

  async ngOnInit() {
    this.translationService.setLanguage(this.translationService.getSelectedLanguage());
    this.dataSource = new MatTableDataSource<any>();
  }

  ngAfterViewInit() {
    this.loadData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(page: 'application' | 'data_visualization' | 'menu_builder' | 'data_processing' = 'data_processing') {
    this.loading = true;

    if (page === 'application' && !this.displayedColumns.some((v) => v === 'application')) {
      this.displayedColumns = [...this.displayedColumns.slice(0, 1), 'application', ...this.displayedColumns.slice(1)];
    } else if (page !== 'application') {
      this.displayedColumns = this.displayedColumns.filter((v) => v !== 'application');
    }

    this.auditTrailService
      .loadAuditTrail(this.user.uuid, page)
      .pipe(
        tap((x) => (this.dataSource.data = x)),
        take(1)
      )
      .subscribe({
        complete: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  ngOnDestroy(): void {}

  searchLog(searchValue) {
    searchValue = searchValue.trim(); // Remove whitespace
    searchValue = searchValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = searchValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onChangePage({ nextId: page }): void {
    this.loadData(page);
  }

  downloadData(): void {
    let csv = [['Date and Time', 'Username', 'Menu', 'Activity Detail\n'].join(',')];
    csv = csv.concat(
      this.dataSource.data.map((v) =>
        [
          `"${(v.logged_at as Date).toISOString()}"`,
          `"${v.username}"`,
          `"${
            v.page === 'application'
              ? ''
              : v.page
                  .split('_')
                  .map((p) => p[0].toUpperCase() + p.slice(1))
                  .join(' ')
          }"`,
          `"${v.text}"\n`,
        ].join(',')
      )
    );
    const data = new Blob(csv, { type: 'text/csv;charset=utf-8' });
    saveAs(data, `audit_trail-${this.user.firstname}-${new Date().toISOString()}.csv`);
  }
}
