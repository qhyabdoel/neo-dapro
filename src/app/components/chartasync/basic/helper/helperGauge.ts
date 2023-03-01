import { chartGrid, axisFormater, CHART_CONSTANTS } from '.';

const generateLegend = (data: any) => {
  let legendData =
    data.form_data.custom_condition &&
    data.form_data.custom_condition_arr != undefined &&
    data.form_data.custom_condition_arr.length > 0
      ? data.form_data.custom_condition_arr.map((item: any) => item.status)
      : ['Low', 'Medium', 'High', 'Very High'];

  return {
    show: true,
    type: 'scroll',
    orient: 'horizontal',
    data: legendData,
    textStyle: { fontSize: 10 },
  };
};

export const setConfigChartGauge = (data: any) => {
  // dummy data when raw.data is empty
  // data = { ...data, data: 0 };
  const legendObj = generateLegend(data);
  return {
    grid: chartGrid,
    series: generateSeries(data, legendObj.data),
  };
};

const generateSeries = (data: any, legendData: any) => {
  const { data_name, colorLabel, coloring, percent } = generateValueAndColorGauge(data, legendData);
  return [
    {
      ...staticObjectGauge,
      detail: {
        formatter: (value: any) => {
          const num = axisFormater(value, data, data.form_data.number_format);
          return String(num) + percent;
        },
        color: 'auto',
      },
      data: [{ value: data.data, name: data_name }],
      // styling gauge
      max: data.form_data.max_value,
      axisLine: { lineStyle: { width: 7, color: coloring } },
      pointer: {
        length: '67%',
        width: 4,
        show: data.form_data.show_needle || false,
        itemStyle: { color: colorLabel },
      },
      axisLabel: {
        show: data.form_data.show_axis_label || false,
        color: 'auto',
        fontSize: 10,
      },
      title: {
        show: data.form_data.show_label || false,
        offsetCenter: ['0%', '-40%'],
        textStyle: {
          fontWeight: 'bolder',
          fontSize: 20,
          fontStyle: 'italic',
          color: colorLabel,
          shadowColor: '#fff',
          shadowBlur: 10,
        },
      },
      // styling gauge
    },
  ];
};

const staticObjectGauge = {
  type: 'gauge',
  splitNumber: 10,
  clockwise: true,
  axisTick: { show: false },
  splitLine: { show: false },
};

const generateValueAndColorGauge = (data, legendData) => {
  // set label value if label type percentage
  let percent = data.form_data.gauge_label_type == 'percent' ? '%' : '';
  // result value gauge
  let valueGauge = data.data != null ? Number(data.data) : 100;
  // maximum gauge
  let maximumGauge = data.form_data.max_value || 100;
  let data_name = '';
  let colorLabel = '';
  let coloring = CHART_CONSTANTS.gauge.coloring;

  if (valueGauge < Number(data.data)) {
    // set minimum maximumGauge
    valueGauge = Number(data.data);
  }

  if (
    data.form_data.custom_condition &&
    data.form_data.custom_condition_arr &&
    data.form_data.custom_condition_arr.length > 0
  ) {
    coloring = [];
    data.form_data.custom_condition_arr.map((item: any) => {
      coloring.push([Number(item.size_to) / Number(maximumGauge), item.colorpicker]);
    });
  }
  let found = false;
  coloring.map((data, index) => {
    let pembagi = Number(valueGauge) / Number(data[0]);
    if (pembagi <= Number(maximumGauge) && !found) {
      data_name = legendData[index];
      colorLabel = String(coloring[index][1]);
      found = true;
    }
  });
  // if value never get set value in maximal color
  if (!data_name && !colorLabel) {
    data_name = legendData[legendData.length - 1];
    colorLabel = String(coloring[coloring.length - 1][1]);
  }
  return {
    data_name,
    colorLabel,
    coloring,
    percent,
  };
};
