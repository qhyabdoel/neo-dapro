import * as moment from 'moment';
export const getConfigChart = async (data, d3, colorPaletteArgs, service, chartLinks) => {
  let config = {};
  let jsonFile = null;
  let result = [];
  let url = 'assets/data/geojson/countries/indonesia.geojson.json';
  switch (data.form_data.viz_type) {
    case 'big_number_total':
      config = setConfigBigNumber(data, d3);
      break;
    case 'word_cloud':
      config = setConfigWordcloud(data);
      break;
    case 'filter_box':
    case 'markup':
      config = data;
      break;
    case 'country_map':
      if (data.form_data.select_province == null || data.form_data.select_province == '') {
        url = `assets/data/geojson/countries/${data.form_data.select_country.toString().toLowerCase()}.geojson.json`;
      } else {
        url = `assets/data/geojson/province/${data.form_data.select_province}.geojson.json`;
      }
      jsonFile = await service.loadGetData(url);
      config = setConfigMap(data, jsonFile, colorPaletteArgs, d3);
      break;
    case 'treemap':
      config = setConfigTreemap(data, colorPaletteArgs);
      break;
    case 'directed_force':
      config = setConfigDirectedForce(data, colorPaletteArgs);
      break;
    case 'scatter':
      config = setConfigScatter(data);
      break;
    default:
      config = await setConfigChart(data.form_data.viz_type, data.form_data.name, 'Value', data, d3, chartLinks);
      break;
  }
  result.push(config);
  result.push(jsonFile);
  return result;
};

const setConfigBigNumber = (data, d3) => {
  let format = data.form_data.y_axis_format || '.3s';
  let f = d3.format(format);
  return {
    value: f(data.data.data[0][0]),
    text: data.data.subheader,
    zoomSizeValue: parseInt(data.form_data.zoomsize) || 4,
    zoomSizeText: parseInt(data.form_data.subheaderfontsize) || 1,
  };
};

const setConfigWordcloud = (data) => {
  let fromdata = JSON.stringify(data.data);
  let dataReplaceText = fromdata.split('text').join('name');
  let dataReplaceValue = dataReplaceText.split('size').join('value');

  return {
    tooltip: {},
    series: [
      {
        type: 'wordCloud',
        gridSize: 2,
        sizeRange: [data.form_data.size_from, data.form_data.size_to],
        rotationRange: [0, 0],
        shape: data.form_data.rotation || 'diamond',
        drawOutOfBound: true,
        data: JSON.parse(dataReplaceValue),
      },
    ],
  };
};

const setConfigMap = (data, mapGeoJson, colorPaletteArgs, d3) => {
  let datamap = [];
  let nameMap = {};
  let me = data.data;
  let scheme =
    data.form_data.color_scheme != 'bnbColors' && data.form_data.color_scheme != undefined
      ? data.form_data.color_scheme
      : 'palette6';

  let colorPalette = colorPaletteArgs[scheme] || [];
  let f = d3.format(data.form_data.number_format);
  var title = '';
  if (data.form_data.select_province == null || data.form_data.select_province == '') {
    title = data.form_data.select_country;
    for (var i = 0; i < me.length; i++) {
      for (var j = 0; j < mapGeoJson.features.length; j++) {
        if (me[i].country_id == mapGeoJson.features[j].properties.ISO) {
          datamap.push({
            name: mapGeoJson.features[j].properties.NAME_1,
            value: me[i].metric,
            label: {
              show: true,
              color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
            },
          });
          // nameMap[mapGeoJson.features[j].properties.NAME_1] = f(me[i].label);
          mapGeoJson.features[j].properties['name'] = mapGeoJson.features[j].properties.NAME_1;
          break;
        } else {
          continue;
        }
      }
    }
  } else {
    title = data.form_data.select_province;
    for (var i = 0; i < me.length; i++) {
      for (var j = 0; j < mapGeoJson.features.length; j++) {
        datamap.push({
          name: mapGeoJson.features[j].properties.KABKOT,
          value: me[i].metric,
          label: {
            show: true,
            color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
          },
        });
        // nameMap[mapGeoJson.features[j].properties.NAME_1] = f(me[i].label);
        mapGeoJson.features[j].properties['name'] = mapGeoJson.features[j].properties.KABKOT;
      }
    }
  }

  // echarts.registerMap('ID', mapGeoJson);

  return {
    mapGeoJson: mapGeoJson,
    geo: {},
    title: {
      text: title,
      subtext: '',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        if (data.form_data.number_format) {
          var f = d3.format(data.form_data.number_format);
          return params['data'].name + '<br>' + f(params['data'].value);
        }
        return params['data'].name + '<br>' + params['data'].value;
      },
    },
    toolbox: {
      show: true,
      // orient: 'vertical',
      left: 'right',
      top: 'top',
      feature: {
        // dataView: { readOnly: false },
        // restore: {},
        // saveAsImage: {},
      },
    },
    visualMap: {
      min: 1000,
      max: 10000000,
      text: ['High', 'Low'],
      realtime: false,
      calculable: true,
      show: false,
      // color: colorPalette,
      inRange: {
        color: colorPalette,
      },
    },
    series: [
      {
        name: 'Peta Propinsi Indonesia',
        type: 'map',
        mapType: 'ID', // map type should be registered
        itemStyle: {
          normal: { label: { show: true } },
          emphasis: { label: { show: true } },
          // textStyle: {
          //   color : "white"
          // }
        },
        data: datamap,
        // nameMap: nameMap
        label: {
          show: true,
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        },
        emphasis: {
          label: {
            show: true,
          },
        },
      },
    ],
  };
};

