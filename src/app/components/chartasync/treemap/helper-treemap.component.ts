import moment from 'moment';
import { getUrl, reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';

export const helperGetDataTreemap = async (exploreJson, service) => {
  let exploreUrl = getUrl(exploreJson);
  let exploreResult = await service.loadGetData(exploreUrl);
  return exploreResult ? (exploreResult.response ? exploreResult.response : exploreResult) : exploreResult;
};

export const setConfigChartTreemap = (
  data,
  mappingExtraFilterArgs,
  explore,
  colorPalette,
  localExplore,
  d3,
  localData
) => {
  for (var i = 0; i < data.data.length; i++) {
    let groupby = {};
    let split = data.data[i].name.split(' - ');
    for (let j = 0; j < data.form_data.groupby.length; j++) {
      groupby = { key: split[i], value: data.form_data.groupby[j] };
      mappingExtraFilterArgs.push(groupby);
    }
  }
  let name = data.data[0].name;
  if ((explore && explore.datasource && explore.datasource.verbose_map) != undefined) {
    name = explore['datasource']['verbose_map'][name];
  }
  data.data[0].name = name;
  if (data.data == undefined) data = localExplore;
  let scheme = data.form_data.color_scheme != 'bnbColors' ? data.form_data.color_scheme : 'palette1';
  let ratio = data.form_data.treemap_ratio;

  //reformat date
  for (var i = 0; i < data.data[0].children.length; i++) {
    var value = data.data[0].children[i];
    for (var prop in value) {
      if (Object.prototype.hasOwnProperty.call(value, prop)) {
        if (typeof value[prop] === 'string') {
          if (!isNaN(Date.parse(value[prop]))) {
            let formatedDate = moment(value[prop]).format('DD/MM/YYYY');
            value[prop] = formatedDate;
          } else {
            value[prop] = value[prop];
          }
        } else {
          value[prop] = value[prop];
        }
      }
    }
  }

  return {
    tooltip: {
      formatter: function (info) {
        var value = info.value;
        var treePathInfo = info.treePathInfo;
        var treePath = [];

        for (var i = 1; i < treePathInfo.length; i++) {
          let nilai = treePathInfo[i].value;
          if (data.form_data.number_format) {
            nilai = reformatNumber(nilai, data.form_data.number_format, explore, d3);
          }
          treePath.push(treePathInfo[i].name + ' (' + nilai + ')');
        }

        return ['<div class="tooltip-title">' + treePath.join(' - ') + '</div>'].join('');
      },
    },
    series: [
      {
        roam: false,
        type: 'treemap',
        data: data.data,
        squareRatio: ratio,
        levels: getLevelOption(colorPalette[scheme], explore, localData, colorPalette),
        label: {
          show: true,
          formatter: function (params) {
            let name = params['data'].name;

            if (params['data'] == undefined) return '0';
            if (data.form_data.number_format) {
              let nilai = reformatNumber(params['data'].value, data.form_data.number_format, explore, d3);
              return name + '\n' + nilai;
            }
            return name + '\n' + params['data'].value;
          },
        },
        upperLabel: {
          show: true,
          height: 20,
        },
      },
    ],
  };
};

export const getLevelOption = (colors, explore, data, colorPalette) => {
  var themes = explore.form_data.color_scheme != 'bnbColors' ? explore.form_data.color_scheme : 'palette1';
  if (data != undefined && data.series != undefined && data.series[0].data.length) {
    let array = data.series[0].data;
    for (let index = 0; index < array.length; index++) {
      if (
        explore.form_data.choose_pallete != undefined &&
        explore.form_data.choose_pallete == 'custom_pallete' &&
        explore.form_data.colorpickers != undefined &&
        explore.form_data.colorpickers.length > 0
      ) {
        colors = [];
        for (let j = 0; j < explore.form_data.colorpickers.length; j++) {
          if (
            String(array[index].name).replace(' ', '').toLowerCase() ==
            String(explore.form_data.colorpickers[j].entity).replace(' ', '').toLowerCase()
          ) {
            colors.push(
              explore.form_data.colorpickers[j].colorpicker != undefined
                ? explore.form_data.colorpickers[j].colorpicker
                : colorPalette[themes][Math.floor(Math.random() * colorPalette[themes].length)]
            );
            break;
          }
        }
      }
    }
  }
  return [
    {
      color: colors,
      itemStyle: {
        borderColor: '#555',
        borderWidth: 7,
        gapWidth: 1,
      },
      upperLabel: {
        show: false,
      },
    },
    {
      color: colors,
      colorMappingBy: 'name',
      itemStyle: {
        borderColor: '#555',
        borderWidth: 5,
        gapWidth: 1,
      },
      emphasis: {
        itemStyle: {
          borderColor: '#666',
        },
      },
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
