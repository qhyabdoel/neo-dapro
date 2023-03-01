import moment from 'moment';

import { setConfigChart } from './helperLine';
import { setConfigChartBar } from './helperBar';
import { setConfigChartPie } from './helperPie';
import { setConfigChartBubble } from './helperBubble';
import { setConfigChartGauge } from './helperGauge';
import { setConfigChartScatter } from './helperScatter';
import { setConfigChartHeatmap } from './helperHeatmap';
import { setConfigChartTreemap } from './helperTreemap';
import { setConfigChartSunburst } from './helperSunburst';
import { setConfigChartMap } from './helperMap';

import { reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';

import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
import * as collorPalleteFile from 'src/assets/data/color_palette.json';

import { setConfigChartBigNumber } from './helperBigNumber';
import { setConfigMarkup } from './helperMarkup';
import { setConfigChartTable } from './helperTable';
import { setConfigChartFilterBox } from './helperFilterBox';
import { setConfigPivotTable } from './helperPivotTable';
import { setConfigChartDirectedForce } from './helperDirectedForce';
import { setConfigChartWordcloud } from './helperWordcloud';
import { setConfigTableComparison } from './helperTableComparison';
import { setConfigChartHistogram } from './helperHistogram';

declare var d3: any;
const colorPaletteJsonFile: any = (collorPalleteFile as any).default;

let colorPaletteVar = [];
for (var i = 0; i < colorPaletteJsonFile.length; i++) {
  colorPaletteVar['palette' + (i + 1)] = colorPaletteJsonFile[i];
}

export const CHART_CONSTANTS = {
  general: { collorPalette: colorPaletteVar },
  pie: {
    itemStyle: {
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
    },
  },
  gauge: {
    coloring: [
      [0.25, '#91c7ae'],
      [0.5, '#c23531'],
      [0.75, '#63869e'],
      [1, '#ccccff'],
    ],
  },
};

export const chartGrid = { left: '10%', top: '20%', bottom: '16%', right: '10%' };

export const tooltipObj = {
  trigger: 'item',
  textStyle: { fontSize: 10 },
};

const axisObj = {
  nameLocation: 'center',
  nameGap: 40,
  splitLine: { lineStyle: { type: 'dashed' } },
  axisLine: { show: true },
  scale: true,
};

export const yAxisObj = { type: 'value', ...axisObj };
export const xAxisObj = { type: 'category', ...axisObj };

export const axisFormater = (value: any, data: any, format?: string) => {
  const formatNumber = format || '';
  let formaterNumber = formatNumberIdFile;
  const locale = data.form_data.format_number_id === 'true' || data.form_data.format_number_id === true ? 'ID' : 'EN';
  d3.formatDefaultLocale(formaterNumber[locale]);
  return reformatNumber(value, formatNumber, data, d3);
};

export const generateLegend = (data: any, type: string, legendData: any = false) => {
  let result: any;

  const legendWidth = Number(data.form_data.legend_width);

  result = {
    data: legendData || false,
    type: data.form_data.legend_type,
    textStyle: { color: '#808080', fontSize: 10 },
    pageTextStyle: { color: '#808080' },
    width: legendWidth,
    orient: data.form_data.legend_orient,
    show: data.form_data.show_legend,
  };

  if (data.form_data.legend_position) result[data.form_data.legend_position] = 0;

  return result;
};

export const getConfigChart = async (
  data: any,
  typeChart: string,
  service: any,
  explore: any,
  sanitizer?: any,
  sort?: any,
  zoom?: any,
  centroid?: any,
  selectedValue?: any,
  filterId?: any
) => {
  if (typeChart === 'treemap' || typeChart === 'sunburst') {
    // reformat date
    if (data.data.length > 0) {
      for (var i = 0; i < data.data[0].children.length; i++) {
        let value = data.data[0].children[i];
        for (var prop in value) {
          if (Object.prototype.hasOwnProperty.call(value, prop)) {
            if (typeof value[prop] === 'string') {
              if (!isNaN(Date.parse(value[prop]))) {
                let formatedDate = moment(value[prop]).format('DD/MM/YYYY');
                value[prop] = formatedDate;
              }
            }
          }
        }
      }
    }
  }

  switch (typeChart) {
    case 'dist_bar':
    case 'horizontal_bar':
      return setConfigChartBar(data, explore, selectedValue);
    case 'line':
    case 'dual_line':
      return setConfigChart(data, explore, selectedValue, filterId);
    case 'pie':
      return setConfigChartPie(data, explore, selectedValue);
    case 'bubble':
      return setConfigChartBubble(data, explore);
    case 'gauge':
      return setConfigChartGauge(data);
    case 'predictive':
    case 'scatter':
      return setConfigChartScatter(data);
    case 'heatmap':
      return setConfigChartHeatmap(data);
    case 'treemap':
      return setConfigChartTreemap(data);
    case 'sunburst':
      return setConfigChartSunburst(data);
    case 'country_map':
    case 'map':
      return await setConfigChartMap(data, explore, service, zoom, centroid);
    case 'big_number_total':
      return setConfigChartBigNumber(data);
    case 'markup':
      return setConfigMarkup(data, sanitizer);
    case 'table':
    case 'preview':
      return setConfigChartTable(data, sort);
    case 'pivot_table':
      return setConfigPivotTable(data, sanitizer);
    case 'filter_box':
      return setConfigChartFilterBox(data);
    case 'directed_force':
      return setConfigChartDirectedForce(data, explore);
    case 'word_cloud':
      return setConfigChartWordcloud(data);
    case 'table_comparison':
      return setConfigTableComparison(data);
    case 'histogram':
      return setConfigChartHistogram(data);
  }
};
