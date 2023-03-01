import {
    Component,
    OnInit,
    Input,
    AfterViewInit,
    ChangeDetectorRef,
    ViewChild
} from '@angular/core';
import { InjectDirective } from 'src/app/libs/directives';

@Component({
    selector: 'pq-card-child',
    templateUrl: './card-child.component.html'
})

export class CardChildComponent implements OnInit, AfterViewInit {
    constructor(private cdRef: ChangeDetectorRef) {}

    @ViewChild(InjectDirective, { static: false }) injectComp: InjectDirective;

    // get component ref from outside
    @Input() title: string;
    @Input() hasActivity: boolean;
    @Input() eventButtonData: any;
    @Input() formData: any;
    @Input() handleEventButton: any;
    @Input() borderStyle: any;
    @Input() createChildComponent: any;
    @Input() chartIndex: number;

    ngOnInit() {}
    
    ngAfterViewInit(): void {
        this.createChildComponent(this.chartIndex);
        this.cdRef.detectChanges();
    }
}
  