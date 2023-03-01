import { reformat_number } from 'src/app/libs/helpers/utility';

export const setConfigChart = async (explore_json_data, colorPaletteArgs, formdata, d3) => {
  var xAxis = explore_json_data.heatmap.x;
  var yAxis = explore_json_data.heatmap.y;
  var data = explore_json_data.heatmap.data;
  let fd = explore_json_data.form_data;
  let _this = this;
  let result = [],
    value = [];

  data.map((item) => {
    value.push(item[2]);
    result.push([item[0], item[1], item[2] || '-']);
  });

  var minVal = Math.min.apply(null, value);
  var maxVal = Math.max.apply(null, value);

  let scheme = fd.color_scheme != 'bnbColors' && fd.color_scheme != undefined ? fd.color_scheme : 'palette1';
  let colorPalette = colorPaletteArgs[scheme] || [];
  let coloring = [];
  if (
    fd.choose_pallete != undefined &&
    fd.choose_pallete == 'custom_pallete' &&
    fd.colorpickers != undefined &&
    fd.colorpickers.length > 0
  ) {
    for (let j = 0; j < fd.colorpickers.length; j++) {
      coloring.push(
        fd.colorpickers[j].colorpicker != undefined
          ? fd.colorpickers[j].colorpicker
          : fd[scheme][Math.floor(Math.random() * colorPaletteArgs[scheme].length)]
      );
    }
  } else {
    coloring = fd.random_color ? colorPalette : colorPalette;
  }
  if (data == undefined) data = formdata;

  return {
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
    backgroundColor: 'transparent',
    grid: {
      backgroundColor: 'transparent',
      top: '10%',
      height: '75%',
      left: fd.left_margin == 'auto' ? '5%' : fd.left_margin != undefined ? fd.left_margin : '5%',
      right: '5%',
      bottom: fd.bottom_margin == 'auto' ? '20%' : fd.bottom_margin != undefined ? fd.bottom_margin : '20%',
      containLabel: true,
    },
    tooltip: {
      position: 'top',
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
      },
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
      formatter: function (params) {
        let number = reformatNumber(params.data.value[2], fd.number_format, fd.format_number_id, d3);
        return params.marker + ' ' + params.name + ': ' + number;
      },
    },
    animation: true,
    xAxis: {
      type: 'category',
      data: xAxis,
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: 'category',
      data: yAxis,
      splitArea: {
        show: false,
      },
    },
    visualMap: {
      type: 'continuous',
      min: minVal < 0 ? 0 : minVal,
      max: maxVal || 100,
      text: ['High', 'Low'],
      textStyle: {
        color: '#333',
      },
      realtime: false,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      show: true,
      color: coloring,
      inRange: {
        color: coloring,
      },
    },
    series: [
      {
        type: 'heatmap',
        data: result,
        label: {
          show: fd.show_label ? fd.show_label : false,
          color: '#fff',
        },
        itemStyle: {
          color: '#fff',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
};

const reformatNumber = (num, numberFormat?, format_number_id?, d3?) => {
  if (!numberFormat) numberFormat = ',';
  let locale = format_number_id ? 'ID' : 'EN';
  let localeStr;
  if (locale === 'ID') localeStr = 'id-ID';
  else if (locale === 'EN') localeStr = 'en-US';
  let value = reformat_number(d3, num, numberFormat, locale, localeStr);
  return value;
};
