import { MatTableDataSource } from '@angular/material/table';
import { axisFormater } from '.';
import { get_format_date } from 'src/app/libs/helpers/utility';

import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

const formatingDate = (value: string, formatVal: any) => {
  const dateStr = moment(value).format(get_format_date(formatVal));
  return dateStr === 'Invalid date' ? value : dateStr;
};

const formatRecord = (row: any, data: any) => {
  const customFormatArr = data.form_data.custom_column_format_arr;
  let formattedRow = [];

  Object.keys(row).map((key) => {
    const customFormatObj = customFormatArr.find((obj: any) => obj.column === key);

    if (customFormatObj) {
      formattedRow[key] =
        customFormatObj.format_type === 'number'
          ? axisFormater(row[key], data, customFormatObj.format)
          : formatingDate(row[key], customFormatObj.format);
    } else {
      if (typeof row[key] === 'number') {
        formattedRow[key] = row[key] % 1 !== 0 ? axisFormater(row[key], data, '.3f') : row[key];
      } else formattedRow[key] = row[key];
    }
  });

  return formattedRow;
};

export const setConfigTableComparison = (data: any) => {
  // dummy data when raw.data is empty
  // data = { ...data, data: [], grand_total: null };
  let dataSource = new MatTableDataSource();

  let tableData = data.data.map((item: Array<any>, index: number) => {
    let rowData = {};
    for (const i in data.columns) {
      rowData[data.columns[i]] = item[i];
    }
    return formatRecord(rowData, data);
  });

  const cellStyle = {
    'font-size': (data.form_data.table_font_size || 10) + 'px',
    'font-family': data.form_data.table_font_family || 'Roboto',
  };

  const headerStyle = {
    'margin-right': '32px',
    ...cellStyle,
  };

  let flexStyles = {};

  let grandTotal = {};
  for (const key in data.grand_total) {
    grandTotal[key] = data.grand_total[key] || 0;
  }
  if (data.columns) {
    grandTotal[data.columns[0]] = 'Total';
  }

  dataSource.data = tableData;

  return {
    dataSource,
    displayedColumns: data.columns,
    cellStyle,
    headerStyle,
    flexStyles,
    displayedColumnsFooter: formatRecord(grandTotal, data),
  };
};
