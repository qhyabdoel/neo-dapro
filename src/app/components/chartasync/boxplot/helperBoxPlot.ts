import { reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';
import { get_random_int } from 'src/app/libs/helpers/utility';

export const addSeries = (exploreJson, colorPaletteArgs, minValue, maxValue) => {
  let series = [];
  let scheme =
    exploreJson.form_data.color_scheme != 'bnbColors' && exploreJson.form_data.color_scheme != undefined
      ? exploreJson.form_data.color_scheme
      : 'palette1';
  let chosenColors = colorPaletteArgs[scheme] || [];

  let index = 0;
  for (let i = 0; i < exploreJson.data.length; i++) {
    let colorIndex = exploreJson.form_data.random_color ? get_random_int(0, chosenColors.length) : index;
    let seriesObj = {
      name: exploreJson.data[i].key,
      type: 'boxplot',
      data: [],
      itemStyle: {
        color: chosenColors[colorIndex],
        borderColor: chosenColors[colorIndex],
      },
    };
    let outlierObj = {
      name: 'outlier',
      type: 'scatter',
      data: [],
      itemStyle: {
        color: chosenColors[colorIndex],
        borderColor: chosenColors[colorIndex],
      },
    };
    let filterDataRange = [];
    for (let j = 0; j < exploreJson.data[i].boxData.length; j++) {
      let minMaxBoxDataRange = [];
      if (minValue != null && maxValue != null) {
        for (let k = 0; k < exploreJson.data[i].boxData[j].length; k++) {
          if (exploreJson.data[i].boxData[j][k] >= minValue && exploreJson.data[i].boxData[j][k] <= maxValue)
            minMaxBoxDataRange.push(exploreJson.data[i].boxData[j][k]);
          else if (exploreJson.data[i].boxData[j][k] < minValue) minMaxBoxDataRange.push(minValue);
          else if (exploreJson.data[i].boxData[j][k] > maxValue) minMaxBoxDataRange.push(maxValue);
        }
        filterDataRange.push(minMaxBoxDataRange);
      } else {
        filterDataRange.push(exploreJson.data[i].boxData[j]);
      }
    }
    if (index == chosenColors.length - 1) {
      index = 0;
    } else index++;

    seriesObj.data = filterDataRange;
    outlierObj.data = exploreJson.data[i].outliers;
    series.push(seriesObj);
    series.push(outlierObj);
  }
  return series;
};

export const addLegend = (exploreJson) => {
  let legendObj = {};
  let legendData = [];
  for (let i = 0; i < exploreJson.data.length; i++) {
    legendData.push(exploreJson.data[i].key);
  }
  legendObj = {
    data: legendData,
    orient: exploreJson.form_data.legend_orient,
    type: exploreJson.form_data.legend_type,
    width: exploreJson.form_data.legend_width,
  };
  legendObj[exploreJson.form_data.legend_position] = 0;
  return legendObj;
};

export const setConfigChart = (exploreJson, colorPaletteArgs, minValueArgs, maxValueArgs, d3) => {
  let minValue = minValueArgs;
  let maxValue = maxValueArgs;
  minValue = exploreJson.form_data.y_axis_bounds[0] ? Number(exploreJson.form_data.y_axis_bounds[0]) : null;
  maxValue = exploreJson.form_data.y_axis_bounds[1] ? Number(exploreJson.form_data.y_axis_bounds[1]) : null;

  let legend = addLegend(exploreJson);
  let series = addSeries(exploreJson, colorPaletteArgs, minValue, maxValue);
  let xAxis = {
    type: 'category',
    data: exploreJson.data[0].axisData,
    boundaryGap: true,
    nameGap: 35,
    name: exploreJson.form_data.x_axis_label ? exploreJson.form_data.x_axis_label : '',
    nameLocation: 'center',
    show: true,
    position: 'bottom',
  };
  let yAxis = {
    type: 'value',
    yAxisIndex: 0,
    name: exploreJson.form_data.y_axis_label ? exploreJson.form_data.y_axis_label : '',
    nameLocation: 'center',
    nameGap: 35,
    show: true,
    position: 'left',
    min: exploreJson.form_data.y_axis_bounds_min || null,
    max: exploreJson.form_data.y_axis_bounds_max || null,
    axisLabel: {
      formatter: function (value) {
        let formatedValue = reformatNumber(value, exploreJson.form_data.y_axis_format, exploreJson, d3);
        return formatedValue;
      },
    },
    splitLine: {
      lineStyle: {
        type: 'dashed',
        color: '#8c8c8c',
      },
    },
    axisLine: {
      show: true,
    },
  };

  //set y axis bound
  if (exploreJson.form_data.y_axis_bounds[0] != '' && exploreJson.form_data.y_axis_bounds[0] != null)
    yAxis = Object.assign({}, yAxis, {
      min: exploreJson.form_data.y_axis_bounds[0] ? Number(exploreJson.form_data.y_axis_bounds[0]) : 0,
    });
  if (exploreJson.form_data.y_axis_bounds[1] != '' && exploreJson.form_data.y_axis_bounds[1] != null)
    yAxis = Object.assign({}, yAxis, {
      max: exploreJson.form_data.y_axis_bounds[1] ? Number(exploreJson.form_data.y_axis_bounds[1]) : 0,
    });

  return {
    // additional for boxplot2.component.ts
    minValue: minValue,
    maxValue: maxValue,
    // additional for boxplot2.component.ts
    title: {
      left: 'center',
    },
    legend: exploreJson.form_data.show_legend ? legend : false,
    tooltip: {
      trigger: 'item',
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
      formatter: function (param) {
        let customTooltip = toolTipFormatter(exploreJson, param, d3);
        return customTooltip;
      },
    },
    grid: {
      left:
        exploreJson.form_data.left_margin == 'auto'
          ? '10%'
          : exploreJson.form_data.left_margin != undefined
          ? exploreJson.form_data.left_margin + '%'
          : '10%',
      right: '10%',
      bottom:
        exploreJson.form_data.bottom_margin == 'auto'
          ? '20%'
          : exploreJson.form_data.bottom_margin != undefined
          ? exploreJson.form_data.bottom_margin + '%'
          : '20%',
    },
    xAxis: xAxis,
    yAxis: yAxis,
    dataZoom: [
      {
        show: exploreJson.form_data.show_brush ? true : false,
        height: 20,
        type: 'slider',
        top: '90%',
        start: xAxis.data.length > 0 ? Number(xAxis.data[0]) : 0,
      },
    ],
    series: series,
  };
};

export const toolTipFormatter = (exploreJson, param, d3) => {
  let me = this;
  let customTooltip = '<table>';
  for (let i = 0; i < param.value.length; i++) {
    let selectedData = exploreJson.data.filter((x) => x.key == param.seriesName)[0];

    let value =
      i == 0
        ? param.value[i]
        : param.seriesType == 'boxplot'
        ? selectedData.boxData[param.dataIndex][i - 1]
        : param.value[i];
    let formatedValue = reformatNumber(value, exploreJson.form_data.format_number_tooltips, exploreJson, d3);
    customTooltip +=
      '<tr>' +
      '<td style="font-size:10px">' +
      param.marker +
      '<span> ' +
      param.dimensionNames[i] +
      '</span>' +
      '</td>' +
      '<td style="font-size:10px">&nbsp;:&nbsp;</td>' +
      '<td style="font-size:10px" align="right">' +
      formatedValue +
      '</td>' +
      '</tr>';
  }
  customTooltip += '</table>';
  return customTooltip;
};
