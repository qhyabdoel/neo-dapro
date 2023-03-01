import { axisFormater, CHART_CONSTANTS } from '.';

export const setConfigChartSunburst = async (data: any) => {
  // dummy empty data
  // data = { ...data, data: [] };
  const color = CHART_CONSTANTS.general.collorPalette[data.form_data.color_scheme] || [];
  let modifyData = data.data.length > 0 ? modifyDataSunbrust(data.data, color) : [];
  return {
    tooltip: {
      formatter: (info) => {
        const treePathInfo = info.treePathInfo;
        let treePath: any = [];

        for (var i = 1; i < treePathInfo.length; i++) {
          let nilai = treePathInfo[i].value;
          if (data.form_data.number_format) nilai = axisFormater(nilai, data, data.form_data.number_format);
          treePath.push(treePathInfo[i].name + ' (' + nilai + ')');
        }

        return ['<div class="tooltip-title">' + treePath.join(' - ') + '</div>'].join('');
      },
    },
    series: [
      {
        ...staticObjectSunburst,
        data: modifyData,
        itemStyle: {
          borderWidth: 1,
          borderColor: 'white',
        },
        label: {
          ...staticLabelSunburst,
          // condition hide label
          show: data.form_data.hide_label ? false : true,
          // condition label outside and inside
          position: data.form_data.labels_outside ? 'outside' : 'inside',
          formatter: function (params) {
            let name = params['data'].name;
            if (!params['data']) return '0';

            if (data.form_data.number_format)
              return name + '\n' + axisFormater(params['data'].value, data, data.form_data.number_format);

            return name + '\n' + params['data'].value;
          },
        },
        levels: [],
      },
    ],
  };
};

// const mapingFilter = (data) => {
//   let mappingExtraFilter: any = [];
//   data.data.map((row: any) => {
//     const split = row.name.split(' - ');
//     data.form_data.groupby.map((value: any, index: number) => {
//       mappingExtraFilter.push({ key: split[index], value });
//     });
//   });
//   return mappingExtraFilter;
// };

const modifyDataSunbrust = (data, color) => {
  return data.map(({ type, children = [], ...rest }, index) => {
    const o = {
      ...rest,
      children: rest.children,
      itemStyle: {
        color: color[index],
      },
    };
    if (children.length) o.children = modifyDataSunbrust(children, color);
    return o;
  });
};
const staticObjectSunburst = {
  roam: false,
  type: 'sunburst',
  radius: [0, '95%'],
  sort: null,
  emphasis: { focus: 'ancestor' },
  itemStyle: { borderColor: '#2E3435', gapWidth: 2, borderWidth: 1 },
  upperLabel: {
    show: true,
    height: 20,
    color: '#FFFFFF',
    fontSize: 16,
    minAngle: 10,
  },
};

const staticLabelSunburst = {
  rotate: 'radial',
  color: '#f7f7f7',
  textBorderColor: '#272E2F',
  textBorderWidth: '2',
  fontWeight: '400',
  fontFamily: 'Roboto',
  fontSize: '10',
  minAngle: 10,
};
