import moment from 'moment';
import { extract_date_filter } from 'src/app/libs/helpers/utility';

export const setLabelValue = (noData, data, explore, untilDate) => {
  let labelValue;
  let titlesObject = {
    text: !noData ? data.value : '0',
    textInitialDate: '',
    left: 'center',
    top: 'center',
    textStyle: {
      fontSize: !noData ? data.zoomSizeValue + 'rem' : explore.form_data.zoomsize + 'rem',
      width: '100%',
      height: '100%',
    },
  };
  let titlesObject2 = {
    text: !noData ? data.text : explore.form_data.subheader,
    textInitialDate: noData
      ? data
        ? data.textInitialDate
        : reformatDateLabel(untilDate, explore)
      : data.textInitialDate,
    left: 'center',
    top: 'center',
    textStyle: {
      fontSize: !noData ? data.zoomSizeText + 'rem' : explore.form_data.subheaderfontsize + 'rem',
      width: '80%',
      height: '100%',
    },
  };
  labelValue = [titlesObject, titlesObject2];
  return labelValue;
};

export const reformatDateLabel = (date, explore) => {
  let reformatDate;
  if (explore.form_data.filter_date_type === 'date') reformatDate = moment(date).format('DD/MM/YYYY');
  else if (explore.form_data.filter_date_type === 'month') reformatDate = moment(date).format('MMM YYYY');
  else if (explore.form_data.filter_date_type === 'year') reformatDate = moment(date).format('YYYY');
  return reformatDate;
};

export const checkIsFilter = (
  param,
  explore,
  isFilter,
  extraFilter,
  sinceDateArgs,
  untilDateArgs,
  isOnDateFilter,
  isDateFilter,
  isInitialDateFilter,
  filter_granularity_sqlaArgs
) => {
  if (isFilter) param.form_data = Object.assign({}, explore.form_data, { extra_filters: extraFilter });
  let sinceDate = sinceDateArgs;
  let untilDate = untilDateArgs;
  let filter_granularity_sqla = filter_granularity_sqlaArgs;

  //check if there is a date in extra filter
  if (isFilter && extraFilter.length > 0) {
    let dateFilter = extract_date_filter(moment, extraFilter);
    sinceDate = isOnDateFilter ? sinceDate : dateFilter[0];
    untilDate = isOnDateFilter ? untilDate : dateFilter[1];
    filter_granularity_sqla = dateFilter[2];
    if (dateFilter[0] && dateFilter[1]) {
      isDateFilter = true;
    }
  }

  if (isFilter && (isDateFilter || isInitialDateFilter)) {
    param.form_data.since = sinceDate;
    param.form_data.until = untilDate;
    param.form_data.granularity_sqla = filter_granularity_sqla;
  }
  return { param, sinceDate, untilDate, filter_granularity_sqla };
};
