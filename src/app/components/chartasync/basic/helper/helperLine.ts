import moment from 'moment';
import { convert_metric_to_verbose, get_format_date } from 'src/app/libs/helpers/utility';
import { generateLegend, axisFormater, CHART_CONSTANTS, xAxisObj, yAxisObj } from '.';

export const setConfigChart = (data: any, explore: any, selectedValue: string, filterId: any) => {
  // dummy empty data
  // data = { ...data, data: { value: null, key: [] } };

  const form_data = data.form_data;
  const color = CHART_CONSTANTS.general.collorPalette[form_data.color_scheme] || [];
  const chartData = mappingData(data, explore, color, selectedValue, filterId);
  const metricName1 =
    form_data.metrics && !data.form_data.metrics[1] ? convert_metric_to_verbose(form_data.metrics[0], explore) : false;

  const metricName2 = form_data.metric ? convert_metric_to_verbose(form_data.metric, explore) : false;
  const metricName3 = form_data.metric_2 ? convert_metric_to_verbose(form_data.metric_2, explore) : false;

  let yAxisData = {
    axisLabel: {
      fontSize: 10,
      formatter: (value: any) => (value !== 0 ? axisFormater(value, data, data.form_data.y_axis_format) : 0),
    },
    name: form_data.y_axis_label || '',
    ...yAxisObj,
  };

  let yAxisData2 = {
    axisLabel: {
      fontSize: 10,
      formatter: (value: any) => (value !== 0 ? axisFormater(value, data, data.form_data.y_axis_2_format) : 0),
    },
    name: form_data.y_axis_label || '',
    ...yAxisObj,
  };

  const yAxis =
    form_data.viz_type === 'dual_line'
      ? [
          { ...yAxisData, name: form_data.y_axis_label || metricName2 },
          { ...yAxisData2, name: form_data.y_axis_line || metricName3 },
        ]
      : {
          ...yAxisData,
          min: form_data.y_axis_bounds_min || null,
          max: form_data.y_axis_bounds_max || null,
        };

  const result = {
    // color,
    tooltip: {
      trigger: form_data.style_tooltips,
      textStyle: { fontSize: 10 },
      formatter: (params: any) => formatTooltip(params, data, metricName1),
      axisPointer: { type: 'cross', label: { show: false } },
    },
    xAxis: {
      ...xAxisObj,
      boundaryGap: false,
      data: chartData.key.slice(0, data.form_data.limit),
      name: form_data.x_axis_label || '',
      axisLabel: { margin: 16, fontSize: 10 },
    },
    yAxis,
    grid: { left: '10%', top: '16%', bottom: '24%', right: '10%' },
    legend: generateLegend(data, 'line', chartData.legends),
    series: chartData.series,
    dataZoom: data.form_data.show_brush && [
      { startValue: chartData.key.length > 0 ? chartData.key[0] : '' },
      { type: 'inside' },
    ],
  };
  return result;
};

const formatTooltip = (params: any, data: any, metricName1: string) => {
  const metric = data.form_data.metrics[0];

  if (data.form_data.style_tooltips === 'item') {
    const label = metricName1 ? `${metricName1} - ${params.seriesName}` : params.seriesName;

    // let origin = data.data.value[metric][params.seriesName][params.dataIndex];
    let origin = data.data.value[metric][params.dataIndex];
    const valueString = axisFormater(origin, data, data.form_data.format_number_tooltips);
    return `<b>${params.name}</b><br>${params.marker} ${label} : ${valueString}`;
  }

  let tooltip = `<b>${params[0].name}</b>`;
  params.map((item: any) => {
    let origin = data.data.value[metric][item.seriesName][item.dataIndex];
    const valueString = axisFormater(origin, data, data.form_data.format_number_tooltips);
    const label = metricName1 ? `${metricName1} - ${item.seriesName}` : item.seriesName;
    tooltip += `<br>${item.marker} ${label} : ${valueString}`;
  });
  return tooltip;
};

