import { Injectable } from '@angular/core';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { select, Store } from '@ngrx/store';

import { ApiService } from './api.service';
import { AppState } from 'src/app/libs/store/states';
import { User } from 'src/app/libs/models';
import { currentUser } from 'src/app/libs/store/selectors/auth/auth.selectors';

import endpointList from 'src/assets/data/endpointDescription.json';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private user: User;
  public notifData = new BehaviorSubject(null);

  constructor(
    private _apicall: ApiService,
    private store: Store<AppState>,
  ) {
    this.store.pipe(select(currentUser)).subscribe(user => this.user = user);
  }

  async getApi(url) {
    let a = await this._apicall
      .get(url)
      .toPromise()
      .then((_) => {
        return _;
      })
      .catch((err) => {
        console.log(err);
      });
    return a;
  }

  get getNotif() {
    return this.notifData.asObservable();
  }

  async setNotif() {
    /*
    let url = `api/logs/${this.user.uuid}`;
    let notifListCount = 0;
    let logList: any;
    let response = await this._apicall.get(url)
      .toPromise()
      .then((result) => {
        logList = result.response;

        for (let i = 0;i < logList.length;i++) {
          let epochDate = logList[i].logged_at / 1000000;
          let datetime = moment(epochDate).format("DD-MM-YYYY hh:mm:ss")
          logList[i].logged_at = datetime;
          let endPoint = logList[i].endpoint;
          let splitEndpoint = endPoint.split('/');
          let activity = endpointList.endpointDescriptionList.filter(
            (x) => x.endpoint == splitEndpoint[2]
          )[0];
          let desc;
          if (activity != undefined) {
            if (activity.detail !== undefined) {
              let subActivity = activity.detail.filter(
                (x) => x.subendpoint == splitEndpoint[3]
              )[0];
              if (subActivity !== undefined) {
                if (subActivity.detail !== undefined) {
                  let subSubActivity = subActivity.detail.filter(
                    (x) => x.subendpoint === splitEndpoint[4]
                  )[0]
                  if (subSubActivity !== undefined) desc = subSubActivity.description;
                } else {
                  desc = subActivity.description
                }

              }
            } else {
              desc = activity.description;
            }
          }

          logList[i] = {
            ...logList[i],
            description: desc
          }
        }
        logList = logList.filter(item => item.description !== undefined);
        notifListCount = logList.length;

        let rest = {
          logList: logList,
          notifListCount: notifListCount
        };
        this.notifData.next(rest);
      }).catch(error => console.log(error));
      */
    return null;
    // 	.subscribe((result) => {
    // logList = result.response;

    // for (let i = 0; i < logList.length; i++) {
    // 	let epochDate = logList[i].logged_at / 1000000;
    // 	let datetime = moment(epochDate).format("DD-MM-YYYY hh:mm:ss")
    // 	logList[i].logged_at = datetime;
    // 	let endPoint = logList[i].endpoint;
    // 	let splitEndpoint = endPoint.split('/');
    // 	let activity = endpointList.endpointDescriptionList.filter(
    // 		(x) => x.endpoint == splitEndpoint[2]
    // 	)[0];
    // 	let desc;
    // 	if (activity != undefined) {
    // 		if (activity.detail !== undefined) {
    // 			let subActivity = activity.detail.filter(
    // 				(x) => x.subendpoint == splitEndpoint[3]
    // 			)[0];
    // 			if (subActivity !== undefined) {
    // 				if (subActivity.detail !== undefined) {
    // 					let subSubActivity = subActivity.detail.filter(
    // 						(x) => x.subendpoint === splitEndpoint[4]
    // 					)[0]
    // 					if (subSubActivity !== undefined) desc = subSubActivity.description;
    // 				} else {
    // 					desc = subActivity.description
    // 				}

    // 			}
    // 		} else {
    // 			desc = activity.description;
    // 		}
    // 	}

    // 	logList[i] = {
    // 		... logList[i],
    // 		description: desc
    // 	}
    // }
    // logList = logList.filter(item => item.description !== undefined);
    // notifListCount =  logList.length;

    // this.loglist.next(logList);
    // this.notiflistcount.next(notifListCount);

    // 	},
    // 	(error) => {
    // 		console.log(error);
    // 	}
    // )
  }
}
