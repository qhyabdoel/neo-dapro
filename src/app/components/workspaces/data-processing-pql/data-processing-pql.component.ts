import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';

import { SetIsNodesModelToPql, SetPqlString } from 'src/app/libs/store/actions/pds/dataprocessing.actions';
import { pqlStringSelector } from 'src/app/libs/store/selectors/dataprocessing.selectors';
import { AppState } from 'src/app/libs/store/states';
import { WorkspaceService } from 'src/app/libs/services';

@Component({
  selector: 'data-processing-pql',
  templateUrl: 'data-processing-pql.component.html',
  styleUrls: ['data-processing-pql.component.scss'],
})
export class DataProcessingPqlComponent implements OnInit {
  @Input() runQuery: boolean;
  @Output() queryRan = new EventEmitter();

  public editorOptions = {
    language: 'sql',
    automaticLayout: true,
  };

  public folderIcon: string = 'icon_only';
  public isPqlExpanded: boolean = false;
  public pqlString: string = '';
  public validate_messages: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private store: Store<AppState>,
    private workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.store.select(pqlStringSelector).subscribe((pqlString: any) => {
      // console.log('pqlString', pqlString);
      if (pqlString) {
        this.pqlString = pqlString.replaceAll('; ', ';\n');
      } else {
        this.pqlString = '';
      }

      this.cdr.detectChanges();
    });
  }

  async togglePql() {
    this.isPqlExpanded = !this.isPqlExpanded;
  }

  onCodeChange(txt) {
    this.pqlString = txt;
    this.store.dispatch(SetPqlString({ pql: txt }));

    // only when editor on focus, set isNodesModelToPql to false
    if (this.isPqlExpanded) {
      this.store.dispatch(SetIsNodesModelToPql({ isNodesModelToPql: false }));
    }
  }

  async validate() {
    if (this.pqlString) {
      if (this.isPqlExpanded) {
        this.store.dispatch(SetIsNodesModelToPql({ isNodesModelToPql: false }));
      }
      await this.workspaceService.getQueryCommandItemsFromPql('data-processing-pql - validate');
    }
  }
}
