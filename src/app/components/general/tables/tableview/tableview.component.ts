import {
  Component,
  OnDestroy,
  AfterViewInit,
  HostListener,
  Renderer2 as Renderer,
  ElementRef,
  Input,
  ViewChild,
  OnChanges,
  OnInit,
  Output,
  EventEmitter,
} from "@angular/core";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { LayoutConfigService } from "src/app/libs/services";
import { LayoutUtilsService, MessageType } from "src/app/libs/services";
import { DataTableDirective } from "angular-datatables";

import * as objectPath from "object-path";

declare var $: any;

class Person {
  id: number;
  firstName: string;
  lastName: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

class DataSetResponse {
  dataset: any[];
  total: number;
  quid: any;
}

@Component({
  selector: "pq-tableview",
  templateUrl: "./tableview.component.html",
  styleUrls: ["./tableview.component.scss"],
})
export class TableviewComponent
  implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() cardID: string;
  @Input() config: any;
  @Input() columns: any = [];
  @Input() records: any = [];
  @Input() formdata: any;
  @Input() typeRow: string; // keyvalue | array
  @Input() title: string;
  @Input() isTemplate: string;
  @Input() autoResize: boolean;
  @Input() isDrag: boolean;
  @Input() url: string;
  @Input() mapGeoJSON: any;
  @Input() index: number;
  @Output() refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<string> = new EventEmitter<string>();
  @Output() download: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() width: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild("dtTableElement", { static: false }) dtTableElement: ElementRef;
  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;

  dtOptions: any = {};
  mydata: any[] = [];
  persons: Person[];
  det: any;
  dragHandle = false;
  dragBounds = true;
  canDownload = false;
  canOverwrite = false;
  skin = "light";
  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  chkDtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  IsmodelShow: boolean = false;
  newrecords: any;
  activeClass = "";
  myChartID;

  constructor(
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private renderer: Renderer,
    private elementRef: ElementRef,
    private layoutUtilsService: LayoutUtilsService,
    private layoutConfigService: LayoutConfigService
  ) { }

  ngOnInit() {
    const config = this.layoutConfigService.getConfig();
    this.skin = objectPath.get(config, "login.self.skin");
    var idxArr = 0;
    let idx = this.formdata.form_data.timeseries_limit_metric;
    if (idx != "undefined" && idx != null) {
      idxArr = Object.keys(this.records[0]).indexOf(idx);
    }
    const self = this;
    let me = this.config;
    this.newrecords = this.records;
    this.dtOptions = {
      responsive: true,
      pagingType: me.pagingType || "full_numbers",
      serverSide: me.serverSide || false,
      processing: me.processing || false,
      scrollY: me.scrollY || "305px",
      height: "375px",
      autoWidth: true,
      info: me.info || true,
      paging: me.paging || true,
      ordering: me.ordering || true,
      searching: me.searching || true,
      searchPlaceholder: me.searchPlaceholder || "Search",
      lengthMenu: me.lengthMenu || [
        [10, 25, 50, -1],
        [10, 25, 50, "All"],
      ],
      order: [[idxArr, this.formdata.form_data.order_desc ? "desc" : "asc"]],
      language: {
        oPaginate: {
          sNext: '<i class="fa fa-forward"></i>',
          sPrevious: '<i class="fa fa-backward"></i>',
          sFirst: '<i class="fa fa-step-backward"></i>',
          sLast: '<i class="fa fa-step-forward"></i>',
        },
      },
    };
  }

