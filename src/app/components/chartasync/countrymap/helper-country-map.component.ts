import { reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';

export const helpergetConfigChart = async (
  data,
  d3,
  formaterNumber,
  explore,
  colorPalette,
  mappingExtraFilter,
  service,
  zoom,
  center
) => {
  let url = '';
  let mapGeoJSON = '';
  let locale = data.form_data.format_number_id ? 'ID' : 'EN';
  d3.formatDefaultLocale(formaterNumber[locale]);
  if (data.form_data.select_province == null || data.form_data.select_province == '') {
    url = `assets/data/geojson/countries/${data.form_data.select_country.toString().toLowerCase()}.geojson.json`;
  } else {
    url = `assets/data/geojson/province/${data.form_data.select_province}.geojson.json`;
  }
  mapGeoJSON = await service.loadGetData(url);
  let item = await setConfigChart(data, mapGeoJSON, d3, explore, colorPalette, mappingExtraFilter, zoom, center);

  return item;
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const setConfigChart = (data, mapGeoJson, d3, explore, colorPaletteArgs, mappingExtraFilterArgs, zoom, center) => {
  if (data.data == undefined) data = explore;
  let datamap = [];
  let me = data.data;
  let scheme =
    data.form_data.color_scheme != 'bnbColors' && data.form_data.color_scheme != undefined
      ? data.form_data.color_scheme
      : 'palette1';
  let colorPalette = colorPaletteArgs[scheme] || [];
  var title = '';
  let maxVal = 0;
  let colorRandom = [],
    values = [],
    groupby = {};
  if (data.form_data.select_province == null || data.form_data.select_province == '') {
    title = data.form_data.select_country;
    for (var i = 0; i < me.length; i++) {
      for (var j = 0; j < mapGeoJson.features.length; j++) {
        if (
          String(me[i].country_id).toLowerCase() == String(mapGeoJson.features[j].properties.ISO).toLowerCase() ||
          String(me[i].country_id).toLowerCase() == String(mapGeoJson.features[j].properties.NAME_1).toLowerCase()
        ) {
          groupby = {};
          groupby = { key: me[i].label, value: data.form_data.map_label_reference };
          mappingExtraFilterArgs.push(groupby);
          values.push(me[i].metric);
          let random = colorPalette[getRandomInt(0, colorPalette.length)];
          let colorResult = random == null ? colorPalette[colorPalette.length - 1] : random;
          colorRandom.push(colorResult);
          let obj = {
            name: data.form_data.map_label == null ? mapGeoJson.features[j].properties.NAME_1 : me[i].label,
            value: me[i].metric,
            label: {
              show: data.form_data.hide_label ? false : true,
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
            index: i,
            tooltips: [],
            index_point_tooltip: 0,
            exploreJson: data,
            is_point_tooltip: data.form_data.is_point_tooltip || false,
            country_id: mapGeoJson.features[j].properties.ISO,
          };
          if (data.form_data.tooltips != undefined && Object.entries(data.form_data.tooltips).length > 0) {
            let toltips = me[i].tooltips;
            obj = {
              name: data.form_data.map_label == null ? mapGeoJson.features[j].properties.NAME_1 : me[i].label,
              value: me[i].metric,
              label: {
                show: data.form_data.hide_label ? false : true,
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
              index: i,
              tooltips: toltips,
              index_point_tooltip: 0,
              exploreJson: data,
              is_point_tooltip: data.form_data.is_point_tooltip || false,
              country_id: mapGeoJson.features[j].properties.ISO,
            };
          }
          datamap.push(obj);
          mapGeoJson.features[j].properties['metric'] = me[i].metric;
          mapGeoJson.features[j].properties['index'] = i;
          mapGeoJson.features[j].properties['obj'] = obj;
          mapGeoJson.features[j].properties['country_id'] = mapGeoJson.features[j].properties.ISO;
          mapGeoJson.features[j].properties['name'] =
            data.form_data.map_label == null ? mapGeoJson.features[j].properties.NAME_1 : me[i].label;
          mapGeoJson.features[j].properties['tooltips'] = [];
          if (data.form_data.tooltips != undefined && Object.entries(data.form_data.tooltips).length > 0) {
            let toltips = me[i].tooltips;
            mapGeoJson.features[j].properties['tooltips'] = toltips;
          }
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
        groupby = {};
        groupby = { key: me[i].country_id, value: data.form_data.map_label_reference };
        mappingExtraFilterArgs.push(groupby);
        values.push(me[i].metric);
        let random = colorPalette[getRandomInt(0, colorPalette.length)];
        let colorResult = random == null ? colorPalette[colorPalette.length - 1] : random;
        colorRandom.push(colorResult);
        colorRandom.push(random);
        let obj = {
          name: data.form_data.map_label == null ? mapGeoJson.features[j].properties.KABKOT : me[i].label,
          value: me[i].metric,
          label: {
            show: data.form_data.hide_label ? false : true,
          },
          index: i,
          tooltips: [],
          index_point_tooltip: 0,
          exploreJson: data,
          is_point_tooltip: data.form_data.is_point_tooltip || false,
          country_id: mapGeoJson.features[j].properties.ISO,
        };
        if (data.form_data.tooltips != undefined && Object.entries(data.form_data.tooltips).length > 0) {
          let toltips = me[i].tooltips;
          obj = {
            name: data.form_data.map_label == null ? mapGeoJson.features[j].properties.KABKOT : me[i].label,
            value: me[i].metric,
            label: {
              show: data.form_data.hide_label ? false : true,
            },
            index: i,
            tooltips: toltips,
            index_point_tooltip: 0,
            exploreJson: data,
            is_point_tooltip: data.form_data.is_point_tooltip || false,
            country_id: mapGeoJson.features[j].properties.ISO,
          };
        }
        datamap.push(obj);
        mapGeoJson.features[j].properties['metric'] = me[i].metric;
        mapGeoJson.features[j].properties['index'] = i;
        mapGeoJson.features[j].properties['obj'] = obj;
        mapGeoJson.features[j].properties['country_id'] = mapGeoJson.features[j].properties.ISO;
        mapGeoJson.features[j].properties['name'] =
          data.form_data.map_label == null ? mapGeoJson.features[j].properties.KABKOT : me[i].label;
        mapGeoJson.features[j].properties['tooltips'] = [];
        if (data.form_data.tooltips != undefined && Object.entries(data.form_data.tooltips).length > 0) {
          let toltips = me[i].tooltips;
          mapGeoJson.features[j].properties['tooltips'] = toltips;
        }
      }
    }
  }
  const mergedColor = mergedArr(colorPalette, colorRandom.length);
  // for custom color

  let coloring = [];
  if (
    explore.form_data.choose_pallete != undefined &&
    explore.form_data.choose_pallete == 'custom_pallete' &&
    explore.form_data.colorpickers != undefined &&
    explore.form_data.colorpickers.length > 0
  ) {
    for (let j = 0; j < explore.form_data.colorpickers.length; j++) {
      coloring.push(
        explore.form_data.colorpickers[j].colorpicker != undefined
          ? explore.form_data.colorpickers[j].colorpicker
          : colorPaletteArgs[scheme][Math.floor(Math.random() * colorPaletteArgs[scheme].length)]
      );
    }
  } else {
    coloring = data.form_data.random_color ? colorRandom : mergedColor || [];
  }
  maxVal = Math.max.apply(null, values);
  let mapGeoJSON = '';
  mapGeoJSON = mapGeoJson;

  let chartConfig = {
    title: {
      text: '',
      subtext: '',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
      formatter: function (params) {
        return reformatTooltips(params, data, d3, explore);
      },
    },
    toolbox: {
      show: true,
      left: 'right',
      top: 'top',
      feature: {},
    },
    visualMap: {
      min: 0,
      max: maxVal,
      text: ['High', 'Low'],
      realtime: false,
      calculable: true,
      show: false,
      color: coloring,
      inRange: {
        color: coloring,
      },
    },
    series: [
      {
        name: `Peta ${title}`,
        type: 'map',
        map: 'ID', // map type should be registered
        zoom: zoom,
        center: center,
        roam: false,
        aspectScale: 1,
        itemStyle: {
          normal: {
            color: 'black',
          },
          emphasis: { label: { show: true } },
        },
        data: datamap,
        label: {
          show: true,
          color: colorPalette[getRandomInt(0, colorPalette.length)],
        },
        emphasis: {
          label: {
            show: true,
          },
        },
      },
    ],
  };
  return {
    chart: chartConfig,
    mapGeoJSON: mapGeoJSON,
    mappingExtraFilter: mappingExtraFilterArgs,
  };
};

const mergedArr = (array, lenLoop) => {
  var ar = [];
  var tmp = [];
  if (array.length < Number(lenLoop)) {
    for (let i = 0; i <= Number(lenLoop / Number(array.length)) - 1; i++) {
      let arr = ar.concat(array);
      tmp = [].concat(tmp, arr);
    }
    if (lenLoop % array.length != 0) {
      for (let i = 0; i < Number(lenLoop % array.length); i++) {
        let arr = ar.concat([array[i]]);
        tmp = [].concat(tmp, arr);
      }
    }
  }
  return tmp;
};

export const reformatTooltips = (params, data, d3, explore, opt?) => {
  if (params['data'] == undefined) return '0';
  let naming = '';
  let point = [];
  if (params['data'].tooltips != undefined && Object.entries(params['data'].tooltips).length > 0) {
    for (let i = 0; i < data.form_data.tooltips.length; i++) {
      for (const [key, value] of Object.entries(params['data'].tooltips)) {
        if (data.form_data.tooltips[i] == key) {
          let val = Number(value);
          let num = value;
          if (String(val) != 'NaN') {
            num = String(reformatNumber(val, data.form_data.number_format, explore, d3));
          }
          naming += key + ': ' + num + '<br>';
          point.push({
            name: key,
            value: num,
          });
        }
      }
    }
  }
  if (opt == undefined && data.form_data.number_format) {
    let value = reformatNumber(params['data'].value, data.form_data.number_format, explore, d3);
    let markval = params.marker + ' ' + value;
    if (data.form_data.hide_value) markval = '';
    return naming + '<br> ' + markval;
  }
  let markval = params.marker + ' ' + params['data'].value;
  if (data.form_data.hide_value) markval = '';
  if (opt == 'point') return point;
  return naming + '<br>' + markval;
};
