import * as moment from 'moment';
import { reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';

export const setConfigChart = async (data, explore, colorPalette, d3) => {
  let mappingExtraFilter = [];
  let result = null;
  for (var i = 0; i < data.data.length; i++) {
    let groupby = {};
    let split = data.data[i].name.split(' - ');
    for (let j = 0; j < data.form_data.groupby.length; j++) {
      groupby = { key: split[j], value: data.form_data.groupby[j] };
      mappingExtraFilter.push(groupby);
    }
  }
  let name = data.data[0].name;
  if (explore && explore.datasource && explore.datasource.verbose_map) {
    name = explore['datasource']['verbose_map'][name];
  }
  data.data[0].name = name;

  // let me = this;
  if (!data.data) data = explore;
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
  result = {
    // additional
    mappingExtraFilter: mappingExtraFilter,
    // additional
    title: {
      text: '',
      subtext: '',
      textStyle: {
        fontSize: 14,
        align: 'center',
      },
      subtextStyle: {
        align: 'center',
      },
    },
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
        type: 'sunburst',
        data: data.data,

        radius: [0, '95%'],
        sort: null,
        emphasis: {
          focus: 'ancestor',
        },

        squareRatio: ratio,
        // levels: this.getLevelOption(this.colorPalette[scheme]),
        levels: [
          {},
          {
            r0: '15%',
            r: '35%',
            itemStyle: {
              borderColor: '#2E3435',
              borderWidth: 2,
            },
            label: {
              rotate: 'tangential',
              color: '#FFFFFF',
              fontSize: 16,
              minAngle: 10,
            },
          },
          {
            r0: '35%',
            r: '70%',
            label: {
              align: 'right',
              color: '#FFFFFF',
              fontSize: 16,
              minAngle: 10,
            },
          },
          {
            r0: '70%',
            r: '72%',
            label: {
              position: 'outside',
              padding: 3,
              silent: false,
            },
            itemStyle: {
              borderColor: '#2E3435',
              borderWidth: 3,
            },
          },
        ],
        label: {
          show: data.form_data.hide_label ? false : true,
          position: data.form_data.labels_outside ? 'outside' : 'inside',
          formatter: function (params) {
            let name = params['data'].name;

            if (!params['data']) return '0';
            if (data.form_data.number_format) {
              let nilai = reformatNumber(params['data'].value, data.form_data.number_format, explore, d3);
              return name + '\n' + nilai;
            }
            return name + '\n' + params['data'].value;
          },
          rotate: 'radial',
          color: '#f7f7f7',
          textBorderColor: '#272E2F',
          textBorderWidth: '2',
          fontWeight: '400',
          fontFamily: 'Roboto',
          fontSize: '10',
          lineHeight: '20',
          minAngle: 10,
        },
        itemStyle: {
          borderColor: '#2E3435',
          gapWidth: 2,
          borderWidth: 1,
        },
        upperLabel: {
          show: true,
          height: 20,
          color: '#FFFFFF',
          fontSize: 16,
          minAngle: 10,
        },
      },
    ],
  };
  result.series[0] = {
    ...result.series[0],
    levels: getLevelOption(colorPalette[scheme], explore, result, colorPalette),
  };
  return result;
};

const getLevelOption = (colors, explore, data, colorPalette) => {
  var themes = explore.form_data.color_scheme != 'bnbColors' ? explore.form_data.color_scheme : 'palette1';
  if (data && data.series && data.series[0].data.length) {
    let array = data.series[0].data;
    for (let index = 0; index < array.length; index++) {
      if (
        explore.form_data.choose_pallete &&
        explore.form_data.choose_pallete == 'custom_pallete' &&
        explore.form_data.colorpickers &&
        explore.form_data.colorpickers.length > 0
      ) {
        colors = [];
        for (let j = 0; j < explore.form_data.colorpickers.length; j++) {
          if (
            String(array[index].name).replace(' ', '').toLowerCase() ==
            String(explore.form_data.colorpickers[j].entity).replace(' ', '').toLowerCase()
          ) {
            colors.push(
              explore.form_data.colorpickers[j].colorpicker
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
      rat: 'name',
      itemStyle: {
        borderColor: '#2E3435',
        borderWidth: 4,
        gapWidth: 4,
      },
    },
    {
      r0: '15%',
      r: '35%',
      label: {
        rotate: 'tangential',
        color: '#FFFFFF',
        fontSize: 16,
        minAngle: 10,
      },
      color: colors,
      colorMappingBy: 'name',
      itemStyle: {
        borderColor: '#2E3435',
        borderWidth: 1,
        gapWidth: 4,
      },
    },
    {
      r0: '30%',
      r: '70%',
      label: {
        align: 'right',
        color: '#FFFFFF',
        fontSize: 16,
        minAngle: 10,
      },
      colorSaturation: [0.3, 0.6],
      itemStyle: {
        borderColor: '#2E3435',
        borderColorSaturation: 0.7,
        gapWidth: 2,
        borderWidth: 1,
      },
    },
    {
      r0: '70%',
      r: '72%',
      label: {
        borderColor: '#2E3435',
        position: 'outside',
        padding: 3,
        silent: false,
      },
      colorSaturation: [0.3, 0.5],
      itemStyle: {
        borderColor: '#2E3435',
        borderColorSaturation: 0.6,
        gapWidth: 1,
      },
    },
    {
      colorSaturation: [0.3, 0.5],
    },
  ];
};
