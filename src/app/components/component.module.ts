import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* ANGULAR MATERIAL UI */
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NgxEchartsModule } from 'ngx-echarts';
import { TranslateModule } from '@ngx-translate/core';
import { TreeviewModule } from 'ngx-treeview';
import { DataTablesModule } from 'angular-datatables';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { ClipboardModule } from 'ngx-clipboard';
import { NestableModule } from 'ngx-nestable';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgxPanZoomModule } from 'ngx-panzoom';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
  NgxMatNativeDateModule,
} from '@angular-material-components/datetime-picker';

/* SERVICES */
import { DataTableService } from 'src/app/libs/services';

/* DATA VISUALIZATION */
import { LeftbarChartVisualizationComponent } from './sidebars/datavisualization/chart/leftsidebarvisualization.component';
import { LeftSidebarDashboardVisualizationComponent } from './sidebars/datavisualization/dashboard/leftsidebardashboardvisualization.component';
import { RightbarChartVisualizationComponent } from './sidebars/datavisualization/chart/rightsidebarvisualization.component';
import { RightSidebarDashboardVisualizationComponent } from './sidebars/datavisualization/dashboard/rightsidebardashboardvisualization.component';
import { TopbarChartVisualizationComponent } from './topbar/datavisualization/chart/topbardatavisualization.component';
import { TopbarDashboardVisualizationComponent } from './topbar/datavisualization/dashboard/topbardashboardvisualization.component';

/* DATA PROCESSING */
import { DataSourcSidebarCommponent } from './sidebars/dataprocessing/data-source/data-source.component';
import { DataProcessingPqlComponent } from './workspaces/data-processing-pql/data-processing-pql.component';
import { DataProcessingResultComponent } from './workspaces/data-processing-result/data-processing-result.component';
import { DataProcessingTopbarComponent } from './topbar/dataprocessing/data-processing-topbar/data-processing-topbar.component';
import { DataProcessingWorkspaceComponent } from './workspaces/data-processing-workspace/data-processing-workspace.component';
import { QueryCommandItemComponent } from './query-command-item/query-command-item.component';
import { QueryCommandSidebarCommponent } from './sidebars/dataprocessing/query-command/query-command.component';

import { ModalComponent } from './modals/modal/modal.component';

/* MODULES */
import { LibModule } from 'src/app/libs/lib.module';
import { PartialModule } from '../../will-be-removed/partials/partial.module';
import { LayoutModule } from '../layouts/layout.module';

/* DIALOGS */
import { DialogAlertComponent } from './dialogs/dialogAlert/dialog-alert.component';
import { DialogCommonComponent } from './dialogs/dialog-common/dialog-common.component';
import { DialogDeleteEntityComponent } from './dialogs/dialogDeleteEntity/dialog-delete-entity.component';