const setConfigTreemap = (data, colorPaletteArgs) => {
  let scheme = data.form_data.color_scheme != 'bnbColors' ? data.form_data.color_scheme : 'palette6';
  return {
    tooltip: {
      formatter: function (info) {
        var value = info.value;
        var treePathInfo = info.treePathInfo;
        var treePath = [];

        for (var i = 1; i < treePathInfo.length; i++) {
          treePath.push(treePathInfo[i].name);
        }

        return ['<div class="tooltip-title">' + treePath.join(' - ') + '</div>'].join('');
      },
    },
    color: colorPaletteArgs[scheme],
    series: [
      {
        type: 'treemap',
        data: data.data,
        // leafDepth: 2,
        levels: [
          {
            // color: this.colorPalette[scheme],
            // colorMappingBy: "name",
            itemStyle: {
              borderColor: '#555',
              borderWidth: 4,
              gapWidth: 4,
            },
          },
          {
            colorSaturation: [0.3, 0.6],
            itemStyle: {
              borderColorSaturation: 0.7,
              gapWidth: 2,
              borderWidth: 2,
            },
          },
          {
            colorSaturation: [0.3, 0.5],
            itemStyle: {
              borderColorSaturation: 0.6,
              gapWidth: 1,
            },
          },
          {
            colorSaturation: [0.3, 0.5],
          },
        ],
        label: {
          show: true,
          formatter: '{b}',
        },
        upperLabel: {
          show: true,
          height: 30,
        },
      },
    ],
  };
};

const setConfigDirectedForce = (data, colorPaletteArgs) => {
  let scheme = data.form_data.color_scheme != 'bnbColors' ? data.form_data.color_scheme : 'palette6';

  let colorPalette = colorPaletteArgs[scheme] || [];

  var categories = [];
  var node = [];
  var link = [];
  var source = [];
  var cat = [];
  //distinc data from source
  for (var i = 0; i < data.data.length; i++) {
    if (source.includes(data.data[i].source)) {
    } else {
      source.push(data.data[i].source);
    }
  }
  var cat = source;
  //distinc data from target
  for (var i = 0; i < data.data.length; i++) {
    if (source.includes(data.data[i].target)) {
    } else {
      source.push(data.data[i].target);
    }
  }

  //add categories
  for (var i = 0; i < cat.length; i++) {
    categories[i] = {
      name: cat[i],
    };
  }
  //add node cascade with link
  for (var i = 0; i < source.length; i++) {
    node[i] = {
      id: i,
      name: source[i],
      itemStyle: null,
      symbolSize: 10,
      x: null,
      y: null,
      attributes: {
        modularity_class: 0,
      },
      value: 1,
      category: categories.filter((x) => x.name == source[i])[0].name,
      draggable: true,
      label: {
        show: data.form_data.show_label || false,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      },
    };
  }
  //add link
  for (var i = 0; i < data.data.length; i++) {
    link[i] = {
      id: i,
      name: null,
      source: node.filter((x) => x.name == data.data[i].source)[0].id,
      target: node.filter((x) => x.name == data.data[i].target)[0].id,
      lineStyle: {
        normal: {},
      },
    };
  }

  var graph = {
    links: link,
    nodes: node,
  };

  return {
    title: {
      text: '',
      subtext: '',
      top: 'bottom',
      left: 'right',
    },
    tooltip: {},
    legend: [
      // {
      //   // selectedMode: 'single',
      //   data: categories.map(function (a) {
      //       return a.name;
      //   })
      // }
    ],
    animation: false,
    series: [
      {
        name: data.form_data.datasource_name,
        type: 'graph',
        layout: data.form_data.layout_directed || 'force',
        data: graph.nodes,
        links: graph.links,
        categories: categories,
        roam: true,
        label: {
          show: data.form_data.show_label || false,
          position: 'right',
        },
        force: {
          repulsion: data.form_data.repulsion || 100,
        },
        circular: {
          rotateLabel: true,
        },
        lineStyle: {
          color: 'source',
          curveness: data.form_data.curvenes || 0.3,
        },
        emphasis: {
          lineStyle: {
            width: 10,
          },
        },
      },
    ],
  };
};

