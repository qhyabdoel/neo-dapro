import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'setting-menu',
  templateUrl: './setting-menu.component.html',
})
export class SettingMenuComponent implements OnInit {
  @Input() public isUserManagement;

  ngOnInit() {}
}
