import {
    Component,
    OnInit,
    Input,
    AfterViewInit,
    ChangeDetectorRef,
    ViewChild,
    Output,
    EventEmitter,
    OnChanges
} from '@angular/core';

import { convert_metric_to_verbose, sort_array_object } from 'src/app/libs/helpers/utility';
import { MatPaginator } from '@angular/material/paginator';

@Component({
    selector: 'pq-table-comparison',
    templateUrl: './table-comparison.component.html'
})

export class TableComparisonComponent implements OnInit, AfterViewInit {
    @Input() explore: any;
    @Input() exploreJson: any;
    @Input() dataSource: any;
    @Input() displayedColumns: any;
    @Input() chartOption: any;
    @Input() pagelength: number;

    @Output() onSortData: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

    ngOnInit() {
        // this.dataSource.paginator = this.paginator;
    }
    
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    ngOnChanges() {
        this.dataSource.paginator = this.paginator;
    }
    
    setColumnName(val: string) {
        const formData = this.exploreJson.form_data;
    
        const baseColumn = formData.base_columns.find((item:any) => item.id === val);
        if (baseColumn) return baseColumn.label;

        const comparisonColumn = formData.comparison.find((item:any) => item.id === val);
        if (comparisonColumn) return comparisonColumn.label;

        return convert_metric_to_verbose(val, this.explore);
    }

    handleSortData(event: any) {
        this.onSortData.emit(event);
    }

    sortData(event: any) {
        if (event.direction === '') event.direction = 'asc';

        let baseRecords = this.dataSource.data;
        let sortedRecords = sort_array_object(baseRecords, event.active, event.direction);
        
        this.dataSource.data = sortedRecords;
    }

    onChangePage(event:any) {}

    handleApplyFilter(event: any) {
        let filterValue = event.target.value;

		filterValue = filterValue.trim(); // Remove whitespace
		filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
		this.dataSource.filter = filterValue;
	}
}
  