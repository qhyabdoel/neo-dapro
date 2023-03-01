import ecStat from 'echarts-stat';
export const setConfigChartHistogram = (data: any) => {
  // dummy data when raw.data is empty
  // data = { ...data, data: { values: [] } };
  let collectingData = [];
  const chartColor =
    data.form_data.colorpickers.length > 0 ? [data.form_data.colorpickers[0].colorpicker] : ['rgb(25, 183, 207)'];
  const labelColor = data.form_data.colorpickers.length > 0 ? data.form_data.colorpickers[1].colorpicker : '#808080';
  data.data.values.map((item) => {
    collectingData.push(parseFloat(item.value));
  });
  const bins = collectingData.length > 0 ? ecStat.histogram(collectingData, 'sturges') : null;
  const min = collectingData.length > 0 ? Math.min(...collectingData) : 0;
  return {
    color: chartColor,
    grid: { left: '10%', top: '12%', bottom: '16%', right: '10%' },
    tooltip: {
      show: data.form_data.chart_tooltip,
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        return `Range : ${params.value[4]}</br>Count : <b>${params.value[1]}</b>`;
      },
    },
    xAxis: {
      scale: true,
      splitLine: {
        show: false,
      },
      nameLocation: 'center',
      nameGap: 40,
      max: data.form_data.domain || null,
      min: min === 0 ? 0 : null,
      name: data.form_data.x_axis_label || '',
      interval: Number(data.form_data.range) || null,
    },
    yAxis: {
      nameLocation: 'center',
      nameGap: 40,
      name: data.form_data.y_axis_label || '',
      showGrid: false,
      splitLine: {
        show: false,
      },
    },
    series: [
      {
        name: 'histogram',
        type: 'bar',
        barWidth: '99.3%',
        label: {
          normal: {
            show: true,
            position: 'top',
            color: labelColor,
          },
        },
        data: collectingData.length > 0 ? bins.data : [],
      },
    ],
  };
};
