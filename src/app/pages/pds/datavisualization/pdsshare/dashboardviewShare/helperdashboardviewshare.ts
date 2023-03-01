import { hexToRgbA } from 'src/app/libs/helpers/color';
import { getRandomInt } from 'src/app/libs/helpers/data-visualization-helper';

export const setIsExtraFilterStatus = (
  datasources,
  datasourceFilter,
  extra_filters,
  isDateFilter,
  isInitialDateFilter
) => {
  let flag = false;
  if (datasources.length > 0) {
    for (let row of datasources) {
      if (datasourceFilter == row.key) {
        if (row.value.all_cols.length > 0) {
          for (let i = 0; i < row.value.all_cols.length; i++) {
            for (let item of extra_filters) {
              if (item.col == row.value.all_cols[i][0]) flag = true;
              if (isDateFilter || isInitialDateFilter) {
                if (item.col === '__time_col') {
                  if (item.val === row.value.all_cols[i][0]) flag = true;
                }
              }
            }
          }
        }
      }
    }
  }
  return flag;
};

export const setConfigMapOverlay = async (data, mapGeoJson, colorPaletteArgs, d3) => {
  let datamap = [];
  let datamapPie = [];
  let colorRandom = [];
  let visualMapColor = [];
  let visualMapText = [];
  let me = data.data;
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
  var title = data.form_data.select_country2;
  // for coloring
  let coloring = [];
  let coloringPie = [];
  for (var i = 0; i < me.group.length; i++) {
    let warna = colorPalette[i > colorPalette.length - 1 ? colorPalette.length - 1 : i];
    coloring.push(hexToRgbA(warna));
    coloringPie.push(warna);
  }
  // ini.coloringPie = coloringPie;
  let obj = {};
  let total = 0;
  for (var j = 0; j < me.data.length; j++) {
    total += me.data[j][me.series_keys.indexOf('sumTot')];
    obj = {};
    obj = {
      name: me.data[j][me.series_keys.indexOf('name')],
      value: me.data[j][me.series_keys.indexOf('sumTot')],
      id: me.data[j][me.series_keys.indexOf('id')],
      sumTot: me.data[j][me.series_keys.indexOf('sumTot')],
      data: [],
    };
    let groupArr = [];
    for (var i = 0; i < me.group.length; i++) {
      obj['data'].push({
        name: me.group[i],
        color: coloring[i],
        value: me.data[j][me.series_keys.indexOf(me.group[i])],
      });
      if (obj['value'] == 0) {
        obj['value'] = me.data[j][me.series_keys.indexOf(me.group[i])];
      } else {
        obj['value'] =
          obj['value'] < me.data[j][me.series_keys.indexOf(me.group[i])]
            ? me.data[j][me.series_keys.indexOf(me.group[i])]
            : obj['value'];
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
          value: obj['value'],
          label: {
            show: true,
            color: coloring[idxMaxVal], //colorResult,
          },
        });
        // map pie
        obj['label'] = {
          show: true,
          color: coloring[idxMaxVal], //colorResult,
        };
        obj['id'] = mapGeoJson.features[k].properties.ISO;
        obj['name'] = mapGeoJson.features[k].properties.NAME_1;
        datamapPie.push(obj);
        mapGeoJson.features[k].properties['name'] = mapGeoJson.features[k].properties.NAME_1;
        // visual map
        visualMapColor.push(hexToRgbA(coloring[idxMaxVal]));
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

  // echarts.registerMap(title, mapGeoJson);
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
    itemStyle: {
      normal: { label: { show: true } },
      emphasis: { label: { show: true } },
    },
    label: {
      show: true,
      color: colorPalette[getRandomInt(0, colorPalette.length)],
    },
    emphasis: {
      label: {
        show: true,
      },
    },
  });

  return {
    // additional
    coloringPie: coloringPie,
    total: total,
    datamapPie: datamapPie,
    mapGeoJson: mapGeoJson,
    // additional
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
    legend: {
      show: true,
      type: 'scroll',
      orient: 'horizontal',
      left: 'left',
      width: 275,
      data: me.group,
      textStyle: {
        fontSize: 10,
      },
    },
    tooltip: {
      trigger: 'item',
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
      formatter: function (params) {
        if (params['data'] == undefined) return '0';

        if (data.form_data.number_format) {
          var f = d3.format(data.form_data.number_format);
          let html = '';
          params['data'].data.map((v, idx) => {
            html += v.name + ' <span style="color:' + v.color + '">\u25CF</span> ' + f(v.value) + '<br>';
          });
          return (
            params['data'].name +
            '<br>' +
            html +
            '<br/><hr style="border-top: 1px solid red;"/>Total: ' +
            f(params['data'].value) +
            '<br>'
          );
        }
        let html = '';
        params['data'].data.map((v, idx) => {
          html += v.name + ' <span style="color:' + v.color + '">\u25CF</span> ' + v.value + '<br>';
        });
        return (
          params['data'].name +
          '<br>' +
          html +
          '<br/><hr style="border-top: 1px solid red;"/>Total: ' +
          params['data'].value
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
        color: 'rgba(0,0,0,0.4)',
      },
      itemStyle: {
        borderColor: 'rgba(0, 0, 0, 0.2)',
      },
      emphasis: {
        itemStyle: {
          areaColor: null,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowBlur: 20,
          borderWidth: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
    series: seriesData,
  };
};
