import { reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';

declare var d3: any;

export const setConfigChartBigNumber = (data: any) => {
  // dummy empty data
  // data = { ...data, data: { data: [] } };
  let formaterNumber = formatNumberIdFile;
  let locale = data.form_data.format_number_id ? 'ID' : 'EN';
  d3.formatDefaultLocale(formaterNumber[locale]);

  let value = 0;
  if (data.data.data.length > 0) {
    data.data.data[0].map((data) => {
      value = data;
    });
  }

  const labelPosition = data.form_data.label_position;

  let options = {
    title: reformatNumber(value, data.form_data.y_axis_format, data, d3) || 0,
    toolbox: {
      feature: {},
    },
    textStyle: {
      'font-size': data.form_data.zoomsize ? `${data.form_data.zoomsize}rem` : `${data.form_data.subheaderfontsize}rem`,
      color: data.form_data.colorpickers.length > 0 ? data.form_data.colorpickers[0].colorpicker : '',
    },
    label: data.data.subheader,
    labelStyle: {
      'font-size': `${data.form_data.subheaderfontsize}rem`,
      color: data.form_data.colorpickers.length > 0 ? data.form_data.colorpickers[1].colorpicker : '',
    },
    labelFirst: ['left', 'top'].includes(labelPosition),
    divClass: ['left', 'right'].includes(labelPosition) ? 'col-md-6 px-5 d-flex' : 'col-md-12 h-50 px-5 d-flex',
    titleClass:
      labelPosition === 'bottom'
        ? 'big-number align-self-end'
        : labelPosition === 'top'
        ? 'big-number align-self-start'
        : 'big-number align-self-center',
    labelClass:
      labelPosition === 'top'
        ? 'big-number align-self-end'
        : labelPosition === 'bottom'
        ? 'big-number align-self-start'
        : 'big-number align-self-center',
  };
  return options;
};