/* MODALS */
import { ModalAddValueComponent } from './modals/modalAddValue/modal-add-value.component';
import { ModalAddFolderComponent } from './modals/modalAddFolder/modal-add-folder.component';
import { ModalApiConnectorComponent } from './modals/modalApiConnector/modal-api-connector.component';
import { ModalColorPickerComponent } from './modals/modalColorPicker/modal-color-picker.component';
import { ModalColumnWidthSettingComponent } from './modals/modalColumWidthSetting/modal-column-width-setting.component';
import { ModalComparisonComponent } from './modals/modalComparison/modal-comparison.component';
import { ModalCustomColorComponent } from './modals/modalCustomColor/modal-custom-color.component';
import { ModalCustomColumnFormatComponent } from './modals/modalColumnFormat/modal-column-format.component';
import { ModalCustomConditionComponent } from './modals/modalCustomCondition/modal-custom-condition.component';
import { ModalDatabaseConnectorComponent } from './modals/modalDatabaseConnector/modal-database-connector.component';
import { ModalDataSourceConnectorComponent } from './modals/modalDataSourceConnector/modal-data-source-connector.component';
import { ModalDuplicateChartComponent } from './modals/modalDuplicateChart/modal-duplicate-chart.component';
import { ModalDuplicateQueryComponent } from './modals/ModalDuplicateQuery/modal-duplicate-query.component';
import { ModalFormulaEditorComponent } from './modals/ModalFormulaEditor/modal-formula-editor.component';
import { ModalFormulaNotificationsComponent } from './modals/modalFormulaNotifications/modal-formula-notifications.component';
import { ModalGlossaryComponent } from './modals/modalGlossary/modalGlossary';
import { ModalLoginListComponent } from './modals/modalLoginList/modalLoginList';
import { ModalMetricLegendComponent } from './modals/modalMetricLegend/modal-metric-legend';
import { ModalMarkupCSSComponent } from './modals/modalMarkup/modalCss/modal-markup-css.component';
import { ModalMarkupJSComponent } from './modals/modalMarkup/modalJs/modal-markup-js.component';
import { ModalMarkupCodeComponent } from './modals/modalMarkup/modalCode/modal-markup-code.component';
import { ModalNotificationsComponent } from './modals/modalNotifications/modal-notifications.component';
import { ModalQueryComponent } from './modals/modalQuery/modal-query.component';
import { ModalViewQueryInformationComponent } from './modals/modalViewQueryInformation/modal-query-information.component';
import { ModalRenameFileFolderComponent } from './modals/ModalRenameFileFolder/modal-rename-file-folder.component';
import { ModalSaveChartComponent } from './modals/modalSaveChart/modal-save-chart.component';
import { ModalTextAreaComponent } from './modals/ModalTextArea/modal-text-area.component';
import { ModalWizardComponent } from './modals/modalWizard/modal-wizard';
import { ModalHadoopConnectorComponent } from './modals/modalHadoopConnector/modal-hadoop-connector.component';

/* MENU BUILDER */
import { LeftbarMenuBuilderComponent } from './sidebars/menubuilder/leftsidebar/leftsidebar.component';
import { RightbarMenuBuilderComponent } from './sidebars/menubuilder/rightbar/rightbarapplication.component';
import { WorkspacesApplicationComponent } from './sidebars/menubuilder/workspaces/workspaces.component';
import { ApplicationPropertyComponent } from './sidebars/menubuilder/rightbar/component/menubuilder/application_property/application_property';
import { TopbarOptionComponent } from './sidebars/menubuilder/rightbar/component/menubuilder/topbar_option/topbar_option';
import { SubTopbarOptionComponent } from './sidebars/menubuilder/rightbar/component/menubuilder/sub_topbar_option/sub_topbar_option';
import { OptionComponent } from './sidebars/menubuilder/rightbar/component/menubuilder/options/option';
import { DashboardOptionComponent } from './sidebars/menubuilder/rightbar/component/dashboard/dashboard_option/dashboard_option';
import { DashboardPropertyComponent } from './sidebars/menubuilder/rightbar/component/dashboard/dashboard_property/dashboard_property';
import { DatasourceChartComponent } from './sidebars/menubuilder/rightbar/component/chart/datasource/datasource';
import { VisualizationTypeComponent } from './sidebars/menubuilder/rightbar/component/chart/visualization_type/visualization_type';
import { QueryComponent } from './sidebars/menubuilder/rightbar/component/chart/query/query';
import { ChartOptionsComponent } from './sidebars/menubuilder/rightbar/component/chart/chart_options/chart_options';
import { TimeComponent } from './sidebars/menubuilder/rightbar/component/chart/time/time';
import { NotificationChartComponent } from './sidebars/menubuilder/rightbar/component/chart/notification/notification';
import { FilterComponent } from './sidebars/menubuilder/rightbar/component/chart/filter/filter';

