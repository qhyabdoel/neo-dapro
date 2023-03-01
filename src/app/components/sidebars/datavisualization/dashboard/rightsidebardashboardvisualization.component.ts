import { Component, OnInit, ChangeDetectorRef, AfterViewInit, Input } from '@angular/core';
import { LayoutUtilsService, JsonService, ApiService } from 'src/app/libs/services';
@Component({
  selector: 'rightbar-dashboard-visualization',
  templateUrl: './rightsidebardashboardvisualization.component.html',
})
export class RightSidebarDashboardVisualizationComponent implements OnInit, AfterViewInit {
  // additional dashboard
  @Input() paramEdit;
  @Input() messages;
  @Input() charts;
  @Input() chartList;
  @Input() refreshDashboard: (paramEdit) => void;
  @Input() removeDashboardFromContent: () => void;
  @Input() initial: () => void;
  @Input() loadDashboard: () => void;
  @Input() loadChart: () => void;
  @Input() initialDragDrop: () => void;
  // boolean
  isRightToggle: boolean = false;

  // array
  component: any = [];
  chartSelected: any = [];

  constructor(
    private layoutUtilsService: LayoutUtilsService,
    private changeDetectordRef: ChangeDetectorRef,
    // private store: Store<AppState>,
    private jsonService: JsonService,
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    this.chartSelected = this.charts;
  }

  ngAfterViewInit() {
    this.chartSelected = this.charts;
  }

  public activeColapse: any = {
    dashboardProperty: true,
    dashboardOptions: false,
  };

  // collapse accordion on click have 2 options
  // dashboard property and dashboard options
  // default dashboardProperty is open
  collapseOnClick(collapseType: string) {
    this.activeColapse = { ...this.activeColapse, [collapseType]: !this.activeColapse[collapseType] };
  }

  // hide and show right bar
  // default idenity is true
  hideAndShowRightbar() {
    this.isRightToggle = !this.isRightToggle;
    this.layoutUtilsService.addRemoveBodyClass('right', false, this.isRightToggle);
  }

  async onChartDeleteInSelect(item) {
    // let componentRef = this.component.filter((x) => x.instance.myChartID === item.value.id)[0];
    // let vcrIndex: number = this.injectComp.viewContainerRef.indexOf(componentRef);
    // this.injectComp.viewContainerRef.remove(vcrIndex);
    // this.component = this.component.filter((x) => x.instance.index !== item.index);
    // this.charts = this.charts.filter((x) => x.id !== item.value.id);
    // window.dispatchEvent(new Event('resize'));
    this.changeDetectordRef.detectChanges();
  }

  async delete(type, item) {
    this.messages = await this.jsonService.retMessage();
    const dialogRef = this.layoutUtilsService.deleteElement(
      this.messages.DASHBOARD.C,
      this.messages.DASHBOARD.MSG_DN + ' ' + type + '?',
      type + this.messages.DASHBOARD.DN
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }

      if (type == 'dashboard') {
        // console.log(item.id);
        await this.apiService.getApi(`/api/dashboard/delete?id=${item.id}`, true);
        this.initial();
        this.removeDashboardFromContent();
        this.loadDashboard();
      }
      if (type == 'chart') {
        // return await this.store.dispatch(DeleteChart(item.id));
        this.initial();
        this.removeDashboardFromContent();
        this.loadChart();
      }
    });
    this.changeDetectordRef.detectChanges();
  }
}