  ngOnChanges(changes: { [propKey: string]: any }) {
    console.log("ngOnChanges", this.typeRow, new Date(), this.records);
    this.typeRow = this.typeRow == "array" ? this.typeRow : "keyvalue";
    let me = changes.config.currentValue;
    var idxArr = 0;
    let idx = this.formdata.form_data.timeseries_limit_metric;
    if (idx != "undefined" && idx != null) {
      idxArr = Object.keys(this.records[0]).indexOf(idx);
    }
    const self = this;
    if (this.records.length > 0 && this.columns.length > 0) {
      this.dtOptions = {
        responsive: true,
        serverSide: true,
        pagingType: me.pagingType || "full_numbers",
        processing: me.processing || false,
        // scrollY: "300px",
        // scrollX: "100%",
        // // height : '100%',//me.height || "305px",
        height: "375px",
        autoWidth: true,
        info: me.info || true,
        paging: me.paging || true,
        ordering: me.ordering || true,
        searching: me.searching || true,
        searchPlaceholder: me.searchPlaceholder || "Search",
        lengthMenu: me.lengthMenu || [
          [10, 25, 50, -1],
          [10, 25, 50, "All"],
        ],
        order: [
          [
            idxArr,
            this.formdata.form_data.order_desc &&
              this.formdata.form_data.order_desc == undefined
              ? "desc"
              : "asc",
          ],
        ],
        language: {
          oPaginate: {
            sNext: '<i class="fa fa-forward"></i>',
            sPrevious: '<i class="fa fa-backward"></i>',
            sFirst: '<i class="fa fa-step-backward"></i>',
            sLast: '<i class="fa fa-step-forward"></i>',
          },
        },
        ajax: (dataTablesParameters: any, callback) => {
          console.log(dataTablesParameters);
          // self.httpClient.post<DataSetResponse>(this.url, me.postParam?me.postParam: {}, {})
          //     .subscribe(resp => {
          //       console.log('resp', resp);
          //       callback({
          //         recordsTotal: resp.quid.rowtotal,
          //         recordsFiltered: resp.quid.rowtotal,
          //         data: []
          //       });
          //     });
        },
      };

      this.dtTrigger.next(1);
    } else {
      this.dtOptions = {
        pagingType: me.pagingType || "full_numbers",
        serverSide: me.serverSide || false,
        processing: me.processing || false,
        scrollY: me.scrollY || "400px",
        info: me.info || true,
        paging: me.paging || true,
        ordering: me.ordering || false,
        searching: me.searching || false,
        searchPlaceholder: me.searchPlaceholder || "Search",
        lengthMenu: me.lengthMenu || [
          [10, 25, 50, -1],
          [10, 25, 50, "All"],
        ],
        ajax: (dataTablesParameters: any, callback) => {
          if (!me.serverSide) {
            self.httpClient.get(me.list.url || "/api/chart/list")
              .pipe(map(self.extractData))
              .subscribe((resp) => {
                self.mydata = resp.hasOwnProperty("response")
                  ? resp["response"]
                  : resp;
                callback({ data: self.mydata });
              });
          } else {
            self.httpClient.post<DataSetResponse>(
              "api/dataset/view?from-load-queries",
              me.postParam ? me.postParam : {},
              {}
            ).subscribe((resp) => {
              console.log(resp.dataset.length);
              let obj = {};
              let b = [];
              self.mydata = Object.keys(resp.dataset).map(function (key) {
                obj = {};
                b = [];
                let n = JSON.parse(resp.dataset[key].columns);
                let m = JSON.parse(resp.dataset[key].rows);
                for (var i = 0;i < n.length;i++) {
                  obj[n[i]] = m[i];
                }
                return obj;
              });
              console.log(JSON.stringify(self.mydata[0]));
              callback({
                recordsTotal: resp.quid.rowtotal,
                recordsFiltered: resp.quid.rowtotal,
                data: self.mydata,
              });
            });
          }
        },
        columns: me.columns,
        rowCallback: (row: Node, data: any[] | Object, index: number) => {
          const self = this;
          $("td", row).unbind("click");
          $(me.rowCallback.rowMustClick, row).bind("click", () => {
            self.eventRowClickHandler(data, me.rowCallback.opt);
          });

          if (me.rowCallback.isLastRowAction) {
            $("td:last-child", row).bind("click", () => {
              self.bindClickToDelete();
            });
          }
          return row;
        },
      };
    }
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(1);
  }

  onRefresh(id) {
    this.refresh.emit({
      id: id,
      index: this.index ? this.index : 0,
      url: this.url ? this.url : "",
      mapGeoJSON: this.mapGeoJSON ? this.mapGeoJSON : null,
    });
  }

