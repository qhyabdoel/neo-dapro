// Angular
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { TranslateModule } from '@ngx-translate/core';
// Components
// Material

import { HttpUtilsService, InterceptService, LayoutUtilsService, TypesUtilsService } from 'src/app/libs/services';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { PartialModule } from 'src/will-be-removed/partials/partial.module';
import { NotificationsComponent } from './notification.component';
import { NotificationsListComponent } from './notification-list/list/list.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsEditComponent } from './notification-list/notification-edit/notification-edit.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { NotificationsRecipientComponent } from './notification-list/recipient/recipient.component';
import { NotificationsTemplatesComponent } from './notification-list/templates/templates.component';
import { ManualComponent } from './notification-list/manual/form-manual.component';
import { ComponentModule } from 'src/app/components/component.module';

import { MatInputModule } from '@angular/material/input';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
const routes: Routes = [
  {
    path: '',
    component: NotificationsComponent,
    children: [
      {
        path: 'list',
        component: NotificationsListComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationsListComponent,
    NotificationsEditComponent,
    NotificationsRecipientComponent,
    NotificationsTemplatesComponent,
    ManualComponent,
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
    MatTooltipModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatOptionModule,
    ComponentModule,

    MatInputModule,
    AngularEditorModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
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
  ],
  entryComponents: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NotificationsModule {}
