declare var d3: any;

export function copy_url(val) {
  const selBox = document.createElement('textarea');
  selBox.style.position = 'fixed';
  selBox.style.left = '0';
  selBox.style.top = '0';
  selBox.style.opacity = '0';
  selBox.value = val;
  document.body.appendChild(selBox);
  selBox.focus();
  selBox.select();
  document.execCommand('copy');
  document.body.removeChild(selBox);
}

export function on_full_screen() {
  setTimeout(function () {
    let card = document.getElementById('content-full');
    if (card.requestFullscreen) {
      card.requestFullscreen();
    }
  }, 500);
}

export function on_full_screen_id(id) {
  setTimeout(function () {
    let card = document.getElementById(id);
    if (card.requestFullscreen) {
      card.requestFullscreen();
    }
  }, 500);
}

export function gen_random_number(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function mergedArr(array, lenLoop) {
  var ar = [];
  var tmp = [];
  if (array.length < Number(lenLoop)) {
    for (let i = 0; i <= Number(lenLoop / Number(array.length)) - 1; i++) {
      let arr = ar.concat(array);
      tmp = [].concat(tmp, arr);
    }
    if (lenLoop % array.length != 0) {
      for (let i = 0; i < Number(lenLoop % array.length); i++) {
        let arr = ar.concat([array[i]]);
        tmp = [].concat(tmp, arr);
      }
    }
  }
  return tmp;
}
export function search_regex(list, value, param) {
  let result = list;
  if (value.replace(/[^\w\s]/gi, '') != '') {
    result = list.filter((a) => new RegExp(value.replace(/[^\w\s]/gi, '').toLowerCase()).test(a[param].toLowerCase()));
  }
  return result;
}

export function search_regex_two(list, value, param0, param1) {
  let result = list;
  if (value.replace(/[^\w\s]/gi, '') != '') {
    result = list.filter((a) =>
      new RegExp(value.replace(/[^\w\s]/gi, '')).test(a[param0].toLowerCase() || a[param1].toLowerCase())
    );
  }
  return result;
}

export function search_regex_three(list, value, param) {
  let result = list;
  result = list.filter((a) => new RegExp(value.toLowerCase()).test(a[param].toLowerCase()));
  return result;
}

export function search_regex_four(list, value, param0, param1, param2) {
  let result = list;
  result = list.filter((a) =>
    new RegExp(value).test(a[param0].toLowerCase() || a[param1].toLowerCase() || a[param2].toLowerCase())
  );
  return result;
}

export function checked_unchecked_list(isChecked, list, listofresult, value, param) {
  let result = listofresult;
  if (isChecked === true) {
    let result_filter = list.filter((x) => x[param] === value)[0];
    result.push(result_filter);
    return result;
  } else {
    let result_filter = result
      .map(function (item) {
        return item[param];
      })
      .indexOf(value);
    result.splice(result_filter, 1);
    return result;
  }
}

export function checked_unchecked_all(isCheckedAll, list) {
  let result = [];
  if (isCheckedAll === false) {
    for (var i = 0; i < list.length; i++) {
      list[i].isChecked = true;
      result.push(list[i]);
    }
  } else {
    for (var i = 0; i < list.length; i++) {
      list[i].isChecked = false;
    }
  }
  return [list, result];
}

export function get_random_int(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  let r = Math.floor(Math.random() * (max - min + 1)) + min;
  if (Number(r) >= Number(max)) r = max - 1;
  return r;
}

export function getColOldConfig(col) {
  let colResult = 12;
  switch (col) {
    case 1:
      colResult = 12;
      break;
    case 2:
      colResult = 6;
      break;
    case 3:
      colResult = 4;
      break;
    case 4:
      colResult = 3;
      break;
    case 6:
      colResult = 2;
      break;
    default:
      colResult = col;
      break;
  }
  return colResult;
}

// //function for remove array value by value
export function removeArrayValue(arr, what) {
  var a = arguments,
    L = a.length,
    ax;
  while (L > 1 && arr.length) {
    what = a[--L];
    while ((ax = arr.indexOf(what)) !== -1) {
      arr.splice(ax, 1);
    }
  }
  return arr;
}

export function convert_number(val) {
  let num = 0;
  let f = d3.format('.2s');
  if (Number(val) < 100000) num = Number(val);
  else num = f(val);
  let locale = this.formdata.form_data.format_number_id ? 'ID' : 'EN';
  if (locale === 'ID') {
    var bilNum = num.toString().search('B');
    var milNum = num.toString().search('M');
    var kNum = num.toString().search('k');
    let formatIdNum;
    if (bilNum > -1) formatIdNum = num.toString().replace('B', 'M');
    else if (milNum > -1) formatIdNum = num.toString().replace('M', 'Jt');
    else if (kNum > -1) formatIdNum = num.toString().replace('k', 'Rb');
    else {
      formatIdNum = num.toString();
    }
    return formatIdNum;
  } else {
    return num;
  }
}

export function reformat_number(formater, number, numberFormat, locale, localeStr?) {
  let result, f;
  switch (numberFormat) {
    case '.3s':
      result = conv_si_prefix(formater, number, locale);
      break;
    case ',':
      let numlength = number.toString().length;
      f = formater.format(',.' + numlength + 'r');
      result = f(number);
      break;
    case ',.2r':
      let numArr = number.toString().split('.');
      number = Number(numArr[0]);
      result = number.toLocaleString(localeStr);
      break;
    default:
      f = formater.format(numberFormat);
      result = f(number);
      break;
  }
  return result;
}

export function validate_date(dateStr): boolean {
  if (isNaN(dateStr)) {
    //Checked for numeric
    var dt = new Date(dateStr);
    if (dateStr && dateStr.length) {
      if (dateStr.length < 9) {
        return false;
      }
    } else {
      return false;
    }

    if (Array.isArray(dateStr)) {
      return false;
    }

    let arr_date = dateStr.split('/');
    if (arr_date.length === 1) {
      arr_date = dateStr.split('-');
      if (arr_date.length <= 1) return false;
    }
    let new_text = arr_date[1] + '/' + arr_date[2] + '/' + arr_date[0];
    let isDate = new Date(new_text);
    if (String(isDate) != 'Invalid Date') {
      return true;
    }

    if (dateStr.length > 0) {
      if (dateStr.substring(0, 1) == "'" || dateStr.substring(0, 1) == '"') {
        return false;
      }
      if (dateStr.substring(13, 14) === ':' && dateStr.substring(16, 17) === ':') {
        return true;
      }
      if (dateStr.substring(10, 11) === 'T' && dateStr.substring(19, 20) === 'Z') {
        return true;
      }
    }

    if (isNaN(dt.getTime())) {
      //Checked for date
      return false; //Return string if not date.
    } else {
      return true; //Return date **Can do further operations here.
    }
  } else {
    return false; //Return string as it is number
  }
}

export function get_position(cls) {
  let pos = 1;
  switch (cls) {
    case 'col-md-12':
      pos = 1;
      break;
    case 'col-md-6':
      pos = 2;
      break;
    case 'col-md-4':
      pos = 3;
      break;
    case 'col-md-3':
      pos = 4;
      break;
    case 'col-md-2':
      pos = 6;
      break;
    case 'col-md-9':
      pos = 9;
      break;
    case 'col-md-8':
      pos = 8;
      break;
    default:
      break;
  }
  return pos;
}

export function get_format_date(format) {
  let result;
  switch (format) {
    case 'smart_date':
      result = 'MMM/YYYY';
      break;
    case '%d/%m/%Y':
      result = 'DD/MM/YYYY';
      break;
    case '%m/%d/%Y':
      result = 'MM/DD/YYYY';
      break;
    case '%Y-%m-%d':
      result = 'YYYY-MM-DD';
      break;
    case '%Y-%m-%d %H:%M:%S':
      result = 'YYYY-MM-DD hh:mm:ss';
      break;
    case '%d-%m-%Y %H:%M:%S':
      result = 'DD-MM-YYYY hh:mm:ss';
      break;
    case '%H:%M:%S':
      result = 'hh:mm:ss';
      break;
    default:
      result = 'DD/MM/YYYY';
      break;
  }
  return result;
}

export function conv_si_prefix(formater, number, locale) {
  let result = 0;
  let f = formater.format('.2s');
  if (Number(number) < 100000) result = Number(number);
  else result = f(number);
  if (locale === 'ID') {
    let result_id;
    var bilNum = result.toString().search('B');
    var milNum = result.toString().search('M');
    var kNum = result.toString().search('k');

    if (bilNum > -1) result_id = result.toString().replace('B', 'M');
    else if (milNum > -1) result_id = result.toString().replace('M', 'Jt');
    else if (kNum > -1) result_id = result.toString().replace('k', 'Rb');
    else {
      result_id = result.toString();
    }
    return result_id;
  } else {
    return result;
  }
}

export function year_picker_handler(moment, since, until, dateFilterType) {
  let result;
  if (dateFilterType === 'date_picker') {
    let sinceDate = new Date();
    let sinceDateYear = until.year();
    let sinceDateMonth = until.month();
    let sinceDateDay = until.date();
    sinceDate.setFullYear(sinceDateYear, sinceDateMonth, sinceDateDay);
    since = until ? moment(until).startOf('year').startOf('month').format('YYYY-MM-DDTHH:mm:ss') : null;
    until = moment(sinceDate).endOf('year').endOf('month').format('YYYY-MM-DDTHH:mm:ss');
  } else {
    since = since ? moment(since).startOf('year').startOf('month').format('YYYY-MM-DDTHH:mm:ss') : null;
    until = until ? moment(until).endOf('year').endOf('month').format('YYYY-MM-DDTHH:mm:ss') : null;
  }
  result = [since, until];
  return result;
}

export function month_picker_handler(moment, since, until, dateFilterType) {
  let result;
  if (dateFilterType === 'date_picker') {
    let sinceDate = new Date();
    let sinceDateYear = until.year();
    let sinceDateMonth = until.month();
    let sinceDateDay = until.date();
    sinceDate.setFullYear(sinceDateYear, sinceDateMonth, sinceDateDay);
    since = moment(sinceDate).startOf('month').format('YYYY-MM-DDTHH:mm:ss');
    until = until ? moment(until).endOf('month').format('YYYY-MM-DDTHH:mm:ss') : null;
  } else {
    since = since ? moment(since).startOf('month').format('YYYY-MM-DDTHH:mm:ss') : null;
    until = until ? moment(until).endOf('month').format('YYYY-MM-DDTHH:mm:ss') : null;
  }
  result = [since, until];
  return result;
}

export function date_picker_handler(moment, since, until, dateFilterType) {
  let result;
  if (dateFilterType === 'date_picker') {
    let sinceDate = new Date();
    let sinceDateYear = until.year();
    let sinceDateMonth = until.month();
    let sinceDateDay = until.date();
    sinceDate.setFullYear(sinceDateYear, sinceDateMonth, sinceDateDay);
    since = moment(sinceDate).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
    until = until ? moment(until).endOf('day').format('YYYY-MM-DDTHH:mm:ss') : null;
  } else {
    since = since ? moment(since).format('YYYY-MM-DDTHH:mm:ss') : null;
    until = until ? moment(until).endOf('day').format('YYYY-MM-DDTHH:mm:ss') : null;
  }
  result = [since, until];
  return result;
}

export function sort_array_object(data, param, order = 'asc') {
  let result;
  if (order === 'asc') {
    result = data.sort((a, b) => (a[param] > b[param] ? 1 : b[param] > a[param] ? -1 : 0));
  } else {
    result = data.sort((a, b) => (a[param] < b[param] ? 1 : b[param] < a[param] ? -1 : 0));
  }
  return result;
}

export function convert_metric_to_verbose(metric_name, explore) {
  if (Array.isArray(metric_name)) metric_name = metric_name[0];
  let verbose_name;
  if (explore.datasource && explore.datasource.metrics !== null) {
    verbose_name = explore.datasource.metrics.filter((v) => {
      if (v.metric_name == metric_name) return v;
    });
  }

  return verbose_name != undefined && verbose_name.length > 0 ? verbose_name[0].verbose_name : metric_name;
}

export function convert_verbose_to_metric(verbose_name, explore) {
  if (Array.isArray(verbose_name)) verbose_name = verbose_name[0];
  let metric_name;
  if (explore.datasource && explore.datasource.metrics !== null) {
    metric_name = explore.datasource.metrics.filter((m) => {
      if (m.verbose_name == verbose_name) return m;
    });
  }
  return metric_name != undefined && metric_name.length > 0 ? metric_name[0].metric_name : verbose_name;
}

export function extract_date_filter(moment, extraFilter) {
  let result = [];
  let since, until, granularity_sqla;
  for (let i = 0; i < extraFilter.length; i++) {
    if (extraFilter[i].col === '__from') since = extraFilter[i].val;
    else if (extraFilter[i].col === '__to') until = extraFilter[i].val;
    else if (extraFilter[i].col === '__time_col') granularity_sqla = extraFilter[i].val;
    else {
      let filteredDate: any;
      let value = Array.isArray(extraFilter[i].val) ? extraFilter[i].val[0] : extraFilter[i].val;
      let isUtc = validate_date(value);
      if (isUtc) {
        filteredDate = moment(value).format('YYYY-MM-DD');
        since = moment(filteredDate).startOf('day').format('YYYY-MM-DD');
        until = moment(filteredDate).endOf('day').format('YYYY-MM-DD');
        granularity_sqla = extraFilter[i].col;
      }
    }
  }
  return (result = [since, until, granularity_sqla]);
}
// export function load_script(url: string) {
// 	const body = <HTMLDivElement> document.body;
// 	const script = document.createElement('script');
// 	script.innerHTML = '';
// 	script.src = url;
// 	script.async = false;
// 	script.defer = true;
// 	body.appendChild(script);
// }

// export function objectToArray(obj){
// 	let dict = {};
// 	for(let k in obj){
// 	  if(obj[k].value != undefined) //Only one value
// 	  {
// 		  dict[obj[k].value] = 1;
// 	  }
// 	  else if(obj[k].length != undefined) //Array
// 		for(let i = 0; i < obj[k].length; i++)
// 		{
// 		  dict[obj[k][i].value] = 1;
// 		}
// 	}

// 	let array = [];
// 	for(let el in dict)
// 	  array.push(el);

// 	return array;
// }

export function deepCopy(o: object) {
  let newO, i;

  if (typeof o !== 'object') {
    return o;
  }
  if (!o) {
    return o;
  }

  if ('[object Array]' === Object.prototype.toString.apply(o)) {
    newO = [];
    for (i = 0; i < (o as Array<any>).length; i += 1) {
      newO[i] = deepCopy(o[i]);
    }
    return newO;
  }

  newO = {};
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newO[i] = deepCopy(o[i]);
    }
  }
  return newO;
}

export function on_click_overlay(id) {
  // console.log(id);
  let card = document.getElementById(id);
  let hiddenPopUp = document.getElementsByClassName('cdk-overlay-container');

  if (document.fullscreenElement) {
    // console.log(hiddenPopUp);
    for (let i = 0; i < hiddenPopUp.length; i++) {
      card.appendChild(hiddenPopUp[i]);
    }
  }
}

export function remapping_color_key(exploreJson) {
  if (exploreJson.form_data.colorpickers.length > 0) {
    for (let i = 0; i < exploreJson.data.length; i++) {
      if (exploreJson.data[i].key != exploreJson.form_data.colorpickers[i].entity)
        exploreJson.form_data.colorpickers[i].entity = exploreJson.data[i].key;
    }
  }
  return exploreJson;
}

export const timezoneOffset = (offset?: number): string => {
  if (!offset) {
    offset = (new Date()).getTimezoneOffset();
  }
  if (offset === 0) {
    return "Z";
  }
  const sign = offset > 0 ? "-" : "+";
  offset = Math.abs(offset);
  const pad = (n: number) => n < 10 ? "0" + n : n;
  return `${sign}${pad(Math.floor(offset / 60))}:${pad(offset % 60)}`;
}