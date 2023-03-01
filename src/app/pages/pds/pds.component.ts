import { Component, OnInit, } from '@angular/core';
import { MenuConfigService } from "src/app/libs/services";

@Component({
  selector: "pq-pds",
  templateUrl: "./pds.component.html"
})
export class PdsComponent implements OnInit {
  title = 'PDS DATA PROCESSING';
  constructor(private menuConfigService: MenuConfigService) { }

  ngOnInit() {
    this.menuConfigService.setShowMenu(true);
  }
}
