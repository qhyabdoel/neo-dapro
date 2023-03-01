import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { AppState } from 'src/app/libs/store/states';
import { currentUser, currentAuthToken } from 'src/app/libs/store/selectors/auth/auth.selectors';
import { Logout } from 'src/app/libs/store/actions/auth/auth.actions';
import { User } from 'src/app/libs/models';

@Component({
  selector: 'kt-user-profile3',
  templateUrl: './user-profile3.component.html',
})
export class UserProfile3Component implements OnInit {
  user$: Observable<User>;

  @Input() avatar = true;
  @Input() greeting = true;
  @Input() badge: boolean;
  @Input() icon: boolean;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this.user$ = this.store.pipe(select(currentUser));
  }

  logout() {
    // this.store.select(currentAuthToken).subscribe(authToken => this.store.dispatch(new Logout({ authToken })));
  }
}
