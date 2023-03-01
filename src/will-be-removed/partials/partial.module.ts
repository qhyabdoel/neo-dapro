import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DataTablesModule } from 'angular-datatables';

import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

import { LibModule } from 'src/app/libs/lib.module';

import {
  ActionNotificationComponent,
  AlertComponent,
  BottomSheetComponent,
  ChangepasswordDialogComponent,
  ChooseRadioDialogComponent,
  ConfirmEntityDialogComponent,
  DeleteEntityDialogComponent,
  FetchEntityDialogComponent,
  OverwriteDialogComponent,
  RequestResetPasswordDialogComponent,
  SaveEntityDialogComponent,
  UpdateStatusDialogComponent,
} from './content';

import {
  CartComponent,
  QuickActionComponent,
  Subheader1Component,
  Subheader2Component,
  Subheader3Component,
  Subheader4Component,
  Subheader5Component,
  SubheaderSearchComponent,
  SearchResultComponent,
  SplashScreenComponent,
  SearchDefaultComponent,
  SearchDropdownComponent,
  UserProfile2Component,
  UserProfile3Component,
} from './layout';

@NgModule({
  declarations: [
    ActionNotificationComponent,
    AlertComponent,
    BottomSheetComponent,
    ChangepasswordDialogComponent,
    ChooseRadioDialogComponent,
    ConfirmEntityDialogComponent,
    DeleteEntityDialogComponent,
    FetchEntityDialogComponent,
    OverwriteDialogComponent,
    RequestResetPasswordDialogComponent,
    SaveEntityDialogComponent,
    UpdateStatusDialogComponent,

    CartComponent,

    QuickActionComponent,
    Subheader1Component,
    Subheader2Component,
    Subheader3Component,
    Subheader4Component,
    Subheader5Component,
    SubheaderSearchComponent,
    SearchResultComponent,
    SplashScreenComponent,
    SearchDefaultComponent,
    SearchDropdownComponent,

    UserProfile2Component,
    UserProfile3Component,
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    FormsModule,
    InlineSVGModule,
    LibModule,
    MatButtonModule,
    MatMenuModule,
    MatSelectModule,
    MatInputModule,
    MatTableModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatIconModule,
    MatNativeDateModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSidenavModule,
    MatListModule,
    NgbDropdownModule,
    NgbTooltipModule,
    PerfectScrollbarModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule.forChild(),
  ],
  exports: [
    ActionNotificationComponent,
    AlertComponent,
    BottomSheetComponent,
    ChangepasswordDialogComponent,
    ChooseRadioDialogComponent,
    ConfirmEntityDialogComponent,
    DeleteEntityDialogComponent,
    FetchEntityDialogComponent,
    OverwriteDialogComponent,
    RequestResetPasswordDialogComponent,
    SaveEntityDialogComponent,
    UpdateStatusDialogComponent,
    CartComponent,
    QuickActionComponent,
    Subheader1Component,
    Subheader2Component,
    Subheader3Component,
    Subheader4Component,
    Subheader5Component,
    SubheaderSearchComponent,
    SearchResultComponent,
    SplashScreenComponent,
    SearchDefaultComponent,
    SearchDropdownComponent,

    // UserProfileComponent,
    UserProfile2Component,
    UserProfile3Component,
  ],
})
export class PartialModule {}
