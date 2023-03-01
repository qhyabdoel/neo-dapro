import { axisFormater, generateLegend, CHART_CONSTANTS, yAxisObj, xAxisObj } from '.';
import { convert_metric_to_verbose } from 'src/app/libs/helpers/utility';
import { E } from '@angular/cdk/keycodes';

const formatLabel = (data: any, counts: any) => {
  return {
    show: data.form_data.show_bar_value || counts,
    position:
      data.form_data.bar_stacked && !counts ? '' : data.form_data.viz_type === 'horizontal_bar' ? 'right' : 'top',
    formatter: (params: any) => {
      const count = counts[params.dataIndex];
      const formatNumbber = data.form_data.format_number_tooltips;

      return counts
        ? axisFormater(count, data, formatNumbber)
        : params.value === 0 && data.form_data.bar_stacked
        ? ''
        : axisFormater(params.value, data, formatNumbber);
    },
    textStyle: {
      color: data.form_data.bar_stacked || counts ? null : 'inherit',
      fontSize: '9px',
    },
  };
};

const createSerie = (type: string, name: string, data: any, stack: any, label?: any, key?: string) => ({
  type,
  name,
  data,
  stack,
  label,
  key,
});

const getMetricCounts = (metrics: any, data: any) => {
  return metrics.map((metric: string) => {
    let countItem = data.key.map((item: any) => 0);

    if (data.value[metric]) {
      if (!data.value[metric][0]) {
        Object.keys(data.value[metric]).map((group, index) => {
          countItem = data.value[metric][group].map((value: any, i: number) => countItem[i] + value);
        });
      } else countItem = data.value[metric].map((value: any, i: number) => countItem[i] + value);
    }

    return { metric, data: countItem };
  });
};

const helperPickColor = (raw, selectedValue, pickColor, serieName, item, index) => {
  const findIndex =
    raw.form_data.style_tooltips === 'axis' &&
    raw.data.key.findIndex((item: string) => {
      return item === selectedValue;
    });
  let forSelected = `${serieName}=${item}`;
  if (raw.form_data.style_tooltips === 'item') {
    return selectedValue !== '' && selectedValue !== forSelected ? `${pickColor}26` : pickColor;
  } else if (raw.form_data.style_tooltips === 'axis') {
    return findIndex >= 0 && index !== findIndex ? `${pickColor}26` : pickColor;
  }
};

const mappingDataToOptions = (raw: any, explore: any, color, selectedValue) => {
  let legend = [];
  let series = [];

  let metricList = raw.form_data
    ? raw.form_data.line_metric
      ? [...raw.form_data.metrics, raw.form_data.line_metric]
      : raw.form_data.metrics
    : [];
  const key = raw.form_data.groupby ? raw.form_data.groupby[0] : '';
  metricList.map((metric: any, index: number) => {
    const { metric_values, metricName, serieType } = findMetricValue(raw, explore, metricList, metric, index);
    const stack = raw.form_data.bar_stacked && serieType === 'bar' ? 'bar' : false;
    const label = formatLabel(raw, false);

    if (metric_values) {
      if (!metric_values[0]) {
        Object.keys(metric_values).map((group, idxGroup) => {
          const serieName = `${metricName} - ${group}::${serieType}`;
          let data = metric_values[group].map((item, idxVal) => {
            let pickColor = color[idxGroup % color.length];
            return {
              value: item,
              selected: `${serieName}=${item}`,
              itemStyle: {
                color: helperPickColor(raw, selectedValue, pickColor, serieName, item, idxVal),
              },
            };
          });
          const serieData = createSerie(serieType, serieName, data, stack, label, key);
          legend.push(serieName);
          series.push(serieData);
        });
      } else {
        const serieName = `${metricName}::${serieType}`;
        let pickColor = color[index];
        let data = metric_values.map((item) => {
          return {
            value: item,
            selected: `${serieName}=${item}`,
            itemStyle: {
              color: selectedValue !== '' && selectedValue !== `${serieName}=${item}` ? `${pickColor}26` : pickColor,
            },
          };
        });
        const serieData = createSerie(serieType, serieName, data, stack, label, key);
        legend.push(serieName);
        series.push(serieData);
      }
    }

    if (raw.data.value.CONST) {
      const serieData = createSerie('line', 'CONST::line', raw.data.value.CONST, false, '', key);
      legend.push('CONST::line');
      series.push(serieData);
    }
  });

  if (raw.form_data.count_stacked && raw.form_data.bar_stacked) {
    getMetricCounts(raw.form_data.metrics, raw.data).map((item: any) => {
      const metricData = item.data.map((value: number) => 0);
      const serieData = createSerie('bar', item.metric, metricData, item.metric, formatLabel(raw, item.data), key);
      series.push(serieData);
    });
  }

  return { series, legend };
};

