import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, Inject } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSort } from '@angular/material/sort';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { first, Subscription, Subject, lastValueFrom, take } from 'rxjs';
import { TreeviewConfig, TreeviewItem } from 'ngx-treeview';
import * as FileSaver from 'file-saver';
import { Clipboard } from '@angular/cdk/clipboard';

import { QueryCommand, User } from 'src/app/libs/models';
import {
  ApiService,
  DatasetService,
  DatasourceService,
  TranslationService,
  WorkspaceService,
  LayoutUtilsService,
} from 'src/app/libs/services';
import {
  isDatasetListReloadRequestTriggeredSelector,
  isDataSourceListReloadRequestTriggeredSelector,
  queryCommandItemsPropertyAndValueSelector,
  queryCommandsSelector,
} from 'src/app/libs/store/selectors/dataprocessing.selectors';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/libs/store/states';
import { DOCUMENT } from '@angular/common';
import {
  attachChildrenToItem,
  pushDsItemToChildren,
  removeItemFromTree,
  getTextCollections,
  syncTreeviewItems,
  addItemToTree,
  convertDatasourceItemsToTreeviewItems,
  addRemoveItemInTree,
  sortTreeviewItems,
  getItemPosition,
  convertDatasourceItemToTreeviewItem,
} from 'src/app/libs/helpers/data-processing.helper';
import { UserSelector } from 'src/app/libs/store/selectors/authentication.selectors';
import _ from 'lodash';
import { ModalAddFolderComponent } from 'src/app/components/modals/modalAddFolder/modal-add-folder.component';
import { ModalRenameFileFolderComponent } from 'src/app/components/modals/ModalRenameFileFolder/modal-rename-file-folder.component';
import { ModalDataSourceConnectorComponent } from 'src/app/components/modals/modalDataSourceConnector/modal-data-source-connector.component';
import { ModalApiConnectorComponent } from 'src/app/components/modals/modalApiConnector/modal-api-connector.component';
import { ModalDatabaseConnectorComponent } from 'src/app/components/modals/modalDatabaseConnector/modal-database-connector.component';
import { ModalHadoopConnectorComponent } from 'src/app/components/modals/modalHadoopConnector/modal-hadoop-connector.component';

import { confirmationDialogWithCallback } from 'src/app/libs/helpers/common';
import { MatDialog } from '@angular/material/dialog';
import {
  SetIsNodesModelToPql,
  SetIsProgressActive,
  SetIsDatasetListReloadRequestTriggered,
  SetQueryObject,
  SetToastrMessage,
  ResetWorkspace,
  SetMessage,
  ExecuteQuery,
  GetQueryResult,
  SetIsQueryRequestTriggered,
  SetIsResultExpanded,
} from 'src/app/libs/store/actions/pds/dataprocessing.actions';
import { ModalDuplicateQueryComponent } from 'src/app/components/modals/ModalDuplicateQuery/modal-duplicate-query.component';
import { DialogCommonComponent } from 'src/app/components/dialogs/dialog-common/dialog-common.component';

import { environment } from 'src/environments/environment';
import { tree } from 'd3';
import { isError500EncounteredSelector } from 'src/app/libs/store/selectors/general.selector';
import { ModalShareQueryComponent } from 'src/app/components/modals/modalShareQuery/modalShareQuery';

const ROOT_DIR = '√:';

@Component({
  selector: 'data-source-sidebar',
  templateUrl: './data-source.component.html',
  styleUrls: ['./data-source.component.scss'],
})
export class DataSourcSidebarCommponent implements OnInit, OnDestroy {
  @ViewChild('trigger', { static: false }) trigger: MatMenuTrigger;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  public modalReference: NgbModalRef;
  public Object = Object;

  public activeTab: string = 'tab1';
  public advanceMode = false;

