import { parseDate } from 'src/app/libs/helpers/data-visualization-helper';
import { convert_verbose_to_metric } from 'src/app/libs/helpers/utility';

export const handleSearchFilter = (type, filters, columnDateList, valueSearch, displayedColumns, explore, key?, i?) => {
  let colname = convert_verbose_to_metric(type === 'search_box' ? displayedColumns[i] : key, explore);
  if (valueSearch) {
    let utcCol = columnDateList.indexOf(colname);
    let isSearchUtc = parseDate(valueSearch);
    let filterObj;

    if (utcCol == -1 && !isSearchUtc) {
      filterObj = {
        col: colname,
        op: 'regex',
        val: `(?i).*${valueSearch}.*`,
      };
    } else if (utcCol > -1 && isSearchUtc) {
      filterObj = {
        col: colname,
        op: '==',
        val: valueSearch,
      };
    }

    if (type === 'search_box') {
      if (displayedColumns[i] !== 'No') {
        filters.push(filterObj);
      }
    } else {
      if (key !== 'No') {
        filters.push(filterObj);
      }
    }
  }
  return filters;
};
