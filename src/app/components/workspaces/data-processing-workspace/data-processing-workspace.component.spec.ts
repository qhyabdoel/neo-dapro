import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialog } from "@angular/material/dialog";
import { Store, StoreModule } from "@ngrx/store";
import { TranslateModule } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { ApiService, QueryCommandItemService, QueryCommandService, WorkspaceService } from "src/app/libs/services";
import { DataProcessingEffects } from 'src/app/libs/store/effects/pds/dataprocesssing.effects';

import { NgxPanZoomModule } from "src/app/components/panzoom/panzoom.module";

import { PanZoomConfig } from "src/app/components/panzoom/panzoom-config";
import { PanZoomConfigOptions } from "src/app/components/panzoom/types/panzoom-config-options";
import { ToastrComponent } from "src/app/components/toastr/toastr.component";
import { DataSourcSidebarCommponent } from "src/app/components/sidebars/dataprocessing/data-source/data-source.component";
import { DataProcessingTopbarComponent } from "src/app/components/topbar/dataprocessing/data-processing-topbar/data-processing-topbar.component";

import { DataProcessingWorkspaceComponent } from './data-processing-workspace.component';

import { EffectsModule } from "@ngrx/effects";
import { metaReducers, reducers } from 'src/app/libs/store/reducers';
import { AppState } from "src/app/libs/store/states";
import { GetQueryCommands, SetPqlString } from "src/app/libs/store/actions/pds/dataprocessing.actions";
import { MatMenuModule } from "@angular/material/menu";
import { QueryCommandItemComponent } from "src/app/components/query-command-item/query-command-item.component";
import { DragDropModule } from "@angular/cdk/drag-drop";

const panZoomConfigOptions: PanZoomConfigOptions = {
  zoomLevels: 3.5,
  initialZoomLevel: 2,
  scalePerZoomLevel: 2,
  initialPanX: 0,
  initialPanY: 0,
  zoomStepDuration: 0.2,
  freeMouseWheelFactor: 0.08,
  zoomToFitZoomLevelFactor: 0.95,
  dragMouseButton: 'left',
  zoomOnDoubleClick: false,
  zoomOnMouseWheel: false,
  zoomButtonIncrement: 1,
  freeMouseWheel: false,
  noDragFromElementClass: 'pan-zoom-frame',
}

class MockMatDialog {}

class MockHttpClient {}

class MockApiService {
  post(url: string): Observable<any> {
    let resultData: ApiResult;

    if (url === '/api/query/parse') {
      resultData = {
          "status": "success",
          "code": 200,
          "response": {
              "nodes": {
                  "CONFIG_0": {
                      "node_type": "CONFIG",
                      "props": {
                          "type": "CSV",
                          "path": "/data/Cars.csv",
                          "separator": ",",
                          "columns": "",
                          "head_pos": 0,
                          "trim": true,
                          "validate": false
                      }
                  },
                  "SELECT_0": {
                      "node_type": "SELECT",
                      "props": {
                          "selectors": "",
                          "from_csv": {
                              "path": "/data/Cars.csv",
                              "alias": ""
                          },
                          "from_type": "CSV",
                          "join": null,
                          "where": "",
                          "order_by": "",
                          "limit": 10,
                          "offset": 0,
                          "group_by": "",
                          "into": "data_cars",
                          "has_limit": true,
                          "has_offset": false
                      }
                  }
              },
              "model": [
                  {
                      "id": "CONFIG_0"
                  },
                  {
                      "id": "SELECT_0",
                      "out": [
                          null
                      ]
                  }
              ]
          },
          "message": null
      } as ApiResult;
    }

    return of(resultData);
  }
}

describe('DataProcessingWorkspaceComponent', () => {
  let dataProcessingWorkspaceComponentFixture: ComponentFixture<DataProcessingWorkspaceComponent>;
  let componentInstance: DataProcessingWorkspaceComponent;
  let store: Store<AppState>;
  let queryCommandService: QueryCommandService;
  let workspaceService: WorkspaceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        DragDropModule,
        EffectsModule.forFeature([DataProcessingEffects]),
        EffectsModule.forRoot([]),
        MatMenuModule,
        NgxPanZoomModule,
        StoreModule.forRoot(reducers, { metaReducers }),
        TranslateModule.forRoot(),
      ],
      declarations: [
        DataProcessingTopbarComponent,
        DataProcessingWorkspaceComponent,
        DataSourcSidebarCommponent,
        QueryCommandItemComponent,
        ToastrComponent,
      ],
      providers: [
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: HttpClient, useClass: MockHttpClient },
        { provide: ApiService, useClass: MockApiService },
        QueryCommandService,
        QueryCommandItemService,
        WorkspaceService
      ],
    }).compileComponents();

    workspaceService = TestBed.inject(WorkspaceService);
    queryCommandService = TestBed.inject(QueryCommandService);
    store = TestBed.inject(Store);

    store.dispatch(GetQueryCommands());

    dataProcessingWorkspaceComponentFixture = TestBed.createComponent(DataProcessingWorkspaceComponent);
    componentInstance = dataProcessingWorkspaceComponentFixture.componentInstance;
    componentInstance.panzoomConfig = new PanZoomConfig(panZoomConfigOptions);

    dataProcessingWorkspaceComponentFixture.detectChanges();
  });

  it('DataProcessingWorkspaceComponent should be created', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('PQL String Must be Succefuly Generate Query Command Items', async () => {
    store.dispatch(SetPqlString({pql: 'CONFIG FILE CSV \'/data/Cars.csv\' SEPARATOR \',\' HEADERPOS 0 TRIMSPACE TRUE; SELECT * FROM CSV \'/data/Cars.csv\' LIMIT 10 INTO data_cars;' }));

    await workspaceService.getQueryCommandItemsFromPql();

    dataProcessingWorkspaceComponentFixture.detectChanges();

    const htmlElement: HTMLElement = dataProcessingWorkspaceComponentFixture.nativeElement;
    const queryCommandItems: NodeListOf<HTMLElement> = htmlElement.querySelectorAll('.query-command-item');
    const dataAliasCnfg = queryCommandItems[0].getAttribute('data-alias');
    const dataAliasSlct = queryCommandItems[1].getAttribute('data-alias');

    // console.log('###### dataAliasCnfg', dataAliasCnfg)
    // console.log('###### dataAliasSlct', dataAliasSlct)

    expect(dataAliasCnfg === 'cnfg_0' && dataAliasSlct === 'slct_0').toBeTruthy();
  });
});
