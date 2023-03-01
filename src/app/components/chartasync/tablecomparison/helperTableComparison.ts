import moment from 'moment';
import { reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';

export const setInitianDate = (param, explore) => {
  let latest_date = explore.latest_date;
  for (let i = 0; i < explore.form_data.base_columns.length; i++) {
    let column_filter = explore.form_data.base_columns[i].column;
    let filter_date_type = explore.form_data.base_columns[i].filter_date_type;
    param.form_data.base_columns[i].filters = setBaseColumnDate(latest_date, column_filter, filter_date_type);
  }
  return param;
};

//add header column
export const addHeaderColumn = (exploreJson, columns) => {
  let colHeader = [];
  for (let j = 0; j < Number(exploreJson.form_data.groupby.length); j++) {
    colHeader.push(columns[j]);
  }
  for (let j = 0; j < exploreJson.form_data.base_columns.length; j++) {
    colHeader.push(exploreJson.form_data.base_columns[j].label);
  }
  for (let j = 0; j < exploreJson.form_data.comparison.length; j++) {
    colHeader.push(exploreJson.form_data.comparison[j].label);
  }
  return colHeader;
};
//add footer column
export const addFooterColumn = (exploreJson, columns, explore, d3) => {
  let arr = [],
    colFooter = [];
  for (let item of columns) {
    if (arr.length == 0) colFooter.push('Total');
    let flag = true;
    for (const [key, value] of Object.entries(exploreJson.grand_total)) {
      if (key == item) {
        let customColFormat = exploreJson.form_data.custom_column_format_arr.filter((x) => x.column === key)[0];
        flag = false;
        let num =
          customColFormat !== undefined
            ? reformatNumber(Number(value), customColFormat.format, explore, d3)
            : Number(value);
        colFooter.push(num);
      }
    }
    if (arr.length > 0 && flag) colFooter.push('');
    arr.push(item);
  }
  return colFooter;
};

export const setBaseColumnDate = (latest_date, column_filter, filter_date_type) => {
  let date_result = [];
  var date = new Date(latest_date),
    y = date.getFullYear(),
    m = date.getMonth();
  var f = new Date(y, m, 1);
  var l = new Date(y, m + 1, 0);
  var fdy = new Date(new Date().getFullYear(), 0, 1);
  var ldy = new Date(new Date().getFullYear(), 11, 31);
  let isUtc: any;
  switch (filter_date_type) {
    case 'month':
      isUtc = new Date(latest_date);
      if (String(isUtc) != 'Invalid Date') {
        (date = new Date(latest_date)), (y = date.getFullYear()), (m = date.getMonth());
        f = new Date(y, m, 1);
        l = new Date(y, m + 1, 0);
      }
      date_result.push(
        {
          col: column_filter,
          op: '>=',
          val: moment(f).format('YYYY-MM-DD'),
        },
        {
          col: column_filter,
          op: '<=',
          val: moment(l).format('YYYY-MM-DD'),
        }
      );
      break;
    case 'year':
      isUtc = new Date(latest_date);
      if (String(isUtc) != 'Invalid Date') {
        fdy = new Date(new Date(latest_date).getFullYear(), 0, 1);
        ldy = new Date(new Date(latest_date).getFullYear(), 11, 31);
      }
      date_result.push(
        {
          col: column_filter,
          op: '>=',
          val: moment(fdy).format('YYYY-MM-DD'),
        },
        {
          col: column_filter,
          op: '<=',
          val: moment(ldy).format('YYYY-MM-DD'),
        }
      );
      break;
    default:
      isUtc = new Date(latest_date);
      if (String(isUtc) != 'Invalid Date') latest_date = moment(latest_date).format('YYYY-MM-DD');
      date_result.push(
        {
          col: column_filter,
          op: '>=',
          val: moment(latest_date).format('YYYY-MM-DD'),
        },
        {
          col: column_filter,
          op: '<=',
          val: moment(latest_date, 'YYYY-MM-DD').add(1, 'days'),
        }
      );
      break;
  }
  return date_result;
};

// reformat Data Table
export const reformatDataTable = (exploreJsonData) => {
  // reformat only data
  let records = [];
  for (const [key, value] of Object.entries(exploreJsonData.data)) {
    // console.log(key,value);
    if (key != '') {
      let obj_arr = [];
      for (var i = 0; i < exploreJsonData.columns.length; ++i) {
        obj_arr[exploreJsonData.columns[i]] = value[i];
      }
      records.push(obj_arr);
    }
  }
  return [
    {
      columns: exploreJsonData.columns,
      records: records,
      row_total: records.length,
      row_column: exploreJsonData.columns.length,
    },
  ];
};

export const setFilter = (param, exploreJson, isFilter, extraFilter) => {
  if (isFilter) param = { form_data: Object.assign({}, exploreJson.form_data, { extra_filters: extraFilter }) };
  return param;
};

export const sortNumber = (data, event, locale, records) => {
  let sortingValueArr = [];
  let tValueArr = [];
  let bValueArr = [];
  let mValueArr = [];
  let kValueArr = [];

  for (let i = 0; i < data.length; i++) {
    let trilNum = data[i][event.active].toString().search('T');
    let bilNum =
      locale === 'EN' ? data[i][event.active].toString().search('B') : data[i][event.active].toString().search('M');
    let milNum =
      locale === 'EN' ? data[i][event.active].toString().search('M') : data[i][event.active].toString().search('Jt');
    let kNum =
      locale === 'EN' ? data[i][event.active].toString().search('k') : data[i][event.active].toString().search('Rb');
    if (trilNum > -1) {
      let num_arr = data[i][event.active].split('T');
      let num = num_arr[0].replace(/,/g, '.');
      num_arr[0] = Number(num);
      num_arr[1] = 'T';
      data[i][event.active] = num_arr;
      tValueArr.push(data[i]);
    } else if (bilNum > -1) {
      let siprefix = locale === 'EN' ? 'B' : 'M';
      let num_arr = data[i][event.active].split(siprefix);
      let num = num_arr[0].replace(/,/g, '.');
      num_arr[0] = Number(num);
      num_arr[1] = siprefix;
      data[i][event.active] = num_arr;
      bValueArr.push(data[i]);
    } else if (milNum > -1) {
      let siprefix = locale === 'EN' ? 'M' : 'Jt';
      let num_arr = data[i][event.active].split(siprefix);
      let num = num_arr[0].replace(/,/g, '.');
      num_arr[0] = Number(num);
      num_arr[1] = siprefix;
      data[i][event.active] = num_arr;
      mValueArr.push(data[i]);
    } else if (kNum > -1) {
      let siprefix = locale === 'EN' ? 'k' : 'Rb';
      let num_arr = records[i][event.active].split(siprefix);
      let num = num_arr[0].replace(/,/g, '.');
      num_arr[0] = Number(num);
      num_arr[1] = siprefix;
      data[i][event.active] = num_arr;
      kValueArr.push(data[i]);
    }
  }

  if (event.direction == 'asc') {
    if (kValueArr.length > 0) {
      let siprefix = locale === 'EN' ? 'k' : 'Rb';
      kValueArr.sort((a, b) =>
        a[event.active][0] > b[event.active][0] ? 1 : b[event.active][0] > a[event.active][0] ? -1 : 0
      );
      for (let i = 0; i < kValueArr.length; i++) {
        let sortedNum = kValueArr[i][event.active][0][0].toString() + siprefix;
        sortedNum = locale === 'ID' ? sortedNum.replace(/\./g, ',') : sortedNum;
        kValueArr[i][event.active] = sortedNum;
        sortingValueArr.push(kValueArr[i]);
      }
    }
    if (mValueArr.length > 0) {
      let siprefix = locale === 'EN' ? 'M' : 'Jt';
      mValueArr.sort((a, b) =>
        a[event.active][0] > b[event.active][0] ? 1 : b[event.active][0] > a[event.active][0] ? -1 : 0
      );
      for (let i = 0; i < mValueArr.length; i++) {
        let sortedNum = mValueArr[i][event.active][0].toString() + siprefix;
        sortedNum = locale === 'ID' ? sortedNum.replace(/\./g, ',') : sortedNum;
        mValueArr[i][event.active] = sortedNum;
        sortingValueArr.push(mValueArr[i]);
      }
    }
    if (bValueArr.length > 0) {
      let siprefix = locale === 'EN' ? 'B' : 'M';
      bValueArr.sort((a, b) =>
        a[event.active][0] > b[event.active][0] ? 1 : b[event.active][0] > a[event.active][0] ? -1 : 0
      );
      for (let i = 0; i < bValueArr.length; i++) {
        let sortedNum = bValueArr[i][event.active][0].toString() + siprefix;
        sortedNum = locale === 'ID' ? sortedNum.replace(/\./g, ',') : sortedNum;
        bValueArr[i][event.active] = sortedNum;
        sortingValueArr.push(bValueArr[i]);
      }
    }
    if (tValueArr.length > 0) {
      tValueArr.sort((a, b) =>
        a[event.active][0] > b[event.active][0] ? 1 : b[event.active][0] > a[event.active][0] ? -1 : 0
      );
      for (let i = 0; i < tValueArr.length; i++) {
        let sortedNum = tValueArr[i][event.active][0].toString() + 'T';
        sortedNum = locale === 'ID' ? sortedNum.replace(/\./g, ',') : sortedNum;
        tValueArr[i][event.active] = sortedNum;
        sortingValueArr.push(tValueArr[i]);
      }
    }
  } else {
    if (tValueArr.length > 0) {
      tValueArr.sort((a, b) =>
        a[event.active][0] < b[event.active][0] ? 1 : b[event.active][0] < a[event.active][0] ? -1 : 0
      );
      for (let i = 0; i < tValueArr.length; i++) {
        let sortedNum = tValueArr[i][event.active][0].toString() + 'T';
        sortedNum = locale === 'ID' ? sortedNum.replace(/\./g, ',') : sortedNum;
        tValueArr[i][event.active] = sortedNum;
        sortingValueArr.push(tValueArr[i]);
      }
    }
    if (bValueArr.length > 0) {
      let siprefix = locale === 'EN' ? 'B' : 'M';
      bValueArr.sort((a, b) =>
        a[event.active][0] < b[event.active][0] ? 1 : b[event.active][0] < a[event.active][0] ? -1 : 0
      );
      for (let i = 0; i < bValueArr.length; i++) {
        let sortedNum = bValueArr[i][event.active][0].toString() + siprefix;
        sortedNum = locale === 'ID' ? sortedNum.replace(/\./g, ',') : sortedNum;
        bValueArr[i][event.active] = sortedNum;
        sortingValueArr.push(bValueArr[i]);
      }
    }
    if (mValueArr.length > 0) {
      let siprefix = locale === 'EN' ? 'M' : 'Jt';
      mValueArr.sort((a, b) =>
        a[event.active][0] < b[event.active][0] ? 1 : b[event.active][0] < a[event.active][0] ? -1 : 0
      );
      for (let i = 0; i < mValueArr.length; i++) {
        let sortedNum = mValueArr[i][event.active][0].toString() + siprefix;
        sortedNum = locale === 'ID' ? sortedNum.replace(/\./g, ',') : sortedNum;
        mValueArr[i][event.active] = sortedNum;
        sortingValueArr.push(mValueArr[i]);
      }
    }
    if (kValueArr.length > 0) {
      let siprefix = locale === 'EN' ? 'k' : 'Rb';
      kValueArr.sort((a, b) =>
        a[event.active][0] < b[event.active][0] ? 1 : b[event.active][0] < a[event.active][0] ? -1 : 0
      );
      for (let i = 0; i < kValueArr.length; i++) {
        let sortedNum = kValueArr[i][event.active][0].toString() + siprefix;
        sortedNum = locale === 'ID' ? sortedNum.replace(/\./g, ',') : sortedNum;
        kValueArr[i][event.active] = sortedNum;
        sortingValueArr.push(kValueArr[i]);
      }
    }
  }

  return sortingValueArr;
};
