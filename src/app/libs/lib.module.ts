import { NgModule } from '@angular/core';

import {
  FirstLetterPipe,
  GetObjectPipe,
  JoinPipe,
  SafePipe,
  TimeElapsedPipe,
  NumberFormatPiPe,
  FilterPipe,
  DateFormatPipe,
  Json2TablePipe,
  ReplacePipe,
  LoadingPipe,
  PaginatorPipe,
  ToArrayPipe,
  KeyValsPipe,
  MaxNumPipe,
  ShortHashPipe,
  TypeCheckPipe,
  ToFixedPipe,
} from './pipes';

import {
  InjectDirective
} from './directives';

@NgModule({
  declarations: [
    FirstLetterPipe,
    GetObjectPipe,
    JoinPipe,
    SafePipe,
    TimeElapsedPipe,
    NumberFormatPiPe,
    FilterPipe,
    DateFormatPipe,
    Json2TablePipe,
    ReplacePipe,
    LoadingPipe,
    PaginatorPipe,
    ToArrayPipe,
    KeyValsPipe,
    MaxNumPipe,
    ShortHashPipe,
    TypeCheckPipe,
    InjectDirective,
    ToFixedPipe,
  ],
  imports: [],
  exports: [
    FirstLetterPipe,
    GetObjectPipe,
    JoinPipe,
    SafePipe,
    TimeElapsedPipe,
    NumberFormatPiPe,
    FilterPipe,
    DateFormatPipe,
    Json2TablePipe,
    ReplacePipe,
    LoadingPipe,
    PaginatorPipe,
    ToArrayPipe,
    KeyValsPipe,
    MaxNumPipe,
    ShortHashPipe,
    TypeCheckPipe,
    InjectDirective,
    ToFixedPipe,
  ],
})
export class LibModule { }
