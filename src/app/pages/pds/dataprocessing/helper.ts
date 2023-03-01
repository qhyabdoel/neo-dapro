export function isDateParser(dateStr) {
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
      if (arr_date.length <= 1) {
        return false;
      }
    }
    let new_text = arr_date[1] + '/' + arr_date[2] + '/' + arr_date[0];
    let new_text2 = arr_date[0] + '/' + arr_date[1] + '/' + arr_date[2]; //sebelumnya mm/dd/yyyy
    let isDate = new Date(new_text); //m/d/Y
    let isDate2 = new Date(new_text2);
    if (
      String(isDate) != 'Invalid Date' ||
      String(isDate2) != 'Invalid Date'
    ) {
      return true;
    }

    if (dateStr.length > 0) {
      if (
        dateStr.substring(0, 1) == '\'' ||
        dateStr.substring(0, 1) == '"'
      ) {
        return false;
      } else if (
        dateStr.substring(13, 14) === ':' &&
        dateStr.substring(16, 17) === ':'
      ) {
        return true;
      } else if (
        dateStr.substring(10, 11) === 'T' &&
        dateStr.substring(19, 20) === 'Z'
      ) {
        return true;
      } else {
        return false;
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
