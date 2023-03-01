import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { _MatDialogBase } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription, filter, iif, lastValueFrom, take, withLatestFrom } from 'rxjs';
import { queryCommandItemPropertyAndValueIsValid } from 'src/app/libs/helpers/data-processing.helper';
import { QueryCommandItem } from 'src/app/libs/models';
import { WorkspaceService } from 'src/app/libs/services';
import { UpdateQueryCommandItemEndpoint, UpdateQueryCommandItemPropertyValue } from 'src/app/libs/store/actions/pds/dataprocessing.actions';
import {
  queryCommandItemsDragPositionSelector,
  queryCommandItemsEndpointSelector,
  queryCommandItemsOnFocusSelector,
  queryCommandItemsPropertyAndValueSelector,
} from 'src/app/libs/store/selectors/dataprocessing.selectors';
import { AppState } from 'src/app/libs/store/states';

@Component({
  selector: 'query-command-item',
  templateUrl: 'query-command-item.component.html',
  styleUrls: ['query-command-item.component.scss'],
})
export class QueryCommandItemComponent implements OnDestroy, OnInit {
  @Input() item: QueryCommandItem;

  @Output() getTooltipAlias = new EventEmitter<{ a: any; b: any }>();
  @Output() onContextMenu = new EventEmitter<any>();
  @Output() onDragEnded = new EventEmitter<any>();
  @Output() onDragMoved = new EventEmitter<any>();
  @Output() setItemOnFocus = new EventEmitter();
  @Output() slotOnClick = new EventEmitter<{ queryCommandItemEndpoint: QueryCommandItemEndpoint; key: string }>();

  private subscriptions: Subscription[] = [];

  public hasInvalidProps: boolean = false;
  public queryCommandItemOnFocus: QueryCommandItemOnFocus;
  public queryCommandItemEndpoint: QueryCommandItemEndpoint;
  public queryCommandItemDragPosition: QueryCommandItemDragPosition;

  constructor(private store: Store<AppState>, private workspaceService: WorkspaceService) {}

  ngOnInit() {
    // queryCommandItemsPropertyAndValueSelector
    this.subscriptions.push(
      this.store.select(queryCommandItemsPropertyAndValueSelector)
        .subscribe(async (itemsPropertyAndValue) => {
          // console.log('queryCommandItemsPropertyAndValue', queryCommandItemsPropertyAndValue)
          if (itemsPropertyAndValue && itemsPropertyAndValue.length > 0) {
            const [filteredQueryCommandItemPropertyAndValue]: QueryCommandItemPropertyAndValue[] = itemsPropertyAndValue.filter(
              (_itemPropertyAndValue) => _itemPropertyAndValue.id === this.item.id
            );
            if (filteredQueryCommandItemPropertyAndValue) {
              this.hasInvalidProps = false;

              let isValid = queryCommandItemPropertyAndValueIsValid(filteredQueryCommandItemPropertyAndValue);

              this.hasInvalidProps = this.hasInvalidProps || !isValid;

              const itemsEndpoint: QueryCommandItemEndpoint[] = await lastValueFrom(this.store.select(queryCommandItemsEndpointSelector).pipe(take(1)));
              if (itemsEndpoint && itemsEndpoint.length > 0) {
                const [itemEndpoint]: QueryCommandItemEndpoint[] = itemsEndpoint.filter((_itemEndpoint: QueryCommandItemEndpoint) => _itemEndpoint.id === filteredQueryCommandItemPropertyAndValue.id);
                // check if it is a SELECT, and has source type === 'table' => then add IN endpoint slot
                // check if it is a SELECT, and has condition set => then add BRANCH endpoint slot
  
                if (itemEndpoint) {
                  const matches = filteredQueryCommandItemPropertyAndValue.id.match(/^([A-Z]+)_[0-9]+$/);
                  if (matches && matches[1] && matches[1] === 'SELECT') {
                    let isTableSourceType = false;
                    let isGzSourceType = false;
                    let hasCondition = false;
                    let aliasValue = '';
    
                    filteredQueryCommandItemPropertyAndValue.commandProperties.forEach((_cmdProp: QueryCommandProperty) => {
                      if (!isTableSourceType && _cmdProp.name === 'from_type' && _cmdProp.value === 'TABLE') {
                        isTableSourceType = true;
                      }
    
                      if (!isTableSourceType && _cmdProp.name === 'from_type' && _cmdProp.value === 'GZ') {
                        isGzSourceType = true;
                      }
  
                      if (!hasCondition && _cmdProp.name === 'where' && _cmdProp.value) {
                        hasCondition = true;
                      }
    
                      if (_cmdProp.name === 'alias') {
                        aliasValue = _cmdProp.value;
                      }
                    });
    
                    let objs = [];
                    if (isTableSourceType || isGzSourceType) {
                      if (!itemEndpoint.in.isExist) {
                        objs.push({
                          key: 'in',
                          value: {
                            isExist: true,
                            isActive: false,
                            from: [],
                          }
                        });
                      }
                    } else {
                      objs.push({
                        key: 'in',
                        value: {
                          isExist: false,
                          isActive: false,
                          from: [],
                        }
                      });
                    }
                    
                    if (hasCondition) {
                      if (itemEndpoint.branch && !itemEndpoint.branch.isExist) {
                        objs.push({
                          key: 'branch',
                          value: {
                            isExist: true,
                            isActive: false,
                            to: [],
                          }
                        });
                      }
                    } else {
                      if (itemEndpoint.branch && itemEndpoint.branch.isExist) {
                        this.workspaceService.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'branch');
                        this.workspaceService.findReferedDatasetAndClear(itemEndpoint.id, 'branch');
      
                        this.workspaceService.findPeerEndpointAndUncheckingSlot(itemEndpoint.id, 'out');
                        this.workspaceService.findReferedDatasetAndClear(itemEndpoint.id, 'out');
      
                        if (aliasValue) {
                          this.store.dispatch(UpdateQueryCommandItemPropertyValue({
                            item: filteredQueryCommandItemPropertyAndValue,
                            propName: 'alias',
                            propValue: '',
                          }));  
                        }
      
                        objs.push({
                          key: 'branch',
                          value: {
                            isExist: false,
                            isActive: false,
                            to: [],
                          }
                        });
      
                        objs.push({
                          key: 'out',
                          value: {
                            isExist: true,
                            isActive: false,
                            to: [],
                          }
                        });  
                      }
                    }
    
                    // console.log('objs', objs)
    
                    if (objs && objs.length > 0) {
                      this.store.dispatch(UpdateQueryCommandItemEndpoint({
                        id: filteredQueryCommandItemPropertyAndValue.id,
                        objs,
                      }));  
                    }
                  }  
                }
              }
            }
          }
        }
      )
    );

