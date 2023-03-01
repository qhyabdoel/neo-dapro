import { axisFormater, generateLegend, tooltipObj } from '.';
const collectAllData = (obj) => {
  let arrCollect = [];
  obj.value.map((item) => {
    if (item.data) {
      arrCollect = arrCollect.concat(item.data);
    }
  });
  return arrCollect;
};

const findHighestValueInArray = (obj) => {
  let colletingData = collectAllData(obj.data);
  const highest = colletingData.reduce((previous, current) => {
    return current[1] > previous[1] ? current : previous;
  });
  return highest.length > 0 ? (obj.form_data.x_log_scale ? Math.log10(highest[2]) : highest[2]) : 0;
};

const generateModifyValue = (item, form_data) => {
  /**
   * flag untuk x log scale akan di Math.log10()
   */
  let arrDuplicate = [];
  item.map((data) => {
    let x = data[0];
    let y = data[1];
    let value = data[2];
    if (form_data.x_log_scale) {
      x = x > 0 ? Math.log10(x) : 0;
      value = value > 0 ? Math.log10(value) : 0;
    }
    if (form_data.y_log_scale) {
      y = y > 0 ? Math.log10(y) : 0;
    }
    arrDuplicate.push([x, y, value, data[3]]);
  });
  console.log(arrDuplicate);
  return arrDuplicate;
};
const mapingData = (obj) => {
  let highest = findHighestValueInArray(obj);
  return obj.data.value.map((item: any) => {
    return {
      name: item.name,
      data:
        obj.form_data.x_log_scale || obj.form_data.y_log_scale
          ? generateModifyValue(item.data, obj.form_data)
          : item.data,
      type: 'scatter',
      symbolSize: function (data) {
        let calculatePercentage = Math.round((Number(data[2]) / highest) * 100);
        let calculatebase =
          calculatePercentage < 1
            ? 1
            : calculatePercentage == 100
            ? calculatePercentage
            : Number(calculatePercentage) + 15;
        return (calculatebase * obj.form_data.max_bubble_size) / 100;
      },
      emphasis: {
        focus: 'item',
        label: {
          show: true,
          formatter: (params: any) => `${params.seriesName} - ${params.data[3]}`,
          position: 'top',
        },
      },
      itemStyle: {
        borderColort: 'white',
      },
    };
  });
};

export const setConfigChartBubble = (data: any, explore: any) => {
  // dummy empty data
  // data = { ...data, data: { value: [] } };
  return {
    tooltip: {
      ...tooltipObj,
      formatter: (params: any) => {
        const x = axisFormater(params.data[0], data, data.form_data.y_axis_format);
        const y = axisFormater(params.data[1], data, data.form_data.y_axis_format);
        const z = axisFormater(params.data[2], data, data.form_data.y_axis_format);

        return `
          <b>${params.seriesName} - ${params.data[3]}</b><br>
          ${params.marker} X : ${x}<br>
          ${params.marker} Y : ${y}<br>
          ${params.marker} Value : ${z}
        `;
      },
    },
    xAxis: {
      name: data.form_data.x_axis_label || '',
      nameLocation: 'center',
      nameGap: 35,
      position: 'bottom',
      splitLine: { lineStyle: { type: 'dashed' } },
      axisLabel: {
        formatter: (value: any) => {
          return axisFormater(value, data, ',');
        },
      },
    },
    yAxis: {
      nameLocation: 'center',
      nameGap: 35,
      position: 'left',
      name: data.form_data.y_axis_label || '',
      splitLine: { lineStyle: { type: 'dashed' } },
      scale: true,
      axisLabel: {
        formatter: (value: any) => {
          return axisFormater(value, data, data.form_data.y_axis_format);
        },
      },
    },
    grid: { left: '12%', bottom: '20%', right: '5%' },
    legend: generateLegend(data, 'bubble'),
    series: data.data.value.length > 0 ? mapingData(data) : [],
  };
};
