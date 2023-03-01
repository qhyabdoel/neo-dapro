import { axisFormater, CHART_CONSTANTS } from '.';

const generateGrid = (fd: any) => {
  return {
    backgroundColor: 'transparent',
    top: '15%',
    height: '75%',
    left: fd.left_margin == 'auto' && fd.legend_position === 'left' ? '10%' : '5%',
    right: fd.legend_position === 'right' ? '10%' : '5%',
    bottom: fd.bottom_margin == 'auto' ? '15%' : '15%',
    containLabel: true,
  };
};

export const setConfigChartHeatmap = (data: any) => {
  // dummy data when raw.data is empty
  // data = { ...data, heatmap: { data: [], x: [], y: [], limit_x: 0, limit_y: 0 } };
  const value = data.heatmap.data.map((item: any) => item[2]);

  var minVal = Math.min.apply(null, value);
  var maxVal = Math.max.apply(null, value);

  let scheme =
    data.form_data.color_scheme != 'bnbColors' && data.form_data.color_scheme != undefined
      ? data.form_data.color_scheme
      : 'palette1';
  let colorPalette = CHART_CONSTANTS.general.collorPalette[scheme] || [];

  const coloring =
    data.form_data.choose_pallete == 'custom_pallete' && data.form_data.colorpickers[0]
      ? data.form_data.colorpickers.map((item: any) => {
          return (
            item.colorpicker ||
            data.form_data[scheme][Math.floor(Math.random() * CHART_CONSTANTS.general.collorPalette[scheme].length)]
          );
        })
      : colorPalette;

  return {
    backgroundColor: 'transparent',
    grid: generateGrid(data.form_data),
    tooltip: {
      position: 'top',
      trigger: 'item',
      axisPointer: { type: 'shadow' },
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
      formatter: function (params) {
        return (
          params.marker + ' ' + params.name + ': ' + axisFormater(params.data[2], data, data.form_data.number_format)
        );
      },
    },
    animation: true,
    xAxis: {
      type: 'category',
      data: data.heatmap.x,
      boundaryGap: true,
      nameGap: 30,
      splitArea: { show: true },
      inverse: data.form_data.is_axis_reverse,
      position: data.form_data.is_axis_reverse ? 'top' : 'bottom',
    },
    yAxis: {
      type: 'category',
      data: data.heatmap.y,
      splitArea: { show: false },
      inverse: data.form_data.is_axis_reverse,
      position: data.form_data.is_axis_reverse ? 'right' : 'left',
    },
    visualMap: {
      type: ['piecewise', 'continuous'].includes(data.form_data.legend_type)
        ? data.form_data.legend_type
        : 'continuous',
      min: minVal < 0 ? 0 : minVal,
      max: maxVal || 100,
      text: ['High', 'Low'],
      textStyle: { color: '#333' },
      realtime: false,
      calculable: true,
      orient: data.form_data.legend_orient,
      left: ['left', 'right'].includes(data.form_data.legend_position) ? data.form_data.legend_position : 'center',
      top: ['top', 'bottom'].includes(data.form_data.legend_position) ? data.form_data.legend_position : 'center',
      show: true,
      color: coloring,
      inRange: { color: coloring },
      itemHeight: data.form_data.legend_width || 20,
    },
    series: [
      {
        type: 'heatmap',
        data: data.heatmap.data.map((item: any) => [item[0], item[1], item[2] || '-']),
        label: {
          show: data.form_data.show_label ? data.form_data.show_label : false,
          color: '#fff',
          formatter: (params: any) => {
            return axisFormater(params.value[2], data, data.form_data.number_format);
          },
        },
        itemStyle: { color: '#fff' },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      },
    ],
  };
};