const getTooltipItem = (seriesName: string, data: any, params: any, explore: any, style: string) => {
  const metricName = seriesName.split(' - ')[0];
  const groupName = seriesName.replace(`${metricName} - `, '');
  const tooltipStrip = data.form_data.tooltips[0] ? '' : '<br>-';
  let tooltip = style === 'item' ? `<b>${params.name}</b>${tooltipStrip}` : '';
  data.form_data.tooltips.map((metric) => {
    const label = convert_metric_to_verbose(metric, explore);
    const metricValue = data.data.value[metric][groupName]
      ? data.data.value[metric][groupName][params.dataIndex]
      : data.data.value[metric][params.dataIndex];

    tooltip += `<br>${params.marker} ${label} - ${groupName} 
      : ${axisFormater(metricValue, data, data.form_data.format_number_tooltips)}`;
  });

  return tooltip;
};

const formatTooltip = (params: any, data: any, explore: any, style: string) => {
  if (style === 'item') {
    const seriesName = params.seriesName.split('::')[0];
    return getTooltipItem(seriesName, data, params, explore, style);
  } else {
    const tooltipStrip = data.form_data.tooltips[0] ? '' : '<br>-';
    let tooltips = `<b>${params[0].name}</b>${tooltipStrip}`;

    for (const row of params) {
      const seriesName = row.seriesName.split('::')[0];
      const seriesNameArray = seriesName.split(' - ');

      if (seriesNameArray[1]) {
        const tooltip = getTooltipItem(seriesName, data, row, explore, style);
        tooltips += `${tooltip}`;
      }
    }

    return tooltips;
  }
};

export const setConfigChartBar = (data: any, explore, selectedValue) => {
  const color = CHART_CONSTANTS.general.collorPalette[data.form_data.color_scheme] || [];
  const chartOption = mappingDataToOptions(data, explore, color, selectedValue);

  const yAxis = {
    name: data.form_data.y_axis_label || '',
    axisLabel: {
      fontSize: 10,
      formatter: (value: any) => axisFormater(value, data, data.form_data.y_axis_format),
    },
    ...yAxisObj,
  };

  const yAxisLine = {
    name: data.form_data.y_axis_line || '',
    min:
      data.form_data.y_axis_bounds_min && data.form_data.y_axis_bounds_min !== ''
        ? data.form_data.y_axis_bounds_min
        : 0 || 0,
    max:
      data.form_data.y_axis_bounds_max && data.form_data.y_axis_bounds_max !== ''
        ? data.form_data.y_axis_bounds_max
        : 100 || 100,
    axisLabel: {
      formatter: (value: number) => axisFormater(value, data, data.form_data.y_axis_2_format),
    },
    show: data.form_data.show_dual_axis_line,
    position: 'right',
    ...yAxisObj,
  };

  const xAxis = {
    data: data.data.key,
    name: data.form_data.x_axis_label || '',
    axisLabel: {
      textStyle: { fontSize: 10 },
      rotate: Number(data.form_data.rotate_axis),
    },
    ...xAxisObj,
  };
  const result = {
    tooltip: {
      trigger: data.form_data.style_tooltips,
      textStyle: { fontSize: 10 },
      formatter: (params: any) => formatTooltip(params, data, explore, data.form_data.style_tooltips),
    },
    xAxis: data.form_data.viz_type === 'horizontal_bar' ? [yAxis, yAxisLine] : xAxis,
    yAxis: data.form_data.viz_type === 'horizontal_bar' ? xAxis : [yAxis, yAxisLine],
    grid: { left: '10%', top: '12%', bottom: '16%', right: '10%' },
    series: chartOption.series,
    legend: {
      ...generateLegend(data, 'bar', chartOption.legend),
      formatter: (param: string) => {
        return param.split('::')[0];
      },
    },
  };

  return result;
};

export const findMetricValue = (raw, explore, metricList, metric, index) => {
  const metric_values = raw.data.value[metric];
  const metricName = convert_metric_to_verbose(metric, explore);
  const serieType = index === metricList.length - 1 ? (raw.form_data.line_metric ? 'line' : 'bar') : 'bar';
  return { metric_values, metricName, serieType };
};
