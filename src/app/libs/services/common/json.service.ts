import { Injectable } from '@angular/core';
// import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { TranslationService } from './translation.service';
import men from 'src/assets/data/config/messages/en.json';
import mid from 'src/assets/data/config/messages/id.json';
import on_premise from 'src/assets/data/config/on_premise.json';
import on_cloud from 'src/assets/data/config/on_cloud.json';
import developer from 'src/assets/data/config/developer.json';
import introEN from 'src/assets/data/introduction/introduction_en.json';
import introID from 'src/assets/data/introduction/introduction_id.json';
import * as visualEN from 'src/assets/data/datavisualization/visual_type_en.json';
import * as visualID from 'src/assets/data/datavisualization/visual_type_id.json';
import * as teamCredits from 'src/assets/data/team/team_credits.json';

@Injectable({
  providedIn: 'root',
})
export class JsonService {
  public vEN: any = (visualEN as any).default;
  public vID: any = (visualID as any).default;
  public tCred: any = (teamCredits as any).default;
  public messages = new BehaviorSubject(null);
  public dataprocessingJson = new BehaviorSubject(null);
  public buttonCreateName = new BehaviorSubject<String>('');
  public titleName = new BehaviorSubject<String>('');
  public zoomLevel = new BehaviorSubject<Number>(5);

  constructor(private _apicall: ApiService, private translationService: TranslationService) {}

  get getbuttonCreateName() {
    return this.buttonCreateName.asObservable();
  }
  setbuttonCreateName(buttonCreateName) {
    this.buttonCreateName.next(buttonCreateName);
  }

  get getZoomLevel() {
    return this.zoomLevel.asObservable();
  }
  setZoomLevel(level: number) {
    this.zoomLevel.next(level);
  }

  get getTitleName() {
    return this.titleName.asObservable();
  }
  setTitleName(titleName) {
    this.titleName.next(titleName);
  }

  get getDataprocessingJson() {
    return this.dataprocessingJson.asObservable();
  }

  get getMessage() {
    return this.messages.asObservable();
  }

  async setMessage(lang?) {
    if (lang == undefined) lang = this.translationService.getSelectedLanguage();
    let messages = {};
    if (lang == 'id') messages = mid;
    else messages = men;
    this.messages.next(messages);
  }

  async retMessage(lang?: string) {
    let _lang = lang;
    if (!lang) {
      _lang = this.translationService.getSelectedLanguage();
    }

    let messages = {};
    if (_lang === 'id') {
      messages = mid;
    } else {
      messages = men;
    }

    return messages;
  }

  async retVisual(lang?) {
    if (lang == undefined) lang = this.translationService.getSelectedLanguage();
    let messages = {};
    if (lang == 'id') messages = this.vID;
    else messages = this.vEN;
    return messages;
  }
  async retTeam() {
    let messages = {};
    messages = this.tCred;
    return messages;
  }
  async retIntro(lang?): Promise<any> {
    if (lang == undefined) lang = this.translationService.getSelectedLanguage();
    let messages = {};
    if (lang == 'id') messages = introID;
    else messages = introEN;
    return messages;
  }
  async retEnvironment(env?): Promise<any> {
    let objEnv = {};
    switch (env) {
      case 'on_premise':
        objEnv = on_premise;
        break;
      case 'on_cloud':
        objEnv = on_cloud;
        break;
      default:
        objEnv = developer;
        break;
    }
    return objEnv;
  }
}
