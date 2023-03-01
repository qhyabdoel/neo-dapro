import moment from 'moment';
import { convertNumbering, parseDate, reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';
import { extract_date_filter } from 'src/app/libs/helpers/utility';

// set configuration chart to generate series data for bar chart
export const modifyDataToChartPresentation = (
  data,
  typeChart,
  localExploreArgs, // localExploreArgs alias this.explore
  mappingExtraFilterArgs,
  dataProps, // dataProps alias this.data
  colorPaletteArgs,
  localColorPalette, // localColorPalette alias this.colorPalette
  d3
) => {
  if (data.data == undefined) data = localExploreArgs;
  var tf2 = data.form_data.y_axis_2_format;
  var f2 = d3.format(tf2 ? (tf2 == ',f' ? ',' : tf2) : ',');
  var total = 0;
  var series = [];
  var legendData = [];
  var seriesData = [];
  var xAxisData = [];
  var yAxisData = [];
  var itemStyle = {
    // style by default
    normal: {},
    // highlighted style when mouse hovered
    emphasis: {
      opacity: 0.7,
    },
  };

  var dataZoom = [];
  var xAxis = {
    type: 'category',
    data: [],
    name: data.form_data.x_axis_label ? data.form_data.x_axis_label : '',
    nameLocation: 'center',
    nameGap: 35,
    show: true,
    position: 'bottom',
  };
  // for yAxisLine Hor Bar
  var xAxisLine = {
    type: 'category',
    data: [],
    name: data.form_data.y_axis_line ? data.form_data.y_axis_line : '',
    nameLocation: 'center',
    nameGap: 35,
    show: true,
    position: 'top',
  };
  // yAxis BAR
  var yAxis = {
    type: 'value',
    data: [],
    name: data.form_data.y_axis_label ? data.form_data.y_axis_label : '',
    nameLocation: 'center',
    nameGap: 35,
    axisLabel: {
      formatter: (value) => {
        value = reformatNumber(value, data.form_data.y_axis_format, localExploreArgs, d3);
        return value;
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
  // yAxis LINE
  var yAxisLine = {
    type: 'value',
    data: [],
    name: data.form_data.y_axis_line ? data.form_data.y_axis_line : '',
    nameLocation: 'center',
    // nameGap: 35,
    min:
      data.form_data.y_axis_bounds_min != undefined && data.form_data.y_axis_bounds_min != ''
        ? data.form_data.y_axis_bounds_min
        : 0 || 0,
    max:
      data.form_data.y_axis_bounds_max != undefined && data.form_data.y_axis_bounds_max != ''
        ? data.form_data.y_axis_bounds_max
        : 100 || 100,
    axisLabel: {
      formatter: (value) => {
        return data.form_data.y_axis_2_format == '.3s' ? convertNumbering(value) : f2(value);
      },
    },
    show: true,
    position: 'right',
  };
  // Series BAR
  let forSeriesData = {
    name: '',
    type: 'bar',
    stack: '',
    itemStyle: itemStyle,
    label: {},
    data: [],
    tooltips: [],
  };
  // Series LINE
  let forSeriesLine = {
    name: '',
    type: 'line',
    itemStyle: itemStyle,
    yAxisIndex: 1,
    // label: {},
    data: [],
    tooltips: [],
  };

  //reformate date
  for (var i = 0; i < data.data.length; i++) {
    var value = data.data[i].values;
    for (var j = 0; j < value.length; j++) {
      if (typeof data.data[i].values[j].x === 'string') {
        var isUTC = parseDate(data.data[i].values[j].x);
        if (isUTC) {
          let formatedDate = moment(data.data[i].values[j].x).format('DD/MM/YYYY');
          data.data[i].values[j].x = formatedDate;
        } else {
          data.data[i].values[j].x = data.data[i].values[j].x;
        }
      }
    }
  }

  var val = [];
  let groupby = {};
  let subgroupby = {};
  //for Sorting
  let sumValue = {};
  let mappingExtraFilter = mappingExtraFilterArgs;
  for (var i = 0; i < data.data.length; i++) {
    if (data.form_data.groupby.length > 0) {
      for (let row of data.form_data.groupby) {
        groupby = {};
        groupby = { key: data.data[i].key, value: row };
        mappingExtraFilter.push(groupby);
      }
    }
    if (data.form_data.columns) {
      if (data.form_data.columns.length > 0 && data.form_data.style_tooltips === 'item') {
        for (let row of data.form_data.columns) {
          subgroupby = {};
          subgroupby = { key: data.data[i].key, value: row };
          mappingExtraFilter.push(subgroupby);
        }
      }
    }

    val = data.data[i].values;
    for (var j = 0; j < val.length; j++) {
      if (i == 0) sumValue[val[j].x] = val[j].y;
      else sumValue[val[j].x] += val[j].y;
    }
  }
  let ordereds = [],
    list_axis = [];
  for (var i = 0; i < data.data[0].values.length; i++) {
    ordereds.push([data.data[0].values[i].x, data.data[0].values[i].y]);
    list_axis.push({ key: data.data[0].values[i].x });
  }

  if (typeChart != 'dist_bar') {
    ordereds = [];
    for (var i = 0; i < data.data[0].values.length; i++) {
      ordereds.push([data.data[0].values[i].x, data.data[0].values[i].y]);
    }
  }

  for (var i = 0; i < data.data.length; i++) {
    let pos = 'top';
    let show = data.form_data.show_bar_value ? data.form_data.show_bar_value : false;
    if (typeChart != 'dist_bar') {
      if (data.form_data.bar_stacked) {
        if (data.form_data.count_stacked) {
          pos = 'right';
        } else pos = 'inside';
      } else {
        pos = 'right';
      }
    } else {
      if (data.form_data.bar_stacked) {
        if (data.form_data.count_stacked) {
          pos = 'top';
        } else {
          pos = 'inside';
        }
      }
    }

    val = data.data[i].values;
    if (!data.data[i].line) {
      forSeriesData = {
        name: data.data[i].hasOwnProperty('tooltips') ? JSON.stringify(data.data[i].tooltips) : data.data[i].key,
        type: 'bar',
        stack: data.form_data.bar_stacked ? 'total' : '',
        itemStyle: itemStyle,
        label: {
          normal: {
            show: show,
            position: pos,
            formatter: (v) => {
              let totalDataIndex = 0;
              let val = parseFloat(v.value);
              if (data.form_data.count_stacked) val = totalDataIndex;

              let formatedValue = reformatNumber(val, data.form_data.y_axis_format, localExploreArgs, d3);
              return formatedValue;
            },
          },
        },
        data: [],
        tooltips: [],
      };
    }
    if (data.data[i].line) {
      let yAxisIndex = 0;
      if (data.form_data.show_dual_axis_line) yAxisIndex = 1;
      forSeriesLine = {
        name: data.data[i].hasOwnProperty('tooltips') ? JSON.stringify(data.data[i].tooltips) : data.data[i].key,
        type: 'line',
        itemStyle: itemStyle,
        yAxisIndex: yAxisIndex,
        data: [],
        tooltips: [],
      };
    }

    if (
      data.form_data.choose_pallete != undefined &&
      data.form_data.choose_pallete == 'custom_pallete' &&
      data.form_data.colorpickers != undefined &&
      data.form_data.colorpickers.length > 0
    ) {
      for (let j = 0; j < data.form_data.colorpickers.length; j++) {
        if (
          String(data.data[i].key).replace(' ', '').toLowerCase() ==
          String(data.form_data.colorpickers[j].entity).replace(' ', '').toLowerCase()
        ) {
          let itemGaul = {
            normal: {},
            emphasis: {
              opacity: 0.7,
            },
            color:
              data.form_data.colorpickers[j].colorpicker != undefined
                ? data.form_data.colorpickers[j].colorpicker
                : '#808080',
          };
          if (!data.data[i].line) forSeriesData = { ...forSeriesData, itemStyle: itemGaul };
          if (data.data[i].line) forSeriesLine = { ...forSeriesLine, itemStyle: itemGaul };
          break;
        }
      }
    }

    if (data.form_data.dist_bar_sorter == 'x_axis' || data.form_data.horizontal_bar_sorter == 'y_axis') {
      Object.keys(ordereds).map((key) => {
        if (i == 0 && !data.form_data.is_first_axis_label) xAxis.data.push(ordereds[key][0]);
        if (i == 0 && data.form_data.is_first_axis_label) xAxis.data.push(ordereds[key][0].split(' - ')[0]);
        for (var j = 0; j < val.length; j++) {
          if (val[j].x == ordereds[key][0]) {
            if (!data.data[i].line) forSeriesData.data.push(val[j].y);
            if (data.data[i].line) forSeriesLine.data.push(val[j].y);
            break;
          }
          if (data.form_data.tooltips != undefined && data.form_data.tooltips.length > 0) {
            let toltips = [];
            if (val[j].hasOwnProperty('tooltips')) {
              for (const [key, value] of Object.entries(val[j].tooltips)) {
                toltips.push(value);
              }
            }
            if (!data.data[i].line) forSeriesData = { ...forSeriesData, tooltips: toltips };
            if (data.data[i].line) forSeriesLine = { ...forSeriesLine, tooltips: toltips };
          }
        }
      });
    } else {
      for (var j = 0; j < val.length; j++) {
        if (i == 0 && !data.form_data.is_first_axis_label) xAxis.data.push(val[j].x);
        if (i == 0 && data.form_data.is_first_axis_label) xAxis.data.push(val[j].x.split(' - ')[0]);
        if (!data.data[i].line) {
          forSeriesData.data.push(val[j].y);
        }
        if (data.data[i].line) {
          forSeriesLine.data.push(val[j].y);
        }
        if (data.form_data.tooltips != undefined && Object.entries(data.form_data.tooltips).length > 0) {
          let toltips = [];
          if (val[j].hasOwnProperty('tooltips')) {
            for (const [key, value] of Object.entries(val[j].tooltips)) {
              toltips.push(value);
            }
          }
          if (!data.data[i].line) forSeriesData = { ...forSeriesData, tooltips: toltips };
          if (data.data[i].line) forSeriesLine = { ...forSeriesLine, tooltips: toltips };
        }
      }
    }

    if (i === 0) {
      if (data.form_data.rotate_axis != null && data.form_data.rotate_axis != undefined) {
        xAxis = Object.assign({}, xAxis, {
          axisLabel: {
            rotate: data.form_data.rotate_axis,
          },
        });
      }
      // order dulu asc desc and default is asc
      // limit data
      // reverse legend & value
      if (data.form_data.row_limit != null) {
        if (typeChart == 'dist_bar') {
          xAxis.data = xAxis.data.slice(
            0,
            xAxis.data.length < data.form_data.row_limit ? xAxis.data.length : data.form_data.row_limit
          );

          forSeriesData.data = forSeriesData.data.slice(
            0,
            forSeriesData.data.length < data.form_data.row_limit ? forSeriesData.data.length : data.form_data.row_limit
          );
          forSeriesLine.data = forSeriesLine.data.slice(
            0,
            forSeriesLine.data.length < data.form_data.row_limit ? forSeriesLine.data.length : data.form_data.row_limit
          );
        } else {
          xAxis.data = xAxis.data.slice(
            xAxis.data.length - data.form_data.row_limit < 0 ? 0 : xAxis.data.length - data.form_data.row_limit,
            xAxis.data.length
          );
          forSeriesData.data = forSeriesData.data.slice(
            forSeriesData.data.length - data.form_data.row_limit < 0
              ? 0
              : forSeriesData.data.length - data.form_data.row_limit,
            forSeriesData.data.length
          );
          forSeriesLine.data = forSeriesLine.data.slice(
            forSeriesLine.data.length - data.form_data.row_limit < 0
              ? 0
              : forSeriesLine.data.length - data.form_data.row_limit,
            forSeriesLine.data.length
          );
        }
      }
    }

    // begin X axis reverse
    if (typeChart != 'dist_bar') {
      if (i == 0) xAxis.data = xAxis.data.reverse();
      if (!data.form_data.is_axis_reverse) {
        if (data.form_data.order_desc) {
          if (data.data[i].line) forSeriesLine.data = forSeriesLine.data.reverse();
          else forSeriesData.data = forSeriesData.data.reverse();
        } else {
          if (data.data[i].line) forSeriesLine.data = forSeriesLine.data.reverse();
          else forSeriesData.data = forSeriesData.data.reverse();
        }
      }
    } else {
      if (data.form_data.is_axis_reverse) {
        if (data.data[i].line) forSeriesLine.data = forSeriesLine.data.reverse();
        else forSeriesData.data = forSeriesData.data.reverse();
      }
    }
    if (i == 0 && data.form_data.is_axis_reverse) xAxis.data = xAxis.data.reverse();
    // end x axis reverse

    legendData.push(data.data[i].key);
    // bar line
    if (data.form_data.with_line) {
      if (data.data[i].line) seriesData.push(forSeriesLine);
      else seriesData.push(forSeriesData);
    } else {
      seriesData.push(forSeriesData);
    }
  }
  //  for sort desc pol gede gone duwur
  xAxis.data.filter((item, pos, self) => {
    return self.indexOf(item) == pos;
  });

  let min = forSeriesLine.data.length > 0 ? Math.min.apply(null, forSeriesLine.data) : 0;
  let max = forSeriesLine.data.length > 0 ? Math.max.apply(null, forSeriesLine.data) : 100;
  if (data.form_data.y_axis_bounds_min != undefined && data.form_data.y_axis_bounds_min != '')
    min = data.form_data.y_axis_bounds_min;
  if (data.form_data.y_axis_bounds_max != undefined && data.form_data.y_axis_bounds_max != '')
    max = data.form_data.y_axis_bounds_max;
  if (typeChart == 'dist_bar') {
    xAxisData.push(xAxis);

    // bar line
    if (data.form_data.show_dual_axis_line) {
      yAxisLine = Object.assign({}, yAxisLine, { min: min, max: max });
      yAxisData.push(yAxis, yAxisLine);
    } else {
      yAxisData.push(yAxis);
    }
  } else {
    xAxis = Object.assign({}, xAxis, {
      nameLocation: 'end',
    });
    xAxisData.push(yAxis);
    // bar line
    if (data.form_data.show_dual_axis_line) {
      xAxisLine = Object.assign({}, xAxisLine, { min: min, max: max });
      yAxisData.push(xAxis, xAxisLine);
    } else {
      yAxisData.push(xAxis);
    }
  }

  //sort bar berdasar series name
  if (!data.form_data.order_desc) {
    //ascending series data
    seriesData.sort((a, b) => {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
  }

  if (data.form_data.order_desc) {
    //descending series data
    seriesData.sort((a, b) => {
      return a.name < b.name ? 1 : b.name < a.name ? -1 : 0;
    });
  }

  series = seriesData;
  // begin
  let themes = data.form_data.color_scheme
    ? data.form_data.color_scheme != 'bnbColors'
      ? data.form_data.color_scheme
      : 'palette1'
    : 'palette1';
  // this.theme = themes ? (themes != 'bnbColors' ? themes : 'palette1') : 'palette1';
  let colors = [];
  if (data.form_data.random_color) {
    let array = dataProps && dataProps.series ? dataProps.series : series;
    for (let index = 0; index < array.length; index++) {
      colors.push(colorPaletteArgs[themes][Math.floor(Math.random() * colorPaletteArgs[themes].length)]);
    }
  }

  let scheme =
    data.form_data.color_scheme != 'bnbColors' && data.form_data.color_scheme != undefined
      ? data.form_data.color_scheme
      : 'palette1';

  // sort desc dari atas , uncheck dari bawah
  let obj = {
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
  let widthLegend = 400;
  let legends = {
    show: data.form_data.show_legend != undefined ? data.form_data.show_legend : true,
    type: 'scroll',
    orient: 'horizontal',
    // left: "center",
    width: widthLegend,
    data: legendData,
    // selected:{'Forest':false, 'Steppe':true,'Desert':false},
    textStyle: {
      fontSize: 10,
    },
  };
  let legendSelected = {};
  for (let i = 0; i < legendData.length; i++) {
    if (i == 0) legendSelected[legendData[i]] = true;
    else legendSelected[legendData[i]] = false;
  }
  if (data.form_data.show_only_one_value) legends = Object.assign({}, legends, { selected: legendSelected });
  if (data.form_data.legend_orient != undefined)
    legends = {
      ...legends,
      orient: data.form_data.legend_orient == null ? 'horizontal' : data.form_data.legend_orient,
    };
  if (data.form_data.legend_type != undefined)
    legends = { ...legends, type: data.form_data.legend_type == null ? 'plain' : data.form_data.legend_type };
  if (data.form_data.legend_position != undefined) legends[data.form_data.legend_position] = 0;
  if (data.form_data.legend_width != undefined && data.form_data.legend_width != null)
    legends = {
      ...legends,
      width: Number(data.form_data.legend_width) > 0 ? Number(data.form_data.legend_width) : widthLegend,
    };

  let coloring = [];
  if (
    data.form_data.choose_pallete != undefined &&
    data.form_data.choose_pallete == 'custom_pallete' &&
    data.form_data.colorpickers != undefined &&
    data.form_data.colorpickers.length > 0
  ) {
    // let array = dataProps !== undefined ? dataProps.series : series;
    let array = series;
    for (let index = 0; index < array.length; index++) {
      for (let j = 0; j < data.form_data.colorpickers.length; j++) {
        if (
          String(array[index].name).replace(' ', '') == String(data.form_data.colorpickers[j].entity).replace(' ', '')
        ) {
          coloring.push(
            data.form_data.colorpickers[j].colorpicker != undefined
              ? data.form_data.colorpickers[j].colorpicker
              : colorPaletteArgs[themes][Math.floor(Math.random() * colorPaletteArgs[themes].length)]
          );
          break;
        }
      }
    }
  } else {
    coloring = colors.length == 0 ? localColorPalette[themes] : colors || [];
  }

  return {
    // additional set data to bar2.component.ts
    mappingExtraFilter: mappingExtraFilter,
    legendList: legendData,

    theme: themes ? (themes != 'bnbColors' ? themes : 'palette1') : 'palette1',
    // additional set data to bar2.component.ts
    color: coloring,
    grid: {
      top: 50,
      left:
        data.form_data.left_margin == 'auto'
          ? '5%'
          : data.form_data.left_margin != undefined
          ? data.form_data.left_margin
          : '5%',
      right: '5%',
      bottom:
        data.form_data.bottom_margin == 'auto'
          ? '20%'
          : data.form_data.bottom_margin != undefined
          ? data.form_data.bottom_margin
          : '20%',
      containLabel: true,
    },
    title: {
      text: obj.title ? obj.title : '',
      subtext: obj.subtitle,
      left: obj.lefttitle,
    },
    tooltip: {
      trigger: data.form_data.style_tooltips || 'item',
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
      axisme: {
        type: 'shadow',
      },
      textStyle: {
        fontSize: 14,
      },
      formatter: (params) => {
        // for array tooltips
        // console.log(params);
        let custom_name = params['name'];
        let obj = list_axis.filter((x) => x.key.split(' - ')[0] == custom_name)[0];
        if (obj != undefined) custom_name = obj.key;

        let customTooltip = '';
        if (data.form_data.style_tooltips == 'axis') {
          // for tooltip trigger axis
          custom_name = params[0]['name'];
          obj = list_axis.filter((x) => x.key.split(' - ')[0] == custom_name)[0];
          if (obj != undefined) custom_name = obj.key;

          customTooltip +=
            '<table ><tr><td style="font-size:10px" colspan="3"><span> ' + custom_name + ' </span></td></tr>';
          Object.keys(params).map((key) => {
            let par = reformatNumber(
              params[key]['value'],
              data.form_data.format_number_tooltips != undefined ? data.form_data.format_number_tooltips : ',',
              localExploreArgs,
              d3
            );
            if (Number(par) != 0) {
              customTooltip +=
                '<tr><td style="font-size:10px">' +
                params[key]['marker'] +
                '<span> ' +
                params[key]['seriesName'] +
                '</span></td><td style="font-size:10px">&nbsp;:&nbsp;</td><td style="font-size:10px" align="right">' +
                par +
                '</td></tr>';
            }
          });
        } else {
          let key = params['data'].key;
          let name = custom_name;
          let toltip = '';
          if (params['data'].tooltips != undefined && params['data'].tooltips.length > 0) {
            for (let row of params['data'].tooltips) {
              toltip += row + '<br>';
            }
            key = toltip;
            name = toltip;
          }
          let value = Number(params['value']);
          value = reformatNumber(
            value,
            data.form_data.format_number_tooltips != undefined ? data.form_data.format_number_tooltips : ',',
            localExploreArgs,
            d3
          );

          customTooltip += '<table ><tr><td style="font-size:10px" colspan="3"><span> ' + name + ' </span></td></tr>';
          customTooltip +=
            '<tr><td style="font-size:10px">' +
            params['marker'] +
            '<span> ' +
            params['seriesName'] +
            '</span></td><td style="font-size:10px">&nbsp;:&nbsp;</td><td style="font-size:10px" align="right">' +
            value +
            '</td></tr>';
          customTooltip += '</table>';
        }
        return customTooltip;
      },
    },
    toolbox: {
      show: data.form_data.show_controls,
      showTitle: false, // hide the default text so they don't overlap each other
      feature: {
        magicType: {
          type: [data.form_data.bar_stacked ? 'bar' : 'stack'],
          title: {
            stack: data.form_data.bar_stacked ? '' : 'Switch to stacked',
            bar: !data.form_data.bar_stacked ? '' : 'Switch to bar',
          },
        },
      },
      tooltip: {
        // same as option.tooltip
        show: true,
        formatter: (param) => {
          let title = param.title == '切换为平铺' ? 'Switch to bar' : param.title;
          if (param.title == '切换为堆叠') {
            title = 'Switch to stacked';
          }
          return '<div>' + title + '</div>'; // user-defined DOM structure
        },
        backgroundColor: '#222',
        textStyle: {
          fontSize: 12,
        },
        extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);', // user-defined CSS styles
      },
    },
    dataZoom: [
      {
        show: false,
      },
    ],
    xAxis: obj.xAxis,
    yAxis: obj.yAxis,
    legend: legends,
    series: data.form_data.count_stacked
      ? obj.series.map((item, index) => {
          let pos = 'top';
          let show = data.form_data.show_bar_value ? data.form_data.show_bar_value : false;
          if (typeChart != 'dist_bar') {
            if (data.form_data.bar_stacked) {
              if (data.form_data.count_stacked) {
                show = index == obj.series.length - 1 ? true : false;
                pos = 'right';
              } else pos = 'inside';
            } else {
              pos = 'right';
            }
          } else {
            if (data.form_data.bar_stacked) {
              if (data.form_data.count_stacked) {
                show = index == obj.series.length - 1 ? true : false;
                pos = 'top';
              } else {
                pos = 'inside';
              }
            }
          }

          return Object.assign(item, {
            name: item.name,
            type: 'bar',
            stack: data.form_data.bar_stacked ? 'total' : '',
            itemStyle: item.itemStyle,
            label: {
              normal: {
                show: show,
                position: item.label.normal.position,
                formatter: (v) => {
                  let totalDataIndex = 0;

                  let val = parseFloat(v.value);
                  if (data.form_data.count_stacked) val = totalDataIndex;
                  let formatedValue = reformatNumber(val, data.form_data.y_axis_format, localExploreArgs, d3);
                  return formatedValue;
                },
              },
            },
            data: item.data,
          });
        })
      : obj.series,
  };
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
  filter_granularity_sqlaArgs,
  exploreArgs
) => {
  if (isFilter) {
    param.form_data = Object.assign({}, explore.form_data, { extra_filters: extraFilter });
  }
  let sinceDate = sinceDateArgs;
  let untilDate = untilDateArgs;
  let filter_granularity_sqla = filter_granularity_sqlaArgs;
  if (isFilter && extraFilter.length > 0) {
    let dateFilter = extract_date_filter(moment, extraFilter);
    sinceDate = isOnDateFilter ? sinceDateArgs : dateFilter[0];
    untilDate = isOnDateFilter ? untilDateArgs : dateFilter[1];
    filter_granularity_sqla = dateFilter[2];
    if (dateFilter[0] && dateFilter[1]) isDateFilter = true;
  }
  if (isFilter && (isDateFilter || isInitialDateFilter)) {
    exploreArgs.form_data.since = '';
    exploreArgs.form_data.until = '';
    param.form_data.since = '';
    param.form_data.until = '';
  }
  return { param, sinceDate, untilDate, filter_granularity_sqla, exploreArgs };
};
