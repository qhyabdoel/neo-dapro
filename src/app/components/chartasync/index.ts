import { NgModule } from '@angular/core';
import { Pie2Component } from './pie/pie2.component';
import { Bignumber2Component } from './bignumber/bignumber2.component';
import { Markup2Component } from './markup/markup2.component';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { Filterbox2Component } from './filterbox/filterbox2.component';
import { Bar2Component } from './bar/bar2.component';
import { HistogramComponent } from './histogram/histogram.component';
import { Line2Component } from './line/line2.component';
import { D3DirectedForceComponent } from './d3-directed-force/d3-directed-force.component';
import { Tableview2Component } from './tableview/tableview2.component';
import { Treemap2Component } from './treemap/treemap2.component';
import { Gauge2Component } from './gauge/gauge2.component';
import { SunburstComponent } from './sunburst/sunburst.component';
import { Countrymap2Component } from './countrymap/countrymap2.component';
import { D3CloudComponent } from './d3-cloud/d3-cloud.component';
import { Pivot2Component } from './pivot/pivot2.component';
import { TableComparison2Component } from './tablecomparison/tablecomparison2.component';
import { Bubble2Component } from './bubble/bubble2.component';
// import { Mapoverlay2Component } from './mapoverlay/mapoverlay2.component';
// import { Scatter2Component } from './scatter/scatter2.component';
import { Predictive2Component } from './predictive/predictive2.component';
import { BasicChartComponent } from './basic/basic.component';

import { TableComparisonComponent } from './basic/components/table-comparison/table-comparison.component';

// Modul yang digunakan oleh chart detail
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxEchartsModule } from 'ngx-echarts';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TreeviewModule } from 'ngx-treeview';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { LibModule } from 'src/app/libs/lib.module';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DataTablesModule } from 'angular-datatables';
import { MatTableModule } from '@angular/material/table';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletMarkerClusterModule } from '@asymmetrik/ngx-leaflet-markercluster';
import { MatInputModule } from '@angular/material/input';
import { PartialModule } from 'src/will-be-removed/partials/partial.module';
import { BoxplotComponent } from './boxplot/boxplot2.component';
import { ComponentModule } from 'src/app/components/component.module';
import { MatSortModule } from '@angular/material/sort';
import { ChartBigNumberComponent } from './basic/components/bignumber/bignumber.component';
import { ChartTableComponent } from './basic/components/table/table.component';
import { ChartFilterBoxComponent } from './basic/components/filterbox/filterbox.component';

@NgModule({
  declarations: [
    Pie2Component,
    Bignumber2Component,
    Markup2Component,
    HeatmapComponent,
    Filterbox2Component,
    Bar2Component,
    HistogramComponent,
    Line2Component,
    D3DirectedForceComponent,
    Tableview2Component,
    Treemap2Component,
    Gauge2Component,
    SunburstComponent,
    Countrymap2Component,
    D3CloudComponent,
    Pivot2Component,
    TableComparison2Component,
    Bubble2Component,
    Predictive2Component,
    BoxplotComponent,
    BasicChartComponent,
    TableComparisonComponent,
    ChartBigNumberComponent,
    ChartTableComponent,
    ChartFilterBoxComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    RouterModule,
    FormsModule,
    LibModule,
    NgSelectModule,
    MatRadioModule,
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    DragDropModule,
    FormsModule,
    LibModule,
    MatIconModule,
    MatMenuModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    TreeviewModule,
    MatNativeDateModule,
    MatPaginatorModule,
    DataTablesModule,
    MatTableModule,
    PartialModule,
    LeafletModule,
    LeafletMarkerClusterModule,
    MatInputModule,
    MatSortModule,
    ComponentModule,
  ],
  exports: [
    Pie2Component,
    Bignumber2Component,
    Markup2Component,
    HeatmapComponent,
    Filterbox2Component,
    Bar2Component,
    HistogramComponent,
    Line2Component,
    D3DirectedForceComponent,
    Tableview2Component,
    Treemap2Component,
    Gauge2Component,
    SunburstComponent,
    Countrymap2Component,
    D3CloudComponent,
    Pivot2Component,
    TableComparison2Component,
    Bubble2Component,
    // Mapoverlay2Component,
    // Scatter2Component,
    Predictive2Component,
    BoxplotComponent,
    BasicChartComponent,
    TableComparisonComponent,
  ],
})
export class ChartModule {}
