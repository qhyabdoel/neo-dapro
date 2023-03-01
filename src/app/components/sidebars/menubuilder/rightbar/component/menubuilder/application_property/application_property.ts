import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter, Input, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ApiService, JsonService, LayoutUtilsService, TranslationService } from 'src/app/libs/services';
import { AppState } from 'src/app/libs/store/states';
import { DOCUMENT } from "@angular/common";

@Component({
  selector: 'application_property',
  templateUrl: './application_property.html',
})
export class ApplicationPropertyComponent implements OnInit {
  @Input() formData;
  @Input() activeColapse;
  @Output() collapseOnClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() openModalTemplate: EventEmitter<any> = new EventEmitter<any>();
  @Output() errorHandler: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleChangeFormData: EventEmitter<any> = new EventEmitter<any>();
  messages: any;
  constructor(
    private layoutUtilsService: LayoutUtilsService,
    private jsonService: JsonService,
    private service: ApiService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {}
  handleChange(event: any, type: string) {
    this.handleChangeFormData.emit({ name: event.name, value: event.value, type });
  }
  async deleteByOne(item: any) {
    this.messages = await this.jsonService.retMessage();
    const dialogRef = this.layoutUtilsService.deleteElement(
      this.messages.APPLICATIONS.C,
      this.messages.APPLICATIONS.MSG_DN,
      this.messages.APPLICATIONS.AD
    );
    dialogRef.afterClosed().subscribe(async (res) => {
      if (!res) {
        return;
      }
      await this.service.postApi(`/api/applications/${item.slug}/delete`, {}, true);
    });
  }
  openTemplate = (type) => {
    this.openModalTemplate.emit(type);
  };
  errorHandling = (event) => {
    this.errorHandler.emit(event);
  };

  collapsible = (event) => {
    this.collapseOnClick.emit(event);
  };

  setPopover() {
    this.document.body.classList.add('show-popover');
  }

  hidePopover() {
    this.document.body.classList.remove('show-popover');
  }
}
