import { hexToRgbA } from 'src/app/libs/helpers/color';
import { get_random_int } from 'src/app/libs/helpers/utility';

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
  let colorPalette = colorPaletteArgs[scheme] || [];
  let colors = [];
  if (data.form_data.random_color) {
    let array = me.group;
    for (let index = 0; index < array.length; index++) {
      colors.push(colorPalette[get_random_int(0, colorPalette.length)]);
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
        let random = colorPalette[get_random_int(0, colorPalette.length)];
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
      }
    }
  }
  let seriesData = [];
  let scatterData = null;
  scatterData = datamapPie;
  var title = data.form_data.select_country2 != 'Pemilu - overlay' ? data.form_data.select_country2 : 'Indonesia';

  // return echart
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
      color: colorPalette[get_random_int(0, colorPalette.length)],
    },
    emphasis: {
      label: {
        show: true,
      },
    },
  });

  return {
    // additonal dashboard variable
    scatterData: scatterData,
    coloringPie: coloringPie,
    total: total,
    mapGeoJson: mapGeoJson,
    // additonal dashboard variable
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
      max: coloring.length - 1, //ini.total,
      left: 'left',
      text: me.group, //visualMapText,
      seriesIndex: [0],
      inRange: {
        color: coloring, //visualMapColor, //colorRandom,
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

export const initialParameterEdit = {
  id: null,
  slug: '',
  charts: [],
  position_json: [],
  css: '',
  expanded_slices: {},
  dashboard_title: '',
  default_filters: '{}',
  duplicate_slices: false,
};

export const initialParameterCreate = {
  dashboard: {},
  addMode: true,
  dashboard_title: '',
  slug: '',
  charts: [],
};

export const initialOptionGridStack = {
  float: true,
  resizable: {
    handles: 'e, se, s, sw, w',
  },
  acceptWidgets: '.newWidget',
};

export const initialOptionGridStackOnViewOnly = {
  float: true,
  staticGrid: true,
  disableDrag: true,
  disableResize: true,
};

export const collectingChartByDashboardId = (dashboardId, chartList, visualizationTypeList) => {
  let filter = chartList.filter((chartItem) => chartItem.id == dashboardId);
  let visualizationType =
    filter && filter.length > 0 ? getVisualizationTypeLabel(filter[0].viz_type, visualizationTypeList) : ' - ';
  let name = filter && filter.length > 0 ? filter[0].name + ' | ' + visualizationType : '';
  return name;
};

const getVisualizationTypeLabel = (visualizationTypeName, visualizationTypeList) => {
  var visualizationTypeDetail = visualizationTypeList.filter((v) => v['value'] == visualizationTypeName)[0];
  var visualizationLabel = visualizationTypeDetail == null ? ' - ' : visualizationTypeDetail['label'];
  return visualizationLabel;
};

export const remapingChartPosition = (node, currentData) => {
  let remaping = [];
  let charts = [];
  let dashboard_title = currentData.dashboard_title == '' ? 'Untitled' : currentData.dashboard_title;
  // remove duplicate id
  currentData = {
    ...currentData,
    charts: Object.values(currentData.charts.reduce((acc, cur) => Object.assign(acc, { [cur.id]: cur }), {})),
  };
  if (node.length > 0) {
    node.map((data) => {
      remaping.push({
        col: data.width,
        row: data.height,
        size_x: data.x,
        size_y: data.y,
        id: data.el.id,
        slice_id: Number(data.el.id.split('_').reverse()[0]),
        index: Number(data.el.id.split('_')[0]),
      });
      charts.push(Number(data.el.id.split('_').reverse()[0]));
    });
  }
  return { ...currentData, position_json: remaping, charts, dashboard_title };
};
