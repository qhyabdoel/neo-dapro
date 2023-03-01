import moment from 'moment';
import { reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';
import { convert_metric_to_verbose, get_format_date } from 'src/app/libs/helpers/utility';

export const helpergetConfigChart = async (data, d3, formaterNumber, explore, originalDate, mappingExtraFilter) => {
  let locale = data.form_data.format_number_id ? 'ID' : 'EN';
  d3.formatDefaultLocale(formaterNumber[locale]);
  let item = await setConfigChart(data, data.form_data.viz_type, d3, explore, originalDate, mappingExtraFilter);

  return item;
};

const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

export const setConfigChart = async (data, typeChart, d3, explore, originalDateArgs, mappingExtraFilterArgs) => {
  if (data.data == undefined) data = explore;
  let total = 0;
  let series = [];
  let legendData = [];
  let seriesData = [];
  let xAxisData = [];
  let yAxisData = [];
  let originalDate = originalDateArgs;
  let mappingExtraFilter = mappingExtraFilterArgs;

  var dataZoom = [];
  var xAxis = {
    type: 'category',
    data: [],
    name: data.form_data.x_axis_label ? data.form_data.x_axis_label : '',
    nameLocation: 'center',
    nameGap: 35,
    show: true,
    position: 'bottom',
    boundaryGap: false,
    originDate: 'test',
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
        let formatedValue = reformatNumber(value, data.form_data.y_axis_format, explore, d3);
        return formatedValue;
      },
    },
    show: true,
    position: 'left',
    axisLine: { onZero: false },
  };
  let groupby = {};
  switch (typeChart) {
    case 'line':
      let forSeriesDataLine = {
        name: '',
        type: 'line',
        data: [],
        symbolSize: 0,
        symbol: 'circle',
      };
      var val = [];
      var date_num_val_arr = [];
      var date_num_val_arr_not_format = [];
      var arrTresholdMin = [];

      for (var i = 0; i < data.data.length; i++) {
        val = data.data[i].values;
        for (var j = 0; j < val.length; j++) {
          date_num_val_arr.push(val[j].x);
        }
      }

      date_num_val_arr = date_num_val_arr.filter(onlyUnique);

      if (data.form_data.order_desc) {
        date_num_val_arr.sort((a, b) => (a < b ? 1 : b < a ? -1 : 0));
      } else {
        date_num_val_arr.sort((a, b) => (b < a ? 1 : a < b ? -1 : 0));
      }

      date_num_val_arr = date_num_val_arr.slice(0, data.form_data.limit);
      date_num_val_arr = data.form_data.order_desc ? date_num_val_arr.reverse() : date_num_val_arr;
      date_num_val_arr_not_format = date_num_val_arr;

      for (let d = 0; d < date_num_val_arr.length; d++) {
        if (data.form_data.x_axis_format == 'smart_date' || data.form_data.granularity_sqla == 'Date') {
          let formatdate = get_format_date(data.form_data.x_axis_format);
          xAxis.data.push(moment(date_num_val_arr[d]).format(formatdate));
          originalDate.push(moment(date_num_val_arr[d]).format('DD/MM/YYYY'));
        } else {
          if (data.form_data.time_grain_sqla == 'hour') {
            let formatdate = get_format_date(data.form_data.x_axis_format);
            xAxis.data.push(moment(date_num_val_arr[d]).format(formatdate + ' hh:mm A'));
          } else {
            let formatdate = get_format_date(data.form_data.x_axis_format);
            xAxis.data.push(moment(date_num_val_arr[d]).format(formatdate));
          }
        }
      }
      xAxisData.push(xAxis);
      for (var i = 0; i < data.data.length; i++) {
        for (let z = 0; z < data.form_data.groupby.length; z++) {
          groupby = {};
          const el = data.form_data.groupby[z];
          groupby = { key: data.data[i].key[0], value: data.form_data.groupby[z] };
          mappingExtraFilter.push(groupby);
        }

        forSeriesDataLine = {
          name: convert_metric_to_verbose(data.data[i].key, explore),
          type: 'line',
          data: [],
          symbolSize: 8,
          symbol: 'circle',
        };
        if (data.form_data.area_chart) {
          forSeriesDataLine = Object.assign({}, forSeriesDataLine, {
            areaStyle: {},
          });
        }
        if (data.form_data.stack_area_chart) {
          forSeriesDataLine = Object.assign({}, forSeriesDataLine, {
            stack: 'total',
          });
        }

        if (data.form_data.line_interpolation == 'step-line') {
          if (i == 0) {
            forSeriesDataLine = Object.assign({}, forSeriesDataLine, {
              step: 'start',
            });
          } else {
            forSeriesDataLine = Object.assign({}, forSeriesDataLine, {
              step: 'end',
            });
          }
        } else if (data.form_data.line_interpolation == 'smooth') {
          forSeriesDataLine = Object.assign({}, forSeriesDataLine, {
            smooth: true,
          });
        }
        val = data.data[i].values;
        let total = 0;

        //sort by date
        if (data.form_data.order_desc) {
          val.sort((a, b) => (a['x'] < b['x'] ? 1 : b['x'] < a['x'] ? -1 : 0));
        }

        for (var j = 0; j < val.length; j++) {
          total += parseFloat(val[j].y);
        }

        for (var k = 0; k < date_num_val_arr_not_format.length; k++) {
          let el = date_num_val_arr_not_format[k];
          let v = 0;
          let x = 0;
          for (var j = 0; j < val.length; j++) {
            if (el == val[j].x) {
              if (data.form_data.y_log_scale) {
                x = parseFloat(val[j].y) > 0 ? Math.log10(parseFloat(val[j].y)) : 0;
                v = parseFloat(val[j].y) > 0 ? Math.log10(parseFloat(val[j].y)) : 0;
              } else {
                if (data.form_data.contribution) {
                  x = (val[j].y / total) * 100;
                  v = (val[j].y / total) * 100;
                } else {
                  x = val[j].y;
                  v = val[j].y;
                }
              }
            }
          }
          forSeriesDataLine.data.push(x);
          arrTresholdMin.push(v);
        }

        if (i == 0) {
          let obj = {
            type: 'value',
            yAxisIndex: 0,
            show: true,
            position: 'left',
          };

          if (data.form_data.y_axis_bounds[0] != '') {
            yAxis = Object.assign({}, yAxis, {
              type: 'value',
              yAxisIndex: 0,
              min: data.form_data.y_axis_bounds[0],
            });
          }
          if (data.form_data.y_axis_bounds[1] > 0) {
            yAxis = Object.assign({}, yAxis, {
              type: 'value',
              yAxisIndex: 0,
              max: data.form_data.y_axis_bounds[1] || '',
            });
          }

          if (data.form_data.contribution) {
            yAxis = Object.assign({}, yAxis, {
              type: 'value',
              yAxisIndex: 0,
              min: 0,
              max: 100,
            });
          }
          yAxis = Object.assign({}, yAxis, {
            axisLabel: {
              fontWeight: function (value, idx) {
                return 'bold';
              },
            },
          });

          if (data.form_data.show_brush) {
            dataZoom.push(
              {
                startValue: xAxis.data.length > 0 ? xAxis.data[0] : '',
              },
              {
                type: 'inside',
              }
            );
          }
        }

        legendData.push(convert_metric_to_verbose(data.data[i].key, explore));
        seriesData.push(forSeriesDataLine);
      }

      // set min yAxis treshold
      if (data.form_data.y_axis_bounds[0] == null) {
        const minim = Math.min.apply(null, arrTresholdMin);
        if (Number(minim) > 5)
          yAxis = Object.assign({}, yAxis, {
            min: Number(minim) - 5,
          });
      }
      yAxisData.push(yAxis);
      series = seriesData;
      break;
    case 'dual_line':
      let forSeriesData2Line = {
        name: '',
        type: 'line',
        data: [],
        yAxisIndex: 0,
        symbolSize: 0,
      };
      if (data.form_data.stack_area_chart) {
        forSeriesData2Line = Object.assign({}, forSeriesData2Line, {
          stack: 'total',
        });
      }
      if (data.form_data.area_chart) {
        forSeriesData2Line = Object.assign({}, forSeriesData2Line, {
          areaStyle: {},
        });
      }
      var val = [];
      for (var i = 0; i < data.data.length; i++) {
        forSeriesData2Line = {
          name: data.data[i].key,
          type: 'line',
          data: [],
          yAxisIndex: i,
          symbolSize: 8,
        };
        if (data.form_data.stack_area_chart) {
          forSeriesData2Line = Object.assign({}, forSeriesData2Line, {
            stack: 'total',
          });
        }
        if (data.form_data.area_chart) {
          forSeriesData2Line = Object.assign({}, forSeriesData2Line, {
            areaStyle: {},
          });
        }
        yAxis = Object.assign({}, yAxis, {
          name: data.data[i].key,
          type: 'value',
          position: i == 0 ? 'left' : 'right',
          yAxisIndex: i,
          axisLabel: {
            formatter:
              i == 0
                ? function (value) {
                    let formatedValue = reformatNumber(value, data.form_data.y_axis_format, explore, d3);
                    return formatedValue;
                  }
                : function (value) {
                    let formatedValue = reformatNumber(value, data.form_data.y_axis_2_format, explore, d3);
                    return formatedValue;
                  },
          },
          nameGap: 35,
          axisLine: { onZero: false },
        });

        val = data.data[i].values;

        for (var j = 0; j < val.length; j++) {
          forSeriesData2Line.data.push(val[j].y);
          if (i == 0) {
            if (data.form_data.x_axis_format == 'smart_date') {
              xAxis.data.push(moment(val[j].x).format('MMM YYYY'));
              originalDate.push(moment(val[j].x).format('DD/MM/YYYY'));
            } else {
              let formatdate = get_format_date(data.form_data.x_axis_format);
              xAxis.data.push(moment(val[j].x).format(formatdate));
            }
          }
        }
        if (i == 0) {
          xAxisData.push(xAxis);
        }
        legendData.push(data.data[i].key);
        yAxisData.push(yAxis);
        seriesData.push(forSeriesData2Line);
      }
      series = seriesData;
      break;
    default:
      break;
  }
  return {
    showLegend: data.form_data.show_legend ? data.form_data.show_legend : true,
    showControls: data.form_data.show_controls ? data.form_data.show_controls : true,
    // legendData: legendData,
    legend: { data: legendData, textStyle: { color: '#ccc' } },
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
    originalDate: originalDate,
    mappingExtraFilter: mappingExtraFilter,
  };
};
