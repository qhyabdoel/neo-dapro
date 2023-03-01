import {
  Component,
  OnInit,
  OnChanges,
  Input,
  SimpleChanges,
  ViewChild,
  HostListener,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { PanZoomConfig, PanZoomConfigOptions, PanZoomModel } from 'ngx-panzoom';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'data-processing-workspace',
  templateUrl: './data-processing-workspace.component.html',
  styleUrls: ['./data-processing-workspace.component.scss'],
})
export class DataProcessingWorkspaceComponent implements OnInit, OnChanges {
  @Input() data;
  public scaleValue: number = 1;
  private panZoomConfigOptions: PanZoomConfigOptions = {
    acceleratePan: false,
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
  };
  public panZoomConfig: PanZoomConfig = new PanZoomConfig(this.panZoomConfigOptions);
  private panzoomModel: PanZoomModel;
  private tempSlotLine: {
    from: string;
    fromItem: QueryCommandItemEndpoint;
    fromSlot: string;
    to: string;
    line: any;
  } = {
    from: '',
    fromItem: null,
    fromSlot: '',
    to: 'tempSlot',
    line: null,
  };
  public activateTempSlot: boolean = false;

  workspacesItem: Array<any> = [];
  @ViewChild('tempSlot') tempSlot: ElementRef;

  /*
   * HOST LISTENER
   */
  @HostListener('document:mousemove', ['$event']) async onMouseMove($event) {
    // console.log('$event', $event);

    // if (this.panzoomModel.pan) {
    //   console.log('this.panzoomModel.pan.x', this.panzoomModel.pan.x)
    //   console.log('this.panzoomModel.pan.y', this.panzoomModel.pan.y)
    // }

    // console.log('this.tempSlot', this.tempSlot);
    // console.log('this.activateTempSlot', this.activateTempSlot);
    if (this.tempSlot && this.activateTempSlot) {
      const factor = 1 * 10 - 10 + 1;

      const offsetX = -80 + factor * 85 + (this.panzoomModel.pan ? this.panzoomModel.pan.x : 0);
      const offsetY = 50 + factor * 40 + (this.panzoomModel.pan ? this.panzoomModel.pan.y : 0);

      // scaleValue = 1.0
      this.tempSlot.nativeElement.style.left = `${$event.pageX - offsetX}px`;
      this.tempSlot.nativeElement.style.top = `${$event.pageY - offsetY}px`;

      // scaleValue = 1.1
      // this.tempSlot.nativeElement.style.left = `${$event.pageX - 90}px`;
      // this.tempSlot.nativeElement.style.top = `${$event.pageY - 130}px`;

      // scaleValue = 1.2
      // this.tempSlot.nativeElement.style.left = `${$event.pageX - 175}px`;
      // this.tempSlot.nativeElement.style.top = `${$event.pageY - 130}px`;

      if (this.tempSlotLine && this.tempSlotLine.line) {
        try {
          this.tempSlotLine.line.position();
        } catch (e) {
          // console.log('Errr: ', e.message)
        }
      }

      this.cdr.detectChanges();
    }
  }

  @HostListener('document:mousedown', ['$event']) onMouseDown($event) {
    if (this.activateTempSlot && !($event.target as Element).className.match(/zmdi/)) {
      // console.log('this.tempSlotLine', this.tempSlotLine)
      this.tempSlotLine.line.remove();
      this.activateTempSlot = false;
    }
  }
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.workspacesItem = this.data;
      console.log(this.workspacesItem);
    }
  }
  handleSlot = (e?, qci?) => {
    console.log(e);
  };
}
