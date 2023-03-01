import { Component, OnInit, AfterViewInit, Input, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { copy_url } from 'src/app/libs/helpers/utility';
import { ApiService, JsonService, LayoutUtilsService } from 'src/app/libs/services';

@Component({
  selector: 'topbar-dashboard-visualization',
  templateUrl: './topbardashboardvisualization.component.html',
})
export class TopbarDashboardVisualizationComponent implements OnInit {
  @Input() dashboardTitle;
  @Input() charts;
  @Input() buttonSave: () => void;
  @Input() buttonNew: () => void;
  @Input() removeDashboardFromContent: () => void;

  public messages: any;
  public isLoadingContent: boolean = false;
  public shareUrl: string = '';
  public paramEdit: ParamEditDashboard;
  constructor(
    private _apicall: ApiService,
    private route: Router,
    private jsonService: JsonService,
    private activedRoute: ActivatedRoute,
    private layoutUtilsService: LayoutUtilsService
  ) {}

  ngOnInit() {
    this.getMessage();
  }

  getMessage = async () => {
    this.messages = await this.jsonService.retMessage();
  };

  getParameter = () => {
    this.activedRoute.queryParams.subscribe((params) => {
      if ('id' in params) {
        //artinya ada parameter atau edit data assign id nya ke parameter id
        this.paramEdit.id = parseInt(params['id']);
        this.paramEdit.slug = params['link'];
      }
    });
  };

  async handlePreview() {
    if (this.paramEdit.slug != '') {
      this.route.navigate(['/pds/dashboard/view'], {
        queryParams: { link: this.paramEdit.slug },
      });
    } else {
      this._apicall.openModal(this.messages.DASHBOARD.W, this.messages.DASHBOARD.MSG_PSDF);
    }
  }

  async handleShareUrl() {
    // set data share url with token
    let url = location.origin + '/#/pdsshare/dashboard/view/shared?token=' + this.shareUrl;
    copy_url(url);
    this._apicall.openModal(this.messages.DASHBOARD.S, this.messages.DASHBOARD.MSG_DSC);
  }
}
