import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit, Optional, Input, ChangeDetectorRef, Output } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ITableChartColStyle, ITableColStyle } from 'src/app/libs/store/states/datavisualization.state';

@Component({
  selector: 'modal-custom-color',
  templateUrl: './modal-custom-color.component.html',
})
export class ModalCustomColorComponent implements OnInit {
  @Output() public form_data;
  @Output() public exploreJson;
  table_selected_column: Array<any> = [];
  columnStyles: ITableChartColStyle[] = [];
  constructor(
    @Optional() public dialogRef: MatDialogRef<ModalCustomColorComponent>,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {}

  ngOnInit() {
    this.initial();
  }
  initColStyles() {
    let result: ITableChartColStyle[] = [];
    for (let i = 0; i < this.form_data.column_styles.length; i++) {
      const style = this.form_data.column_styles[i];
      for (let j = 0; j < style.criterias.length; j++) {
        const criteria = style.criterias[j];
        result.push({
          col: style.column,
          op: criteria.op,
          values: criteria.values,
          format: criteria.format,
        });
      }
    }
    this.columnStyles = result;
  }

  initial = () => {
    this.table_selected_column = this.exploreJson.data.columns;
    this.initColStyles();
  };

  closeFormula = () => {
    this.modalService.dismissAll();
  };
  addEmptyColStyles() {
    this.columnStyles.push({
      col: '',
      op: '',
      values: [],
      format: {
        color: '',
      },
    });
  }

  removeColStyles(index: number) {
    this.columnStyles.splice(index, 1);
  }
  parseColumnStyles() {
    let groupedStyles: ITableColStyle[] = [];
    for (let i = 0; i < this.columnStyles.length; i++) {
      const style = this.columnStyles[i];
      const groupIdx = groupedStyles.findIndex((x) => x.column === style.col);
      let group = groupedStyles[groupIdx];
      if (group) {
        group.criterias.push({
          op: style.op,
          values: style.values,
          format: style.format,
        });
        groupedStyles[groupIdx] = group;
      } else {
        group = {
          column: style.col,
          criterias: [
            {
              op: style.op,
              values: style.values,
              format: style.format,
            },
          ],
        };
        groupedStyles.push(group);
      }
    }
    return groupedStyles;
  }

  applyColStyles() {
    let columnStyle = this.parseColumnStyles();
    this.activeModal.close(columnStyle);
  }

  onChange = (event, name, index) => {
    this.columnStyles = this.columnStyles.map((data, i) => {
      if (i === index) {
        switch (name) {
          case 'col':
          case 'op':
            data = {
              ...data,
              [name]: event.target.value,
            };
            break;
          case 'color':
            data = {
              ...data,
              format: { color: event.target.value },
            };
            break;
          case 'values1':
            data = {
              ...data,
              values: [event.target.value],
            };
            break;
          case 'values2':
            data = {
              ...data,
              values: [data.values[0], event.target.value],
            };
            break;
          default:
            break;
        }
      }
      return data;
    });
  };
}
