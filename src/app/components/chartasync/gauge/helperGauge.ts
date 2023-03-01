import { reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';

export const CHART_CONSTANTS = {
  palette1: 'palette1',
  light: 'light',
  current_date: 'current_date',
  date: 'date',
  date_picker: 'date_picker',
  month: 'month',
  year: 'year',
  coloring: [
    [0.25, '#91c7ae'],
    [0.5, '#c23531'],
    [0.75, '#63869e'],
    [1, '#ccccff'],
  ],
  legendData: ['Low', 'Medium', 'High', 'Very High'],
  id: 'ID',
  en: 'EN',
  since: 'since',
  until: 'until',
};

export const setConfigChart = (data, localExploreArgs, exploreArgs, d3) => {
  if (data.data == undefined) data = localExploreArgs;
  let data_name = 'Label';
  let coloring = CHART_CONSTANTS.coloring;
  let percent = '';
  let minVal = 0;
  let maxVal = data.data != null ? Number(data.data) : 100;
  let seriesName = data.form_data.metric != undefined ? data.form_data.metric : '';
  let colorLabel = '#808080';
  if (data.form_data.gauge_label_type == 'percent') percent = '%';
  let maxValue = data.form_data.max_value != null ? Number(data.form_data.max_value) : 100 || Number(data.data);
  if (maxValue < Number(data.data)) maxValue = Number(data.data); // set minimum maxVal
  let legendData = CHART_CONSTANTS.legendData;
  if (
    data.form_data.custom_condition &&
    data.form_data.custom_condition_arr != undefined &&
    data.form_data.custom_condition_arr.length > 0
  ) {
    coloring = [];
    legendData = [];
    for (let i = 0; i < data.form_data.custom_condition_arr.length; i++) {
      if (
        Number(maxVal) >= Number(data.form_data.custom_condition_arr[i].size_from) &&
        Number(maxVal) <= Number(data.form_data.custom_condition_arr[i].size_to)
      ) {
        data_name = data.form_data.custom_condition_arr[i].status;
        colorLabel = data.form_data.custom_condition_arr[i].colorpicker;
      }
      legendData.push(data.form_data.custom_condition_arr[i].status);
      coloring.push([
        Number(data.form_data.custom_condition_arr[i].size_to) / Number(maxValue),
        data.form_data.custom_condition_arr[i].colorpicker,
      ]);
    }
  } else {
    // default
    if (Number(maxValue) / 0.25 <= maxVal) {
      data_name = CHART_CONSTANTS.legendData[0];
      colorLabel = String(coloring[0][1]);
    } else if (Number(maxValue) / 0.5 <= maxVal) {
      data_name = CHART_CONSTANTS.legendData[1];
      colorLabel = String(coloring[1][1]);
    } else if (Number(maxValue) / 0.75 <= maxVal) {
      data_name = CHART_CONSTANTS.legendData[2];
      colorLabel = String(coloring[2][1]);
    } else {
      data_name = CHART_CONSTANTS.legendData[3];
      colorLabel = String(coloring[3][1]);
    }
  }

  // generate style
  const style = stylingGauge(data, coloring, colorLabel);
  return {
    tooltip: {
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
    },
    grid: {
      top: '3%',
      bottom: '3%',
    },
    legend: {
      show: true,
      type: 'scroll',
      orient: 'horizontal',
      data: legendData,
      textStyle: {
        fontSize: 10,
      },
    },
    series: [
      {
        name: seriesName,
        type: 'gauge',
        detail: {
          formatter: function (value) {
            let num = reformatNumber(Number(value).toFixed(2), data.form_data.number_format, exploreArgs, d3);
            return String(num) + percent;
          },
          show: true,
          color: 'auto',
          fontWeight: '',
        },
        data: [
          {
            value: maxVal,
          },
        ],

        min: minVal,
        max: data.form_data.max_value || maxVal,
        // styling gauge
        ...style,
        // styling gauge
      },
    ],
  };
};

const stylingGauge = (data, coloring, colorLabel) => {
  return {
    splitNumber: 10,
    clockwise: true,
    axisLine: {
      lineStyle: {
        width: 7,
        color: coloring,
      },
    },
    pointer: {
      itemStyle: {
        color: 'auto',
      },
      length: '67%',
      width: 4,
      show: data.form_data.show_needle || false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: false,
    },
    axisLabel: {
      show: data.form_data.show_axis_label || false,
      color: 'auto',
      fontSize: 10,
    },
    title: {
      show: data.form_data.show_label || false,
      fontWeight: 'bolder',
      fontSize: 20,
      fontStyle: 'italic',
      color: colorLabel,
      shadowColor: '#fff',
      shadowBlur: 10,
    },
  };
};
