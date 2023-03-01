import { MatTableDataSource } from '@angular/material/table';
import { helperGenerateExploreJsonUrl } from 'src/app/libs/helpers/data-visualization-helper';
import { get_format_date } from 'src/app/libs/helpers/utility';
import { axisFormater } from '.';
import * as _moment from 'moment';
import { default as _rollupMoment } from 'moment';

const moment = _rollupMoment || _moment;

const formatingDate = (value: string, formatVal: any) => {
  const dateStr = moment(value).format(get_format_date(formatVal));
  return dateStr === 'Invalid date' ? value : dateStr;
};

const formatRecords = (records: any, data: any) => {
  const formattedRecods = records.map((row: any, index: number) => {
    let formattedRow = {};
    const customFormatArr = data.form_data.custom_column_format_arr;

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

    return data.form_data.static_number ? { ...formattedRow, No: index + 1 } : formattedRow;
  });

  return { formattedRecods, realRecords: records };
};

const completeRecords = (data: any) => {
  if (data.form_data.show_total_numeric_column) {
    let totalValueCol = {};
    let index = 0;

    for (var prop in data.data.records[0]) {
      if (Object.prototype.hasOwnProperty.call(data.data.records[0], prop)) {
        let numericCol = data.table_sum[prop];
        if (prop === data.data.columns[0]) {
          totalValueCol[prop] = 'Total';
        } else {
          if (numericCol !== undefined) {
            totalValueCol[prop] = numericCol;
          } else {
            totalValueCol[prop] = '';
          }
        }
        index++;
      }
    }

    return formatRecords([...data.data.records, totalValueCol], data);
  }

  return formatRecords(data.data.records, data);
};

const cleanData = (form_data: any) => {
  let formData = form_data;
  delete formData.line_metric;
  delete formData.line_const;
  delete formData.metric;

  return formData;
};

const compareMath = (value: any, x: any, y: any, op: string) => {
  switch (op) {
    case '==':
      return value == x;
    case '>':
      return value > x;
    case '<':
      return value < x;
    case '>=':
      return value >= x;
    case '=<':
      return value <= x;
    case 'between':
      return value >= x && value <= y;
    case 'not between':
      return value >= y && value <= x;
    default:
      break;
  }
};

export const getColumnColor = (row: any, column: string, columnStyles: any) => {
  let color: any = false;

  for (let styleObj of columnStyles) {
    if (column === styleObj.column) {
      for (let criteria of styleObj.criterias) {
        let value = row[column];
        let x: any;
        let y: any;

        if (!color && row) {
          if (isNaN(value)) {
            value = moment(value);

            const dateValue = moment(value).format('YYYY-MM-DD');
            const isDate = dateValue !== 'Invalid date';

            if (isDate) {
              const dateX = moment(criteria.values[0], 'DD/MM/YYYY');
              const dateY = moment(criteria.values[1]).format('YYYY-MM-DD');
              x = moment(dateX);
              y = moment(dateY);
            } else {
              value = row[column];
              x = criteria.values[0];
              y = criteria.values[1];
            }
          } else {
            x = Number(criteria.values[0]);
            y = Number(criteria.values[1]);
          }

          color = compareMath(value, x, y, criteria.op) && criteria.format.color;
        }
      }
    }
  }

  return color;
};

export const setConfigChartTable = (data: any, sort: any) => {
  // dummy empty data
  // data = { ...data, data: { ...data.data, records: [] } };
  let dataSource = new MatTableDataSource();
  let displayedColumns = data.form_data.static_number ? ['No', ...data.data.columns] : data.data.columns;

  const recordsObj = completeRecords(data);
  dataSource.data = recordsObj.formattedRecods;

  const cellStyle = {
    'font-size': (data.form_data.table_font_size || 10) + 'px',
    'font-family': data.form_data.table_font_family || 'Roboto',
    width: '100%',
  };

  const headerStyle = {
    'margin-right': '32px',
    ...cellStyle,
  };

  const customColumnFormatArr = data.form_data.custom_column_format_arr;
  let flexStyles = {};

  displayedColumns.map((column: string) => {
    const customColumnFormat = customColumnFormatArr.find((obj: any) => obj.column === column);
    const columnFormatStyle = customColumnFormat?.format_type === 'number' ? 'text-align:right' : 'text-align:left';

    const columnFlex = data.form_data.custom_width_column_arr.find((obj: any) => obj.column === column);
    const columnStyle = columnFlex ? columnFlex.width : 'auto;';

    flexStyles[column] = columnStyle + columnFormatStyle;
  });

  return { dataSource, displayedColumns, cellStyle, headerStyle, flexStyles };
};

export const getSortedData = async (
  event: any,
  myChartID: string,
  token: string,
  explore: any,
  pageIndex: number,
  service: any,
  sortObj: any
) => {
  let exploreJsonUrl = helperGenerateExploreJsonUrl(myChartID);
  if (token) exploreJsonUrl += '&token=' + token;

  let form_data = { ...explore.form_data };
  form_data = cleanData(form_data);

  form_data.page_index = pageIndex;
  form_data.page_sort = [sortObj];

  const param = { form_data: JSON.stringify(form_data) };
  let exploreJsonResult = await service.loadPostData(exploreJsonUrl, param);
  const exploreJson = exploreJsonResult.response || exploreJsonResult;

  return completeRecords(exploreJson);
};
