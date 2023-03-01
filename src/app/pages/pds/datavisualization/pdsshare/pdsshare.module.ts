import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Routes, RouterModule } from '@angular/router';
import { TreeviewModule } from 'ngx-treeview';

import { NgbModule, NgbAlertConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { HighlightModule } from 'ngx-highlightjs';
import { HighlightPlusModule } from 'ngx-highlightjs/plus';
import { EditorComponent, MonacoEditorModule } from 'ngx-monaco-editor';
import { AngularDraggableModule } from 'angular2-draggable';
import { ColorPickerModule } from 'ngx-color-picker';
import { TranslateModule } from '@ngx-translate/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { EffectsModule } from '@ngrx/effects';

import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { LibModule } from 'src/app/libs/lib.module';
import { ComponentModule } from 'src/app/components/component.module';
import { PartialModule } from 'src/will-be-removed/partials/partial.module';

import { HttpUtilsService, TypesUtilsService, InterceptService, LayoutUtilsService } from 'src/app/libs/services';

import { LayoutModule } from 'src/app/layouts/layout.module';
import { ChartModule } from 'src/app/components/chartasync';

// import { DataProcessingService } from 'src/app/libs/services';

import { DataVisualizationEffects } from 'src/app/libs/store/effects/pds/datavisualization/datavisualization.effect';
import { DataVisualizationService } from 'src/app/libs/services';
import { MatDialogModule } from '@angular/material/dialog';
import { ClipboardModule } from 'ngx-clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PdsShareComponent } from './pdsshare.component';
import { DashboardViewShareComponent } from './dashboardviewShare/dashboardviewshared.component';
import { ChartShareComponent } from './chartShare/chartShare.component';
import { NestableModule } from 'ngx-nestable';
import { PdsModule } from '../../pds.module';

const routes: Routes = [
  {
    path: '',
    component: PdsShareComponent,
    children: [
      // { path: 'sharevisualization', component: ChartShareComponent },
      // { path: "chartdetailasync", component: ChartddetailasyncComponent, },
      // { path: 'dashboard/view/shared', component: EditorComponent },
    ],
  },
];

@NgModule({
  declarations: [DashboardViewShareComponent, PdsShareComponent, ChartShareComponent],
  imports: [
    AngularDraggableModule,

    CommonModule,
    ColorPickerModule,
    DragDropModule,
    EffectsModule.forFeature([DataVisualizationEffects]),
    FormsModule,
    HighlightModule,
    HighlightPlusModule,
    LeafletModule,
    LibModule,
    MatIconModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTreeModule,
    MatMenuModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatRadioModule,
    MatChipsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatSortModule,
    MatPaginatorModule,
    MonacoEditorModule.forRoot(),
    NgbModule,
    NgSelectModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ScrollingModule,
    TranslateModule.forChild(),
    TreeviewModule.forRoot(),
    ComponentModule,
    PartialModule,
    LayoutModule,
    ChartModule,
    MatDialogModule,
    ClipboardModule,
    MatTooltipModule,
    NestableModule,
    PdsModule,
  ],
  exports: [RouterModule, DashboardViewShareComponent],
  providers: [
    // DataProcessingService,
    DataVisualizationService,
    InterceptService,
    NgbAlertConfig,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true,
    },
    HttpUtilsService,
    TypesUtilsService,
    LayoutUtilsService,
  ],
})
export class PdsShareModule {}
