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
import { MonacoEditorModule } from 'ngx-monaco-editor';
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
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule,
} from '@angular-material-components/datetime-picker';

import { LibModule } from 'src/app/libs/lib.module';
import { ComponentModule } from 'src/app/components/component.module';
import { PartialModule } from 'src/will-be-removed/partials/partial.module';

import {
  ApplicationService,
  DatasetService,
  DatasourceService,
  HttpUtilsService,
  InterceptService,
  LayoutUtilsService,
  TypesUtilsService,
  WorkspaceService,
} from 'src/app/libs/services';

import { DataprocessingComponent } from './dataprocessing/dataprocessing.component';
import { PdsComponent } from './pds.component';
import { LayoutModule } from 'src/app/layouts/layout.module';
import { DatavisualizationComponent } from './datavisualization/charteditor/datavisualization.component';
import { DashboardeditorComponent } from './datavisualization/dashboardeditor/dashboardeditor.component';
import { ChartddetailasyncComponent } from './datavisualization/chartdetailasync/chartdetailasync.component';
import { ChartModule } from 'src/app/components/chartasync';
import { DashboarddetailasyncComponent } from './datavisualization/dashboarddetailasync/dashboarddetailasync.component';
import { DashboardviewComponent } from './datavisualization/dashboardview/dashboardview.component';

import { DataProcessingEffects } from 'src/app/libs/store/effects/pds/dataprocesssing.effects';
import { DataVisualizationEffects } from 'src/app/libs/store/effects/pds/datavisualization/datavisualization.effect';
import { DataVisualizationService } from 'src/app/libs/services';
import { MatDialogModule } from '@angular/material/dialog';
import { ModalTooltipsComponent } from 'src/app/components/modals/modalTooltips/modal-tooltips.component';
import { ClipboardModule } from 'ngx-clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
// import { GridsterModule } from 'angular-gridster2';
import { CardComponent } from 'src/app/components/card/card.component';
import { CardChildComponent } from 'src/app/components/card/cardChild/card-child.component';

// import { NestableModule } from 'ngx-nestable';
import { ContentCardListComponent } from 'src/app/layouts/content/list/list.component';
import { EditorVisualizationComponent } from './menubuilder/editor/editor.component';
import { ApplicationviewComponent } from './menubuilder/applicationview/applicationview.component';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { NestableModule } from 'ngx-nestable';
import { MatButtonModule } from '@angular/material/button';
import { EditorComponent } from './datavisualization/editor-visualization/editor.visualization.component';
import { ToastrComponent } from 'src/app/components/toastr/toastr.component';

const routes: Routes = [
  {
    path: '',
    component: PdsComponent,
    children: [
      { path: 'dataprocessing', component: DataprocessingComponent },
      // Main Dashboard Data Visualization
      { path: 'listdatavisualization', component: ContentCardListComponent },
      // Chart Data Visualization
      // { path: 'newdatavisualization', component: DatavisualizationComponent },
      // { path: 'datavisualization', component: DatavisualizationComponent },

      // Dashboard Data Visualization
      { path: 'dashboardvisualization', component: ContentCardListComponent },
      // { path: 'dashboardeditor', component: DashboardeditorComponent },
      // { path: 'dashboard/view', component: DashboardviewComponent },
      { path: 'dashboard/view/shared', component: EditorComponent },
      // Menu Builder / Application
      { path: 'applicationlist', component: ContentCardListComponent },
      // { path: 'applicationbuilder_app', component: EditorVisualizationComponent },
      // { path: 'app_preview', component: ApplicationviewComponent },
      { path: 'app_preview', component: EditorComponent },

      // coba terbaru general component
      { path: 'newdatavisualization', component: EditorComponent },
      { path: 'datavisualization', component: EditorComponent },
      { path: 'dashboardeditor', component: EditorComponent },
      { path: 'applicationbuilder_app', component: EditorComponent },
      { path: 'dashboard/view', component: EditorComponent },
      { path: 'sharevisualization', component: EditorComponent },
    ],
  },
];

@NgModule({
  declarations: [
    DataprocessingComponent,
    PdsComponent,
    DatavisualizationComponent,
    DashboardeditorComponent,
    ChartddetailasyncComponent,
    DashboarddetailasyncComponent,
    DashboardviewComponent,
    ModalTooltipsComponent,
    CardComponent,
    CardChildComponent,
    EditorVisualizationComponent,
    ApplicationviewComponent,
    // coba
    EditorComponent,
    ToastrComponent,
  ],
  imports: [
    AngularDraggableModule,

    CommonModule,
    ColorPickerModule,
    DragDropModule,
    EffectsModule.forFeature([DataProcessingEffects, DataVisualizationEffects]),
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
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
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
    MatListModule,
    DragDropModule,
    MatExpansionModule,
    NestableModule,
    MatButtonModule,
  ],
  exports: [RouterModule],
  providers: [
    ApplicationService,
    DatasetService,
    DatasourceService,
    DataVisualizationService,
    HttpUtilsService,
    InterceptService,
    LayoutUtilsService,
    NgbAlertConfig,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true,
    },
    TypesUtilsService,
    WorkspaceService,
  ],
})
export class PdsModule {}