  onEdit(id) {
    this.edit.emit(id);
  }

  onChartWidth(cls) {
    let card = document.getElementById(this.cardID);
    card.removeAttribute("class");
    card.className = cls;
    this.activeClass = cls;
    this.width.emit(this.getPosition(cls));
  }

  onDownload(id) {
    this.download.emit({ id: id, url: this.url });
  }

  onDelete(id) {
    this.delete.emit(this.index);
  }

  getPosition(cls) {
    let pos = 1;
    switch (cls) {
      case "col-md-12":
        pos = 1;
        break;
      case "col-md-6":
        pos = 2;
        break;
      case "col-md-4":
        pos = 3;
        break;
      case "col-md-3":
        pos = 4;
        break;
      case "col-md-2":
        pos = 6;
        break;
      case "col-md-9":
        pos = 9;
        break;
      case "col-md-8":
        pos = 8;
        break;
      default:
        break;
    }
    return pos;
  }

  private extractData(res: Response) {
    return res || {};
  }

  async rerender(newSettings?: DataTables.Settings) {
    try {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        if (newSettings) {
          // FIX To ensure that the DT doesn't break when we don't get columns
          if (newSettings.columns && newSettings.columns.length > 1) {
            dtInstance.destroy();
            this.dtOptions = Promise.resolve(newSettings);
            // this.displayTable(this.dtTableElement);
          }
        }
      });
    } catch (error) {
      console.log(`DT Rerender Exception: ${error}`);
    }
    return Promise.resolve(null);
  }

  eventRowClickHandler(info: any, opt: any): void {
    switch (opt) {
      case "ds":
        localStorage.setItem("vizType", JSON.stringify([info]));
        break;
      default:
        this.router.navigate(["../users/edit", info.id], {
          relativeTo: this.activatedRoute,
        });
        break;
    }
    $("label.choose_ds").html(info.name);
    $("button.tutup-modal").trigger("click");
    this.IsmodelShow = true;
  }

  bindClickToDelete(): void {
    const self = this;
    let _title = "Delete Items";
    let _description = "Are you sure to permanently delete selected item?";
    let _waitDesciption = "Item are deleting...";
    let _deleteMessage = "Selected item have been deleted";
    const dialogRef = self.layoutUtilsService.deleteElement(
      _title,
      _description,
      _waitDesciption
    );
    self.renderer.listen("document", "click", (event) => {
      if (event.target.hasAttribute("button-delete-id")) {
        const id = event.target.getAttribute("button-delete-id");
        dialogRef.afterClosed().subscribe((res) => {
          if (!res) {
            return;
          }
          self.layoutUtilsService.showActionNotification(
            _deleteMessage,
            MessageType.Delete
          );
        });
      }
    });
  }

  @HostListener("window:scroll", ["$event"])
  onResize(event) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      console.log("Width: " + event.target);
      //this.ref.markForCheck();
    });
    //this.dataTableElement.dtInstance.then((dtInstance: DataTables.Api) => console.log(dtInstance.fixedHeader));
  }
}

