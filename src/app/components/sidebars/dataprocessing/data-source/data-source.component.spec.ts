import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TreeviewConfig, TreeviewItem, TreeviewModule, TreeviewI18n, TreeviewI18nDefault, DefaultTreeviewEventParser, TreeviewEventParser } from 'ngx-treeview';

import { AppState } from 'src/app/libs/store/states';
import { LayoutUtilsService, WorkspaceService } from 'src/app/libs/services';
import { QueryFileWrapper, QueryObject } from 'src/dataprocessing';
import { DataSourcSidebarCommponent } from './data-source.component';
import { DateFormatPipe } from 'src/app/libs/pipes';

class MockHttpClient {}

class MockMatDialog {}

class MockLayoutUtilService {}

describe('DataSourcSidebarCommponent', () => {
  let dataSourceSidebarComponentFixture: ComponentFixture<DataSourcSidebarCommponent>;
  let componentInstance: DataSourcSidebarCommponent;
  let store: MockStore<AppState>;
  let querySelector = null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, MatMenuModule, MatIconModule, TranslateModule.forRoot(), TreeviewModule ],
      declarations: [
        DataSourcSidebarCommponent,

        DateFormatPipe,
      ],
      providers: [
        provideMockStore(),
        TranslateService,
        WorkspaceService,
        TreeviewConfig,
        { provide: TreeviewI18n, useClass: TreeviewI18nDefault },
        { provide: TreeviewEventParser, useClass: DefaultTreeviewEventParser },
        { provide: HttpClient, useClass: MockHttpClient },
        { provide: MatDialog, useClass: MockMatDialog },
        { provide: LayoutUtilsService, useClass: MockLayoutUtilService },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);

    dataSourceSidebarComponentFixture = TestBed.createComponent(DataSourcSidebarCommponent);
    componentInstance = dataSourceSidebarComponentFixture.componentInstance;
  });

  it('DataSourcSidebarCommponent should be created', () => {
    expect(componentInstance).toBeTruthy();
  });

  it('Datasource Tab should displaying NO-DATA for empty datasource list', () => {
    componentInstance.treeView = new TreeviewItem({
      text: 'Data',
      value: {
        value: 'Data',
        label: 'Data',
        isRoot: true,
      },
      collapsed: false,
      children: null,
    });
    componentInstance.rootTreeview = [componentInstance.treeView];

    dataSourceSidebarComponentFixture.detectChanges();

    const htmlElement: HTMLElement = dataSourceSidebarComponentFixture.nativeElement;
    const datasourceNoData = htmlElement.querySelector('.datasource-no-data');
    expect(datasourceNoData).toBeTruthy();
  });

  it('Dataset Tab should displaying NO-DATA for empty dataset list', () => {
    componentInstance.queryFileWrapperList = null;

    dataSourceSidebarComponentFixture.detectChanges();

    const htmlElement: HTMLElement = dataSourceSidebarComponentFixture.nativeElement;
    const datasetNoData = htmlElement.querySelector('.dataset-no-data');
    expect(datasetNoData).toBeTruthy();
  });

  it('Datasource Tab should displaying mocked-datasource list', () => {
    componentInstance.treeView = new TreeviewItem({
      text: 'Data',
      value: {
        isRoot: true,
      },
      collapsed: false,
      children: [
        new TreeviewItem({
          text: 'Treeview Item Test 1',
          value: {
            name: 'Treeview Item Test 1',
            label: 'Treeview Item Test 1',
            isDir: true
          }
        }),
        new TreeviewItem({
          text: 'Treeview Item Test 2',
          value: {
            name: 'Treeview Item Test 2',
            label: 'Treeview Item Test 2',
            isDir: false
          }
        })
      ],
    });    
    componentInstance.rootTreeview = [componentInstance.treeView];

    dataSourceSidebarComponentFixture.detectChanges();

    const htmlElement: HTMLElement = dataSourceSidebarComponentFixture.nativeElement;
    const datasourceItems = htmlElement.querySelector('.datasource-item');
    expect(datasourceItems).toBeTruthy();
  });

  it('Dataset Tab should displaying mocked-query-dataset list', () => {
    componentInstance.queryFileWrapperList = [
      {
        isChecked: false,
        queryFile: {
          ID: 100,
          title: 'Query Title 1',
          updatedDate: '2022-09-09 12:34:23',
          datasetAlias: ['dataset1', 'dataset2']
        } as QueryObject
      } as QueryFileWrapper,
      {
        isChecked: false,
        queryFile: {
          ID: 101,
          title: 'Query Title 2',
          updatedDate: '2022-09-09 12:34:23',
          datasetAlias: ['dataset1', 'dataset2']
        } as QueryObject
      } as QueryFileWrapper,
    ];

    componentInstance.queryFileExpanded = [false, false];

    componentInstance.queryFileEditable[0] = [false, false];
    componentInstance.queryFileEditable[1] = [false, false];

    componentInstance.queryFileDatasetAliases[0] = ['dataset1', 'dataset2'];
    componentInstance.queryFileDatasetAliases[1] = ['dataset1', 'dataset2'];

    dataSourceSidebarComponentFixture.detectChanges();

    const htmlElement: HTMLElement = dataSourceSidebarComponentFixture.nativeElement;
    const datasetItems = htmlElement.querySelector('.dataset-item');
    // console.log('datasetItems', datasetItems);
    expect(datasetItems).toBeTruthy();
  });

  it('Double-click on CSV file on Datasource list will create SEARCH Query Command Item on Workspace', () => {

  });

  // it('Double-click on directory on Datasource list will create CONFIG & SELECT Query Command Item on Workspace', () => {});
});