export const generateFormatDate = (type, generalFormat) => {
  const formatdate = get_format_date(generalFormat);
  switch (type) {
    case 'year':
      return 'YYYY';
    case 'month':
      return 'MM/YYYY';
    case 'hour':
      return formatdate.includes('hh:mm:ss') ? formatdate : `${formatdate} hh:mm:ss`;
    default:
      return formatdate;
  }
};
const mappingData = (raw: any, explore: any, color: Array<any>, selectedValue: string, filterId: any) => {
  const formatdate = generateFormatDate(raw.form_data.time_grain_sqla, raw.form_data.x_axis_format);
  const formattedDate = raw.data.key.map((item: any) => {
    const x = item * 1000;
    const date = moment(x).format(formatdate);
    return date;
  });

  const firstMetric = raw.form_data.metrics ? raw.form_data.metrics[0] || false : false;
  const isDualAxis = raw.form_data.viz_type === 'dual_line';
  const yLogScale = raw.form_data.y_log_scale;

  let metrics = raw.form_data.metrics;
  let legends = [];
  let minValue: number;

  if (isDualAxis) metrics = [raw.form_data.metric, raw.form_data.metric_2];

  let series = [];
  if (raw.data.value) {
    series =
      raw.form_data.groupby && raw.form_data.groupby[0]
        ? Object.keys(raw.data.value[firstMetric]).map((group, index) => {
            let scaledValues = scaleValues(raw.data.value[firstMetric][group], yLogScale, raw);
            const stack = raw.form_data.area_chart && raw.form_data.stack_area_chart ? 'total' : false;
            let originVal = originValues(raw.data.value[firstMetric][group], yLogScale);
            legends.push(group);
            let pickColor = color[index];
            let select = selectedValue.split('=')[1];
            let indexByGroup = null;

            if (select) {
              indexByGroup = Object.keys(raw.data.value[firstMetric]).findIndex(
                (data) => data === selectedValue.split('=')[0]
              );
            }
            return {
              name: group,
              type: 'line',
              smooth: raw.form_data.line_interpolation === 'smooth' && true,
              step: raw.form_data.line_interpolation === 'step-line' && true,
              data: sortValues(scaledValues, raw.form_data),
              connectNulls: true,
              symbolSize: 7,
              symbol: 'circle',
              showSymbol: selectedValue.split('=')[0] === '' ? raw.form_data.show_markers || isDualAxis : true,
              areaStyle: raw.form_data.area_chart || null,
              stack,
              origin: sortValues(originVal, raw.form_data),
              lineStyle: {
                color: selectedValue.split('=')[0] !== '' ? `${pickColor}26` : pickColor,
              },
              itemStyle: {
                color:
                  selectedValue.split('=')[0] !== '' && filterId === raw.form_data.slice_id
                    ? `${pickColor}26`
                    : pickColor,
              },
              markPoint: {
                symbol: 'circle',
                symbolSize: [10, 10],
                data: [
                  {
                    coord: select ? [Number(select.split(',')[0]), Number(select.split(',')[1])] : [],
                    itemStyle: {
                      color: indexByGroup !== null ? color[indexByGroup] : '',
                    },
                  },
                ],
              },
            };
          })
        : metrics.map((metric: string, index: number) => {
            const metricName = convert_metric_to_verbose(metric, explore);
            let scaledValues = scaleValues(raw.data.value[metric], yLogScale, raw);
            const stack = raw.form_data.area_chart && raw.form_data.stack_area_chart ? 'total' : false;
            legends.push(metricName);
            let pickColor = color[index];
            let select = selectedValue.split('=')[1];
            return {
              name: metricName,
              type: 'line',
              smooth: raw.form_data.line_interpolation === 'smooth' && true,
              step: raw.form_data.line_interpolation === 'step-line' && true,
              data: sortValues(scaledValues, raw.form_data),
              connectNulls: true,
              symbolSize: 7,
              symbol: 'circle',
              yAxisIndex: index === 1 && isDualAxis ? 1 : 0,
              showSymbol: selectedValue.split('=')[0] === '' ? raw.form_data.show_markers || isDualAxis : true,
              areaStyle: raw.form_data.area_chart || null,
              stack,
              lineStyle: {
                color: selectedValue.split('=')[0] !== '' ? `${pickColor}26` : pickColor,
              },
              itemStyle: {
                color:
                  selectedValue.split('=')[0] !== '' && filterId === raw.form_data.slice_id
                    ? `${pickColor}26`
                    : pickColor,
              },
              markPoint: {
                symbol: 'circle',
                symbolSize: [10, 10],
                data: [
                  {
                    coord: select ? [Number(select.split(',')[0]), Number(select.split(',')[1])] : [],
                    itemStyle: {
                      color: select ? pickColor : '',
                    },
                  },
                ],
              },
            };
          });
  }

  return {
    key: raw.form_data.order_desc ? formattedDate.reverse() : formattedDate,
    series,
    legends,
    minValue,
  };
};

const sortValues = (values: Array<any>, formData: any) => {
  return formData.order_desc ? [...values].reverse() : values;
};

const scaleValues = (value: any, yLogScale: boolean, raw: any) => {
  return yLogScale ? value.map((item: number) => Math.log10(item)) : generateValueLine(raw, value);
};

const originValues = (value: any, yLogScale: boolean) => {
  return yLogScale ? value.map((item: number) => Math.log10(item)) : value;
};

const generateValueLine = (item, data) => {
  let value = data;
  let modifArr = [];
  if (item.form_data.y_axis_bounds_max) {
    data.map((val) => {
      if (item.form_data.y_axis_bounds_max) {
        let changeValue = val > item.form_data.y_axis_bounds_max ? item.form_data.y_axis_bounds_max : val;
        modifArr.push(changeValue);
      }
    });
    return modifArr;
  }
  return value;
};

export const helperGenerateSpecificFormat = (type, date) => {
  let since;
  let until;
  switch (type) {
    case 'year':
      since = moment(date).startOf('year').startOf('month').format('YYYY-MM-DDTHH:mm:ss');
      until = moment(date).endOf('year').endOf('month').format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'month':
      since = moment(date).startOf('month').format('YYYY-MM-DDTHH:mm:ss');
      until = moment(date).endOf('month').format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'day':
      since = moment(date).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
      until = moment(date).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
      break;

    default:
      break;
  }
  return { since, until };
};
