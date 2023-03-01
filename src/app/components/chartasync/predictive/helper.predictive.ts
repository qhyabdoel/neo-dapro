import moment from 'moment';
import { reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';
import { convert_metric_to_verbose, extract_date_filter, get_format_date } from 'src/app/libs/helpers/utility';

export const helperSetFilter = (
  param,
  explore,
  isFilter,
  extraFilter,
  exploreArgs,
  sinceDate,
  untilDate,
  filter_granularity_sqla,
  isDateFilter,
  isInitialDateFilter
) => {
  if (isFilter) param.form_data = Object.assign({}, explore.form_data, { extra_filters: extraFilter });
  //check if there is a date in extra filter
  if (isFilter && extraFilter.length > 0) {
    let dateFilter = extract_date_filter(moment, extraFilter);
    sinceDate = dateFilter[0];
    untilDate = dateFilter[1];
    filter_granularity_sqla = dateFilter[2];
    if (dateFilter[0] && dateFilter[1]) isDateFilter = true;
  }
  if (isFilter && (isDateFilter || isInitialDateFilter)) {
    exploreArgs.form_data.since = '';
    exploreArgs.form_data.until = '';
    param.form_data.since = '';
    param.form_data.until = '';
  }
  return { param: param, sinceDate: sinceDate, untilDate: untilDate, filter_granularity_sqla: filter_granularity_sqla };
};

export const setConfigChart = (data, typeChart, explorePointer, d3, colorPaletteArgs, explore) => {
  if (data.data == undefined) data = explorePointer;
  var total = 0;
  var series = [];
  var legendData = [];
  var seriesData = [];
  var xAxisData = [];
  var yAxisData = [];
  var dataZoom = [];
  var xAxis = {
    type: 'category',
    data: [],
    name: data.form_data.x_axis_label ? data.form_data.x_axis_label : '',
    nameLocation: 'center',
    nameGap: 35,
    show: true,
    position: 'bottom',
    axisLabel: { fontSize: 10 },
  };
  var yAxis = {
    type: 'value',
    data: [],
    name: data.form_data.y_axis_label ? data.form_data.y_axis_label : '',
    nameLocation: 'center',
    nameGap: 35,
    axisLabel: {
      formatter: function (value) {
        let num = reformatNumber(value, data.form_data.y_axis_format, explorePointer, d3);
        return num;
      },
      fontSize: 10,
    },
    show: true,
    position: 'left',
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
  let scheme =
    data.form_data.color_scheme != 'bnbColors' && data.form_data.color_scheme != undefined
      ? data.form_data.color_scheme
      : 'palette1';

  let colorPalette = colorPaletteArgs[scheme] || [];
  // mapping data dots, areas, & lines
  var yFormat = d3.format(data.form_data.y_axis_format);

  for (var i = 0; i < data.data.length; i++) {
    legendData.push(data.data[i].key);
  }
  // mapping dots
  var me = data.data.dots[0].values;
  var chartDots = {
    name: data.data.dots[0].key,
    data: [],
    type: 'scatter',
    symbol: 'circle',
    symbolSize: 10,
    emphasis: {
      label: {
        show: true,
        position: 'left',
        fontSize: 16,
      },
    },
    itemStyle: {
      color: function () {
        return colorPalette[Math.floor(Math.random() * colorPalette.length)];
      },
    },
  };
  for (var j = 0; j < me.length; j++) {
    let bubbleValue = [];
    let formatDate = get_format_date(data.form_data.x_axis_format);
    xAxis.data.push(moment(me[j].x).format(formatDate));
    let val = moment(me[j].x).format(formatDate);
    let val2 =
      yFormat != undefined
        ? data.form_data.y_axis_format == '.3s'
          ? reformatNumber(me[j].y, data.form_data.y_axis_format, explorePointer, d3)
          : yFormat(me[j].y).replace('m', '').replace('M', '')
        : String(me[j].y).replace('m', '').replace('M', '');

    if (data.form_data.y_log_scale) {
      val2 = val2 > 0 ? Math.log10(val2) : 0;
    }
    bubbleValue.push(val);
    bubbleValue.push(parseFloat(val2));
    chartDots.data.push(bubbleValue);
  }
  // mapping lines
  var me2 = data.data.lines[0].values;
  var chartLines = {
    name: convert_metric_to_verbose(data.data.lines[0].key, explore),
    type: 'line',
    data: me2.map((v) =>
      yFormat != undefined
        ? data.form_data.y_axis_format == '.3s'
          ? reformatNumber(v.y, data.form_data.y_axis_format, explorePointer, d3)
          : yFormat(parseFloat(v.y))
        : parseFloat(v.y)
    ),
    showSymbol: false,
  };
  // mapping areas
  var me3 = data.data.areas;

  // upper
  var chartAreas = {
    name: convert_metric_to_verbose(me3[0].key, explore),
    data: me3[0].values.map((v) => {
      if (Number(v.upper) > Number(v.lower)) {
        return yFormat != undefined
          ? data.form_data.y_axis_format == '.3s'
            ? reformatNumber(v.upper, data.form_data.y_axis_format, explorePointer, d3)
            : yFormat(parseFloat(v.upper))
          : parseFloat(v.upper);
      } else {
        return yFormat != undefined
          ? data.form_data.y_axis_format == '.3s'
            ? reformatNumber(v.lower, data.form_data.y_axis_format, explorePointer, d3)
            : yFormat(parseFloat(v.lower))
          : parseFloat(v.lower);
      }
    }),
    type: 'line',
    areaStyle: {},
  };
  // lower
  var chartAreas2 = {
    name: convert_metric_to_verbose(me3[1].key, explore),
    data:
      me3[1].values.length > 0
        ? me3[1].values.map((v) => {
            if (Number(v.upper) > Number(v.lower)) {
              return yFormat != undefined
                ? data.form_data.y_axis_format == '.3s'
                  ? reformatNumber(v.upper, data.form_data.y_axis_format, explorePointer, d3)
                  : yFormat(parseFloat(v.upper))
                : parseFloat(v.upper);
            } else {
              return yFormat != undefined
                ? data.form_data.y_axis_format == '.3s'
                  ? reformatNumber(v.lower, data.form_data.y_axis_format, explorePointer, d3)
                  : yFormat(parseFloat(v.lower))
                : parseFloat(v.lower);
            }
          })
        : [],
    type: 'line',
    areaStyle: {},
  };

  if (data.form_data.x_log_scale) {
    xAxis = Object.assign({}, xAxis, {
      type: 'log',
      logBase: 10,
    });
  }

  xAxisData.push(xAxis);
  yAxisData.push(yAxis);
  seriesData.push(chartDots, chartLines, chartAreas, chartAreas2);
  series = seriesData;

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
    label: {
      color: 'auto',
    },
  };
};

export const getConfigChart = async (data, d3, formaterNumber, explorePointer, colorPaletteArgs, explore) => {
  let locale = data.form_data.format_number_id ? 'ID' : 'EN';
  d3.formatDefaultLocale(formaterNumber[locale]);
  let config = {};
  config = await setConfigChart(data, data.form_data.viz_type, explorePointer, d3, colorPaletteArgs, explore);
  return config;
};