    // queryCommandItemsOnFocusSelector
    this.subscriptions.push(
      this.store.select(queryCommandItemsOnFocusSelector).subscribe((queryCommandItemsOnFocus) => {
        // console.log('queryCommandItemsOnFocus', queryCommandItemsOnFocus)
        if (queryCommandItemsOnFocus && queryCommandItemsOnFocus.length > 0) {
          const [filteredItemsOnFocus]: QueryCommandItemOnFocus[] = queryCommandItemsOnFocus.filter(
            (queryCommandItemOnFocus) => queryCommandItemOnFocus.id === this.item.id
          );
          if (filteredItemsOnFocus) {
            this.queryCommandItemOnFocus = filteredItemsOnFocus;
          }
        }
      })
    );

    // queryCommandItemsEndpointSelector
    this.subscriptions.push(
      this.store.select(queryCommandItemsEndpointSelector).subscribe((queryCommandItemsEndpoint) => {
        // console.log('queryCommandItemsEndpoint', queryCommandItemsEndpoint)
        if (queryCommandItemsEndpoint && queryCommandItemsEndpoint.length > 0) {
          const [filteredItemsOnFocus]: QueryCommandItemEndpoint[] = queryCommandItemsEndpoint.filter(
            (queryCommandItemEndpoint) => queryCommandItemEndpoint.id === this.item.id
          );
          if (filteredItemsOnFocus) {
            this.queryCommandItemEndpoint = filteredItemsOnFocus;
          }

        }
      })
    );

    // queryCommandItemsDragPositionSelector
    this.subscriptions.push(
      this.store.select(queryCommandItemsDragPositionSelector).subscribe((queryCommandItemsDragPosition) => {
        if (queryCommandItemsDragPosition && queryCommandItemsDragPosition.length > 0) {
          const [filteredItemsDragPosition]: QueryCommandItemDragPosition[] = queryCommandItemsDragPosition.filter(
            (queryCommandItemDragPosition) => queryCommandItemDragPosition.id === this.item.id
          );
          if (filteredItemsDragPosition) {
            this.queryCommandItemDragPosition = filteredItemsDragPosition;
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((_subscription) => _subscription.unsubscribe());
  }

  _slotOnClick(queryCommandItemEndpoint: QueryCommandItemEndpoint, key: string) {
    this.slotOnClick.emit({ queryCommandItemEndpoint, key });
  }

  _getTooltipAlias(a: any, b: any) {
    this.getTooltipAlias.emit({ a, b });
  }

  _onContextMenu($event) {
    this.onContextMenu.emit($event);
  }

  _onDragEnded($event) {
    this.onDragEnded.emit($event);
  }

  _onDragMoved($event) {
    this.onDragMoved.emit($event);
  }

  _setItemOnFocus($event) {
    this.setItemOnFocus.emit($event);
  }
}
