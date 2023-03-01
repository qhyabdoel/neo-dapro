import { axisFormater, generateLegend, CHART_CONSTANTS } from '.';
import { convert_metric_to_verbose } from 'src/app/libs/helpers/utility';

const formatSeriesData = (seriesDataRaw: any, colorPalette: any, categories: any, links: any) => {
  let seriesDataClean: Array<any> = [];
  for (const obj of seriesDataRaw) {
    const existObj = seriesDataClean.find((oldObj: any) => oldObj.name === obj.name);

    if (!existObj) {
      const link = links.find((item: any) => {
        return item.source === obj.name || item.target === obj.name;
      });

      const category = categories.findIndex((item: string) => {
        return item === link.group;
      });

      const color = colorPalette[category % colorPalette.length];
      let newObj = { ...obj, label: { color } };
      if (category > -1) newObj.category = category;
      seriesDataClean.push(newObj);
    }
  }

  return seriesDataClean;
};

export const setConfigChartDirectedForce = (data: any, explore: any) => {
  // dummy empty data
  // data = { ...data, data: [] };
  const metricName = convert_metric_to_verbose(data.form_data.metric, explore);
  const colorPalette = CHART_CONSTANTS.general.collorPalette[data.form_data.color_scheme] || [];
  const repulsion = data.form_data.charge ? data.form_data.charge.replace('-', '') : 500;

  let categoriesArray = [];

  // if data[0].item.group doesn't exist then categoriesArray empty
  if (data.data.length > 0 && data.data[0].group) {
    categoriesArray = data.data.map((item: any) => item.group.toString());
    categoriesArray = [...new Set(categoriesArray)];
  }

  const categoriesData = categoriesArray.map((category: string) => {
    return { name: category, base: category };
  });

  let seriesDataRaw: Array<any> = [];

  for (const item of data.data) {
    seriesDataRaw.push({
      name: item.target.toString(),
      id: item.target.toString(),
    });
  }

  for (const item of data.data) {
    seriesDataRaw.push({
      name: item.source.toString(),
      id: item.source.toString(),
    });
  }

  const links = data.data.map((item: any) => {
    let link = {
      source: item.source.toString(),
      target: item.target.toString(),
      value: item.value,
    };
    return item.group ? { ...link, group: item.group.toString() } : link;
  });

  const seriesDataClean = formatSeriesData(seriesDataRaw, colorPalette, categoriesArray, links);

  return {
    legend: generateLegend(data, 'bar', categoriesArray),
    tooltip: {
      textStyle: { fontSize: 10 },
      formatter: (params: any) => {
        const category = categoriesArray.findIndex((item: string) => {
          return item === params.data.group;
        });

        const formattedValue = axisFormater(params.data.value, data, data.form_data.number_format);
        const color = colorPalette[category % colorPalette.length];
        const marker = `<span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${color};"></span>`;

        if (params.data.value) return `<b>${params.name}</b><br>${marker}${metricName}: ${formattedValue}`;
      },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        animation: false,
        label: {
          position: 'right',
          formatter: '{b}',
          show: data.form_data.show_label,
          textStyle: { fontSize: 10 },
        },
        draggable: true,
        data: seriesDataClean,
        categories: categoriesData,
        force: {
          edgeLength: data.form_data.link_length || 50,
          repulsion: data.form_data.charge ? Number(repulsion) : 500,
          gravity: 1,
          initLayout: null,
          friction: 0.05,
          layoutAnimation: true,
        },
        edges: links,
      },
    ],
    color: colorPalette,
  };
};
