import {
  Component,
  OnInit,
  Output,
  Input,
  EventEmitter,
  HostBinding,
  AfterViewInit,
  ViewChild,
  ElementRef,
  ViewContainerRef,
} from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

declare var require: any;
require('echarts-wordcloud');

@Component({
  selector: 'pq-chartdetailasync',
  templateUrl: './chartdetailasync.component.html',
  styleUrls: ['./chartdetailasync.component.scss'],
})
export class ChartddetailasyncComponent implements OnInit, AfterViewInit {
  @ViewChild('screen', { static: false }) screen: ElementRef;
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @ViewChild('downloadLink', { static: false }) downloadLink: ElementRef;

  @HostBinding('id') id: string;
  @HostBinding('class') class: string;
  @Input() myChartID: string;
  @Input() typeChart: string;
  @Input() data: any;
  @Input() title: string;
  @Input() autoResize: any;
  @Input() isDrag: any;
  @Input() isView: boolean;
  @Input() mapGeoJSON: any;
  @Input() url: string;
  @Input() slug: string;
  @Input() index: number;
  @Input() themes: any;
  @Input() columns: any;
  @Input() records: any;
  @Input() explore: any;
  @Input() exploreJson: any;
  @Input() extra: any;
  @Input() coloringPie: any;
  @Input() displayedColums: any;
  @Input() token: any;

  @Output() openModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<string> = new EventEmitter<string>();
  @Output() download: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() width: EventEmitter<any> = new EventEmitter<any>();
  @Output() filter: EventEmitter<any> = new EventEmitter<any>();

  myHtml: SafeHtml;
  typeHtml: string;
  isMatchColumn: boolean = false;
  constructor(public viewContainerRef: ViewContainerRef) {}

  ngOnInit() {
    let me = this;
    me.id = me.index + '_' + me.typeChart + '_' + me.myChartID;
    this.isView = this.isView ? this.isView : false;
    me.class = 'col-md-12';
  }

  ngAfterViewInit() {
    let card = document.getElementById(this.id);
  }

  onRefresh(id) {
    this.refresh.emit({
      id: id,
      index: this.index,
      mapGeoJSON: this.mapGeoJSON,
    });
  }

  onEdit(id) {
    this.edit.emit(id);
  }

  onWidth(e) {
    let me = this;
    this.width.emit({
      id: me.id,
      col: e,
      row: 0,
      size_x: 0,
      size_y: 0,
      slice_id: this.myChartID,
    });
  }

  onDownload(id) {
    this.download.emit({ id: id, url: this.url });
  }

  onDelete() {
    this.delete.emit(this.index);
  }

  onOpenModal(explore) {
    this.openModal.emit(explore);
  }

  onFilter(e) {
    this.filter.emit({
      id: e.id,
      data: e.data,
      filter: e.filter,
      url: this.url,
      slug: this.slug,
    });
  }
}
