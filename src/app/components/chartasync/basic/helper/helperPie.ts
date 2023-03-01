import { generateLegend, chartGrid, CHART_CONSTANTS, tooltipObj, axisFormater } from '.';
import { convert_metric_to_verbose } from 'src/app/libs/helpers/utility';
import { reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
declare var d3: any;
const mappingDataToOptions = (raw: any, colorPalette: any, selectedValue: any) => {
  let formaterNumber = formatNumberIdFile;
  let locale = raw.form_data.format_number_id ? 'ID' : 'EN';
  d3.formatDefaultLocale(formaterNumber[locale]);
  let colors = [];
  const series = raw.data.key.map((key: string, index: number) => {
    let name = handleLabelPie(raw.form_data.pie_label_type, key, raw, index);
    if (name.includes(':')) {
      const seriesName = name.split(' : ')[0];
      name = seriesName;
    }
    const textColor =
      index < colorPalette.length ? colorPalette[index] : colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors.push(selectedValue !== '' && selectedValue !== name ? `${textColor}26` : textColor);

    return {
      index,
      selected: selectedValue === name ? true : false,
      name: name,
      key: raw.form_data.groupby ? raw.form_data.groupby[0] : '',
      value: raw.data.value[index],
      tooltip: raw.data.tooltip.map((item: any) => ({ column: item.column, value: item.value[index] })),
      label: {
        formatter: `${handleLabelPie(raw.form_data.pie_label_type, key, raw, index)}`,
        show: raw.form_data.hide_label ? false : true,
        textStyle: {
          color: raw.form_data.labels_outside
            ? selectedValue !== '' && selectedValue !== name
              ? `${textColor}26`
              : textColor
            : '#fff',
          fontSize: 10,
          fontWeight: raw.form_data.labels_outside ? 'normal' : 'bold',
          borderColor: '#000',
        },
      },
    };
  });

  return { series, colors };
};

const handleLabelPie = (labelType, key, raw, index) => {
  //  find total all pie data
  let total = raw.data.value.reduce((a, b) => {
    return a + b;
  }, 0);
  // find percentage
  let percentage = (parseFloat(raw.data.value[index]) * 100) / total || 0;

  let label = '';
  switch (labelType) {
    case 'key':
      label = key;
      break;
    case 'value':
      label = `${reformatNumber(raw.data.value[index], raw.form_data.y_axis_format, raw, d3)}`;
      break;
    case 'percent':
      label = `${percentage.toFixed(2)}%`;
      break;
    case 'percent_around':
      label = `${Math.round(Number(percentage))}%`;
      break;
    case 'key_value':
      label = `${key} : ${reformatNumber(raw.data.value[index], raw.form_data.y_axis_format, raw, d3)}`;
      break;
    case 'key_percent':
      label = `${key} : ${percentage.toFixed(2)}%`;
      break;
    case 'key_percent_around':
      label = `${key} : ${Math.round(Number(percentage))}%`;
      break;
    default:
      break;
  }

  return label;
};

export const setConfigChartPie = (data: any, explore: any, selectedValue: any) => {
  // dummy empty data
  // data = { ...data, data: { key: [], value: [], tooltip: [] } };
  const scheme = data.form_data.color_scheme != 'bnbColors' ? data.form_data.color_scheme : 'palette1';
  const colorPalette = CHART_CONSTANTS.general.collorPalette[scheme] || [];
  const chartData = mappingDataToOptions(data, colorPalette, selectedValue);
  let series = {
    type: 'pie',
    radius: data.form_data.donut ? ['40%', '80%'] : '55%',
    data: chartData.series,
    label: {},
    selectedMode: 'single',
  };

  if (!data.form_data.labels_outside) {
    series = {
      ...series,
      label: {
        position: 'inside',
      },
    };
  }

  return {
    color: chartData.colors,

    tooltip: {
      ...tooltipObj,
      formatter: (params: any) => {
        let tooltip = `<b>${params.name}</b><br>`;
        let additionalData = '-';
        if (params.data.tooltip[0]) additionalData = '';

        params.data.tooltip.map((item: any) => {
          const tooltipName = convert_metric_to_verbose(item.column, explore);
          additionalData += `${params.marker} ${tooltipName}: 
                        ${axisFormater(item.value, data)} <br>`;
        });
        return `${tooltip}${additionalData}`;
      },
    },
    grid: chartGrid,
    legend: generateLegend(data, 'pie'),
    series,
  };
};