// ngOnChanges(changes: { [propKey: string]: any }) {
// 	console.log("ngOnChanges", this.typeRow, new Date());
// 	this.typeRow = this.typeRow == "array" ? this.typeRow : "keyvalue";
// 	let me = changes.config.currentValue;
// 	const self = this;
// 	if (this.records.length > 0 && this.columns.length > 0) {
// 		this.dtOptions = {
// 			pagingType: me.pagingType || "full_numbers",
// 			serverSide: true,
// 			processing: me.processing || false,
// 			// scrollY: me.scrollY || "300px",
// 			// scrollX: "100%",
// 			// height : '100%',//me.height || "305px",
// 			height: "400px",
// 			width: "100%",
// 			// scrollCollapse: true,
// 			info: me.info || true,
// 			paging: me.paging || true,
// 			ordering: me.ordering || true,
// 			searching: me.searching || true,
// 			searchPlaceholder: me.searchPlaceholder || "Search",
// 			lengthMenu: me.lengthMenu || [
// 				[10, 25, 50, -1],
// 				[10, 25, 50, "All"],
// 			],
// 			colReorder: me.colReorder
// 				? me.colReorder
// 				: {
// 						order: [1],
// 				  },
// 			language: {
// 				oPaginate: {
// 					sNext: '<i class="fa fa-forward"></i>',
// 					sPrevious: '<i class="fa fa-backward"></i>',
// 					sFirst: '<i class="fa fa-step-backward"></i>',
// 					sLast: '<i class="fa fa-step-forward"></i>',
// 				},
// 			},
// 		};
// 	} else {
// 		this.dtOptions = {
// 			pagingType: me.pagingType || "full_numbers",
// 			serverSide: me.serverSide || false,
// 			processing: me.processing || false,
// 			// scrollY: me.scrollY || "400px",
// 			info: me.info || true,
// 			paging: me.paging || true,
// 			ordering: me.ordering || false,
// 			searching: me.searching || false,
// 			searchPlaceholder: me.searchPlaceholder || "Search",
// 			lengthMenu: me.lengthMenu || [
// 				[10, 25, 50, -1],
// 				[10, 25, 50, "All"],
// 			],
// 			ajax: (dataTablesParameters: any, callback) => {
// 				if (!me.serverSide) {
// 					self.httpClient.get(me.list.url || "/api/chart/list")
// 						.map(self.extractData)
// 						.subscribe((resp) => {
// 							self.mydata = resp.hasOwnProperty("response")
// 								? resp["response"]
// 								: resp;
// 							callback({ data: self.mydata });
// 						});
// 				} else {
// 					self.httpClient.post<DataSetResponse>(
// 						"api/dataset/view?from-load-queries",
// 						me.postParam ? me.postParam : {},
// 						{}
// 					).subscribe((resp) => {
// 						console.log(resp.dataset.length);
// 						let obj = {};
// 						let b = [];
// 						self.mydata = Object.keys(resp.dataset).map(
// 							function (key) {
// 								obj = {};
// 								b = [];
// 								let n = JSON.parse(
// 									resp.dataset[key].columns
// 								);
// 								let m = JSON.parse(resp.dataset[key].rows);
// 								for (var i = 0; i < n.length; i++) {
// 									obj[n[i]] = m[i];
// 								}
// 								return obj;
// 							}
// 						);
// 						console.log(JSON.stringify(self.mydata[0]));
// 						callback({
// 							recordsTotal: resp.quid.rowtotal,
// 							recordsFiltered: resp.quid.rowtotal,
// 							data: self.mydata,
// 						});
// 					});
// 				}
// 			},
// 			columns: me.columns,
// 			rowCallback: (
// 				row: Node,
// 				data: any[] | Object,
// 				index: number
// 			) => {
// 				const self = this;
// 				$("td", row).unbind("click");
// 				$(me.rowCallback.rowMustClick, row).bind("click", () => {
// 					self.eventRowClickHandler(data, me.rowCallback.opt);
// 				});

// 				if (me.rowCallback.isLastRowAction) {
// 					$("td:last-child", row).bind("click", () => {
// 						self.bindClickToDelete();
// 					});
// 				}
// 				return row;
// 			},
// 		};
// 	}
// }

// ajax : (dataTablesParameters : any,callback) => {
//   self.httpClient.post<DataSetResponse>(me.url, me.postParam?me.postParam: {}, {})
//       .subscribe(resp => {
//         let obj = {};
//         let b= [];
//         self.mydata = Object.keys(resp.dataset).map(function(key) {
//                 obj = {};
//                 b = [];
//                 let n = JSON.parse(resp.dataset[key].columns);
//                 let m = JSON.parse(resp.dataset[key].rows);
//                 for(var i = 0; i < n.length; i++){
//                   obj[n[i]] = m[i];
//                 }
//                 return obj;
//             });
//             console.log(JSON.stringify(self.mydata[0]));
//         callback({
//           recordsTotal: resp.quid.rowtotal,
//           recordsFiltered: resp.quid.rowtotal,
//           data: self.mydata
//         });
//       });
//   }
