import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { RemoveToastrMessage } from 'src/app/libs/store/actions/pds/dataprocessing.actions';
import { toastrMessagesSelector } from 'src/app/libs/store/selectors/dataprocessing.selectors';
import { AppState } from 'src/app/libs/store/states';

@Component({
  selector: 'toastr',
  templateUrl: './toastr.component.html',
  styleUrls: ['./toastr.component.scss'],
})
export class ToastrComponent implements OnInit {
  public toastrMessages: ToastrMessage[];

  constructor(private cdr: ChangeDetectorRef, private store: Store<AppState>) {}

  ngOnInit() {
    this.store.select(toastrMessagesSelector).subscribe((toastrMessages) => {
      this.toastrMessages = toastrMessages;

      if (toastrMessages && toastrMessages.length > 0) {
        toastrMessages.forEach((toastrMessage, index) => {
          setTimeout(() => {
            this.store.dispatch(RemoveToastrMessage({ index }));
            this.cdr.detectChanges();
          }, 10000);
        });
      }

      this.cdr.detectChanges();
    });
  }

  calcTop(i: number) {
    return {};
  }

  onClick(index: number) {
    this.store.dispatch(RemoveToastrMessage({ index }));
    this.cdr.detectChanges();
  }
}
