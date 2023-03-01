import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { InjectDirective } from 'src/app/libs/directives';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';
import {
  sharedChartDataSelector,
  sharedDashboardDataSelector,
} from 'src/app/libs/store/selectors/datavisualization.selector';
import { findTypeCheckByUrl } from 'src/app/libs/helpers/data-visualization-helper';

@Component({
  selector: 'pq-card',
  templateUrl: './card.component.html',
})
export class CardComponent implements OnInit {
  constructor(private store: Store<AppState>, private cdRef: ChangeDetectorRef) {}

  @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;

  // get component ref from outside
  @Input() createChildComponent: (chartIndex?: any) => void;

  @Input() title: string;
  @Input() hasActivity: boolean;
  @Input() eventButtonData: any;
  @Input() id: any;
  @Input() isSharedPage: any;
  @Output() onEventButtonClick: EventEmitter<any> = new EventEmitter<any>();

  // Input from dashboard
  @Input() chartIndex: number;

  formData: any;
  borderStyle: any;
  typePage: string;
  typeChart: string;
  ngAfterViewInit(): void {
    this.createChildComponent(this.chartIndex);
    this.cdRef.detectChanges();
  }
  ngOnInit() {
    this.typePage = findTypeCheckByUrl();

    if (['dashboard', 'dashboardview', 'app_preview'].includes(this.typePage)) {
      this.store
        .select(sharedDashboardDataSelector)
        .pipe()
        .subscribe((result) => {
          if (this.chartIndex !== undefined && result) {
            const chartData = result.dashboardCharts[this.chartIndex];
            this.setCardData(chartData);
          }
        });
    } else {
      this.store
        .select(sharedChartDataSelector)
        .pipe()
        .subscribe((result) => {
          this.setCardData(result);
        });
    }
  }

  setCardData(cardData: any) {
    if (cardData) {
      // share variable
      this.title = cardData.title;
      this.hasActivity = cardData.hasActivity;
      this.formData = cardData.exploreJson.form_data;
      this.typeChart = cardData.exploreJson.form_data.viz_type;
      this.borderStyle = this.setBorderStyle(this.formData);

      this.cdRef.detectChanges();
    }
  }

  handleEventButton(type: string) {
    this.onEventButtonClick.emit({ type, slice_id: this.formData.slice_id, element_id: this.id });
  }

  setBorderStyle = (data: any) => {
    if (data.viz_type === 'big_number_total') {
      let styles = [];

      styles['padding'] = '0px';
      styles['margin'] = '0px';

      if (data.show_border && data.border_position && data.border_position !== '') {
        const colorBorder = data.colorpickers[0]?.colorpicker || '#808080';
        const borderPosition = 'border-' + data.border_position;

        styles[borderPosition] = '5px solid ' + colorBorder;
      }

      return styles;
    }
  };
}