  public columns: any[] = [];
  public columnIds = [];
  public commandProperty = '';
  public config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: true,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 550,
  });
  public configList: any = [];
  public contextMenuPosition = { x: '0px', y: '0px' };
  public countItem = [];

  public disablePaste = true;

  public filterText = '';
  public folderIconRightClick = '';
  public folderName = '';

  public isCheckedAllItem: boolean = false;
  public isLeftToggle: boolean = false;
  public isRightToggle: boolean = false;
  public rootTreeview: TreeviewItem[];

  public loadMoreFlag: boolean = false;
  public loadProccess: boolean;

  public masterDataquery = [];

  public nameFileFolder = '';

  public queryFileWrapperList: QueryFileWrapper[] = null;
  public queryFileEditable: boolean[][] = [];
  public queryFileExpanded: boolean[] = [];
  public queryFileDatasetAliases: string[][] = [];

  public rows: any = [];

  public searchDataqueryText = '';
  public selectedQuery: any;
  public selectedQueryListforDelete = [];

  public treeView: TreeviewItem = null;
  public treeViewHdfs: TreeviewItem = null;

  public user: User = null;

  public validate_messages: any = [];

  public wasRedraw = false;

  private isFiltered: boolean = false;

  private currentTreeItem: any;

  private explorerCurrentPath: string = ROOT_DIR;

  private isLoadingChild: boolean = false;
  private isCopy: boolean = true;
  private itemToCopyCut: TreeviewItem = null;

  private lang: string;

  private queryCommands: QueryCommand[];

  private fileUpload: {
    fileObj: any;
    fileBin: any;
    fileName: string;
  } = {
    fileObj: null,
    fileBin: null,
    fileName: '',
  };

  private savedMappings = [];
  private skip = 0;
  private subscriptions = [];

  private textCollections: any = null;

  /* OBSERVABLES */
  public loadingDataSourceList$: Subject<boolean> = new Subject();
  public loadingDatasetList$: Subject<boolean> = new Subject();
  public loadingPreview$: Subject<boolean> = new Subject();
  public loadingRun$: Subject<boolean> = new Subject();

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private clipboard: Clipboard,
    private dialog: MatDialog,
    private layoutUtilsService: LayoutUtilsService,
    private ngbModal: NgbModal,
    private datasetService: DatasetService,
    private datasourceService: DatasourceService,
    private store: Store<AppState>,
    private translationService: TranslationService,
    private workspaceService: WorkspaceService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.treeView = new TreeviewItem({
      text: 'Data',
      value: {
        id: 'root-dir-id',
        name: 'Data',
        label: 'Data',
        path: ROOT_DIR,
        isDir: true,
        isRoot: true,
      },
      collapsed: false,
      children: null,
    });

    this.treeViewHdfs = new TreeviewItem({
      text: 'HDFS Connection',
      value: {
        id: 'root-dir-hdfs',
        name: 'HDFS Connection',
        label: 'HDFS Connection',
        path: ROOT_DIR,
        isDir: true,
        isRoot: true,
        isHdfs: true,
      },
      collapsed: false,
      children: null,
    });
  }

  async ngOnInit() {
    this.explorerCurrentPath = ROOT_DIR;

    this.lang = this.translationService.getSelectedLanguage();
    this.textCollections = getTextCollections(this.lang);

    this.subscriptions.push(
      this.store
        .select(UserSelector)
        .pipe(first())
        .subscribe((user) => (this.user = user))
    );

    this.subscriptions.push(
      this.store.select(queryCommandsSelector).subscribe((queryCommands) => (this.queryCommands = queryCommands))
    );

    this.subscriptions.push(
      this.store
        .select(isDataSourceListReloadRequestTriggeredSelector)
        .subscribe((isDataSourceListReloadRequestTriggered) => {
          if (isDataSourceListReloadRequestTriggered) {
            this.store.dispatch({
              type: 'SetIsDataSourceListReloadRequestTriggered',
              isDataSourceListReloadRequestTriggered: false,
            });
            this.refreshExplorer();
          }
        })
    );

    this.subscriptions.push(
      this.store
        .select(isDatasetListReloadRequestTriggeredSelector)
        .subscribe((isDatasetListReloadRequestTriggered) => {
          if (isDatasetListReloadRequestTriggered) {
            this.store.dispatch(SetIsDatasetListReloadRequestTriggered({ isDatasetListReloadRequestTriggered: false }));
            this.loadDatasetList();
          }
        })
    );

    this.subscriptions.push(
      this.store.select(isError500EncounteredSelector).subscribe((isError500Encountered) => {
        if (isError500Encountered) {
          this.loadingDataSourceList$.next(false);
          this.loadingDatasetList$.next(false);
        }
      })
    );

    await this.loadDatasourceList();
    await this.loadDatasetList();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  addRemoveBodyClass(className, type) {
    if (type == 'left') {
      this.isLeftToggle = !this.isLeftToggle;
      if (this.isLeftToggle) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    }
    if (type == 'right') {
      this.isRightToggle = !this.isRightToggle;
      if (this.isRightToggle) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    }

    let array = this.savedMappings;
    setTimeout(() => {
      for (var i = 0; i < array.length; i++) {
        if (array[i].line.position) {
          array[i].line.position();
        }
      }
    }, 500);
  }

  tabOnClick(tab: string) {
    this.activeTab = tab;
  }

  async addConfigSelectToWorkspace(treeviewItem: TreeviewItem) {
    const filePath = this._extractFilePath(treeviewItem, true);

    // get existing query command item with same filepath
    // if exist, immediate return and never create new query command item
    const existingQueryCommandItemsPropertyAndValue = await lastValueFrom(
      this.store.select(queryCommandItemsPropertyAndValueSelector).pipe(take(1))
    );
    if (existingQueryCommandItemsPropertyAndValue) {
      const filteredQueryCommandItemsPropertyAndValue = existingQueryCommandItemsPropertyAndValue.filter(
        (queryCommandItemPropertyAndValue) => {
          const matches = queryCommandItemPropertyAndValue.id.match(/^([A-Z]+)_([0-9]+)$/);

          const filteredCommandProperties = queryCommandItemPropertyAndValue.commandProperties.filter(
            (commandProperty) =>
              commandProperty.name === 'path' &&
              commandProperty.value &&
              commandProperty.value.length > 0 &&
              commandProperty.value.indexOf(filePath) > -1
          );

          return (
            (matches[1] === 'CONFIG' || matches[1] === 'SELECT') &&
            filteredCommandProperties &&
            filteredCommandProperties.length > 0
          );
        }
      );
      if (filteredQueryCommandItemsPropertyAndValue && filteredQueryCommandItemsPropertyAndValue.length > 0) {
        this.store.dispatch(
          SetMessage({
            title: 'Error',
            text: 'Query command items with the same file path already exists',
          })
        );
        return;
      }
    }

    this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

    const configQueryCommands = this.queryCommands.filter((queryCommand) => queryCommand.name === 'config');
    await this.workspaceService.createQueryCommandItem(configQueryCommands[0], {
      props: {
        type: 'CSV',
        path: filePath,
        separator: ',',
        columns: '',
        head_pos: 0,
        trim: true,
        validate: true,
      },
    });

    const selectQueryCommands = this.queryCommands.filter((queryCommand) => queryCommand.name === 'select');
    await this.workspaceService.createQueryCommandItem(selectQueryCommands[0], {
      props: {
        from_type: 'CSV',
        from_file: {
          path: filePath,
        },
      },
    });

    this.store.dispatch(SetIsNodesModelToPql({ isNodesModelToPql: true }));
    await this.workspaceService.getPqlFromQueryCommandItems('addConfigSelectToWorkspace');

    this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
  }

  async addSearchToWorkspace(treeviewItem: TreeviewItem, type?: string) {
    // console.log('treeviewItem', treeviewItem);
    const filePath = this._extractFilePath(treeviewItem, true);
    // console.log('filePath', filePath);

    // get existing query command item with same filepath
    // if exist, immediate return and never create new query command item
    const existingQueryCommandItemsPropertyAndValue = await lastValueFrom(
      this.store.select(queryCommandItemsPropertyAndValueSelector).pipe(take(1))
    );
    if (existingQueryCommandItemsPropertyAndValue) {
      const filteredQueryCommandItemsPropertyAndValue = existingQueryCommandItemsPropertyAndValue.filter(
        (queryCommandItemPropertyAndValue) => {
          const matches = queryCommandItemPropertyAndValue.id.match(/^([A-Z]+)_([0-9]+)$/);

          const filteredCommandProperties = queryCommandItemPropertyAndValue.commandProperties.filter(
            (commandProperty) =>
              commandProperty.name === 'paths' &&
              commandProperty.value &&
              commandProperty.value.length > 0 &&
              commandProperty.value.indexOf(filePath) > -1
          );

          return matches[1] === 'SEARCH' && filteredCommandProperties && filteredCommandProperties.length > 0;
        }
      );
      if (filteredQueryCommandItemsPropertyAndValue && filteredQueryCommandItemsPropertyAndValue.length > 0) {
        this.store.dispatch(
          SetMessage({
            title: 'Error',
            text: 'Query command item with the same file path already exists',
          })
        );
        return;
      }
    }

    this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

    let search_type = 'FILE';
    let include_header = false;
    let is_folder = false;
    let is_csv = false;

    // if (treeviewItem.value && treeviewItem.value.filetype === 'csv') {
    //   search_type = 'CSV';
    //   include_header = true;
    //   is_csv = true;
    // }

    if (type === 'folder') {
      search_type = 'FOLDER';
      is_folder = true;
    }

    const filteredQueryCommands = this.queryCommands.filter((queryCommand) => queryCommand.name === 'search');
    this.workspaceService.createQueryCommandItem(filteredQueryCommands[0], {
      props: {
        paths: [filePath],
        search_type,
        is_csv,
        include_header,
        is_folder,
      },
    });
    this.store.dispatch(SetIsNodesModelToPql({ isNodesModelToPql: true }));
    this.workspaceService.getPqlFromQueryCommandItems('addSearchToWorkspace');

    this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
  }

  checkDataForArray(obj) {
    return Object.keys(obj).length > 0;
  }

  checkUncheckAll() {
    this.selectedQueryListforDelete = [];
    if (this.isCheckedAllItem === false) {
      this.isCheckedAllItem = true;
      for (var i = 0; i < this.queryFileWrapperList.length; i++) {
        this.queryFileWrapperList[i].isChecked = true;
        this.selectedQueryListforDelete.push(this.queryFileWrapperList[i]);
      }
    } else {
      this.isCheckedAllItem = false;
      for (var i = 0; i < this.queryFileWrapperList.length; i++) {
        this.queryFileWrapperList[i].isChecked = false;
        const removeIndex = this.selectedQueryListforDelete
          .map((item) => item.ID)
          .indexOf(this.queryFileWrapperList[i].queryFile.ID);
        this.selectedQueryListforDelete.splice(removeIndex, 1);
      }
    }
  }

  dataSetCount(obj) {
    var result = Object.keys(obj).map(function (key) {
      return [obj[key]];
    });
    return result.length;
  }

  async deleteAll(items, title?) {}

  async deleteApiConnection(apiConfig) {}

  async deleteDbConnection(config) {}

  durationToHHmmFormat(minutes: number): string {
    const duration = moment.duration(minutes, 'minutes');
    return duration.hours().toString().padStart(2, '0') + ':' + duration.minutes().toString().padStart(2, '0');
  }

  extractDateValue(idEl) {
    //   let date = document.getElementById(idEl) as HTMLInputElement;
    //   let val = date == null ? "" : date.value;
    //   if (val == "" || val == undefined) val = "0001-01-01T00:00:00";
    //   return val;
  }

  editDatasetName(idx: number, i: number) {
    this.queryFileEditable = this.queryFileEditable.map((item, j) => {
      const _item = [...item];

      if (idx === j) {
        _item[i] = !_item[i];
      }

      return _item;
    });
  }

  /* refactored */
  async fileUploadProcessing() {
    this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

    // console.log('this.fileUpload', this.fileUpload)
    // console.log('this.fileUpload.fileObj', this.fileUpload.fileObj)
    // console.log('this.fileUpload.fileObj.files', this.fileUpload.fileObj.files)

    // console.log('this.explorerCurrentPath', this.explorerCurrentPath);

    this.datasourceService
      .upload(environment.api_paths.explorerUploadV2, this.explorerCurrentPath, this.fileUpload.fileObj.files)
      .subscribe({
        next: async (uploadResult: ApiResult) => {
          // TODO: upload result notification toastr
          if (uploadResult.status === 'success' && uploadResult.response && uploadResult.response.length > 0) {
            await new Promise<void>((resolve) => {
              const itemToAdds: TreeviewItem[] = convertDatasourceItemsToTreeviewItems(uploadResult.response);
              itemToAdds.forEach((itemToAdd: TreeviewItem) => {
                this.rootTreeview = addItemToTree(
                  this.rootTreeview,
                  this.currentTreeItem ?? this.rootTreeview[0],
                  itemToAdd
                );
              });

              resolve();
            });

            this.store.dispatch(
              SetToastrMessage({
                toastrMessage: {
                  toastrType: 'info',
                  message: this.textCollections.DATA_PROCESSING.FUS,
                },
              })
            );
          } else {
            this.store.dispatch(
              SetToastrMessage({
                toastrMessage: {
                  toastrType: 'error',
                  message: 'Upload Failed!',
                },
              })
            );
          }

          this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
          this.loadingDataSourceList$.next(false);
        },
        error: (err) => {
          this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
          this.loadingDataSourceList$.next(false);

          this.store.dispatch(
            SetToastrMessage({
              toastrMessage: {
                toastrType: 'error',
                message: err.message,
              },
            })
          );
        },
        complete: () => {
          (<HTMLInputElement>document.getElementById('upload_file')).value = null;
        },
      });
  }

  /* refactored */
  getCheckedQuery(id, isChecked) {
    if (isChecked === true) {
      let selectedQuery = this.queryFileWrapperList.filter(
        (queryFileWrapper) => queryFileWrapper.queryFile.ID === id
      )[0];
      this.selectedQueryListforDelete.push(selectedQuery);
    } else {
      var removeIndex = this.selectedQueryListforDelete
        .map(function (item) {
          return item.ID;
        })
        .indexOf(id);
      this.selectedQueryListforDelete.splice(removeIndex, 1);
    }
  }

  getSelectedSchedulerMode(): number {
    //   const el0 = document.getElementById("selectedSchedulerMode") as HTMLSelectElement;
    //   return parseInt(el0.value);
    return 0;
  }

  isControlHasChekRequired(): boolean {
    //   let listRequire = this.listCommandProperties;
    //   let result = false;
    //   Object.keys(listRequire).map(function (n) {
    //     if (listRequire[n].value == null && listRequire[n].isRequired) {
    //       result = true;
    //       return;
    //     }
    //     if (listRequire[n].value == "" && listRequire[n].isRequired) {
    //       result = true;
    //       return;
    //     }
    //   });
    //   return result;
    return true;
  }

  isLoadOrSearch(name) {
    //   let arr = ["search", "load", "correlate", "merge"];
    //   let rslt = arr.includes(name) ? true : false;
    //   return rslt;
  }

  isNameMergeCorrelate(name) {
    //   let incld = ["merge", "correlate"];
    //   let rslt = incld.includes(name) ? true : false;
    //   return rslt;
  }

  onDoubleClickTreeviewItem(treeviewItem: TreeviewItem) {
    if (!treeviewItem.value.isDir) {
      this.addSearchToWorkspace(treeviewItem);
    }
  }

  onDragDropTreeviewItem(event: any, treeviewItem: TreeviewItem) {
    // console.log('event', event);
    if (event.target.classList.contains('datasource-item')) {
      if (!treeviewItem.value.isDir) {
        this.addSearchToWorkspace(treeviewItem);
      } else {
        this.addConfigSelectToWorkspace(treeviewItem);
      }
    }
  }

  async loadChild(treeviewItem: TreeviewItem) {
    // console.log('treeviewItem', treeviewItem);

    this.loadingDataSourceList$.next(true);

    const path = this._extractPath(treeviewItem);
    
    // console.log('path', path);

    if (treeviewItem.value.isConnection) {
      const result: ApiResult = await new Promise((resolve, reject) => {
        if (treeviewItem.value.filetype === 'folder') {
          let connectionPath = `${treeviewItem.value.location}/${treeviewItem.value.name}`;
          this.datasourceService.listConnection('hdfs', treeviewItem.value.connectionName, connectionPath).subscribe({
            next: (res) => resolve(res),
            error: (err) => reject(err),
          });
        } else {
          this.datasourceService.listConnection('hdfs', treeviewItem.value.name).subscribe({
            next: (res) => resolve(res),
            error: (err) => reject(err),
          });
        }
      });

      const connectionDirectoryList = result.response.map((item: any) => ({
        ...item,
        isConnection: true,
        connectionName: treeviewItem.value.connectionName || treeviewItem.value.name,
      }));

      this.treeViewHdfs.children = attachChildrenToItem(
        this.treeViewHdfs.children,
        this.currentTreeItem,
        connectionDirectoryList
      );
    } else {
      const result: ApiResult = await new Promise((resolve, reject) => {
        this.datasourceService.list(path).subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err),
        });
      });
      this.treeView.children = attachChildrenToItem(this.treeView.children, this.currentTreeItem, result.response);
    }

    this.rootTreeview = this.treeViewHdfs.children && this.treeViewHdfs.children[0] ? [this.treeView, this.treeViewHdfs] : [this.treeView];
    // console.log('this.treeView', this.treeView);
    this.loadingDataSourceList$.next(false);
    this.isLoadingChild = false;
  }

  /* refactored */
  async loadDatasourceList(filter?: string) {
    this.loadingDataSourceList$.next(true);

    const result: ApiResult = await new Promise((resolve, reject) => {
      this.datasourceService.list(ROOT_DIR).subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(err),
      });
    });

    const resultHdfs: ApiResult = await new Promise((resolve, reject) => {
      this.datasourceService.listConnection('hdfs').subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(err),
      });
    });

    if (result && result.status === 'success') {
      // console.log('this.treeView', {...this.treeView})
      this.treeView.children = convertDatasourceItemsToTreeviewItems(
        result.response as DataSourceItemV2[],
        this.treeView.children as TreeviewItem[]
      );
      this.rootTreeview = [this.treeView];
    }

    if (resultHdfs && resultHdfs.status === 'ok') {
      const hdfsDirectoryList = resultHdfs.response.map((item: any) => ({
        ...item,
        isDir: true,
        isConnection: true,
      }));

      this.treeViewHdfs.children = convertDatasourceItemsToTreeviewItems(
        hdfsDirectoryList as DataSourceItemV2[],
        this.treeViewHdfs.children as TreeviewItem[]
      );
      
      if (this.treeViewHdfs.children && this.treeViewHdfs.children[0]) {
        this.rootTreeview.push(this.treeViewHdfs);
      }
    }

    this.loadingDataSourceList$.next(false);
  }

  loadmore() {
    this.skip += 15;
    this.loadMoreFlag = true;
    this.loadDatasetList();
  }

  async loadDatasetList() {
    this.loadingDatasetList$.next(true);

    const params = {
      userID: this.user ? this.user.uuid : '',
      skip: this.skip,
      filter: this.searchDataqueryText,
    };

    const result: ApiResult = await this.datasetService.list(params);
    this.queryFileWrapperList = result.response.list.map((queryFile: QueryObject, i: number) => {
      this.queryFileExpanded[i] = false;
      this.queryFileEditable[i] = Object.keys(queryFile.datasetAlias).map(() => false);
      this.queryFileDatasetAliases[i] = Object.keys(queryFile.datasetAlias).map((dataset) => dataset);

      return {
        queryFile,
        isChecked: false,
      } as QueryFileWrapper;
    });

    this.loadingDatasetList$.next(false);
  }

  async multipleDelete() {
    // console.log('this.selectedQueryListforDelete', this.selectedQueryListforDelete)
    confirmationDialogWithCallback(
      this.dialog,
      this.textCollections.DATA_PROCESSING.C,
      this.textCollections.DATA_PROCESSING.DYWD +
        ' ' +
        this.selectedQueryListforDelete.length +
        this.textCollections.DATA_PROCESSING.SED +
        (this.selectedQueryListforDelete.length > 1 ? ' queries' : ' query') +
        ' ?',
      async () => {
        this.loadingDatasetList$.next(true);
        this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

        let selectedQuery = this.selectedQueryListforDelete;

        const promises = [];
        for (let i = 0; i < this.selectedQueryListforDelete.length; i++) {
          promises.push(
            this.datasetService.delete({
              userID: this.user.uuid,
              id: selectedQuery[i].queryFile.ID,
              quid: selectedQuery[i].queryFile.quid,
            })
          );
        }

        const promisesResult = await Promise.all(promises);
        if (promisesResult) {
          this.store.dispatch(
            SetToastrMessage({
              toastrMessage: {
                toastrType: 'info',
                message: this.textCollections.DATA_PROCESSING.QDSDS,
              },
            })
          );

          this.selectedQueryListforDelete = [];
          this.loadMoreFlag = false;

          await this.loadDatasetList();
        } else {
          this.store.dispatch(
            SetToastrMessage({
              toastrMessage: {
                toastrType: 'error',
                message: this.textCollections.DATA_PROCESSING.PF,
              },
            })
          );
        }

        this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
        this.loadingDatasetList$.next(false);
      },
      {
        needCancel: true,
      }
    );
  }

  async onChangeInputFile(file: any) {
    // this.loadingDataSourceList$.next(true);

    this.fileUpload = {
      fileObj: file,
      fileBin: file.files[0],
      fileName: file.files[0].name.replace(/[`~!\s@#$%^&*()|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '_'),
    };

    const checkResult: ApiResult = await new Promise((resolve, reject) =>
      this.datasourceService.check(this.explorerCurrentPath, this.fileUpload.fileName).subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(err),
      })
    );
    const isExist = checkResult.response ? checkResult.response[0] : checkResult[0];
    if (isExist) {
      const dialogRef = this.layoutUtilsService.overwriteElement(
        this.textCollections.DATA_PROCESSING.OEF,
        this.textCollections.DATA_PROCESSING.DSW,
        this.fileUpload.fileName + this.textCollections.DATA_PROCESSING.UN
      );

      dialogRef.afterClosed().subscribe((res) => {
        if (!res) {
          return;
        }

        this.fileUploadProcessing();
      });
    } else {
      this.fileUploadProcessing();
    }
  }

  async onClickTreeviewItem(treeviewItem: TreeviewItem) {
    this.currentTreeItem = treeviewItem;

    if (!treeviewItem.value.isDir) return;

    if (treeviewItem.collapsed && !this.isLoadingChild) {
      this.isLoadingChild = true;
      this.loadChild(treeviewItem);
    }

    treeviewItem.collapsed = !treeviewItem.collapsed;
  }

  /* refactored */
  onContextMenuTreeviewItem(event: MouseEvent, treeviewItem: TreeviewItem) {
    event.preventDefault();

    this.currentTreeItem = treeviewItem;

    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';

    this.trigger.menuData = { item: treeviewItem };
    this.trigger.menu.focusFirstItem('mouse');
    this.trigger.openMenu();
  }

  /* refactored */
  openModalApiConnector() {
    const modalRef = this.ngbModal.open(ModalApiConnectorComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.close.subscribe(() => modalRef.close());
  }

  /* refactored */
  openModalDatabaseConnector() {
    const modalRef = this.ngbModal.open(ModalDatabaseConnectorComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.close.subscribe(() => modalRef.close());
  }

  /* refactored */
  openModalDataSourceConnector() {
    const modalRef = this.ngbModal.open(ModalDataSourceConnectorComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.close.subscribe(() => modalRef.close());
    modalRef.componentInstance.addDbConnection.subscribe(() => this.openModalDatabaseConnector());
    modalRef.componentInstance.addAPIConnection.subscribe(() => this.openModalApiConnector());
    modalRef.componentInstance.addHadoopConnection.subscribe(() => this.openModalHadoopConnector());
  }

  openModalHadoopConnector() {
    const modalRef = this.ngbModal.open(ModalHadoopConnectorComponent, {
      centered: true,
      size: 'md',
    });
    modalRef.componentInstance.close.subscribe(() => modalRef.close());
    modalRef.componentInstance.getHdfsList.subscribe((fileList: any) => this.loadDatasourceList());
  }

  async datasetDelete(queryObject: QueryObject) {
    // console.log('this.selectedQueryListforDelete', this.selectedQueryListforDelete)
    confirmationDialogWithCallback(
      this.dialog,
      this.textCollections.DATA_PROCESSING.C,
      this.textCollections.DATA_PROCESSING.DYWD + queryObject.title + '?',
      // queryObject.title + this.textCollections.DATA_PROCESSING.DN,
      async () => {
        this.loadingDatasetList$.next(true);

        const res = await this.datasetService.delete({
          userID: this.user.uuid,
          id: queryObject.ID,
          quid: queryObject.quid,
        });
        if (res) {
          this.store.dispatch(
            SetToastrMessage({
              toastrMessage: {
                toastrType: 'info',
                message: this.textCollections.DATA_PROCESSING.QDSDS,
              },
            })
          );

          await this.loadDatasetList();

          this.loadingDatasetList$.next(false);
        } else {
          this.loadingDatasetList$.next(false);

          this.store.dispatch(
            SetToastrMessage({
              toastrMessage: {
                toastrType: 'error',
                message: this.textCollections.DATA_PROCESSING.PF,
              },
            })
          );
        }
      },
      {
        needCancel: true,
      }
    );
  }

  async shareQuery(queryObject: QueryObject) {
    this.modalReference = this.ngbModal.open(ModalShareQueryComponent, {
      centered: true,
    });
    this.modalReference.componentInstance.query_id = queryObject.ID;

    this.modalReference.result.then(
      (res) => {
        this.ngbModal.dismissAll();
        this.store.dispatch(
          SetToastrMessage({
            toastrMessage: {
              toastrType: res.includes('Failed') ? 'error' : 'info',
              message: res,
            },
          })
        );
      },
      (reason: any) => {}
    );
  }

  async datasetDuplicate(query: QueryObject) {
    const modalRef = this.ngbModal.open(ModalDuplicateQueryComponent, {
      centered: true,
      size: 'sm',
    });
    modalRef.componentInstance.newName = `${query.title}(Duplicate)`;
    modalRef.componentInstance.close.subscribe(() => modalRef.close());
    modalRef.componentInstance.save.subscribe(async (newName) => {
      modalRef.close();

      this.loadingDatasetList$.next(true);

      const isSuccess = await this.workspaceService.duplicateQuery({
        id: query.ID,
        new_name: newName,
      });

      if (isSuccess) {
        this.store.dispatch(
          SetToastrMessage({
            toastrMessage: {
              toastrType: 'info',
              message: this.textCollections.DATA_PROCESSING.QSD,
            },
          })
        );

        await this.loadDatasetList();
      } else {
        this.store.dispatch(
          SetToastrMessage({
            toastrMessage: {
              toastrType: 'error',
              message: this.textCollections.DATA_PROCESSING.PF,
            },
          })
        );
      }

      this.loadingDatasetList$.next(false);
    });
  }

  async datasetToWorkspace(queryObject: QueryObject) {
    // console.log('queryObject', queryObject);
    this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

    this.store.dispatch(ResetWorkspace({ needToastr: false }));

    this.store.dispatch(SetIsNodesModelToPql({ isNodesModelToPql: true }));

    let copyQueryObject = { ...queryObject };
    if (copyQueryObject.refreshInterval) {
      if (copyQueryObject.refreshInterval.Advance === '0001-01-01T00:00:00Z') {
        copyQueryObject.refreshInterval.Advance = '';
      }
      if (copyQueryObject.additionalRefreshInterval && copyQueryObject.additionalRefreshInterval.length > 0) {
        copyQueryObject.additionalRefreshInterval = copyQueryObject.additionalRefreshInterval.map((x) => {
          if (x.Advance === '0001-01-01T00:00:00Z') {
            x.Advance = '';
          }
          return x;
        });
      }
    }
    this.store.dispatch(SetQueryObject({ queryObject: copyQueryObject }));

    await this.workspaceService.loadFromQueryCommandItemsWrapper(JSON.parse(queryObject.model));

    if (copyQueryObject.quid) {
      this.store.dispatch(SetIsResultExpanded({ isResultExpanded: true }));
      this.store.dispatch(GetQueryResult({ quid: copyQueryObject.quid, userQueryID: copyQueryObject.ID, size: 25 }));
    } else {
      this.store.dispatch(SetToastrMessage({
        toastrMessage: {
          toastrType: 'warning',
          message: 'Currenty query has empty dataset'
        }
      }));
    }

    this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));  
  }

  async refreshExplorer() {
    this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

    if (this.isFiltered) {
      this.isFiltered = false;
      this.filterText = '';
      this.treeView.children = null;
    }

    this.loadingDataSourceList$.next(true);

    this.treeView.children = await syncTreeviewItems(this.datasourceService, ROOT_DIR, this.treeView.children);
    this.rootTreeview = this.treeViewHdfs.children ? [ this.treeView, this.treeViewHdfs ] : [ this.treeView ];

    this.cdr.detectChanges();

    this.loadingDataSourceList$.next(false);

    this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
  }

  refreshQuery() {
    this.skip = 0;
    this.queryFileWrapperList = null;
    this.loadMoreFlag = false;
    this.cdr.detectChanges();
    this.loadDatasetList();
  }

  async saveDatasetName(idx: number, i: number) {
    const queryFile = this.queryFileWrapperList[idx].queryFile;
    const datasetAliasKeys = Object.keys(queryFile.datasetAlias);
    const datasetAlias = {};
    datasetAlias[datasetAliasKeys[i]] = this.queryFileDatasetAliases[idx][i];

    const params = {
      datasetAlias,
      id: queryFile.ID,
    };
    // console.log('params', params);
    const result: ApiResult = await new Promise((resolve, reject) => {
      this.apiService.post(environment.api_paths.datasetAliasSave, params).subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(err),
      });
    });

    this.queryFileEditable = this.queryFileEditable.map((item, j) => {
      const _item = [...item];

      if (idx === j) {
        _item[i] = !_item[i];
      }

      return _item;
    });

    this.loadDatasetList();
  }

  async saveNewFolder() {
    let urlCheck = 'api/explorer/check';
    this.nameFileFolder = this.nameFileFolder.replace(/[`~!\s@#$%^&*()|+\-=?;:'",<>\{\}\[\]\\\/]/gi, '_');
    let paramCheck = {
      paths: [this.explorerCurrentPath + '/' + this.nameFileFolder],
    };
    let param = { path: this.explorerCurrentPath + '/' + this.nameFileFolder };
    let url = 'api/explorer/dir';
    let val = await this.apiService.postApi(urlCheck, paramCheck, false);
    let rest = val.result.response ? val.result.response[0] : val.result[0];
    if (rest == false) {
      let go = await this.apiService.postApi(url, param, false);
    }
    this.ngbModal.dismissAll();
    this.loadDatasourceList();
  }

  async search() {
    this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

    this.isFiltered = true;

    this.loadingDataSourceList$.next(true);

    const result: ApiResult = await new Promise((resolve, reject) => {
      this.datasourceService.list(ROOT_DIR, this.filterText).subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(err),
      });
    });
    this.treeView.children = convertDatasourceItemsToTreeviewItems(
      result.response as DataSourceItemV2[],
      this.treeView.children as TreeviewItem[]
    );
    this.rootTreeview = this.treeView.children && this.treeView.children.length > 0 ? [this.treeView] : [];

    this.loadingDataSourceList$.next(false);
    this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
  }

  searchDataquery() {
    this.skip = 0;
    let datapencarian = this.masterDataquery;
    this.loadMoreFlag = false;
    this.loadDatasetList();
  }

  toggleQueryFile(idx: number) {
    this.queryFileExpanded = this.queryFileExpanded.map((isCheck: boolean, i: number) => {
      if (idx === i) {
        return !isCheck;
      }

      return false;
    });
  }

  /*
   * REFACTORED METHODS
   */

  async treeItemAddFolder(treeviewItem?: TreeviewItem) {
    // console.log('treeviewItem', treeviewItem);
    let path = ROOT_DIR;

    if (treeviewItem) {
      path = this._extractPath(treeviewItem);
    }

    // console.log('path', path);

    const modalRef = this.ngbModal.open(ModalAddFolderComponent, {
      centered: true,
      size: 'md',
    });
    modalRef.componentInstance.close.subscribe(() => modalRef.close());
    const dirName = await new Promise((resolve) =>
      modalRef.componentInstance.save.subscribe({
        next: (res) => resolve(res),
      })
    );

    if (dirName) {
      modalRef.close();

      this.loadingDataSourceList$.next(true);
      this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

      const checkResult: ApiResult = await new Promise((resolve, reject) =>
        this.datasourceService.check(path, dirName).subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err),
        })
      );
      if (checkResult && checkResult.status === 'success') {
        const isExist = checkResult.response ? checkResult.response[0] : checkResult[0];
        if (!isExist) {
          const createResult: ApiResult = await new Promise((resolve, reject) =>
            this.datasourceService.create(path, dirName).subscribe({
              next: (res) => resolve(res),
              error: (err) => reject(err),
            })
          );

          // console.log('createResult', createResult);
          if (createResult && createResult.status === 'success') {
            const itemToAdd: TreeviewItem = convertDatasourceItemToTreeviewItem(createResult.response);
            this.rootTreeview = addItemToTree(this.rootTreeview, treeviewItem ?? this.rootTreeview[0], itemToAdd);

            // console.log('this.rootTreeview', this.rootTreeview)

            this.store.dispatch(
              SetToastrMessage({
                toastrMessage: {
                  toastrType: 'info',
                  message: this.textCollections.DATA_PROCESSING.DCS,
                },
              })
            );
          }
        } else {
          this.store.dispatch(
            SetToastrMessage({
              toastrMessage: {
                toastrType: 'warning',
                message: this.textCollections.DATA_PROCESSING.DAE,
              },
            })
          );
        }
      }

      this.loadingDataSourceList$.next(false);
      this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
    }
  }

  treeItemCopyPath(treeviewItem: TreeviewItem) {
    const path = this._extractFilePath(treeviewItem, true);
    // console.log('path', path);

    this.clipboard.copy(path);
  }

  treeItemCopyCut(treeviewItem: TreeviewItem, type) {
    this.disablePaste = false;
    this.itemToCopyCut = treeviewItem;
    this.isCopy = type === 'copy';
  }

  async treeItemDelete(treeviewItem: TreeviewItem) {
    const dialogRef = this.dialog.open(DialogCommonComponent, {
      data: {
        title: this.textCollections.DATA_PROCESSING.C,
        description: this.textCollections.DATA_PROCESSING.DYWD + treeviewItem.value.name + '?',
        needCancel: true,
      },
      width: '440px',
    });
    const dialogRes = await new Promise((resolve) =>
      dialogRef.afterClosed().subscribe({
        next: (res) => resolve(res),
      })
    );

    if (dialogRes) {
      this.loadingDataSourceList$.next(true);
      this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

      const path = this._extractFilePath(treeviewItem);

      let param: any = {
        userID: this.user.uuid,
        paths: [path],
      };

      const result: ApiResult = await new Promise((resolve, reject) =>
        this.datasourceService.remove(true, param).subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err),
        })
      );

      if (result && result.status === 'success' && result.response[0]) {
        const treePosition = getItemPosition([this.treeView], treeviewItem);
        // console.log('treePosition', treePosition);
        if (treePosition.value.isRoot) {
          if (this.treeView.children) {
            this.treeView.children.forEach((_treeItem, i) => {
              if (_treeItem.value.id === treeviewItem.value.id) {
                this.treeView.children.splice(i, 1);
              }
            });
          }
        } else {
          this.treeView.children = removeItemFromTree(this.treeView.children, treePosition, treeviewItem);
          this.rootTreeview = [this.treeView];
        }
        this.store.dispatch(
          SetToastrMessage({
            toastrMessage: {
              toastrType: 'info',
              message: this.textCollections.DATA_PROCESSING.FFDS,
            },
          })
        );
      }

      this.loadingDataSourceList$.next(false);
      this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
    }
  }

  async treeItemDownload(treeviewItem: TreeviewItem) {
    const result: ApiResult = await new Promise((resolve, reject) =>
      this.datasourceService.download(treeviewItem).subscribe({
        next: (res) => resolve(res),
        error: (err) => reject(err),
      })
    );
    FileSaver.saveAs(result, treeviewItem.text);
  }

  async treeItemPaste(treeviewItem: TreeviewItem) {
    if (!treeviewItem.value.isDir) {
      this.store.dispatch(
        SetToastrMessage({
          toastrMessage: {
            toastrType: 'warning',
            message: this.textCollections.DATA_PROCESSING.TMBD,
          },
        })
      );

      return;
    }

    this.disablePaste = true;
    const dialogRef = this.dialog.open(DialogCommonComponent, {
      data: {
        title: this.textCollections.DATA_PROCESSING.C,
        description: `${this.textCollections.DATA_PROCESSING.AYSP} ${this.itemToCopyCut.value.name}?`,
        needCancel: true,
      },
      width: '440px',
    });
    const dialogRes = await new Promise((resolve) =>
      dialogRef.afterClosed().subscribe({
        next: (res) => resolve(res),
      })
    );

    if (dialogRes) {
      this.loadingDataSourceList$.next(true);
      this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));

      const srcFile = this._extractFilePath(this.itemToCopyCut);
      const dstFile = `${this._extractFilePath(treeviewItem, false)}/${this.itemToCopyCut.value.name}`;

      // console.log('treeviewItem', treeviewItem);

      // console.log('srcFile', srcFile);
      // console.log('dstFile', dstFile);

      const result: ApiResult = await new Promise((resolve, reject) => {
        if (this.isCopy) {
          this.datasourceService.copy(srcFile, dstFile).subscribe({
            next: (res) => resolve(res),
            error: (err) => reject(err),
          });
        } else {
          this.datasourceService.move(srcFile, dstFile).subscribe({
            next: (res) => resolve(res),
            error: (err) => reject(err),
          });
        }
      });

      if (result && result.status === 'success' && result.response[0]) {
        // console.log('main tree', [...this.treeView.children]);
        // console.log('position', {...treeviewItem});
        // console.log('this.itemToCopyCut', {...this.itemToCopyCut});

        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

        let treeviewChildren = null;
        if (this.isCopy) {
          treeviewChildren = addItemToTree(this.treeView.children, treeviewItem, this.itemToCopyCut);
        } else {
          if (treeviewItem.value.isRoot) {
            if (treeviewItem.children) {
              treeviewItem.children.push(this.itemToCopyCut);
              treeviewItem.children = sortTreeviewItems(treeviewItem.children);
            } else {
              treeviewItem.children = [this.itemToCopyCut];
            }

            treeviewChildren = removeItemFromTree(this.treeView.children, treeviewItem, this.itemToCopyCut);
          } else {
            treeviewChildren = addRemoveItemInTree(this.treeView.children, treeviewItem, this.itemToCopyCut);
          }
        }

        this.treeView.children = treeviewChildren;
        this.rootTreeview = [this.treeView];

        this.cdr.markForCheck();

        this.store.dispatch(
          SetToastrMessage({
            toastrMessage: {
              toastrType: 'info',
              message: this.textCollections.DATA_PROCESSING.FDCCS,
            },
          })
        );
      }

      this.loadingDataSourceList$.next(false);
      this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
    }
  }

  treeItemReload() {
    this.loadDatasourceList();
  }

  async treeItemRename(treeviewItem: TreeviewItem) {
    const modalRef = this.ngbModal.open(ModalRenameFileFolderComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.fileFolderName = treeviewItem.value.name;
    modalRef.componentInstance.close.subscribe(() => modalRef.close());
    const fileFolderName = await new Promise((resolve) =>
      modalRef.componentInstance.save.subscribe({
        next: (res) => resolve(res),
      })
    );
    if (fileFolderName) {
      this.store.dispatch(SetIsProgressActive({ isProgressActive: true }));
      this.loadingDataSourceList$.next(true);

      modalRef.close();

      const srcFile = this._extractFilePath(treeviewItem);
      const dstFile = `${treeviewItem.value.location}/${fileFolderName}`;

      const result: ApiResult = await new Promise((resolve, reject) => {
        this.datasourceService.move(srcFile, dstFile).subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err),
        });
      });

      if (result && result.status === 'success' && result.response[0]) {
        // this.treeView.children = await syncTreeviewItems(this.datasourceService, ROOT_DIR, this.treeView.children);
        // this.rootTreeview = [this.treeView];

        // console.log('this.treeView.children', this.treeView.children);
        // console.log('treeviewItem', treeviewItem)

        const itemToAdd = convertDatasourceItemToTreeviewItem(result.response[0]);
        const itemPosition = getItemPosition([this.treeView], treeviewItem);
        // console.log('itemPosition', itemPosition)
        // console.log('itemToAdd', itemToAdd)

        if (itemPosition.value.isRoot) {
          if (this.treeView.children) {
            this.treeView.children.forEach((_treeItem, i) => {
              if (_treeItem.value.id === treeviewItem.value.id) {
                this.treeView.children.splice(i, 1);
              }
            });
          }
        } else {
          this.treeView.children = removeItemFromTree(this.treeView.children, itemPosition, treeviewItem);
        }

        if (itemPosition.value.isRoot) {
          this.treeView.children.push(itemToAdd);
          this.treeView.children = sortTreeviewItems(this.treeView.children);
        } else {
          this.treeView.children = addItemToTree(this.treeView.children, itemPosition, itemToAdd);
        }

        this.rootTreeview = [this.treeView, this.treeViewHdfs];

        this.store.dispatch(
          SetToastrMessage({
            toastrMessage: {
              toastrType: 'info',
              message: this.textCollections.DATA_PROCESSING.FFRS,
            },
          })
        );
      }
    }

    this.loadingDataSourceList$.next(false);
    this.store.dispatch(SetIsProgressActive({ isProgressActive: false }));
  }

  treeItemUpload(treeviewItem?: TreeviewItem) {
    //console.log('treeviewItem', treeviewItem)
    if (treeviewItem) {
      this.currentTreeItem = treeviewItem;
      this.explorerCurrentPath = this._extractPath(treeviewItem);
    } else {
      this.currentTreeItem = this.treeView;
      this.explorerCurrentPath = this._extractPath(this.treeView);
    }

    // console.log('this.explorerCurrentPath 1', this.explorerCurrentPath);

    const element = document.getElementById('upload_file') as HTMLInputElement;

    element.click();
  }

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }

  private _extractPath(treeviewItem: TreeviewItem, withoutRootDir: boolean = false) {
    let newPath = '';
    
    if (treeviewItem.value.location) {
      newPath = `${treeviewItem.value.location}`;
    }

    if (treeviewItem.value.isDir) {
      newPath = `${newPath}/${treeviewItem.value.name}`;
    }

    if (withoutRootDir) {
      newPath = newPath.replace(ROOT_DIR, '');
    }

    return newPath;
  }

  private _extractFilePath(treeviewItem: TreeviewItem, withoutRootDir: boolean = false) {
    let newFilePath = '';

    newFilePath = `${treeviewItem.value.location}/${treeviewItem.value.name}`;

    if (withoutRootDir) {
      newFilePath = newFilePath.replace(ROOT_DIR, '');
    }

    if (treeviewItem.value.isConnection) {
      const hdfsLocation = treeviewItem.value.location.replace('//', '/');
      newFilePath = `hdfs://${treeviewItem.value.connectionName}${hdfsLocation}/${treeviewItem.value.name}`;
    }

    return newFilePath;
  }
}
