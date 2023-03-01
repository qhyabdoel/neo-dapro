import moment from 'moment';
import { parseDate, reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';

const convertLabelType = (pie_label_type, total, value, key, exploreArgs, d3) => {
  let numberformat = exploreArgs.form_data.y_axis_format;
  var yFormat = d3.format(numberformat ? (numberformat == ',f' ? ',' : numberformat) : ',');
  let persen = (parseFloat(value) * 100) / total || 0;
  let customTooltip = '';
  if (pie_label_type == 'key') {
    customTooltip += key;
  }
  if (pie_label_type == 'value') {
    let formatedValue = reformatNumber(value, numberformat, exploreArgs, d3);
    customTooltip += formatedValue;
  }
  if (pie_label_type == 'percent') {
    customTooltip += Number(yFormat(persen)).toFixed(2) + '%';
  }
  if (pie_label_type == 'percent_around') {
    customTooltip += Math.round(Number(yFormat(persen))) + '%';
  }
  if (pie_label_type == 'key_value') {
    let num = reformatNumber(value, numberformat, exploreArgs, d3);
    customTooltip += key + ' : ' + num;
  }
  if (pie_label_type == 'key_percent') {
    customTooltip += key + ' : ' + Number(yFormat(persen)).toFixed(2) + '%';
  }
  if (pie_label_type == 'key_percent_around') {
    customTooltip += key + ' : ' + Math.round(Number(yFormat(persen))) + '%';
  }
  return customTooltip;
};

export const setConfigChart = (data, typeChart, localExploreArgs, mappingExtraFilterArgs, exploreArgs, d3) => {
  if (data.data == undefined) data = localExploreArgs;
  var total = 0;
  var series = [];
  var legendData = [];
  var seriesData = [];
  var xAxisData = [];
  var yAxisData = [];
  let mappingExtraFilter = mappingExtraFilterArgs;

  var dataZoom = [];
  let groupby = {};
  //reformat date
  for (var i = 0; i < data.data.length; i++) {
    groupby = {};
    let split = data.data[i].x.split(' - ');
    for (let j = 0; j < data.form_data.groupby.length; j++) {
      groupby = { key: split[j], value: data.form_data.groupby[j] };
      mappingExtraFilter.push(groupby);
    }

    var value = data.data[i];
    for (var prop in value) {
      if (Object.prototype.hasOwnProperty.call(value, prop)) {
        if (typeof value[prop] === 'string') {
          var isUTC = parseDate(value[prop]);
          if (isUTC) {
            let formatedDate = moment(value[prop]).format('DD/MM/YYYY');
            value[prop] = formatedDate;
          } else {
            value[prop] = value[prop];
          }
        } else {
          value[prop] = value[prop];
        }
      }
    }
  }

  series = [
    {
      name: 'Value',
      type: 'pie',
      radius: data.form_data.donut ? ['40%', '80%'] : '55%',
      center: ['50%', '50%'],
      data: [],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ];
  for (var i = 0; i < data.data.length; i++) {
    total += Math.abs(parseFloat(data.data[i].y));
  }
  let label_type = data.form_data.pie_label_type;
  let flag = false;
  for (var i = 0; i < data.data.length; i++) {
    if (Number(data.data[i].y) < 0) flag = true;
  }
  if (flag) {
    // reverse data if negative value y
    let arr = [];
    for (var i = data.data.length - 1; i >= 0; i--) {
      arr.push(data.data[i]);
    }
    data.data = arr;
  }
  for (var i = 0; i < data.data.length; i++) {
    legendData.push(
      convertLabelType(
        label_type != undefined ? label_type : 'key',
        total,
        Math.abs(data.data[i].y),
        data.data[i].x,
        exploreArgs,
        d3
      ).toString()
    );
    let obj = {
      name: convertLabelType(
        label_type != undefined ? label_type : 'key',
        total,
        Math.abs(data.data[i].y),
        data.data[i].x,
        exploreArgs,
        d3
      ).toString(),
      key: data.data[i].x,
      value: Math.abs(data.data[i].y),
      value_original: data.data[i].y,
      label: {
        show: data.form_data.hide_label ? false : true,
        position: 'inside',
      },
      itemStyle: {},
      tooltips: [],
    };
    if (data.form_data.tooltips != undefined && Object.entries(data.form_data.tooltips).length > 0) {
      let toltips = [];
      if (data.data[i].hasOwnProperty('tooltips')) {
        for (const [key, value] of Object.entries(data.data[i].tooltips)) {
          toltips.push(value);
        }
      }
      obj = { ...obj, tooltips: toltips };
    }
    if (data.form_data.labels_outside) {
      let label = {
        show: data.form_data.hide_label ? false : true,
        position: 'outside',
      };
      obj = { ...obj, label: label };
    }
    if (
      data.form_data.choose_pallete != undefined &&
      data.form_data.choose_pallete == 'custom_pallete' &&
      data.form_data.colorpickers != undefined &&
      data.form_data.colorpickers.length > 0
    ) {
      for (let j = 0; j < data.form_data.colorpickers.length; j++) {
        if (
          String(data.data[i].x).replace(' ', '').toLowerCase() ==
          String(data.form_data.colorpickers[j].entity).replace(' ', '').toLowerCase()
        ) {
          let itemGaul = {
            color:
              data.form_data.colorpickers[j].colorpicker != undefined
                ? data.form_data.colorpickers[j].colorpicker
                : '#808080',
          };
          obj = { ...obj, itemStyle: itemGaul };
          break;
        }
      }
    }
    seriesData.push(obj);
  }

  xAxisData.push({ type: 'value' });
  yAxisData.push({ type: 'value' });
  series[0]['data'] = seriesData;

  return {
    showLegend: data.form_data.show_legend ? data.form_data.show_legend : true,
    showControls: data.form_data.show_controls ? data.form_data.show_controls : true,
    legendData: legendData,
    dataZoom: dataZoom,
    title: '',
    subtitle: '',
    lefttitle: 'center',
    legendorient: 'horizontal',
    xAxis: xAxisData,
    yAxis: yAxisData,
    contrastColor: '#eee',
    series: series,
    total: total,
    typeChart: typeChart,
  };
};
