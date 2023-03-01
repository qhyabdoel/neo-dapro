import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  Inject,
  ChangeDetectorRef,
  EventEmitter,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';

import { QueryCommand, QueryCommandItem } from 'src/app/libs/models';
import {
  UpdateQueryCommandItemPropertyValue,
  SetIsNodesModelToPql,
  SetIsQueryRequestTriggeredSubscribed,
  SetIsLineRedrawingNeeded,
  UpdateQueryObjectScheduler,
} from 'src/app/libs/store/actions/pds/dataprocessing.actions';
import {
  queryCommandItemsPropertyAndValueSelector,
  // queryCommandItemsSequenceSelector,
  queryCommandItemsOnFocusSelector,
  queryCommandItemsSelector,
  queryCommandsSelector,
  queryResultSelector,
  isQueryRequestTriggeredSelector,
  queryObjectSelector,
  isNodesModelToPqlSelector,
} from 'src/app/libs/store/selectors/dataprocessing.selectors';
import { AppState } from 'src/app/libs/store/states';
import { DOCUMENT } from '@angular/common';
import _ from 'lodash';
import { TranslationService, WorkspaceService } from 'src/app/libs/services';
import { lastValueFrom, Subscription, take } from 'rxjs';
import { ModalFormulaEditorComponent } from 'src/app/components/modals/ModalFormulaEditor/modal-formula-editor.component';

import formulaJson from 'src/assets/data/dataprocessing/formula.json';
import aggregateJson from 'src/assets/data/dataprocessing/aggregate.json';
import { ModalTextAreaComponent } from 'src/app/components/modals/ModalTextArea/modal-text-area.component';
import moment from 'moment';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDatetimePickerInputEvent } from '@angular-material-components/datetime-picker';
import { isLanguageChangeTriggeredSelector } from 'src/app/libs/store/selectors/general.selector';
import { SetIsLanguageChangeTriggered } from 'src/app/libs/store/actions/general.actions';
import { reloadQueryCommandItemsPropertyAndValue } from 'src/app/libs/helpers/data-processing.helper';
import { ModalViewQueryInformationComponent } from 'src/app/components/modals/modalViewQueryInformation/modal-query-information.component';

declare var $: any;

@Component({
  selector: 'query-command-sidebar',
  templateUrl: './query-command.component.html',
  styleUrls: ['./query-command.component.scss'],
})
export class QueryCommandSidebarCommponent implements OnInit {
  @Output() addCommandItem: EventEmitter<any> = new EventEmitter<any>();
  public queryCommands = [];
  private subscriptions: Subscription[] = [];
  constructor(
    private cdr: ChangeDetectorRef,
    private modal: NgbModal,
    private store: Store<AppState>,
    private translationService: TranslationService,
    private workspaceService: WorkspaceService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  async ngOnInit() {
    // queryCommandsSelector
    this.subscriptions.push(
      this.store.select(queryCommandsSelector).subscribe((queryCommands) => {
        this.queryCommands = queryCommands;
      })
    );
  }

  handleCommanditem = (event) => {
    this.addCommandItem.emit(event);
  };
}