import { LoadingComponent } from './general/loading/loading.component';
import { SettingMenuComponent } from './general/setting-menu/setting-menu.component';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { HeaderMenuBuilderComponent } from './topbar/datavisualization/menubuilder/header-menubuilder';
import { LoginFormComponent } from './general/login-form/login-form';
import { WorkspaceDashboardsComponent } from './sidebars/datavisualization/dashboard/workspace.component';
import { TooltipsComponent } from './tooltips/tooltips.component';
import { CustomEditorComponent } from './general/editor/angular_editor';
import { CustomDatePickerComponent } from './general/date-picker/custom_date_picker';
import { CustomSelectComponent } from './general/select/select.component';
import { CustomCheckboxComponent } from './general/checkbox/custom_checkbox';
import { ChartGeneralComponent } from './sidebars/menubuilder/rightbar/component/chart/chart_options/general/chart_general';
import { CustomInputComponent } from './general/input/custom_input';
import { ChartFormatComponent } from './sidebars/menubuilder/rightbar/component/chart/chart_options/format/chart_format';
import { ChartColorComponent } from './sidebars/menubuilder/rightbar/component/chart/chart_options/color/chart_color';
import { ChartSortComponent } from './sidebars/menubuilder/rightbar/component/chart/chart_options/sort/chart_sort';
import { DualAxisComponent } from './sidebars/menubuilder/rightbar/component/chart/chart_options/dual_axis/dual_axis';
import { ChartLabelComponent } from './sidebars/menubuilder/rightbar/component/chart/chart_options/label/chart_label';
import { ChartLegendComponent } from './sidebars/menubuilder/rightbar/component/chart/chart_options/legend/chart_legend';
import { CustomDisplayComponent } from './sidebars/menubuilder/rightbar/component/chart/chart_options/custom_display/custom_display';
import { ChartOnDashboardComponent } from './sidebars/menubuilder/rightbar/component/chart/chart_options/chart_on_dashboard/chart_on_dashboard';
import { PaginatorComponent } from './general/tables/paginator/paginator.component';
import { PaginationNumberButtonsComponent } from './general/tables/paginator/paginator.component';
import { TableviewComponent } from './general/tables/tableview/tableview.component';
import { ProgressDialogComponent } from './progress-dialog/progress-dialog.component';
import { ModalIconDefault } from './modals/modalIconDefault/modalIconDefault';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { YearPickerComponent } from './general/date-picker/components/year-picker/year-picker';
import { MonthPickerComponent } from './general/date-picker/components/month-picker/month-picker';
import { SingleDatePickerComponent } from './general/date-picker/components/date-picker/date-picker';
import { ModalShareQueryComponent } from './modals/modalShareQuery/modalShareQuery';

