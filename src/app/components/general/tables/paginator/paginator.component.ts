import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  EventEmitter,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  template: `
    <div class="btn_custom-paging-container">
      <button
        mat-button
        class="mat-icon-button"
        *ngFor="let page of pageNumbers"
        [ngClass]="{ active: page === activeNumber }"
        [disabled]="!(page | typeCheck: 'number') || page === activeNumber"
        (click)="click.emit(page)"
      >
        {{ (page | typeCheck: 'number') ? page + 1 : page }}
      </button>
    </div>
  `,
})
export class PaginationNumberButtonsComponent {
  @Input() pageNumbers: any[];
  @Input() activeNumber: number;
  @Output() click: EventEmitter<number> = new EventEmitter<number>();
}

@Component({
  selector: 'pq-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss'],
})
export class PaginatorComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() length: number;
  @Input() pageSize: number;
  @Input() pageSizeOptions: number[];
  @Output() page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  subscription: Subject<boolean>;
  component: ComponentRef<PaginationNumberButtonsComponent>;
  pageNumber = 3;

  constructor(
    private readonly vr: ViewContainerRef,
    private readonly componentFactoryResolver: ComponentFactoryResolver,
    private readonly renderer: Renderer2,
    private readonly injector: Injector,
    private readonly cdr: ChangeDetectorRef
  ) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PaginationNumberButtonsComponent);
    this.component = componentFactory.create(this.injector);
    this.component.instance.click.subscribe((i) => {
      const newEvent: PageEvent = {
        pageSize: this.paginator.pageSize,
        pageIndex: i,
        length: this.paginator.length,
      };

      this.setPaginatorNumber(newEvent);
      this.paginator.pageIndex = i;
      this.paginator.page.emit(newEvent);
    });

    this.subscription = new Subject();
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this.paginator.page.subscribe((param) => this.setPaginatorNumber(param));
    this.setPaginatorNumber({
      pageSize: this.paginator.pageSize,
      pageIndex: this.paginator.pageIndex,
      length: this.paginator.length,
    });
    this.renderer.insertBefore(
      this.vr.element.nativeElement.querySelector('.mat-paginator-range-actions'),
      this.component.location.nativeElement,
      this.vr.element.nativeElement.querySelector('.mat-paginator-range-actions').childNodes[5]
    );
  }

  ngOnDestroy() {
    this.subscription.next(true);
    this.subscription.unsubscribe();
    this.component.destroy();
    this.component.instance.click.unsubscribe();
    this.paginator.page.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    const newEvent: PageEvent = {
      pageSize: changes.pageSize ? changes.pageSize.currentValue : this.paginator.pageSize,
      pageIndex: changes.pageIndex ? changes.pageIndex.currentValue : 0,
      length: changes.length ? changes.length.currentValue : this.paginator.length,
    };
    this.setPaginatorNumber(newEvent);

    this.paginator.pageIndex = newEvent.pageIndex;
  }

  private setPaginatorNumber({ pageIndex, pageSize, length: totalLength }): void {
    const numbers = [];
    if (pageIndex - this.pageNumber > 0) {
      numbers.push('...');
    }
    for (
      let i = pageIndex - this.pageNumber >= 0 ? pageIndex - this.pageNumber : 0;
      i < totalLength / pageSize && i < pageIndex + this.pageNumber;
      i++
    ) {
      numbers.push(i);
    }

    if (pageIndex + this.pageNumber < totalLength / pageSize) {
      numbers.push('...');
    }

    this.component.instance.pageNumbers = numbers;
    this.component.instance.activeNumber = pageIndex;
    this.component.changeDetectorRef.detectChanges();
    this.cdr.detectChanges();
  }
}
