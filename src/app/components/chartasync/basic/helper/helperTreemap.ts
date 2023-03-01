import { getUrl } from 'src/app/libs/helpers/data-visualization-helper';
import { axisFormater, CHART_CONSTANTS } from '.';

export const helperGetDataTreemap = async (exploreJson, service) => {
  let exploreUrl = getUrl(exploreJson);
  let exploreResult = await service.loadGetData(exploreUrl);
  return exploreResult ? (exploreResult.response ? exploreResult.response : exploreResult) : exploreResult;
};

const getLevelOptionTreemap = (colors: any, data: any, colorPalette: any) => {
  var themes = data.form_data.color_scheme != 'bnbColors' ? data.form_data.color_scheme : 'palette1';

  if (data != undefined && data.series != undefined && data.series[0].data.length) {
    data.series[0].data.map((item: any) => {
      if (data.form_data.choose_pallete === 'custom_pallete' && data.form_data.colorpickers[0]) {
        data.form_data.colorpickers.map((row: any) => {
          if (String(item.name).replace(' ', '').toLowerCase() == String(row.entity).replace(' ', '').toLowerCase()) {
            colors = [
              row.colorpicker != undefined
                ? row.colorpicker
                : colorPalette[themes][Math.floor(Math.random() * colorPalette[themes].length)],
            ];
          }
        });
      }
    });
  }

  return [
    {
      color: colors,
      itemStyle: { borderColor: '#555', borderWidth: 7, gapWidth: 1 },
      upperLabel: { show: false },
    },
    {
      color: colors,
      colorMappingBy: 'name',
      itemStyle: { borderColor: '#555', borderWidth: 5, gapWidth: 1 },
      emphasis: { itemStyle: { borderColor: '#666' } },
    },
    {
      colorSaturation: [0.35, 0.5],
      itemStyle: {
        borderWidth: 5,
        gapWidth: 1,
        borderColorSaturation: 0.6,
      },
    },
  ];
};

export const setConfigChartTreemap = (data) => {
  // dummy data when raw.data is empty
  // data = { ...data, data: [] };
  return {
    tooltip: {
      formatter: function (info: any) {
        var treePath = info.treePathInfo.map((item: any) => {
          let nilai = data.form_data.number_format
            ? axisFormater(item.value, data, data.form_data.number_format)
            : item.value;
          return item.name + ' (' + nilai + ')';
        });

        return ['<div class="tooltip-title">' + treePath.join(' - ') + '</div>'].join('');
      },
    },
    series: generateSeries(data),
  };
};

const generateSeries = (data) => {
  const scheme = data.form_data.color_scheme != 'bnbColors' ? data.form_data.color_scheme : 'palette1';
  const colorPaletteArgs = CHART_CONSTANTS.general.collorPalette;

  return [
    {
      roam: false,
      type: 'treemap',
      data: data.data.length > 0 ? data.data : [],
      squareRatio: data.form_data.treemap_ratio,
      levels: getLevelOptionTreemap(colorPaletteArgs[scheme], data, colorPaletteArgs),
      label: {
        show: true,
        formatter: (params: any) =>
          params.data.name
            ? data.form_data.number_format
              ? `${params.data.name}\n${axisFormater(params.data.value, data, data.form_data.number_format)}`
              : `${params.data.name}\n${params.data.value}`
            : '',
      },
      upperLabel: { show: true, height: 20 },
      breadcrumb: {
        show: data.form_data.show_legend,
      },
    },
  ];
};
