import { Component, OnInit, ViewChild } from '@angular/core';
import _ from 'lodash';
import { ToastrComponent } from 'src/app/components/toastr/toastr.component';
import { XCorref, XSelect } from './helper/helper.dataprocessing';

@Component({
  selector: 'pq-dataprocessing',
  templateUrl: './dataprocessing.component.html',
  styleUrls: ['./dataprocessing.component.scss'],
})
export class DataprocessingComponent implements OnInit {
  @ViewChild(ToastrComponent, { static: false }) toastr: ToastrComponent;
  commandItem: any = [];
  constructor() {}

  ngOnInit() {}

  addCommandItem = (event) => {
    let x = Object.assign([], this.commandItem);
    x.push(event);
    this.commandItem = x;
    // console.log('parent', event);
    // console.log('command', this.commandItem);
    // let select11: XSelect = new XSelect(1, 2);
    // let coref1: XCorref = new XCorref(3, 4);
    // select11.SetChildren('out', coref1);
    // console.log(select11);
    // console.log(coref1.in[0].getPos());
  };
}
