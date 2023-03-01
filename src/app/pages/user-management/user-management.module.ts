// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// NGRX
//import { StoreModule } from '@ngrx/store';
//import { EffectsModule } from '@ngrx/effects';
// Translate
import { TranslateModule } from '@ngx-translate/core';
// import { PartialsModule } from '../../partials/partials.module';
// Services
// import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService} from '../../../core/_base/crud';
// Shared
// import { ActionNotificationComponent } from '../../partials/content/crud';
// Components
import { UserManagementComponent } from './user-management.component';
// import { SystemInformationComponent } from './system-information/system-information.component';
// import { SystemConfigurationComponent } from './system-configuration/system-configuration.component';
// Material

// import { AdminGuard } from '../../../core/auth';
// import { UsersListsComponent } from './users/users-lists/users-lists.component';
// import { RolesListComponent } from './roles/roles-list/roles-list.component';
// import { RoleEditDialogComponent } from './roles/role-edit/role-edit.dialog.component';
import { DataTablesModule } from 'angular-datatables';
// import { HighlightJsModule, HighlightJsService } from 'angular2-highlight-js';
// import { UpdateConfiguration } from './system-configuration/update-configuration/update-configuration.component';
// import {AuditTrailService} from '../../../core/notification-center';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpUtilsService, InterceptService, LayoutUtilsService, TypesUtilsService } from 'src/app/libs/services';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { UsersListComponent } from './user/user-list/user-list.component';
import { AdminGuard } from 'src/app/libs/guards/admin.guard';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UserAddEditComponent } from './user/user-action/user-add-edit/user-add-edit.component';
import { MatOptionModule } from '@angular/material/core';
import { PartialModule } from 'src/will-be-removed/partials/partial.module';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { AuditTrailComponent } from './user/user-action/audit-trail/audit-trail-component';
import { GroupAddEditComponent } from './user/user-action/group-add-edit/group-add-edit.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RoleEditDialogComponent } from './user/user-action/role-add-edit/role-edit.dialog.component';
import { ComponentModule } from 'src/app/components/component.module';
import { SettingMenuComponent } from 'src/app/components/general/setting-menu/setting-menu.component';
import { AuditTrailService } from 'src/app/libs/services';
import { MatCardModule } from '@angular/material/card';
// import { BrowserModule } from '@angular/platform-browser';

const routes: Routes = [
  {
    path: '',
    component: UserManagementComponent,
    children: [
      {
        path: 'users',
        // canActivate: [AdminGuard],
        component: UsersListComponent,
      },
      // {
      // 	path: 'system-information',
      // 	component: SystemInformationComponent
      // },
      // {
      // 	path: 'system-configuration',
      // 	component: SystemConfigurationComponent
      // }
    ],
  },
];

@NgModule({
  declarations: [
    UserManagementComponent,
    UsersListComponent,
    UserAddEditComponent,
    AuditTrailComponent,
    GroupAddEditComponent,
    RoleEditDialogComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    PartialModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    MatTableModule,
    MatPaginatorModule,
    DataTablesModule,
    NgbNavModule,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatSortModule,
    MatProgressBarModule,
    ComponentModule,
    MatCardModule,
  ],
  providers: [
    InterceptService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true,
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        hasBackdrop: true,
        panelClass: 'kt-mat-dialog-container__wrapper',
        height: 'auto',
        width: '900px',
      },
    },
    HttpUtilsService,
    TypesUtilsService,
    LayoutUtilsService,
    // HighlightJsService,
    AuditTrailService,
  ],
  entryComponents: [],
})
export class UserManagementModule {}
