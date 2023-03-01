import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import * as echarts from 'echarts';
import { axisFormater, CHART_CONSTANTS } from '.';
import { convert_metric_to_verbose } from 'src/app/libs/helpers/utility';
import { centroid } from '@turf/turf';
declare var d3: any;

const seriesLabelStyle = {
  color: '#f7f7f7',
  textBorderColor: '#272E2F',
  textBorderWidth: '2',
  fontWeight: '400',
  fontFamily: 'Roboto',
  fontSize: '10',
  lineHeight: '20',
};

export const setConfigChartMap = async (data: any, explore: any, service: any, zoom: any, centroid: any) => {
  const formaterNumber: any = (formatNumberIdFile as any).default;
  let locale = data.form_data.format_number_id ? 'ID' : 'EN';

  d3.formatDefaultLocale(formaterNumber[locale]);
  const url =
    data.form_data.select_province == null || data.form_data.select_province == ''
      ? `assets/data/geojson/countries/${data.form_data.select_country.toString().toLowerCase()}.geojson.json`
      : `assets/data/geojson/province/${data.form_data.select_province}.geojson.json`;

  const mapGeoJSON = await service.loadGetData(url);

  return getConfig(data, mapGeoJSON, d3, explore, zoom, centroid);
};

const getSeriesItem = (feature: any, regionData: any, index: number, regionName, form_data) => {
  var centroid2 = centroid(feature);
  let center = centroid2.geometry.coordinates;
  return {
    name: regionName,
    value: regionData?.value,
    emphasis: { label: seriesLabelStyle, focus: 'self', itemStyle: { areaColor: '#808080', borderColor: '#FFFFFF' } },
    select: { label: seriesLabelStyle, itemStyle: { areaColor: '#808080', borderColor: '#FFFFFF' } },
    index,
    country_id: feature.properties.ISO,
    tooltip: regionData?.tooltips || {},
    key: form_data ? form_data.map_label || form_data.entity : '',
    coordinate: center,
  };
};

const getConfig = (data: any, mapGeoJson: any, d3: any, metricsdata: any, zoom: any, centroid: any) => {
  echarts.registerMap('ID', mapGeoJson);
  // dummy data when raw.data is empty
  // data = { ...data, data: { value: [] } };
  const chartData = data.data.value;
  const formData = data.form_data;
  let seriesData = [];
  let title = '';
  let maxVal = 0;
  let values = [];

  title = data.form_data.select_country;
  if (data.form_data.select_province == null || data.form_data.select_province == '') {
    mapGeoJson.features.map((feature: any, index: number) => {
      const dataIndex = chartData.findIndex(
        (item: any) =>
          item.name.toUpperCase() === feature.properties.NAME_1.toUpperCase() ||
          item.name.toUpperCase() === feature.properties.ISO.toUpperCase()
      );

      const regionData = chartData[dataIndex];
      const regionName = feature.properties.NAME_1;

      if (regionData) values.push(regionData.value);

      mapGeoJson.features[index].properties.name = feature.properties.NAME_1;
      seriesData.push(getSeriesItem(feature, regionData, index, regionName, data.form_data));
    });
  } else {
    mapGeoJson.features.map((feature: any, index: number) => {
      const dataIndex = chartData.findIndex(
        (item: any) => item.name.toUpperCase() === feature.properties.KABKOT.toUpperCase()
      );

      const regionData = chartData[dataIndex];
      const regionName = feature.properties.KABKOT;

      if (regionData) values.push(regionData.value);

      mapGeoJson.features[index].properties.name = feature.properties.KABKOT;
      seriesData.push(getSeriesItem(feature, regionData, index, regionName, data.form_data));
    });
  }

  maxVal = Math.max.apply(null, values);

  return {
    title: {
      text: '',
      subtext: '',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        let additionalData = '';
        const numberFormat = data.form_data.number_format;

        formData.tooltips.map((metric: any) => {
          const label = convert_metric_to_verbose(metric, metricsdata);
          const tooltipValue = params.data.tooltip[metric];
          if (tooltipValue !== undefined) {
            const value = axisFormater(tooltipValue, data, numberFormat);
            additionalData += `${params.marker} ${label}: ${value}<br>`;
          }
        });

        if (params.data) {
          const valueString = !params.value ? '-' : formData.tooltips[0] ? additionalData : '-';
          return `<b>${params.name}</b><br>${valueString}`;
        }
      },
      textStyle: { fontSize: 10 },
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
      inRange: {
        color: CHART_CONSTANTS.general.collorPalette[data.form_data.color_scheme] || [],
      },
    },
    series: [
      {
        zoom: zoom,
        center: centroid,
        type: 'map',
        map: 'ID', // map type should be registered
        aspectScale: 1,
        itemStyle: { normal: { color: 'white' }, emphasis: { label: { show: true } } },
        data: seriesData,
        label: { show: !data.form_data.hide_label, ...seriesLabelStyle },
      },
    ],
  };
};
