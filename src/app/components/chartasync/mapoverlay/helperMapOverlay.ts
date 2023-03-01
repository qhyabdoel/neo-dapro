import { hexToRgbA } from 'src/app/libs/helpers/color';
import { getRandomInt, reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';

export const setConfigChart = async (data, mapGeoJson, explore, colorPaletteArgs, d3, coloringPieArgs) => {
  // let pointer = this;
  if (data.data == undefined) data = explore;
  let datamap = [];
  let datamapPie = [];
  // let datasetPie = [];
  // let dataPieDistinct = [];
  // let dataPieValue = [];
  let colorRandom = [];
  // let nameMap = {};
  let me = data.data;
  // let scatterData = {};
  let visualMapColor = [];
  let visualMapText = [];
  let scheme =
    data.form_data.color_scheme != 'bnbColors' && data.form_data.color_scheme != undefined
      ? data.form_data.color_scheme
      : 'palette1';
  // let ini = this;
  let colorPalette = colorPaletteArgs[scheme] || [];
  let colors = [];
  if (data.form_data.random_color) {
    let array = me.group;
    for (let index = 0; index < array.length; index++) {
      colors.push(colorPalette[getRandomInt(0, colorPalette.length)]);
    }
  }
  let f = d3.format(
    data.form_data.number_format != null ||
      data.form_data.number_format != '' ||
      data.form_data.number_format != undefined
      ? data.form_data.number_format
      : '.3s'
  );
  var title = data.form_data.select_country2;
  // for coloring
  let coloring = [];
  if (coloringPieArgs == undefined) {
    let coloringPie = [];
    for (var i = 0; i < me.group.length; i++) {
      let warna = colorPalette[i > colorPalette.length - 1 ? colorPalette.length - 1 : i];
      coloring.push(hexToRgbA(warna));
      coloringPie.push(warna);
    }
    coloringPieArgs = coloringPie;
  } else {
    for (var i = 0; i < coloringPieArgs.length; i++) {
      coloring.push(hexToRgbA(coloringPieArgs[i]));
    }
  }

  let obj = {};
  let total = 0;
  for (var j = 0; j < me.data.length; j++) {
    total += me.data[j][me.series_keys.indexOf('sumTot')];
    obj = {};
    obj = {
      name: me.data[j][me.series_keys.indexOf('name')],
      value: 0,
      values: me.data[j][me.series_keys.indexOf('sumTot')],
      id: me.data[j][me.series_keys.indexOf('id')],
      sumTot: me.data[j][me.series_keys.indexOf('sumTot')],
      data: [],
    };
    let groupArr = [];
    for (var i = 0; i < me.group.length; i++) {
      obj['data'].push({
        name: me.group[i],
        color: coloringPieArgs[i],
        value: me.data[j][me.series_keys.indexOf(me.group[i])],
      });
      if (obj['values'] == 0) {
        obj['values'] = me.data[j][me.series_keys.indexOf(me.group[i])];
      } else {
        obj['values'] =
          obj['values'] < me.data[j][me.series_keys.indexOf(me.group[i])]
            ? me.data[j][me.series_keys.indexOf(me.group[i])]
            : obj['values'];
      }
      groupArr.push(me.data[j][me.series_keys.indexOf(me.group[i])]);
    }
    let idxMaxVal = groupArr.indexOf(Math.max.apply(null, groupArr));
    // maps
    for (var k = 0; k < mapGeoJson.features.length; k++) {
      if (
        String(me.data[j][me.series_keys.indexOf('name')]).toLowerCase() ==
          String(mapGeoJson.features[k].properties.ISO).toLowerCase() ||
        String(me.data[j][me.series_keys.indexOf('name')]).toLowerCase() ==
          String(mapGeoJson.features[k].properties.NAME_1).toLowerCase()
      ) {
        let random = colorPalette[getRandomInt(0, colorPalette.length)];
        let colorResult = random == null ? colorPalette[colorPalette.length - 1] : random;
        colorRandom.push(colorResult);
        datamap.push({
          id: mapGeoJson.features[k].properties.ISO,
          name: mapGeoJson.features[k].properties.NAME_1,
          value: idxMaxVal,
          values: obj['values'],
          label: {
            show: true,
            color: coloringPieArgs[idxMaxVal],
          },
        });
        // map pie
        obj['label'] = {
          show: true,
          color: coloringPieArgs[idxMaxVal],
        };
        obj['value'] = idxMaxVal;
        obj['id'] = mapGeoJson.features[k].properties.ISO;
        obj['name'] = mapGeoJson.features[k].properties.NAME_1;
        obj['itemStyle'] = {
          color: coloringPieArgs[idxMaxVal],
          emphasis: {
            areaColor: coloringPieArgs[idxMaxVal],
          },
        };
        datamapPie.push(obj);
        mapGeoJson.features[k].properties['name'] = mapGeoJson.features[k].properties.NAME_1;
        // visual map
        visualMapColor.push(hexToRgbA(coloringPieArgs[idxMaxVal]));
        visualMapText.push(mapGeoJson.features[k].properties.NAME_1);
        break;
      } else {
        continue;
      }
    }
  }
  let seriesData = [];
  // ini.scatterDatas = datamapPie;
  var title = data.form_data.select_country2 != 'Pemilu - overlay' ? data.form_data.select_country2 : 'Indonesia';

  seriesData.push({
    name: 'Peta ' + title + 'Maps',
    type: 'map',
    mapType: title, // add map type should be registered
    geoIndex: 0,
    data: datamapPie,
    // add
    zoom: 1.25,
    roam: false,
    aspectScale: 1,
  });
  // echarts.registerMap(title, mapGeoJson);

  let widthLegend = 400;
  let legends = {
    show: data.form_data.show_legend != undefined ? data.form_data.show_legend : false,
    type: 'plain',
    orient: 'horizontal',
    // left: "center",
    width: widthLegend,
    data: me.group,
    textStyle: {
      fontSize: 10,
    },
  };
  if (explore.form_data.legend_orient != undefined)
    legends = {
      ...legends,
      orient: explore.form_data.legend_orient == null ? 'horizontal' : explore.form_data.legend_orient,
    };
  if (explore.form_data.legend_position != undefined) legends[explore.form_data.legend_position] = 0;
  if (explore.form_data.legend_type != undefined)
    legends = {
      ...legends,
      type: explore.form_data.legend_type == null ? 'plain' : String(explore.form_data.legend_type),
    };
  if (explore.form_data.legend_width != undefined && explore.form_data.legend_width != null)
    legends = {
      ...legends,
      width: Number(explore.form_data.legend_width) > 0 ? Number(explore.form_data.legend_width) : widthLegend,
    };
  return {
    //additional
    scatterDatas: datamapPie,
    mapGeoJson: mapGeoJson,
    total: total,
    //additional
    grid: {
      left: '0%',
      right: '5%',
      bottom: '5%',
      containLabel: true,
    },
    title: {
      text: title,
      subtext: '',
      left: 'center',
    },
    legend: legends,
    tooltip: {
      trigger: 'item',
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
      formatter: function (params) {
        if (params['data'] == undefined) return '0';
        let html = '';
        let total = 0;
        if (data.form_data.number_format) {
          var f = d3.format(data.form_data.number_format);
          if (params['data'].data != undefined) {
            params['data'].data.map((v, idx) => {
              let formatedValue = reformatNumber(v.value, data.form_data.number_format, explore, d3);
              html += v.name + ' <span style="color:' + v.color + '">\u25CF</span> ' + formatedValue;
            });
          }
          if (params['data'].data != undefined) {
            total = reformatNumber(params['data'].values, data.form_data.number_format, explore, d3);

            if (params['seriesType'] == 'pie') {
              total = reformatNumber(params['data'].value, data.form_data.number_format, explore, d3);
            }
            return (
              params['data'].name + '<br>' + html + '<hr style="border-top: 1px solid red;"/>Total: ' + total + '<br>'
            );
          } else {
            total = reformatNumber(params['data'].values, data.form_data.number_format, explore, d3);

            if (params['seriesType'] == 'pie') {
              total = reformatNumber(params['data'].value, data.form_data.number_format, explore, d3);
            }
            return params['data'].name + '<br/><hr style="border-top: 1px solid red;"/>Total: ' + total + '<br>';
          }
        }
        if (params['data'].data != undefined) {
          params['data'].data.map((v, idx) => {
            html += v.name + ' <span style="color:' + v.color + '">\u25CF</span> ' + v.value + '<br>';
          });
        }
        return (
          params['data'].name +
          '<br>' +
          html +
          '<hr style="border-top: 1px solid red;"/>Total: ' +
          params['data'].values
        );
      },
    },
    toolbox: {
      show: true,
      left: 'right',
      top: 'top',
      feature: {},
    },
    visualMap: {
      show: false,
      min: 0,
      max: coloring.length - 1,
      left: 'left',
      text: me.group,
      seriesIndex: [0],
      inRange: {
        color: coloring,
      },
      calculable: true,
    },
    geo: {
      map: title,
      show: true,
      roam: false,
      zoom: 1.2,
      aspectScale: 1,
      seriesIndex: [0],
      label: {
        show: true,
        color: '#f7f7f7',
        textBorderColor: '#272E2F',
        textBorderWidth: '2',
        fontWeight: '400',
        fontFamily: 'Roboto',
        fontSize: '10',
        lineHeight: '20',
      },
      emphasis: {
        label: {
          color: '#f7f7f7',
          fontWeight: '600',
          fontSize: '12',
        },
      },
    },
    series: seriesData,
  };
};

export const getPieSeriesMaps = (scatterData, chart, total, mapGeoJSON, turf) => {
  return scatterData.map(function (item, index) {
    let features = mapGeoJSON.features.filter((x) => x.properties.ISO == item.id)[0];
    var centroid2 = turf.centroid(features);
    let latlong = centroid2.geometry.coordinates;
    var center = chart.convertToPixel('geo', latlong);
    var pieRadius = Number(item.sumTot / total) * 100;
    return {
      id: index + 'pie',
      type: 'pie',
      center: center,
      label: {
        normal: {
          show: false,
          formatter: '{c}',
          position: 'inside',
        },
      },
      radius: Math.round(pieRadius + 5).toString() + '%',
      data: item.data,
    };
  });
};
