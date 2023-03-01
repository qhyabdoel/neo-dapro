import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pq-pdsshare',
  templateUrl: './pdsshare.component.html',
  styleUrls: ['./pdsshare.component.scss'],
})
export class PdsShareComponent implements OnInit {
  title = 'PDS SHARE DATA PROCESSING';
  constructor() {}

  ngOnInit() {
    // this.menuConfigService.setShowMenu(true);
  }
}
