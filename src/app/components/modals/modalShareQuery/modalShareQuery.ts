import { MatDialogRef } from '@angular/material/dialog';
import { Component, Input, OnInit, Optional } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/libs/services';
@Component({
  selector: 'modal-share-query',
  templateUrl: './modalShareQuery.html',
})
export class ModalShareQueryComponent implements OnInit {
  @Input() public query_id;
  pagelength: any = [];
  pageSize: number;
  pageIndex: number;
  userList: Array<any> = [];
  checkedList: Array<any> = [];
  filterText: string;
  masterUserList: Array<any> = [];
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalShareQueryComponent>,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private service: ApiService
  ) {}
  async ngOnInit() {
    this.getUserInGroups();
  }
  closeModal = () => {
    this.modalService.dismissAll();
  };

  getUserInGroups = async () => {
    let result = await this.service.getApi('api/query/users-in-groups');
    if (result.status) {
      this.userList = result.result.response.map((data) => (data = { ...data, checked: false }));
      this.masterUserList = result.result.response.map((data) => (data = { ...data, checked: false }));
    }
  };

  submit = async () => {
    let data = {
      query_id: this.query_id,
      user_dests: this.checkedList.map((item) => {
        return item.uuid;
      }),
    };
    let result = await this.service.postApi('api/query/share', data);
    if (result.status) {
      this.activeModal.close('Query Successfully Shared!');
    } else {
      this.activeModal.close('Query Failed to Share');
    }
  };

  onChangeCheckBox = (data) => {
    this.userList.map((item) => {
      if (item.uuid === data.uuid) {
        item = {
          ...item,
          checked: !item.checked,
        };
      }
    });
    this.checkedList = this.userList.filter((obj) => obj.checked);
  };

  selectAllUser = (event) => {
    this.userList = this.userList.map((data) => (data = { ...data, checked: event.target.checked }));
    this.checkedList = this.userList.filter((obj) => obj.checked);
  };

  filterUser = () => {
    if (!this.filterText) {
      this.getUserInGroups();
    } else {
      this.userList = this.masterUserList.filter((data) => data.email.includes(this.filterText));
    }
  };
}