@NgModule({
  declarations: [
    DialogAlertComponent,
    DialogCommonComponent,
    DialogDeleteEntityComponent,
    DataSourcSidebarCommponent,
    DataProcessingPqlComponent,
    DataProcessingResultComponent,
    DataProcessingTopbarComponent,
    DataProcessingWorkspaceComponent,
    LeftSidebarDashboardVisualizationComponent,
    ModalComponent,
    TopbarChartVisualizationComponent,
    QueryCommandItemComponent,
    QueryCommandSidebarCommponent,
    RightbarChartVisualizationComponent,
    TopbarDashboardVisualizationComponent,
    RightSidebarDashboardVisualizationComponent,
    ModalAddFolderComponent,
    ModalApiConnectorComponent,
    ModalQueryComponent,
    ModalViewQueryInformationComponent,
    ModalCustomColorComponent,
    ModalDatabaseConnectorComponent,
    ModalDataSourceConnectorComponent,
    ModalHadoopConnectorComponent,
    ModalMetricLegendComponent,
    ModalColumnWidthSettingComponent,
    ModalCustomColumnFormatComponent,
    ModalAddValueComponent,
    ModalFormulaEditorComponent,
    ModalNotificationsComponent,
    ModalFormulaNotificationsComponent,
    ModalComparisonComponent,
    ModalColorPickerComponent,
    ModalMarkupCSSComponent,
    ModalMarkupJSComponent,
    ModalMarkupCodeComponent,
    ModalRenameFileFolderComponent,
    ModalDuplicateQueryComponent,
    ModalSaveChartComponent,
    ModalDuplicateChartComponent,
    ModalCustomConditionComponent,
    ModalTextAreaComponent,
    LoadingComponent,
    SettingMenuComponent,
    DatepickerComponent,
    LeftbarChartVisualizationComponent,
    LeftbarMenuBuilderComponent,
    RightbarMenuBuilderComponent,
    WorkspacesApplicationComponent,
    ModalLoginListComponent,
    ModalGlossaryComponent,
    HeaderMenuBuilderComponent,
    LoginFormComponent,
    // tambahan module application
    ApplicationPropertyComponent,
    TopbarOptionComponent,
    SubTopbarOptionComponent,
    OptionComponent,
    // tambahan module dashboard
    DashboardOptionComponent,
    DashboardPropertyComponent,
    WorkspaceDashboardsComponent,
    // tambahan module chart
    DatasourceChartComponent,
    VisualizationTypeComponent,
    QueryComponent,
    ChartOptionsComponent,
    TimeComponent,
    NotificationChartComponent,
    FilterComponent,
    TooltipsComponent,
    ModalWizardComponent,
    CustomEditorComponent,
    CustomDatePickerComponent,
    CustomSelectComponent,
    CustomCheckboxComponent,
    CustomInputComponent,
    // chart options
    ChartGeneralComponent,
    ChartFormatComponent,
    ChartColorComponent,
    ChartSortComponent,
    DualAxisComponent,
    ChartLabelComponent,
    ChartLegendComponent,
    CustomDisplayComponent,
    ChartOnDashboardComponent,
    PaginatorComponent,
    PaginationNumberButtonsComponent,
    ProgressDialogComponent,
    TableviewComponent,
    ModalIconDefault,
    YearPickerComponent,
    MonthPickerComponent,
    SingleDatePickerComponent,
    ModalShareQueryComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    RouterModule,
    FormsModule,
    LibModule,
    NgSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatDatepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxMatNativeDateModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MonacoEditorModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    NgxPanZoomModule,
    DragDropModule,
    MatIconModule,
    MatMenuModule,
    TreeviewModule,
    MatNativeDateModule,
    MatPaginatorModule,
    DataTablesModule,
    MatTableModule,
    PartialModule,
    LeafletModule,
    LeafletMarkerClusterModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
    MonacoEditorModule.forRoot(),
    NgbModule,
    ColorPickerModule,
    ClipboardModule,
    NestableModule,
    MatListModule,
    MatButtonModule,
    LayoutModule,
    MatCardModule,
    AngularEditorModule,
    MatGridListModule,
    MatAutocompleteModule,
  ],
  providers: [DataTableService, { provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue: {} }],
  exports: [
    DataSourcSidebarCommponent,
    DataProcessingPqlComponent,
    DataProcessingResultComponent,
    DataProcessingTopbarComponent,
    DataProcessingWorkspaceComponent,
    DialogDeleteEntityComponent,
    ModalComponent,
    TopbarChartVisualizationComponent,
    LeftbarChartVisualizationComponent,
    RightbarChartVisualizationComponent,
    TopbarDashboardVisualizationComponent,
    LeftSidebarDashboardVisualizationComponent,
    RightSidebarDashboardVisualizationComponent,
    QueryCommandItemComponent,
    QueryCommandSidebarCommponent,
    RightbarChartVisualizationComponent,
    TopbarChartVisualizationComponent,
    TopbarDashboardVisualizationComponent,
    LoadingComponent,
    SettingMenuComponent,
    DatepickerComponent,
    LeftbarMenuBuilderComponent,
    RightbarMenuBuilderComponent,
    WorkspacesApplicationComponent,
    HeaderMenuBuilderComponent,
    LoginFormComponent,
    WorkspaceDashboardsComponent,
    TooltipsComponent,
    CustomEditorComponent,
    CustomDatePickerComponent,
    PaginatorComponent,
    ProgressDialogComponent,
    TableviewComponent,
    CustomSelectComponent,
  ],
})
export class ComponentModule {}