const setConfigScatter = (data) => {
  return {
    title: {
      text: '',
      subtext: '',
      top: 'bottom',
      left: 'right',
    },
    tooltip: {},
    legend: [],
    animation: false,
    series: [
      {
        type: 'line',
        stack: 'total',
        data: [],
      },
      {
        data: [],
        type: 'scatter',
        symbol: 'circle',
        symbolSize: 10,
        emphasis: {
          label: {
            show: true,
            position: 'top',
            formatter: function (param) {
              return param.data[3];
            },
          },
        },
      },
    ],
  };
};

const setConfigChart = (typeChart, title, seriesName, data, d3, chartLinks) => {
  var tf = data.form_data.y_axis_format;
  var f = d3.format(tf ? (tf == ',f' ? ',' : tf) : ',');
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
      // color: "rgba(33, 182, 168, 1.0)",
      // barBorderWidth: 1,
      // shadow size
      // shadowBlur: 10,
      // horizontal offset of shadow
      // shadowOffsetX: 0,
      // vertical offset of shadow
      // shadowOffsetY: 0,
      // shadow color
      // shadowColor: "rgba(0,0,0,0.5)",
    },
  };
  var dataZoom = [];
  var xAxis = {
    type: 'category',
    // boundaryGap: false,
    data: [],
    name: data.form_data.x_axis_label ? data.form_data.x_axis_label : '',
    nameLocation: 'center',
    nameGap: 35,
    show: true,
    position: 'bottom',
  };
  var yAxis = {
    type: 'value',
    // boundaryGap: false,
    data: [],
    name: data.form_data.y_axis_label ? data.form_data.y_axis_label : '',
    nameLocation: 'center',
    nameGap: 35,
    axisLabel: {
      formatter: function (value) {
        return f(value);
      },
    },
    show: true,
    position: 'left',
  };

  switch (typeChart) {
    case 'dist_bar':
    case 'horizontal_bar':
      xAxis.data = [];
      let forSeriesData = {
        name: '',
        type: 'bar',
        stack: '',
        itemStyle: itemStyle,
        label: {},
        data: [],
      };
      var val = [];
      for (var i = 0; i < data.data.length; i++) {
        let pos = data.form_data.bar_stacked ? 'inside' : 'top';
        if (typeChart != 'dist_bar') {
          pos = data.form_data.bar_stacked ? 'inside' : 'right';
        }
        forSeriesData = {
          name: data.data[i].key,
          type: 'bar',
          stack: data.form_data.bar_stacked ? 'total' : '',
          itemStyle: itemStyle,
          label: {
            show: data.form_data.show_bar_value ? data.form_data.show_bar_value : false,
            position: pos,
            formatter: function (v) {
              return f(parseFloat(v.value));
            },
          },
          data: [],
        };
        val = data.data[i].values;

        for (var j = 0; j < val.length; j++) {
          forSeriesData.data.push(val[j].y);
          if (i == 0) {
            xAxis.data.push(val[j].x);
          }
        }

        if (data.form_data.order_desc) {
          forSeriesData.data.sort((a, b) => (a < b ? 1 : b < a ? -1 : 0));
        } else {
          forSeriesData.data.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
        }
        if (i == 0) {
          if (data.form_data.order_desc) {
            xAxis.data.sort((a, b) => (a < b ? 1 : b < a ? -1 : 0));
          } else {
            xAxis.data.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
          }

          if (data.form_data.rotate_axis != null && data.form_data.rotate_axis != undefined) {
            xAxis = Object.assign({}, xAxis, {
              axisLabel: {
                rotate: data.form_data.rotate_axis,
              },
            });
          }
          if (data.form_data.row_limit != null) {
            xAxis.data = xAxis.data.slice(0, data.form_data.row_limit);
          }
          if (typeChart == 'dist_bar') {
            xAxisData.push(xAxis);
            yAxisData.push(yAxis);
          } else {
            xAxis = Object.assign({}, xAxis, {
              nameLocation: 'end',
              // axisLabel: {
              // 	align: "left",
              // },
            });
            xAxisData.push(yAxis);
            yAxisData.push(xAxis);
          }
        }
        if (data.form_data.row_limit != null) {
          forSeriesData.data = forSeriesData.data.slice(0, data.form_data.row_limit);
        }
        legendData.push(data.data[i].key);
        seriesData.push(forSeriesData);
      }

      series = seriesData;
      break;
    case 'pie':
      series = [
        {
          name: seriesName,
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
        total += parseFloat(data.data[i].y);
      }
      let label_type = data.form_data.pie_label_type;
      for (var i = 0; i < data.data.length; i++) {
        legendData.push(
          convertLabelType(
            label_type != undefined ? label_type : 'key',
            total,
            data.data[i].y,
            data.data[i].x
          ).toString()
        );
        let obj = {
          name: convertLabelType(
            label_type != undefined ? label_type : 'key',
            total,
            data.data[i].y,
            data.data[i].x
          ).toString(),
          value: data.data[i].y,
          label: {
            show: true,
            position: 'inside',
          },
        };
        if (data.form_data.labels_outside) {
          let label = {
            show: true,
            position: 'outside',
          };
          obj = { ...obj, label: label };
        }
        seriesData.push(obj);
        // seriesData.push({
        // 	name: data.data[i].x,
        // 	value: data.data[i].y,
        // });
      }
      xAxisData.push({ type: 'value' });
      yAxisData.push({ type: 'value' });
      series[0]['data'] = seriesData;
      break;

    case 'line':
      let forSeriesDataLine = {
        name: '',
        type: 'line',
        // stack: "total",
        data: [],
      };
      var val = [];

      for (var i = 0; i < data.data.length; i++) {
        forSeriesDataLine = {
          name: convMetricNameToVerboseName(data.data[i].key, chartLinks),
          type: 'line',
          // stack: "总量", // for gap between line
          data: [],
        };
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
        for (var j = 0; j < val.length; j++) {
          total += parseFloat(val[j].y);
        }
        for (var j = 0; j < val.length; j++) {
          if (data.form_data.y_log_scale) {
            forSeriesDataLine.data.push(parseFloat(val[j].y) > 0 ? Math.log10(parseFloat(val[j].y)) : 0);
          } else {
            if (data.form_data.contribution) {
              forSeriesDataLine.data.push((val[j].y / total) * 100);
            } else {
              forSeriesDataLine.data.push(val[j].y);
            }
          }
          if (i == 0) {
            if (data.form_data.x_axis_format == 'smart_date') {
              if (data.form_data.time_grain_sqla == 'hour') {
                xAxis.data.push(moment(val[j].x).format('DD MMM YYYY hh:mm A'));
              } else {
                xAxis.data.push(moment(val[j].x).format('DD MMM YYYY'));
              }
            } else {
              if (data.form_data.time_grain_sqla == 'hour') {
                let formatdate = getFormatDate(data.form_data.x_axis_format);
                xAxis.data.push(moment(val[j].x).format(formatdate + ' hh:mm A'));
              } else {
                let formatdate = getFormatDate(data.form_data.x_axis_format);
                xAxis.data.push(moment(val[j].x).format(formatdate));
              }
            }
          }
        }
        if (data.form_data.order_desc) {
          forSeriesDataLine.data.sort((a, b) => (a < b ? 1 : b < a ? -1 : 0));
        }
        if (i == 0) {
          if (data.form_data.order_desc) {
            xAxis.data.sort((a, b) => (a < b ? 1 : b < a ? -1 : 0));
          }

          xAxis.data = xAxis.data.slice(0, data.form_data.limit);
          xAxisData.push(xAxis);

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
              min: data.form_data.y_axis_bounds[0] || 0,
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
          // if (data.form_data.y_log_scale) {
          // 	yAxis = Object.assign({}, yAxis, {
          // 		type: "log",
          // 		yAxisIndex: 0,
          // 		logBase: 10,
          // 	});
          // }
          yAxisData.push(yAxis);

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
        // legendData.push(data.data[i].key);
        legendData.push(convMetricNameToVerboseName(data.data[i].key, chartLinks));
        seriesData.push(forSeriesDataLine);
      }
      series = seriesData;
      break;
    case 'dual_line':
      let forSeriesData2Line = {
        name: '',
        type: 'line',
        stack: 'total',
        data: [],
        yAxisIndex: 0,
      };
      // let foryAxisData2Line = { name: "", type: "value", max: 0 };
      var val = [];
      // var valMax = [];
      // for (var i = 0; i < data.data.length; i++) {
      // 	valMax.push(
      // 		Math.max.apply(
      // 			Math,
      // 			data.data[i].values.map((o) => o.y)
      // 		)
      // 	);
      // }
      // let maxVal =
      // 	Math.max.apply(
      // 		Math,
      // 		valMax.map((o) => o)
      // 	) || 0;
      for (var i = 0; i < data.data.length; i++) {
        forSeriesData2Line = {
          name: data.data[i].key,
          type: 'line',
          stack: 'total',
          data: [],
          yAxisIndex: i,
        };
        yAxis = Object.assign({}, yAxis, {
          name: data.data[i].key,
          type: 'value',
          position: i == 0 ? 'left' : 'right',
          yAxisIndex: i,
          nameGap: 35,
        });

        val = data.data[i].values;

        for (var j = 0; j < val.length; j++) {
          forSeriesData2Line.data.push(val[j].y);
          if (i == 0) {
            if (data.form_data.x_axis_format == 'smart_date') {
              xAxis.data.push(moment(val[j].x).format('MMM YYYY'));
            } else {
              let formatdate = getFormatDate(data.form_data.x_axis_format);
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

    case 'bubble':
      var xFormat = d3.format(data.form_data.x_axis_format);
      var yFormat = d3.format(data.form_data.y_axis_format);
      let seriesBubble = {
        name: '',
        data: [],
        type: 'scatter',
        symbol: 'circle',
        symbolSize: parseInt(data.form_data.max_bubble_size),
        emphasis: {},
        itemStyle: {},
      };
      let bubbleValue = [];
      let forxAxisData = {
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
        data: [],
      };
      let foryAxisData = {
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
        scale: true,
        data: [],
      };
      for (var i = 0; i < data.data.length; i++) {
        legendData.push(data.data[i].key);

        let me = data.data[i].values;
        seriesBubble = {
          name: data.data[i].key,
          data: [],
          type: 'scatter',
          symbol: 'circle',
          symbolSize: parseInt(data.form_data.max_bubble_size) ** 2,
          emphasis: {
            label: {
              show: true,
              position: 'top',
              formatter: function (param) {
                return param.data[3];
              },
            },
          },
          itemStyle: {
            color: function () {
              let colorPalette = me.colorPalette[me.theme];
              return colorPalette[Math.floor(Math.random() * 12)];
            },
          },
        };
        for (var j = 0; j < me.length; j++) {
          bubbleValue = [];

          let val = xFormat(me[j][data.form_data.x]).replace('m', '').replace('M', '');
          let val2 = xFormat(me[j][data.form_data.y]).replace('m', '').replace('M', '');
          let val3 = me[j][data.form_data.y];
          if (data.form_data.x_log_scale) {
            val = val > 0 ? Math.log10(val) : 0;
            val2 = val2 > 0 ? Math.log10(val2) : 0;
          }
          if (data.form_data.y_log_scale) {
            val3 = val3 > 0 ? Math.log10(val3) : 0;
          }
          bubbleValue.push(xFormat(parseFloat(val)));
          bubbleValue.push(xFormat(parseFloat(val2)));
          bubbleValue.push(yFormat(parseFloat(val3)));
          bubbleValue.push(me[j][data.form_data.entity] + '(' + me[j][data.form_data.series] + ')');
          bubbleValue.push(me[j][data.form_data.series]);
          seriesBubble.data.push(bubbleValue);
        }
        if (i == 0) {
          xAxisData.push(xAxis);
        }

        if (data.form_data.x_log_scale) {
          xAxis = Object.assign({}, xAxis, {
            type: 'log',
            logBase: 10,
          });
        }

        yAxisData.push(yAxis);
        seriesData.push(seriesBubble);
      }
      series = seriesData;
      break;
    default:
      break;
  }
  return {
    showLegend: data.form_data.show_legend ? data.form_data.show_legend : true,
    showControls: data.form_data.show_controls ? data.form_data.show_controls : true,
    legendData: legendData,
    // selected: selected,
    title: '',
    subtitle: '',
    lefttitle: 'center',
    legendorient: 'horizontal', //"vertical",
    xAxis: xAxisData,
    yAxis: yAxisData,
    dataZoom: dataZoom,
    // legendright: 10,
    // legendtop: 20,
    // legendbottom: 20,
    // backgroundColor: "#343a40",
    contrastColor: '#eee',
    series: series,
    total: total,
    typeChart: typeChart,
  };
};

const convertLabelType = (pie_label_type, total, value, key) => {
  let persen = (parseFloat(value) * 100) / total || 0;
  // this.persen = Number(persen).toFixed(3);
  let customTooltip = '';
  if (pie_label_type == 'key') {
    customTooltip += key + ' : ' + value;
  }
  if (pie_label_type == 'value') {
    customTooltip += value;
  }
  if (pie_label_type == 'percent') {
    customTooltip += key + ' : ' + Number(persen).toFixed(3) + '%';
  }
  if (pie_label_type == 'key_value') {
    customTooltip += key + ' : ' + value;
  }
  if (pie_label_type == 'key_percent') {
    customTooltip += key + ' : ' + Number(persen).toFixed(3) + '%';
  }
  return customTooltip;
};

const convMetricNameToVerboseName = (metric_name, chartLinks) => {
  let vname = chartLinks.datasource.metrics.filter((v) => {
    if (v.metric_name == metric_name) return v;
  });
  return vname.length > 0 ? vname[0].verbose_name : metric_name;
};

const getFormatDate = (format) => {
  let formatdate = '';
  switch (format) {
    case '%m/%d/%Y':
      formatdate = 'MM/DD/YYYY';
      break;
    case '%d/%m/%Y':
      formatdate = 'DD/MM/YYYY';
      break;
    case '%Y/%m/%d':
      formatdate = 'YYYY/MM/DD';
      break;
    case '%Y-%m-%d %H:%M:%S':
      formatdate = 'YYYY-MM-DD hh:mm:ss';
      break;
    case '%d-%m-%Y %H:%M:%S':
      formatdate = 'DD-MM-YYYY hh:mm:ss';
      break;
    case '%H:%M:%S':
      formatdate = 'hh:mm:ss';
      break;
    default:
      formatdate = 'MM/DD/YYYY';
      break;
  }
  return formatdate;
};

// export const  fetchDataRightBar=async(visualType, data)=> {
//     let form_data = null
//     switch (visualType) {
//       case 'pie':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType,
//           metrics: data.form_data.metrics,
//           groupby: data.form_data.groupby.length > 0 ? data.form_data.groupby[0] : [],

//           row_limit: data.form_data.limit,
//           pie_label_type: data.form_data.pie_label_type,
//           donut: data.form_data.donut,
//           show_legend: data.form_data.show_legend,
//           labels_outside: data.form_data.labels_outside,
//           color_scheme: data.form_data.color_scheme || 'palette3',
//           granularity_sqla: data.form_data.granularity_sqla || null,
//           time_grain_sqla: data.form_data.time_grain_sqla || null,
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'horizontal_bar':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'dist_bar',
//           metrics: data.form_data.metrics,
//           groupby: data.form_data.groupby.length > 0 ? data.form_data.groupby[0] : [],
//           columns: data.form_data.columns.length > 0 ? data.form_data.columns[0] : [],
//           row_limit: data.form_data.row_limit,
//           color_scheme: data.form_data.color_scheme || 'palette3',
//           show_legend: data.form_data.show_legend,
//           show_bar_value: data.form_data.show_bar_value, //false,
//           bar_stacked: data.form_data.bar_stacked, //false,
//           horizontal_bar_sorter: data.form_data.horizontal_bar_sorter || 'value',

//           order_desc: data.form_data.order_desc || true,
//           y_axis_format: data.form_data.y_axis_format, //".3s",
//           bottom_margin: data.form_data.bottom_margin, //"auto",
//           left_margin: data.form_data.left_margin || 'auto',
//           x_axis_label: data.form_data.x_axis_label, //"",
//           y_axis_label: data.form_data.y_axis_label, //"",
//           reduce_x_ticks: data.form_data.reduce_x_ticks, //false,
//           show_controls: data.form_data.show_controls, //false,
//           granularity_sqla: data.form_data.granularity_sqla || null,
//           time_grain_sqla: data.form_data.time_grain_sqla || null,
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'dist_bar':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'dist_bar',
//           metrics: data.form_data.metrics,
//           groupby: data.form_data.groupby.length > 0 ? data.form_data.groupby[0] : [],
//           columns: data.form_data.columns.length > 0 ? data.form_data.columns[0] : [],
//           row_limit: data.form_data.row_limit,
//           color_scheme: data.form_data.color_scheme || 'palette3',
//           show_legend: data.form_data.show_legend,
//           show_bar_value: data.form_data.show_bar_value, //false,
//           bar_stacked: data.form_data.bar_stacked, //false,
//           dist_bar_sorter: data.form_data.dist_bar_sorter, //null,
//           order_desc: data.form_data.order_desc || true,
//           y_axis_format: data.form_data.y_axis_format, //".3s",
//           bottom_margin: data.form_data.bottom_margin, //"auto",
//           x_axis_label: data.form_data.x_axis_label, //"",
//           y_axis_label: data.form_data.y_axis_label, //"",
//           reduce_x_ticks: data.form_data.reduce_x_ticks, //false,
//           show_controls: data.form_data.show_controls, //false,
//           granularity_sqla: data.form_data.granularity_sqla || null,
//           time_grain_sqla: data.form_data.time_grain_sqla || null,
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'country_map2':
//       case 'country_map':
//       case 'map':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: data.form_data.viz_type || 'country_map',
//           entity: data.form_data.entity || '',
//           metrics: data.form_data.metric || '',
//           map_label: data.form_data.map_label || '',
//           select_country: data.form_data.select_country || 'Indonesia',
//           select_province: data.form_data.select_province || null,
//           number_format: data.form_data.number_format || '.3s',
//           linear_color_scheme: data.form_data.color_scheme || 'blue_white_yellow',
//           lower_limit: data.form_data.lower_limit || 1000,
//           upper_limit: data.form_data.upper_limit || 100000,
//           granularity_sqla: data.form_data.granularity_sqla || '',
//           time_grain_sqla: data.form_data.time_grain_sqla || 'day',
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'big_number_total':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType,
//           zoomsize: parseInt(data.form_data.zoomsize) || 5,
//           subheader: data.form_data.subheader || '',
//           subheaderfontsize: parseInt(data.form_data.subheaderfontsize) || 2,
//           metrics: data.form_data.metric || 'count',
//           y_axis_format: data.form_data.y_axis_format || '.3s',
//           granularity_sqla: data.form_data.granularity_sqla || null,
//           time_grain_sqla: data.form_data.time_grain_sqla || null,
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'word_cloud':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType,
//           groupby: data.form_data.series || '',
//           metrics: data.form_data.metric || '',
//           row_limit: data.form_data.row_limit || 100,
//           size_from: data.form_data.size_from || '20',
//           size_to: data.form_data.size_to || '150',
//           rotation: data.form_data.rotation || 'random',
//           color_scheme: data.form_data.color_scheme || 'palette3',
//           granularity_sqla: data.form_data.granularity_sqla || '',
//           time_grain_sqla: data.form_data.time_grain_sqla || 'day',
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'dual_line':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType,
//           color_scheme: data.form_data.color_scheme || 'palette3',
//           x_axis_format: data.form_data.x_axis_format || 'smart_date',
//           metric: data.form_data.metric || '',
//           y_axis_format: data.form_data.y_axis_format || '.3s',
//           metric_2: data.form_data.metric_2 || '',
//           y_axis_2_format: data.form_data.y_axis_2_format || '.3s',
//           granularity_sqla: data.form_data.granularity_sqla || '',
//           time_grain_sqla: data.form_data.time_grain_sqla || 'day',
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'line':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'line',
//           metrics: data.form_data.metrics || '',
//           groupby: data.form_data.groupby.length > 0 ? data.form_data.groupby[0] : [],
//           color_scheme: data.form_data.color_scheme || 'palette3',
//           timeseries_limit_metric: data.form_data.timeseries_limit_metric || null,
//           order_desc: data.form_data.order_desc || true,
//           show_brush: data.form_data.show_brush || false,
//           show_legend: data.form_data.show_legend || false,
//           rich_tooltip: data.form_data.rich_tooltip || true,
//           show_markers: data.form_data.show_markers || false,
//           line_interpolation: data.form_data.line_interpolation || 'linear',
//           contribution: data.form_data.contribution || false,
//           x_axis_label: data.form_data.x_axis_label || '',
//           bottom_margin: data.form_data.bottom_margin || 'auto',
//           x_axis_showminmax: data.form_data.x_axis_showminmax || true,
//           x_axis_format: data.form_data.x_axis_format || 'smart_date',
//           y_axis_label: data.form_data.y_axis_label || '',
//           left_margin: data.form_data.left_margin || 'auto',
//           y_axis_showminmax: data.form_data.y_axis_showminmax || true,
//           y_log_scale: data.form_data.y_log_scale || false,
//           y_axis_format: data.form_data.y_axis_format || '.3s',
//           y_axis_bounds: data.form_data.y_axis_bounds || [0, 15],
//           granularity_sqla: data.form_data.granularity_sqla || '',
//           time_grain_sqla: data.form_data.time_grain_sqla || 'day',
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'markup':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'markup',
//           markup_type: data.form_data.markup_type || 'markdown',
//           code2: data.form_data.code || '',
//           datasource_name: data.form_data.datasource_name,
//         };
//         if (data.form_data.markup_type == 'html')
//           form_data = {
//             ...form_data,
//             js: data.form_data.js,
//             css: data.form_data.css,
//           };
//         break;
//       case 'bubble':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'buble',
//           series: data.form_data.series || '',
//           entity: data.form_data.entity || '',
//           size: data.form_data.size || '',
//           color_scheme: data.form_data.color_scheme || 'palette3',
//           show_legend: data.form_data.show_legend || true,
//           max_bubble_size: data.form_data.max_bubble_size || '25',
//           x_axis_label: data.form_data.x_axis_label || '',
//           left_margin: data.form_data.left_margin || 'auto',
//           x: data.form_data.x || '',
//           x_axis_format: data.form_data.x_axis_format || '.3s',
//           x_log_scale: data.form_data.x_log_scale || false,
//           x_axis_showminmax: data.form_data.x_axis_showminmax || true,
//           y_axis_label: data.form_data.y_axis_label || '',
//           bottom_margin: data.form_data.bottom_margin || 'auto',
//           y: data.form_data.y || '',
//           y_axis_format: data.form_data.y_axis_format || '.3s',
//           y_log_scale: data.form_data.y_log_scale || false,
//           y_axis_showminmax: data.form_data.y_axis_showminmax || true,
//           granularity_sqla: null,
//           time_grain_sqla: null,
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'table':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'table',
//           groupby: data.form_data.groupby || [],
//           metrics: data.form_data.metric || [],
//           include_time: data.form_data.include_time || false,
//           timeseries_limit_metric: data.form_data.timeseries_limit_metric || '',
//           order_desc: data.form_data.order_desc || true,
//           all_columns: data.form_data.all_columns || [],
//           order_by_cols: data.form_data.order_by_cols || [],
//           table_timestamp_format: data.form_data.table_timestamp_format || '%Y-%m-%d %H:%M:%S',
//           row_limit: data.form_data.row_limit || 1000,
//           page_length: data.form_data.page_length || 0,
//           include_search: data.form_data.include_search || false,
//           granularity: data.form_data.granularity || 'one day',
//           druid_time_origin: data.form_data.druid_time_origin || null,
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'pivot_table':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'pivot_table',
//           groupby: data.form_data.groupby || [],
//           columns: data.form_data.columns || [],
//           metrics: data.form_data.metrics || [],
//           pandas_aggfunc: data.form_data.pandas_aggfunc || 'sum',
//           pivot_margins: data.form_data.pivot_margins || true,
//           number_format: data.form_data.number_format || '.3s',
//           combine_metric: data.form_data.combine_metric || false,
//           granularity: data.form_data.granularity || null,
//           time_grain_sqla: data.form_data.time_grain_sqla || 'hour',
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'filter_box':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'filter_box',
//           groupby: data.form_data.groupby || [],
//           metrics: data.form_data.metric || [],
//           date_filter: data.form_data.date_filter || false,
//           instant_filtering: data.form_data.instant_filtering || true,
//           granularity_sqla: data.form_data.granularity_sqla || null,
//           time_grain_sqla: data.form_data.time_grain_sqla || null,
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'scatter':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'scatter',
//           pred_line: data.form_data.pred_line || '',
//           pred_upper: data.form_data.pred_upper || '',
//           pred_lower: data.form_data.pred_lower || '',
//           pred_actual: data.form_data.pred_actual || '',
//           x_axis_label: data.form_data.x_axis_label || '',
//           bottom_margin: data.form_data.bottom_margin || 'auto',
//           x_axis_showminmax: data.form_data.x_axis_showminmax || true,
//           x_axis_format: data.form_data.x_axis_format || 'smart_date',
//           y_axis_label: data.form_data.y_axis_label || '',
//           left_margin: data.form_data.left_margin || 'auto',
//           y_axis_showminmax: data.form_data.y_axis_showminmax || true,
//           y_log_scale: data.form_data.y_log_scale || false,
//           y_axis_format: data.form_data.y_axis_format || '.3s',
//           y_axis_bounds: [data.form_data.y_axis_bounds_min || null, data.form_data.y_axis_bounds_max || null],
//           granularity_sqla: data.form_data.granularity_sqla || '',
//           time_grain_sqla: data.form_data.time_grain_sqla || 'day',
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'treemap':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'treemap',
//           groupby: data.form_data.groupby || [],
//           metrics: data.form_data.metrics || '',
//           color_scheme: data.form_data.color_scheme || 'palette3',
//           treemap_ratio: data.form_data.treemap_ratio || 1,
//           number_format: data.form_data.number_format || '.3s',
//           granularity_sqla: data.form_data.granularity_sqla || null,
//           time_grain_sqla: data.form_data.time_grain_sqla || null,
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//       case 'directed_force':
//         form_data = {
//           datasource: data.form_data.datasource,
//           viz_type: visualType || 'directed_force',
//           groupby: data.form_data.groupby.length > 0 ? data.form_data.groupby[0] : [],
//           metrics: data.form_data.metrics || '',
//           row_limit: Number(data.form_data.row_limit) || 100,
//           link_length: data.form_data.link_length || '',
//           charge: data.form_data.charge || '',
//           granularity_sqla: data.form_data.granularity_sqla || null,
//           time_grain_sqla: data.form_data.time_grain_sqla || null,
//           since: data.form_data.since || '',
//           until: data.form_data.until || '',
//           filters: [],
//           datasource_name: data.form_data.datasource_name,
//         };
//         break;
//     }
//     return form_data;
//   }
