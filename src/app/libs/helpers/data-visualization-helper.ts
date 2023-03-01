import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { hexToRgbA } from './color';
import {
  convert_number,
  date_picker_handler,
  month_picker_handler,
  reformat_number,
  year_picker_handler,
} from './utility';
import * as echarts from 'echarts';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
declare var d3: any;
let urlExplore = `api/chart/explore/`;
export const setbaseColumnDate = (latest_date, column_filter, filter_date_type) => {
  let date_result = [];
  var date = new Date(latest_date),
    y = date.getFullYear(),
    m = date.getMonth();
  var f = new Date(y, m, 1);
  var l = new Date(y, m + 1, 0);
  var fdy = new Date(new Date().getFullYear(), 0, 1);
  var ldy = new Date(new Date().getFullYear(), 11, 31);
  let isUtc: any;
  switch (filter_date_type) {
    case 'month':
      isUtc = new Date(latest_date);
      if (String(isUtc) != 'Invalid Date') {
        (date = new Date(latest_date)), (y = date.getFullYear()), (m = date.getMonth());
        f = new Date(y, m, 1);
        l = new Date(y, m + 1, 0);
      }
      date_result.push(
        {
          col: column_filter,
          op: '>=',
          val: moment(f).format('YYYY-MM-DD'),
        },
        {
          col: column_filter,
          op: '<=',
          val: moment(l).format('YYYY-MM-DD'),
        }
      );
      break;
    case 'year':
      isUtc = new Date(latest_date);
      if (String(isUtc) != 'Invalid Date') {
        fdy = new Date(new Date(latest_date).getFullYear(), 0, 1);
        ldy = new Date(new Date(latest_date).getFullYear(), 11, 31);
      }
      date_result.push(
        {
          col: column_filter,
          op: '>=',
          val: moment(fdy).format('YYYY-MM-DD'),
        },
        {
          col: column_filter,
          op: '<=',
          val: moment(ldy).format('YYYY-MM-DD'),
        }
      );
      break;
    default:
      isUtc = new Date(latest_date);
      if (String(isUtc) != 'Invalid Date') latest_date = moment(latest_date).format('YYYY-MM-DD');
      date_result.push(
        {
          col: column_filter,
          op: '>=',
          val: moment(latest_date).format('YYYY-MM-DD'),
        },
        {
          col: column_filter,
          op: '<=',
          val: moment(latest_date, 'YYYY-MM-DD').add(1, 'days'),
        }
      );
      break;
  }
  return date_result;
};

export const convertNum = (val) => {
  let num = 0;
  let f = d3.format('.2s');
  if (Number(val) < 100000) num = Number(val);
  else num = f(val);
  return num;
};

export const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  let r = Math.floor(Math.random() * (max - min + 1)) + min;
  if (Number(r) > Number(max)) r = max - 1;
  return r;
};

export const setConfigWordcloud = (data) => {
  let fromdata = JSON.stringify(data.data);
  let dataReplaceText = fromdata.split('text').join('name');
  let dataReplaceValue = dataReplaceText.split('size').join('value');

  return {
    tooltip: {
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
    },
    series: [
      {
        type: 'wordCloud',
        gridSize: 2,
        sizeRange: [data.form_data.size_from, data.form_data.size_to],
        rotationRange: [0, 0],
        shape: data.form_data.shape || 'diamond',
        drawOutOfBound: true,
        data: JSON.parse(dataReplaceValue),
      },
    ],
  };
};

export const reformatDataTable = (columns, records) => {
  let result = [];
  records.map(function (val, idx) {
    let obj = {};
    let arr = Object.entries(val);
    columns.map(function (col) {
      for (let i of arr) {
        if (col == i[0]) return (obj[i[0]] = i[1]);
      }
    });

    result.push(obj);
  });
  return result;
};

export const getDismissReason = (reason: any): string => {
  if (reason === ModalDismissReasons.ESC) {
    return 'by pressing ESC';
  } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
    return 'by clicking on a backdrop';
  } else {
    return `with: ${reason}`;
  }
};

export const loadChartData = async (url, param, messages, service) => {
  let errorMessage = messages.CHART.MSG_ERR;
  let rest = await service.postApi(url, param);
  let result;
  if (rest.status) {
    result = rest.result.response ? rest.result.response : rest.result;
  } else {
    if (rest.result.status != 500) {
      // errorMessage = rest.result.message ? rest.result.message : errorMessage;
      if (url.includes('explore_json')) {
        // return rest.result.message;
        console.log(`${rest.result.message ? rest.result.message : errorMessage}`);
      } else {
        service.openModal(messages.CHART.MSG_ERR, errorMessage);
        return errorMessage;
      }
    } else {
      if (rest.result.status == 0) {
        errorMessage = messages.CHART.ERR_RTO;
        return errorMessage;
      }
      if (rest.result.hasOwnProperty('error')) {
        errorMessage = await rest.result.error.message;
        if (errorMessage == messages.CHART.MSG_NIL) {
          errorMessage = errorMessage;
          service.openModal(messages.CHART.F, errorMessage);
        } else service.openModal(messages.CHART.F, errorMessage);
        if (rest.result.statusText == 'Internal Server Error' && errorMessage == undefined) {
          errorMessage = errorMessage;
        }
        return errorMessage;
      }
    }
  }
  return result;
};

export const loadDatasetData = async (url, service, messages, removeChartFromContent) => {
  let result = await service.getApi(url);
  let errorMessage;
  let value;
  if (result.status) {
    value = result.result.response ? result.result.response : result.result;
    return value;
  } else {
    errorMessage = messages.CHART.ERR_DT;
    removeChartFromContent();
    if (result.result.status == 0) {
      errorMessage = messages.CHART.ERR_RTO;
      service.openModal(messages.CHART.F, errorMessage);
      return errorMessage;
    }
    service.openModal(messages.CHART.F, errorMessage);
    return {};
  }
};

export const loadExploreJson = async (params: any, service, message?) => {
  let explore = {
    form_data: { viz_type: '', color_scheme: '', initial_date_filter: '', since: '', until: '' },
    slice: { slice_name: '' },
    latest_date: '',
  };
  let exploreUrl = null;
  let exploreJson = null;
  let exploreJsonUrl = null;
  let payload = null;
  let tokenShare = getURLParameter('token');
  if (params.id) {
    exploreUrl = helperGenerateExploreUrl(params.id);
    exploreJsonUrl = helperGenerateExploreJsonUrl(params.id);
    explore = await helperGetExplorerChart(
      explore,
      exploreJsonUrl,
      tokenShare,
      exploreUrl,
      service,
      false,
      {},
      message
    );
  } else {
    const [ds, dsType] = params.uid.split('__');
    exploreUrl = `${urlExplore}${dsType}/${ds}`;
    exploreJsonUrl = `/api/chart/explore_json/`;
    explore = await loadDatasetData(exploreUrl, service, message, null);
  }
  if (explore) {
    if (explore.form_data) {
      switch (explore.form_data.initial_date_filter) {
        case 'latest_date':
          explore = {
            ...explore,
            form_data: { ...explore.form_data, since: explore.latest_date, until: explore.latest_date },
          };
          break;
        case 'current_date':
          explore = {
            ...explore,
            form_data: { ...explore.form_data, since: moment(new Date()).format(), until: moment(new Date()).format() },
          };
          break;
        default:
          break;
      }
      payload = explore.form_data;
    } else {
      payload = explore.form_data;
    }

    let param = { form_data: payload };
    param.form_data = JSON.stringify(param.form_data);

    // helper untuk memanggil result dari url exploreUrl atau exploreJsonUrl
    exploreJson = await helperGetExplorerChart(
      explore,
      exploreJsonUrl,
      tokenShare,
      '',
      service,
      explore.form_data,
      param,
      message
    );
  }

  return { explore, exploreJson };
};

export const convertNumbering = (val) => {
  return convert_number(val);
};

export const getConfigChart = async (data, service) => {
  let config = {};
  let jsonFile = null;
  let result = [];
  if (data.form_data.viz_type == 'country_map2') {
    let url = `assets/data/geojson/countries/${data.form_data.select_country2.toString().toLowerCase()}.geojson.json`;
    jsonFile = await service.loadGetData(url);
    config = setConfigMapOverlay(data, jsonFile);
  }
  result = [config, jsonFile];
  return result;
};

export const setConfigMapOverlay = (data, mapGeoJson) => {
  let datamap = [];
  let datamapPie = [];
  let dataPieValue = [];
  let colorRandom = [];
  let visualMapColor = [];
  let visualMapText = [];
  let nameMap = {};
  let me = data.data;
  let scatterData = {};
  let scheme =
    data.form_data.color_scheme != 'bnbColors' && data.form_data.color_scheme != undefined
      ? data.form_data.color_scheme
      : 'palette1';
  let ini = this;
  let colorPalette = [];
  let colors = [];
  if (data.form_data.random_color) {
    let array = me.group;
    for (let index = 0; index < array.length; index++) {
      colors.push(colorPalette[getRandomInt(0, colorPalette.length)]);
    }
  }
  let f = d3.format(
    data.form_data.number_format != '' || data.form_data.number_format != undefined
      ? data.form_data.number_format
      : '.3s'
  );
  var title = data.form_data.select_country2;
  // for coloring
  let coloring = [];
  let coloringPie = [];
  for (var i = 0; i < me.group.length; i++) {
    let warna = colorPalette[i > colorPalette.length - 1 ? colorPalette.length - 1 : i];
    coloring.push(hexToRgbA(warna));
    coloringPie.push(warna);
  }
  // this.coloringPie = coloringPie;
  let obj = {};
  let total = 0;
  for (var j = 0; j < me.data.length; j++) {
    total += me.data[j][me.series_keys.indexOf('sumTot')];
    obj = {};
    obj = {
      name: me.data[j][me.series_keys.indexOf('name')],
      value: me.data[j][me.series_keys.indexOf('sumTot')],
      id: me.data[j][me.series_keys.indexOf('id')],
      sumTot: me.data[j][me.series_keys.indexOf('sumTot')],
      data: [],
    };
    let groupArr = [];
    for (var i = 0; i < me.group.length; i++) {
      obj['data'].push({
        name: me.group[i],
        color: coloring[i],
        value: me.data[j][me.series_keys.indexOf(me.group[i])],
      });
      if (obj['value'] == 0) {
        obj['value'] = me.data[j][me.series_keys.indexOf(me.group[i])];
      } else {
        obj['value'] =
          obj['value'] < me.data[j][me.series_keys.indexOf(me.group[i])]
            ? me.data[j][me.series_keys.indexOf(me.group[i])]
            : obj['value'];
      }
      groupArr.push(me.data[j][me.series_keys.indexOf(me.group[i])]);
    }
    let idxMaxVal = groupArr.indexOf(Math.max.apply(null, groupArr));
    // maps
    for (var k = 0; k < mapGeoJson.features.length; k++) {
      if (
        String(me.data[j][me.series_keys.indexOf('name')]).toLowerCase() ==
          String(mapGeoJson.features[k].properties.ISO).toLowerCase() ||
        String(me.data[j][me.series_keys.indexOf('name')]).toLowerCase() ==
          String(mapGeoJson.features[k].properties.NAME_1).toLowerCase()
      ) {
        let random = colorPalette[getRandomInt(0, colorPalette.length)];
        let colorResult = random == null ? colorPalette[colorPalette.length - 1] : random;
        colorRandom.push(colorResult);
        datamap.push({
          id: mapGeoJson.features[k].properties.ISO,
          name: mapGeoJson.features[k].properties.NAME_1,
          value: obj['value'],
          label: {
            show: true,
            color: coloring[idxMaxVal], //colorResult,
          },
        });
        // map pie
        obj['label'] = {
          show: true,
          color: coloring[idxMaxVal], //colorResult,
        };
        obj['id'] = mapGeoJson.features[k].properties.ISO;
        obj['name'] = mapGeoJson.features[k].properties.NAME_1;
        datamapPie.push(obj);
        mapGeoJson.features[k].properties['name'] = mapGeoJson.features[k].properties.NAME_1;
        // visual map
        visualMapColor.push(hexToRgbA(coloring[idxMaxVal]));
        visualMapText.push(mapGeoJson.features[k].properties.NAME_1);
        break;
      } else {
      }
    }
  }
  let seriesData = [];
  // ini.scatterDatas = datamapPie;
  var title = data.form_data.select_country2 != 'Pemilu - overlay' ? data.form_data.select_country2 : 'indonesia';
  var min = Math.min.apply(null, dataPieValue);
  var max = Math.max.apply(null, dataPieValue);

  echarts.registerMap(title, mapGeoJson);
  seriesData.push({
    name: 'Peta ' + title + 'Maps',
    type: 'map',
    mapType: title, // add map type should be registered
    geoIndex: 0,
    data: datamapPie,
    // add
    zoom: 1.25,
    roam: false,
    aspectScale: 1,
  });

  return {
    grid: {
      left: '0%',
      right: '5%',
      bottom: '5%',
      containLabel: true,
    },
    title: {
      text: title,
      subtext: '',
      left: 'center',
    },
    legend: {
      show: true,
      type: 'scroll',
      orient: 'horizontal',
      left: 'left',
      width: 275,
      data: me.group,
      textStyle: {
        fontSize: 10,
      },
    },
    tooltip: {
      trigger: 'item',
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
      formatter: function (params) {
        if (params['data'] == undefined) return '0';
        if (data.form_data.number_format) {
          var f = d3.format(data.form_data.number_format);
          let html = '';
          params['data'].data.map((v, idx) => {
            html +=
              v.name + ' <span style="color:' + v.color + '">\u25CF</span> ' + data.form_data.y_axis_format == 'd'
                ? convertNum(v.value)
                : f(v.value) + '<br>';
          });
          return params['data'].name +
            '<br>' +
            html +
            '<br/><hr style="border-top: 1px solid red;"/>Total: ' +
            data.form_data.y_axis_format ==
            'd'
            ? convertNum(params['data'].value)
            : f(params['data'].value) + '<br>';
        }
        let html = '';
        params['data'].data.map((v, idx) => {
          html += v.name + ' <span style="color:' + v.color + '">\u25CF</span> ' + v.value + '<br>';
        });
        return (
          params['data'].name +
          '<br>' +
          html +
          '<br/><hr style="border-top: 1px solid red;"/>Total: ' +
          params['data'].value
        );
      },
    },
    toolbox: {
      show: true,

      left: 'right',
      top: 'top',
      feature: {},
    },
    visualMap: {
      show: false,
      min: 0,
      max: coloring.length - 1, //ini.total,
      left: 'left',

      text: me.group, //visualMapText,
      seriesIndex: [0],
      inRange: {
        color: coloring,
      },
      calculable: true,
    },
    geo: {
      map: title,
      show: true,
      roam: false,
      zoom: 1.2,
      aspectScale: 1,
      seriesIndex: [0],
    },
    series: seriesData,
  };
};

export const helperVisualType = (
  visualType,
  form_data,
  since,
  until,
  column_styles,
  page_sort,
  onChangeFilterComparison,
  records
) => {
  let data = {};
  switch (visualType) {
    case 'table':
    case 'pivot_table':
      if (form_data.granularity_sqla === 'null') {
        form_data.granularity_sqla = null;
        form_data.time_grain_sqla = null;
        form_data.filter_date = null;
        form_data.filter_date_type = null;
        form_data.initial_date_filter = null;
      }
      data = {
        groupby: form_data.groupby || [],
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        sort_aggregate_column: form_data.sort_aggregate_column || 'option1',
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        metrics: form_data.metrics != undefined && form_data.metrics.length > 0 ? form_data.metrics : [],
        granularity: form_data.granularity,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        number_format: form_data.number_format || ',',
        initial_date_filter: form_data.initial_date_filter || null,
        chart_on_click_specific_col: form_data.chart_on_click_specific_col || '',
        chart_on_click_col: form_data.chart_on_click_col || false,
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        column_styles: column_styles,
        granularity_sqla: form_data.granularity_sqla || null,
      };
      if (visualType == 'pivot_table') {
        data = {
          ...form_data,
          viz_type: visualType || 'pivot_table',
          columns: form_data.columns || [],
          pandas_aggfunc: form_data.pandas_aggfunc || 'sum',
          pivot_margins: form_data.pivot_margins || true,
          combine_metric: form_data.combine_metric || false,
          granularity_sqla: form_data.granularity_sqla || null,
        };
      } else {
        page_sort = [];
        if (form_data.table_filter_column !== undefined) {
          if (form_data.table_filter_column !== null) {
            page_sort = [];
            let sortOrder = form_data.table_sort_desc === true ? 'desc' : 'asc';
            let sortObj = {
              column: form_data.table_filter_column,
              order: sortOrder,
            };
            page_sort.push(sortObj);
          }
        }
        if (form_data.timeseries_limit_metric !== undefined) {
          if (form_data.timeseries_limit_metric !== null && form_data.timeseries_limit_metric !== 'undefined') {
            page_sort = [];
            let sortOrder = form_data.order_desc === true ? 'desc' : 'asc';
            let sortObj = {
              column: form_data.timeseries_limit_metric,
              order: sortOrder,
            };
            page_sort.push(sortObj);
          }
        }
        data = {
          ...form_data,
          granularity_sqla: form_data.granularity_sqla,
          viz_type: visualType || 'table',
          include_time: form_data.include_time || false,
          timeseries_limit_metric: String(form_data.timeseries_limit_metric) || null,
          order_desc: form_data.order_desc,
          all_columns: form_data.all_columns || [],
          order_by_cols: form_data.order_by_cols || [],
          table_timestamp_format: form_data.table_timestamp_format || '%d/%m/%Y',
          page_length: Number(form_data.page_length) || 0,
          include_search: form_data.include_search,
          search_multi_columns: form_data.search_multi_columns || false,
          table_filter_column: form_data.table_filter_column || null,
          table_sort_desc: form_data.table_sort_desc || false,
          table_grid_view: form_data.table_grid_view || false,
          search_main_column: form_data.search_main_column || false,
          search_second_column: form_data.search_second_column || false,
          gridview_list_view: form_data.gridview_list_view || false,
          table_font_size: form_data.table_font_size || 10,
          table_font_family: form_data.table_font_family || null,
          show_total_numeric_column: form_data.show_total_numeric_column || false,
          having_filters: form_data.having_filters || [],
          page_size: Number(form_data.page_size) || 10,
          page_index: form_data.page_index || 1,
          page_sort: page_sort || [],
          static_number: form_data.static_number || false,
          notifications: form_data.notifications || [],
          custom_column_format_arr: form_data.custom_column_format_arr || [],
          custom_width_column_arr: form_data.custom_width_column_arr || [],
        };
      }
      break;
    case 'table_comparison':
      if (form_data.base_columns && form_data.base_columns.length == 0) onChangeFilterComparison();
      data = {
        viz_type: visualType,
        groupby: form_data.groupby || [],
        number_format: form_data.number_format || ',',
        comparison: form_data.comparison || [],
        base_columns: form_data.base_columns || [],
        filter_comparison: form_data.filter_comparison || 'latest_date',
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        y_axis_format: form_data.y_axis_format || ',',
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        notifications: form_data.notifications || [],
        custom_column_format_arr: form_data.custom_column_format_arr || [],
        initial_date_filter: form_data.initial_date_filter || null,
      };
      break;
    case 'pie':
      data = {
        viz_type: visualType,
        metrics: form_data.metrics,
        tooltips: form_data.tooltips || [],
        hide_label: form_data.hide_label || false,
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        groupby: form_data.groupby || [],
        y_axis_format: form_data.y_axis_format || ',',
        limit: Number(form_data.limit) || 10,
        pie_label_type: form_data.pie_label_type || 'key',
        donut: form_data.donut,
        show_legend: form_data.show_legend,
        labels_outside: form_data.labels_outside,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        notifications2: form_data.notifications2 || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        pie_sort_asc: form_data.pie_sort_asc || false,
      };
      break;
    case 'horizontal_bar':
    case 'dist_bar':
      data = {
        metrics: form_data.metrics,
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        show_label_sort: form_data.show_label_sort,
        tooltips: form_data.tooltips || [],
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        groupby: form_data.groupby || [],
        columns: form_data.columns || [],
        row_limit: Number(form_data.row_limit) || 100,
        rotate_axis: form_data.rotate_axis || null,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        show_legend: form_data.show_legend || false,
        show_bar_value: form_data.show_bar_value || false,
        bar_stacked: form_data.bar_stacked || false,
        count_stacked: form_data.count_stacked || false,
        order_desc: form_data.order_desc || false,
        y_axis_format: form_data.y_axis_format || ',',
        format_number_tooltips: form_data.format_number_tooltips || ',',
        y_axis_2_format: form_data.y_axis_2_format || ',',
        bottom_margin: form_data.bottom_margin || 'auto',
        x_axis_label: form_data.x_axis_label,
        y_axis_label: form_data.y_axis_label,
        y_axis_line: form_data.y_axis_line,
        reduce_x_ticks: form_data.reduce_x_ticks,
        show_controls: form_data.show_controls,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        with_line: form_data.with_line || false,
        style_tooltips: form_data.style_tooltips || 'item',
        show_dual_axis_line: form_data.show_dual_axis_line || false,
        initial_date_filter: form_data.initial_date_filter || null,
        y_axis_bounds_min: form_data.y_axis_bounds_min || null,
        y_axis_bounds_max: form_data.y_axis_bounds_max || null,
        notifications: form_data.notifications || [],
        show_only_one_value: form_data.show_only_one_value || false,
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        is_first_axis_label: form_data.is_first_axis_label || false,
        is_axis_reverse: form_data.is_axis_reverse || false,
        set_default_series: form_data.set_default_series || null,
      };
      if (form_data.with_line) {
        data = {
          ...form_data,
          line_metric: form_data.line_metric || '',
          line_const: Number(form_data.line_const) || undefined,
        };
      }
      if (visualType == 'horizontal_bar') {
        data = {
          ...form_data,
          viz_type: visualType || 'horizontal_bar',
          horizontal_bar_sorter: form_data.horizontal_bar_sorter || 'value',
          left_margin: form_data.left_margin || 'auto',
          x_as_date: form_data.x_as_date || false,
        };
      } else {
        data = {
          ...form_data,
          viz_type: visualType || 'dist_bar',
          dist_bar_sorter: form_data.dist_bar_sorter || 'value',
          x_as_date: form_data.x_as_date || false,
        };
      }
      break;
    case 'histogram':
      data = {
        viz_type: visualType,
        range: form_data.range,
        domain: form_data.domain,
        column_target: form_data.column_target,
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        chart_tooltip: form_data.chart_tooltip || false,
        link_to: form_data.link_to || null,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        show_border: form_data.show_border || false,
        is_filterable: form_data.is_filterable,
        label_initial_date: form_data.label_initial_date || true,
        x_axis_label: form_data.x_axis_label,
        y_axis_label: form_data.y_axis_label,
        y_axis_format: form_data.y_axis_format || ',',
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
      };
      break;

    case 'osmmap':
      data = {
        viz_type: visualType,
        range: form_data.range,
        domain: form_data.domain,
        column_target: form_data.column_target,
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        chart_tooltip: form_data.chart_tooltip || false,
        link_to: form_data.link_to || null,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        show_border: form_data.show_border || false,
        is_filterable: form_data.is_filterable,
        label_initial_date: form_data.label_initial_date || true,
        x_axis_label: form_data.x_axis_label,
        y_axis_label: form_data.y_axis_label,
        y_axis_format: form_data.y_axis_format || ',',
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
      };
      break;
    case 'country_map2':
    case 'country_map':
    case 'map':
      data = {
        viz_type: visualType || 'country_map',
        entity: form_data.entity || null,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        metric: form_data.metric != undefined && form_data.metric.length > 0 ? form_data.metric : null,
        number_format: form_data.number_format || ',',
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        show_legend: form_data.show_legend || false,
      };

      if (visualType == 'country_map') {
        data = {
          ...form_data,
          viz_type: visualType || 'country_map',
          select_country: form_data.select_country || 'indonesia',
          select_province: form_data.select_country == 'indonesia' ? form_data.select_province : null,
          map_label:
            form_data.map_label != undefined && form_data.map_label.length > 0 ? form_data.map_label : null || null,
          tooltips: form_data.tooltips != undefined && form_data.tooltips.length > 0 ? form_data.tooltips : [] || [],
          lower_limit: form_data.lower_limit || 1000,
          upper_limit: form_data.upper_limit || 100000,
          hide_label: form_data.hide_label || false,
          hide_value: form_data.hide_value || false,
          is_point_tooltip: form_data.is_point_tooltip || false,
          point_comparations: form_data.point_comparations || [],
          map_label_reference: form_data.map_label_reference || null,
          notifications: form_data.notifications || [],
          notifications2: form_data.notifications2 || [],
        };
      } else {
        data = {
          ...form_data,
          viz_type: visualType || 'country_map2',
          columns: form_data.columns || null,
          groupby: form_data.groupby || null,
          select_country2: form_data.select_country2 || 'indonesia',
          show_label: form_data.show_label || false,
          hide_overlay: form_data.hide_overlay || false,
        };
      }
      break;
    case 'gauge':
      data = {
        viz_type: visualType,
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        color_scheme: form_data.color_scheme || 'palette1',
        metric: form_data.metric || null,
        custom_condition: form_data.custom_condition || false,
        show_needle: form_data.show_needle,
        custom_condition_arr: form_data.custom_condition_arr || [],
        show_label: form_data.show_label,
        show_axis_label: form_data.show_axis_label,
        max_value: form_data.max_value,
        number_format: form_data.number_format || ',',
        format_number_id: form_data.format_number_id || false,
        gauge_label_type: form_data.gauge_label_type || 'value',
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
      };
      break;
    case 'big_number_total':
      data = {
        viz_type: visualType,
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        filter_item: form_data.filter_item || null,
        filter_label: form_data.filter_label || null,
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        label_position: form_data.label_position || 'bottom',
        show_border: form_data.show_border || false,
        is_filterable: form_data.is_filterable,
        label_initial_date: form_data.label_initial_date || false,
        border_position: form_data.border_position || null,
        // metric: form_data.metric || 'count',
        metric: form_data.metrics || 'count',
        zoomsize: Number(form_data.zoomsize) || 5,
        subheader: form_data.subheader || null,
        subheaderfontsize: Number(form_data.subheaderfontsize) || 2,
        y_axis_format: form_data.y_axis_format || ',',
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
      };
      break;

    case 'word_cloud':
      data = {
        viz_type: visualType,
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        series: form_data.series != undefined && form_data.series.length > 0 ? form_data.series : null,
        metric: form_data.metric != undefined && form_data.metric.length > 0 ? form_data.metric : null,
        row_limit: Number(form_data.row_limit) || 100,
        rotation: form_data.rotation || 'random',
        spiral: form_data.spiral,
        scale: form_data.scale,
        font_size: form_data.font_size,
        font_family: form_data.font_family,
        one_word_perline: form_data.one_word_perline,
        distance: form_data.distance,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
      };
      break;
    case 'line':
    case 'dual_line':
      data = {
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        x_axis_format: form_data.x_axis_format || '%d/%m/%Y',
        y_axis_format: form_data.y_axis_format || null,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        area_chart: form_data.area_chart,
        stack_area_chart: form_data.stack_area_chart,
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        style_tooltips: form_data.style_tooltips || 'item',
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
      };

      if (visualType == 'dual_line') {
        data = {
          ...form_data,
          viz_type: visualType || 'dual_line',
          metric: form_data.metric != undefined && form_data.metric.length > 0 ? form_data.metric : null,
          metric_2: form_data.metric_2 || null,
          y_axis_2_format: form_data.y_axis_2_format || ',',
        };
      } else {
        data = {
          ...form_data,
          viz_type: visualType || 'line',
          metrics:
            form_data.metrics != undefined && form_data.metrics.length > 0
              ? typeof form_data.metrics[0] == 'string'
                ? form_data.metrics
                : form_data.metrics
              : null,
          groupby: form_data.groupby || [],
          timeseries_limit_metric:
            form_data.timeseries_limit_metric != 'null' ? form_data.timeseries_limit_metric : null || null,
          limit: Number(form_data.limit) || 1000,
          row_limit: Number(form_data.row_limit) || 1000,
          order_desc: form_data.order_desc,
          show_brush: form_data.show_brush || false,
          show_legend: form_data.show_legend || false,
          rich_tooltip: form_data.rich_tooltip || true,
          show_markers: form_data.show_markers || false,
          line_interpolation: form_data.line_interpolation || 'basic',
          contribution: form_data.contribution || false,
          x_axis_label: form_data.x_axis_label || null,
          bottom_margin: form_data.bottom_margin || 'auto',
          x_axis_showminmax: form_data.x_axis_showminmax || true,
          y_axis_label: form_data.y_axis_label || null,
          left_margin: form_data.left_margin || 'auto',
          y_axis_showminmax: form_data.y_axis_showminmax || true,
          y_log_scale: form_data.y_log_scale || false,
          y_axis_bounds: [form_data.y_axis_bounds_min || null, form_data.y_axis_bounds_max || null],
          y_axis_bounds_min: form_data.y_axis_bounds_min,
          y_axis_bounds_max: form_data.y_axis_bounds_max,
        };
      }
      break;
    case 'markup':
      let all_columns = [];
      if (form_data.groupby_arrs != undefined && form_data.groupby_arrs.length > 0) {
        for (let item of form_data.groupby_arrs) {
          all_columns.push(item.value);
        }
      }
      data = {
        viz_type: visualType || 'markup',
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        markup_type: form_data.markup_type || 'markdown',
        code: form_data.code || null,
        groupby_arrs: form_data.groupby_arrs || [],
        row_limit: 1,
        groupby: [],
        metrics: [],
        all_columns: all_columns,
        records: records != undefined && records.length > 0 ? records : form_data.records || [],
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        initial_date_filter: form_data.initial_date_filter || null,
        since: since || null,
        until: until || null,
      };
      if (form_data.markup_type == 'html')
        data = {
          ...form_data,
          js: form_data.js,
          css: form_data.css,
        };
      break;
    case 'bubble':
      data = {
        viz_type: visualType || 'buble',
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        series: form_data.series || null,
        entity: form_data.entity || null,
        size: form_data.size || null,
        limit: Number(form_data.limit) || 1000,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        show_legend: form_data.show_legend || true,
        max_bubble_size: form_data.max_bubble_size || '25',
        x_axis_label: form_data.x_axis_label || null,
        left_margin: form_data.left_margin || 'auto',
        x: form_data.x || null,
        x_axis_format: form_data.x_axis_format || ',',
        x_log_scale: form_data.x_log_scale || false,
        x_axis_showminmax: form_data.x_axis_showminmax || true,
        y_axis_label: form_data.y_axis_label || null,
        bottom_margin: form_data.bottom_margin || 'auto',
        y: form_data.y || null,
        y_axis_format: form_data.y_axis_format || ',',
        y_log_scale: form_data.y_log_scale || false,
        y_axis_showminmax: form_data.y_axis_showminmax || true,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
      };
      break;
    case 'filter_box':
      data = {
        viz_type: visualType || 'filter_box',
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        groupby: form_data.groupby || [],
        metric: form_data.metric != undefined && form_data.metric.length > 0 ? form_data.metric : null,
        date_filter: form_data.date_filter || false,
        instant_filtering: form_data.instant_filtering,
        alphabet_filter: form_data.alphabet_filter || false,
        filter_control_alphabetic: form_data.filter_control_alphabetic || null,
        filter_checkbox: form_data.filter_checkbox || false,
        filter_control_checkbox: form_data.filter_control_checkbox || null,
        filter_checkbox_columns: form_data.groupby != undefined ? form_data.groupby.map((s) => [s, s]) : [],
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        filter_alignment_horizontal: form_data.filter_alignment_horizontal || false,
        initial_date_filter: form_data.initial_date_filter || null,
      };
      break;
    case 'predictive':
      data = {
        viz_type: 'scatter',
        viz_type2: visualType || 'predictive',
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        pred_line: form_data.pred_line || null,
        pred_upper: form_data.pred_upper || null,
        pred_lower: form_data.pred_lower || null,
        pred_actual: form_data.pred_actual || null,
        x_axis_label: form_data.x_axis_label || null,
        bottom_margin: form_data.bottom_margin || 'auto',
        x_axis_showminmax: form_data.x_axis_showminmax || true,
        x_axis_format: form_data.x_axis_format || null,
        y_axis_label: form_data.y_axis_label || null,
        left_margin: form_data.left_margin || 'auto',
        y_axis_showminmax: form_data.y_axis_showminmax || true,
        y_log_scale: form_data.y_log_scale || false,
        y_axis_format: form_data.y_axis_format || null,
        y_axis_bounds: [form_data.y_axis_bounds_min || null, form_data.y_axis_bounds_max || null],
        y_axis_bounds_min: form_data.y_axis_bounds_min,
        y_axis_bounds_max: form_data.y_axis_bounds_max,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
      };
      break;
    case 'scatter':
      data = {
        datasource: form_data.datasource,
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        viz_type: visualType || 'scatter',
        metric: form_data.metrics || null,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        pred_line: form_data.pred_line || null,
        pred_upper: form_data.pred_upper || null,
        pred_lower: form_data.pred_lower || null,
        pred_actual: form_data.pred_actual || null,
        x_axis_label: form_data.x_axis_label || null,
        left_margin: form_data.left_margin || 'auto',
        x: form_data.x || null,
        x_axis_format: form_data.x_axis_format || ',',
        x_log_scale: form_data.x_log_scale || false,
        x_bounds: form_data.y_bounds || true,
        y_axis_label: form_data.y_axis_label || null,
        bottom_margin: form_data.bottom_margin || 'auto',
        y: form_data.y || null,
        y_axis_format: form_data.y_axis_format || ',',
        y_log_scale: form_data.y_log_scale || false,
        y_bounds: form_data.y_bounds || true,
        x_axis_showminmax: form_data.x_axis_showminmax || true,
        y_axis_showminmax: form_data.y_axis_showminmax || true,
        y_axis_bounds: [form_data.y_axis_bounds_min || null, form_data.y_axis_bounds_max || null],
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        datasource_name: form_data.datasource_name,
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
      };
      break;
    case 'treemap':
      data = {
        viz_type: visualType || 'treemap',
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        groupby: form_data.groupby || [],
        metrics:
          form_data.metrics != undefined && form_data.metrics.length > 0
            ? typeof form_data.metrics[0] == 'string'
              ? [form_data.metrics[0]]
              : form_data.metrics[0]
            : null,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        treemap_ratio: Number(form_data.treemap_ratio) || 1,
        number_format: form_data.number_format || '.3s',
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
      };
      break;
    case 'sunburst':
      data = {
        viz_type: 'sunburst', //"treemap",
        viz_type2: visualType || 'sunburst',
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        groupby: form_data.groupby || [],
        metrics: form_data.metrics != undefined && form_data.metrics.length > 0 ? form_data.metrics : null,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        treemap_ratio: Number(form_data.treemap_ratio) || 1,
        number_format: form_data.number_format || '.3s',
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        hide_label: form_data.hide_label || false,
        labels_outside: form_data.labels_outside || false,
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
      };
      break;
    case 'directed_force':
      data = {
        viz_type: visualType || 'directed_force',
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        groupby: form_data.groupby || [],
        group: form_data.group || undefined,
        metric: form_data.metric != undefined && form_data.metric.length > 0 ? form_data.metric : null,
        show_label: form_data.show_label,
        format_number_id: form_data.format_number_id || false,
        number_format: form_data.number_format || ',',
        show_legend: form_data.show_legend || false,
        show_row_limit: form_data.show_row_limit || false,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        row_limit: Number(form_data.row_limit) || 100,
        link_length: form_data.link_length || null,
        charge: form_data.charge || null,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        colorpickers2: form_data.colorpickers2 || [],
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
      };
      break;
    case 'heatmap':
      data = {
        viz_type: 'heatmap', //"dist_bar",
        metrics: form_data.metrics || [],
        heat_map: {
          metric_heat_map: form_data.heat_map.metric_heat_map || null,
          x_heat_map: form_data.heat_map.x_heat_map || null,
          y_heat_map: form_data.heat_map.y_heat_map || null,
          sort_asc_x: form_data.heat_map.sort_asc_x && true,
          sort_asc_y: form_data.heat_map.sort_asc_y && true,
          limit_x: form_data.heat_map.limit_x || 10,
          limit_y: form_data.heat_map.limit_y || 10,
        },
        all_columns: [],
        hide_title: form_data.hide_title,
        show_label: form_data.show_label || false,
        hide_background: form_data.hide_background,
        show_label_sort: form_data.show_label_sort,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        groupby: form_data.groupby || [],
        row_limit: Number(form_data.row_limit) || 100,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        show_legend: form_data.show_legend || false,
        order_desc: form_data.order_desc || false,
        format_number_tooltips: form_data.format_number_tooltips || ',',
        bottom_margin: form_data.bottom_margin || 'auto',
        x_axis_label: form_data.x_axis_label,
        y_axis_label: form_data.y_axis_label,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        number_format: form_data.number_format || ',',
        format_number_id: form_data.format_number_id || false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        style_tooltips: form_data.style_tooltips || 'item',
        initial_date_filter: form_data.initial_date_filter || null,
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        is_axis_reverse: form_data.is_axis_reverse || false,
        left_margin: form_data.left_margin || 'auto',
        x_as_date: form_data.x_as_date || false,
      };
      break;
    case 'box_plot':
      data = {
        viz_type: visualType,
        viz_type2: visualType || 'box_plot',
        groupby: form_data.groupby || [],
        columns: form_data.columns || [],
        metrics:
          form_data.metrics != undefined && form_data.metrics.length > 0
            ? typeof form_data.metrics[0] == 'string'
              ? form_data.metrics
              : form_data.metrics
            : null,
        order_desc: form_data.order_desc,
        limit: Number(form_data.limit) || 1000,
        row_limit: Number(form_data.row_limit) || 1000,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        colorpickers: form_data.colorpickers || [],
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        show_brush: form_data.show_brush || false,
        y_axis_bounds: [form_data.y_axis_bounds_min || null, form_data.y_axis_bounds_max || null],
        y_axis_bounds_min: form_data.y_axis_bounds_min,
        y_axis_bounds_max: form_data.y_axis_bounds_max,
        format_number_id: form_data.format_number_id || false,
        y_axis_format: form_data.y_axis_format || null,
        format_number_tooltips: form_data.format_number_tooltips || ',',
        bottom_margin: form_data.bottom_margin || 'auto',
        left_margin: form_data.left_margin || 'auto',
        x_axis_label: form_data.x_axis_label || null,
        y_axis_label: form_data.y_axis_label || null,
        show_legend: form_data.show_legend || false,
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_width: form_data.legend_width || 400,
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: since || null,
        until: until || null,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || null,
        filters: form_data.filters || [],
      };
      break;
  }
  return data;
};

export const helperValidateFormVisualType = (visualType, isFormValidate, form_data, messages, validate_messages) => {
  switch (visualType) {
    case 'table_comparison':
      isFormValidate = true;
      if (!form_data.groupby || form_data.groupby.length == 0) {
        validate_messages.push(messages.CHART.MSG_QGR);
      }

      if (!form_data.base_columns || form_data.base_columns.length == 0) {
        validate_messages.push(messages.CHART.MSG_BCR);
      }
      if (form_data.comparison) {
        if (!form_data.comparison || !form_data.comparison) {
          validate_messages.push(messages.CHART.MSG_QCR);
        }
      }
      break;
    case 'heatmap':
      isFormValidate = true;

      if (!form_data.heat_map.metric_heat_map || form_data.heat_map.metric_heat_map.length == 0) {
        validate_messages.push(messages.CHART.MSG_HMR);
      }
      if (!form_data.heat_map.x_heat_map || form_data.heat_map.x_heat_map.length == 0) {
        validate_messages.push(messages.CHART.MSG_FXR);
      }

      if (!form_data.heat_map.y_heat_map || form_data.heat_map.y_heat_map.length == 0) {
        validate_messages.push(messages.CHART.MSG_FXY);
      }

      break;
    case 'histogram':
      isFormValidate = true;
      if (!form_data.column_target || form_data.column_target.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }
      break;
    //bar chart -> distribution chart
    case 'dist_bar':
    //bar chart -> horizontal bar chart
    case 'horizontal_bar':
      isFormValidate = true;
      if (!form_data.groupby || form_data.groupby.length == 0) {
        validate_messages.push(messages.CHART.MSG_QGR);
      }

      if (!form_data.metrics || form_data.metrics.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }
      if (form_data.with_line) {
        if (!form_data.line_metric && !form_data.line_const) {
          validate_messages.push(messages.CHART.MSG_QLMR);
        }
      }
      break;

    //Bubble Chart
    case 'bubble':
      isFormValidate = true;
      if (!form_data.series || form_data.series.length == 0) {
        validate_messages.push(messages.CHART.MSG_QSR);
      }

      if (!form_data.entity || form_data.entity.length == 0) {
        validate_messages.push(messages.CHART.MSG_QER);
      }

      if (!form_data.size || form_data.size.length == 0) {
        validate_messages.push(messages.CHART.MSG_COBSR);
      }

      if (!form_data.x || form_data.x.length == 0) {
        validate_messages.push(messages.CHART.MSG_COXR);
      }

      if (!form_data.y || form_data.y.length == 0) {
        validate_messages.push(messages.CHART.MSG_COYR);
      }

      break;

    //Line Chart
    case 'line':
      isFormValidate = true;
      if (!form_data.metrics || form_data.metrics.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }

      if (!form_data.granularity_sqla || form_data.granularity_sqla.length == 0) {
        validate_messages.push(messages.CHART.MSG_TCR);
      }

      if (!form_data.time_grain_sqla || form_data.time_grain_sqla.length == 0) {
        validate_messages.push(messages.CHART.MSG_TGR);
      }

      break;
    //Dual Axis
    case 'dual_line':
      isFormValidate = true;
      if (!form_data.metric || form_data.metric.length == 0) {
        validate_messages.push(messages.CHART.MSG_COYX1R);
      }

      if (!form_data.metric_2 || form_data.metric_2.length == 0) {
        validate_messages.push(messages.CHART.MSG_COYX2R);
      }

      if (!form_data.granularity_sqla || form_data.granularity_sqla.length == 0) {
        validate_messages.push(messages.CHART.MSG_TCR);
      }

      if (!form_data.time_grain_sqla || form_data.time_grain_sqla.length == 0) {
        validate_messages.push(messages.CHART.MSG_TGR);
      }

      break;
    case 'box_plot':
      isFormValidate = true;
      if (!form_data.metrics || form_data.metrics.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }
      break;
    //filter box
    case 'filter_box':
      isFormValidate = true;
      /**
       * yang dulu menggunakan metric
       * perubahan sekarang ke mertics
       */
      if (!form_data.metric || form_data.metric.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }
      // if (!form_data.metrics || form_data.metrics.length == 0) {
      //   validate_messages.push(messages.CHART.MSG_QVR);
      // }
      if (!form_data.groupby || form_data.groupby == 0) {
        validate_messages.push(messages.CHART.MSG_FC);
      }

      break;

    //directed force
    case 'directed_force':
      isFormValidate = true;
      if (!form_data.metric || form_data.metric.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }

      if (!form_data.groupby || form_data.groupby.length == 0) {
        validate_messages.push(messages.CHART.MSG_QSTR);
      } else if (form_data.groupby.length < 2 || form_data.groupby.length > 2) {
        validate_messages.push(messages.CHART.MSG_QSTR2);
      }
      break;

    //overlay map
    case 'country_map2':
      isFormValidate = true;
      if (!form_data.entity || form_data.entity.length == 0) {
        validate_messages.push(messages.CHART.MSG_QISO);
      }
      /**
       * yang dulu menggunakan form_data.metric
       * sekarang diubah menjadi form_data.metrics semua
       */
      if (!form_data.metric || form_data.metric.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }

      if (!form_data.columns || form_data.columns.length == 0) {
        validate_messages.push(messages.CHART.MSG_QCNR);
      }

      if (!form_data.groupby || form_data.groupby.length == 0) {
        validate_messages.push(messages.CHART.MSG_QGR);
      }
      break;

    //Country Map
    case 'country_map':
      isFormValidate = true;
      if (!form_data.entity || form_data.entity.length == 0) {
        validate_messages.push(messages.CHART.MSG_QISO);
      }
      /**
       * yang dulu menggunakan form_data.metric
       * sekarang diubah menjadi form_data.metrics semua
       */
      if (!form_data.metric || form_data.metric.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }
      break;

    //Big number & Gauge
    case 'gauge':
    case 'big_number_total':
      isFormValidate = true;
      /**
       * yang dulu menggunakan form_data.metric
       * sekarang diubah menjadi form_data.metrics semua
       */
      if (!form_data.metric || form_data.metric.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }
      if (visualType == 'big_number_total' && form_data.chart_on_click && !form_data.filter_label) {
        validate_messages.push(messages.CHART.MSG_COLF);
      }
      if (visualType == 'big_number_total' && form_data.chart_on_click && !form_data.filter_item) {
        validate_messages.push(messages.CHART.MSG_COFIF);
      }
      if (visualType == 'gauge' && (!form_data.max_value || !form_data.max_value)) {
        validate_messages.push(messages.CHART.MSG_COMV);
      }

      break;

    //Pie chart
    case 'pie':
      isFormValidate = true;
      if (!form_data.groupby || form_data.groupby.length == 0) {
        validate_messages.push(messages.CHART.MSG_QGR);
      }

      if (!form_data.metrics || form_data.metrics.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }
      break;

    //Predictive chart
    case 'predictive':
      isFormValidate = true;
      if (!form_data.pred_line || form_data.pred_line.length == 0) {
        validate_messages.push(messages.CHART.MSG_QMR);
      }

      if (!form_data.pred_upper || form_data.pred_upper.length == 0) {
        validate_messages.push(messages.CHART.MSG_QUVR);
      }

      if (!form_data.pred_lower || form_data.pred_lower.length == 0) {
        validate_messages.push(messages.CHART.MSG_QLVR);
      }

      if (!form_data.granularity_sqla || form_data.granularity_sqla.length == 0) {
        validate_messages.push(messages.CHART.MSG_TCR);
      }

      if (!form_data.time_grain_sqla || form_data.time_grain_sqla.length == 0) {
        validate_messages.push(messages.CHART.MSG_TGR);
      }
      break;

    //Treemap
    case 'treemap':
    case 'sunburst':
      isFormValidate = true;
      if (!form_data.groupby || form_data.groupby.length == 0) {
        validate_messages.push(messages.CHART.MSG_QGR);
      }

      if (!form_data.metrics || form_data.metrics.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }
      break;
    //Pivot Table
    case 'pivot_table':
      isFormValidate = true;
      if (!form_data.groupby || form_data.groupby.length == 0) {
        validate_messages.push(messages.CHART.MSG_QGR);
      }

      if (!form_data.metrics || form_data.metrics.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }

      if (!form_data.columns || form_data.columns.length == 0) {
        validate_messages.push(messages.CHART.MSG_QCOLR);
      }

      break;

    //Table
    case 'table':
      isFormValidate = true;
      if (
        (!form_data.groupby || form_data.groupby.length == 0) &&
        (!form_data.all_columns || form_data.all_columns.length == 0)
      ) {
        validate_messages.push(messages.CHART.MSG_QGR + ' / ' + messages.CHART.MSG_QVR);
      } else if (form_data.groupby != undefined && form_data.groupby.length != 0) {
        if (!form_data.metrics || form_data.metrics.length == 0) {
          validate_messages.push(messages.CHART.MSG_QVR);
        } else if (form_data.all_columns != undefined && form_data.all_columns.length != 0) {
          validate_messages.push(messages.CHART.MSG_QGR + ' / ' + messages.CHART.MSG_QVR);
        }
      }

      if (form_data.table_grid_view) {
        if (form_data.metrics.length > 1) {
          validate_messages.push(messages.CHART.MSG_QVGV);
        }

        if (form_data.all_columns.length > 2) {
          validate_messages.push(messages.CHART.MSG_QVGV2);
        }
      }
      break;

    //Word Cloud
    case 'word_cloud':
      isFormValidate = true;
      if (!form_data.series || form_data.series.length == 0) {
        validate_messages.push(messages.CHART.MSG_QGR);
      }

      if (!form_data.metric || form_data.metric.length == 0) {
        validate_messages.push(messages.CHART.MSG_QVR);
      }
      break;

    // Markup
    case 'markup':
      isFormValidate = true;
      if (!form_data.code || form_data.code.length == 0) {
        validate_messages.push(messages.CHART.MSG_COCCR);
      }
      break;
  }
  return validate_messages;
};

export const initialFormDataHelper = (local) => {
  let form_data = {};
  form_data = {
    sort_asc_x: local.sort_asc_x || null,
    sort_asc_y: local.sort_asc_y || null,
    heat_map: local.heat_map,
    is_first_axis_label: local.is_first_axis_label || false,
    is_axis_reverse: local.is_axis_reverse || false,
    set_default_series: local.set_default_series || [],
    filter_comparison: local.filter_comparison || 'latest_date',
    comparison: local.comparison || [],
    base_columns: local.base_columns || [],
    style_tooltips: local.style_tooltips || 'item',
    with_line: local.with_line || false,
    line_metric: local.line_metric || '',
    line_const: local.line_const,
    hide_title: local.hide_title,
    hide_background: local.hide_background,
    show_label_sort: local.show_label_sort,
    sort_aggregate_column: local.sort_aggregate_column || 'option1',
    choose_pallete: local.choose_pallete || 'default_pallete',
    legend_width: local.legend_width || 400,
    legend_position: local.legend_position || 'top',
    legend_type: local.legend_type || 'scroll',
    legend_orient: local.legend_orient || 'horizontal',
    show_label: local.show_label || false,
    label_position: local.label_position || 'bottom',
    show_border: local.show_border || false,
    is_filterable: local.is_filterable || true,
    label_initial_date: local.label_initial_date || false,
    border_position: local.border_position || null,
    with_animation: local.with_animation || false,
    curvenes: local.curvenes || null,
    repulsion: local.repulsion || 100,
    layout_directed: local.layout_directed || 'force',
    rotate_axis: local.rotate_axis || 0,
    list_rotate_axis: local.list_rotate_axis,
    zoomsize: local.zoomsize || 4,
    subheaderfontsize: local.subheaderfontsize || 2,
    color_scheme: local.color_scheme,
    horizontal_bar_sorter: local.horizontal_bar_sorter || 'value',
    filters: local.filters || [],
    colorpickers: local.colorpickers || [],
    colorpickers2: local.colorpickers2 || [],
    groupby_arrs: local.groupby_arrs || [],
    area_chart: local.area_chart || false,
    stack_area_chart: local.stack_area_chart || false,
    having_filters: local.having_filters,
    palleteDefault: local.palleteDefault || 'palette1',
    component: local.component || [],
    columns: local.columns || [],
    records: local.records || [],
    table_timestamp_format: local.table_timestamp_format || '%d/%m/%Y',
    include_search: local.include_search || false,
    search_multi_columns: local.search_multi_columns || false,
    static_number: local.static_number || false,
    include_time: local.include_time || false,
    order_desc: local.order_desc || false,
    page_length: local.page_length,
    granularity_sqla: local.granularity_sqla || null,
    since: local.since,
    until: local.until,
    size_to: local.size_to || 60,
    subheader: local.subheader || null,
    rotation: local.rotation || 'random',
    shape: local.shape || 'diamond',
    x_axis_format: local.x_axis_format,
    y_axis_2_format: local.y_axis_2_format || '.3s',
    metric_2: local.metric_2 || null,
    list_shape: local.list_shape,
    list_rotation: local.list_rotation,
    metric: local.metric || [],
    errorMessage: local.errorMessage,
    showVerboseName: local.showVerboseName,
    loaded: local.loaded,
    errors: local.errors,
    getRenderChart: local.getRenderChart,
    datasource: local.datasource,
    notGroupBy: local.notGroupBy,
    leftSidebar: local.leftSidebar,
    rightSidebar: local.rightSidebar,
    chartName: local.chartName,
    metrics: local.metrics || [],
    groupby: local.groupby || [],
    show_legend: local.show_legend || false,
    show_row_limit: local.show_row_limit || false,
    row_limit: local.row_limit || 1000,
    time_grain_sqla: local.time_grain_sqla || null,
    mapGeoJSON: local.mapGeoJSON,
    myHtml: local.myHtml,
    typeHtml: local.typeHtml,
    order_by_cols: local.order_by_cols || [],
    granularity: local.granularity || null,
    druid_time_origin: local.druid_time_origin || null,
    table_filter_column: local.table_filter_column || null,
    table_sort_desc: local.table_sort_desc || false,
    table_grid_view: local.table_grid_view || false,
    search_main_column: local.search_main_column || false,
    search_second_column: local.search_second_column || false,
    gridview_list_view: local.gridview_list_view || false,
    table_font_size: local.table_font_size || 10,
    table_font_family: local.table_font_family || null,
    pie_label_type: local.pie_label_type || 'key_value',
    donut: local.donut || false,
    labels_outside: local.labels_outside || false,
    pie_sort_asc: local.pie_sort_asc || false,
    all_columns: local.all_columns || [],
    show_bar_value: local.show_bar_value || false,
    bar_stacked: local.bar_stacked || false,
    count_stacked: local.count_stacked || false,
    show_only_one_value: local.show_only_one_value || false,
    dist_bar_sorter: local.dist_bar_sorter || null,
    x_as_date: local.x_as_date || false,
    show_total_numeric_column: local.show_total_numeric_column,
    page_size: local.page_size || 10,
    page_index: local.page_index || 1,
    page_sort: local.page_sort || [],
    y_axis_format: local.y_axis_format || '.3s',
    format_number_tooltips: local.format_number_tooltips || '.3s',
    bottom_margin: local.bottom_margin || 'auto',
    x_axis_label: local.x_axis_label || null,
    y_axis_label: local.y_axis_label || null,
    y_axis_line: local.y_axis_line || null,
    reduce_x_ticks: local.reduce_x_ticks || false,
    show_controls: local.show_controls || false,
    entity: local.entity || null,
    map_label: local.map_label || null,
    tooltips: local.tooltips || [],
    select_country: local.select_country || 'indonesia',
    select_province: local.select_province,
    number_format: local.number_format || '.3s',
    linear_color_scheme: local.linear_color_scheme,
    lower_limit: local.lower_limit || 1000,
    upper_limit: local.upper_limit || 100000,
    timeseries_limit_metric: local.timeseries_limit_metric || null,
    show_brush: local.show_brush || false,
    rich_tooltip: local.rich_tooltip || true,
    show_markers: local.show_markers || false,
    line_interpolation: local.line_interpolation || 'basic',
    list_line_interpolation: local.list_line_interpolation || [],
    contribution: local.contribution || false,
    x_axis_showminmax: local.x_axis_showminmax || true,
    left_margin: local.left_margin || 'auto',
    y_axis_showminmax: local.y_axis_showminmax || true,
    y_log_scale: local.y_log_scale || false,
    y_axis_bounds: local.y_axis_bounds || [null, null],
    code2: local.code2,
    js: local.js,
    css: local.css,
    markup_type: local.markup_type || 'html',
    series: local.series || null,
    size: local.size,
    max_bubble_size: local.max_bubble_size || '25',
    x: local.x,
    x_log_scale: local.x_log_scale || false,
    y: local.y,
    viz_type: local.viz_type,
    row: local.row,
    onKeyupDebounce: local.onKeyupDebounce,
    slice: local.slice,
    searchText: local.searchText,
    visualType: local.visualType,
    visualName: local.visualName,
    formData: local.formData,
    sharedData: local.sharedData,
    slice_id: local.slice_id,
    y_axis_bounds_min: local.y_axis_bounds_min || null,
    y_axis_bounds_max: local.y_axis_bounds_max || null,
    pred_actual: local.pred_actual || null,
    pred_line: local.pred_line || null,
    pred_upper: local.pred_upper || null,
    pred_lower: local.pred_lower || null,
    date_filter: local.date_filter || false,
    instant_filtering: local.instant_filtering || false,
    alphabet_filter: local.alphabet_filter || false,
    filter_control_alphabetic: local.filter_control_alphabetic || null,
    filter_checkbox: local.filter_checkbox || false,
    filter_control_checkbox: local.filter_control_checkbox || null,
    filter_alignment_horizontal: local.filter_alignment_horizontal || false,
    treemap_ratio: local.treemap_ratio,
    link_length: local.link_length,
    charge: local.charge,
    chart_on_click: local.chart_on_click,
    link_to: local.link_to,
    format_number_id: local.format_number_id || false,
    custom_condition: local.custom_condition,
    custom_condition_arr: local.custom_condition_arr,
    list_gauge_label_type: local.list_gauge_label_type,
    max_value: local.max_value,
    show_axis_label: local.show_axis_label || false,
    gauge_label_type: local.gauge_label_type || 'value',
    show_needle: local.show_needle || true,
    hide_overlay: local.hide_overlay || false,
    hide_label: local.hide_label || false,
    hide_value: local.hide_value || false,
    is_point_tooltip: local.is_point_tooltip || false,
    point_comparations: local.point_comparations || [],
    filterDateList: local.filterDateList || [],
    filterDateTypeList: local.filterDateTypeList || [],
    // filterDateTypeListComparison: local.filterDateTypeListComparison || [],
    columnFormatList: local.columnFormatList || [],
    fontFamilyList: local.fontFamilyList || [],
    filter_item: local.filter_item || null,
    filter_label: local.filter_label || null,
    filter_date: local.filter_date || null,
    filter_date_type: local.filter_date_type || null,
    filter_checkbox_columns: local.filter_checkbox_columns || [],
    alphabetic_filter_columns: local.alphabetic_filter_columns || [],
    initialFilterDateList: local.initialFilterDateList || [],
    initial_date_filter: local.initial_date_filter || null,
    notifications: local.notifications || null,
    notifications2: local.notifications2 || null,
    chart_on_click_specific_col: local.chart_on_click_specific_col || false,
    chart_on_click_col: local.chart_on_click_col || null,
    custom_column_format_arr: local.custom_column_format_arr || [],
    table_selected_column: local.table_selected_column || [],
    initial_chart_blank: local.initial_chart_blank || false,
    is_hide_togle_filter: local.is_hide_togle_filter || false,
    hide_date_picker: local.hide_date_picker || false,
    custom_width_column_arr: local.custom_width_column_arr || [],
    // table_selected_column_width: local.table_selected_column_width || [],
    // column_width_arr: local.column_width_arr || [],
    spiral: local.spiral,
    scale: local.scale,
    font_size: local.font_size,
    font_family: local.font_family,
    one_word_perline: local.one_word_perline,
    orientation: local.orientation,
    orientation_from: local.orientation_from,
    orientation_to: local.orientation_to,
    distance: local.distance,
    column_styles: local.column_styles,
  };
  return form_data;
};

export const helperRequireFormValue = (visualType, chartLinks, form_data, data_exploreJson) => {
  let isRun = false;
  var granularity_sqla = data_exploreJson.form_data.granularity_sqla;
  let groupby = data_exploreJson.form_data.groupby;
  let metrics = data_exploreJson.form_data.metrics;
  let metric = data_exploreJson.form_data.metric;
  let series = data_exploreJson.form_data.series;
  let entity = data_exploreJson.form_data.entity;
  let size = data_exploreJson.form_data.size;
  let metric_2 = data_exploreJson.form_data.metric_2;
  let x = data_exploreJson.form_data.x;
  let y = data_exploreJson.form_data.y;
  let columns = data_exploreJson.form_data.columns;
  let all_columns = data_exploreJson.form_data.all_columns;
  let pred_line = data_exploreJson.form_data.pred_line;
  let pred_upper = data_exploreJson.form_data.pred_upper;
  let pred_lower = data_exploreJson.form_data.pred_lower;
  form_data.groupby = [];
  form_data.metrics = [];
  form_data.all_columns = [];
  form_data.metric = null;
  form_data.series = null;
  form_data.entity = null;
  form_data.size = null;
  form_data.x = null;
  form_data.y = null;
  form_data.metric_2 = null;
  form_data.pred_line = null;
  form_data.pred_upper = null;
  form_data.pred_lower = null;
  switch (visualType) {
    case 'table_comparison':
      if (chartLinks.datasource && chartLinks.datasource.gb_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.gb_cols.length; i++) {
          if (groupby.includes(chartLinks.datasource.gb_cols[i][0])) {
            isRun = true;
            form_data.groupby.push(chartLinks.datasource.gb_cols[i][0]);
          }
        }
      }
      break;
    case 'dist_bar':
    case 'horizontal_bar':
      if (chartLinks.datasource && chartLinks.datasource.gb_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.gb_cols.length; i++) {
          if (groupby.includes(chartLinks.datasource.gb_cols[i][0])) {
            isRun = true;
            form_data.groupby.push(chartLinks.datasource.gb_cols[i][0]);
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metrics.includes(chartLinks.datasource.metrics[i].metric_name)) {
            isRun = true;
            form_data.metrics.push(chartLinks.datasource.metrics[i].metric_name);
          }
        }
      }
      break;

    case 'bubble':
      if (chartLinks.datasource && chartLinks.datasource.gb_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.gb_cols.length; i++) {
          if (series == chartLinks.datasource.gb_cols[i][0]) {
            isRun = true;
            form_data.series = chartLinks.datasource.gb_cols[i][0];
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.filterable_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.filterable_cols.length; i++) {
          if (entity == chartLinks.datasource.filterable_cols[i][0]) {
            isRun = true;
            form_data.entity = chartLinks.datasource.filterable_cols[i][0];
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics_combo.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics_combo.length; i++) {
          if (size == chartLinks.datasource.metrics_combo[i][0]) {
            isRun = true;
            form_data.size = chartLinks.datasource.metrics_combo[i][0];
          }
          if (x == chartLinks.datasource.metrics_combo[i][0]) {
            isRun = true;
            form_data.x = chartLinks.datasource.metrics_combo[i][0];
          }
          if (y == chartLinks.datasource.metrics_combo[i][0]) {
            isRun = true;
            form_data.y = chartLinks.datasource.metrics_combo[i][0];
          }
        }
      }
      break;

    case 'line':
      form_data.granularity_sqla = null;
      if (chartLinks.datasource && chartLinks.datasource.granularity_sqla.length > 0) {
        for (let i = 0; i < chartLinks.datasource.granularity_sqla.length; i++) {
          if (granularity_sqla == chartLinks.datasource.granularity_sqla[i][0]) {
            isRun = true;
            form_data.granularity_sqla = chartLinks.datasource.granularity_sqla[i][0];
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metrics.includes(chartLinks.datasource.metrics[i].metric_name)) {
            isRun = true;
            form_data.metrics.push(chartLinks.datasource.metrics[i].metric_name);
          }
        }
      }

      break;

    case 'dual_line':
      form_data.granularity_sqla = null;
      if (chartLinks.datasource && chartLinks.datasource.granularity_sqla.length > 0) {
        for (let i = 0; i < chartLinks.datasource.granularity_sqla.length; i++) {
          if (granularity_sqla == chartLinks.datasource.granularity_sqla[i][0]) {
            isRun = true;
            form_data.granularity_sqla = chartLinks.datasource.granularity_sqla[i][0];
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metric == chartLinks.datasource.metrics[i].metric_name) {
            isRun = true;
            form_data.metric = chartLinks.datasource.metrics[i].metric_name;
          }
          if (metric_2 == chartLinks.datasource.metrics[i].metric_name) {
            isRun = true;
            form_data.metric_2 = chartLinks.datasource.metrics[i].metric_name;
          }
        }
      }

      break;

    case 'filter_box':
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metric == chartLinks.datasource.metrics[i].metric_name) {
            isRun = true;
            form_data.metric = chartLinks.datasource.metrics[i].metric_name;
          }
        }
      }
      break;

    case 'directed_force':
      if (chartLinks.datasource && chartLinks.datasource.gb_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.gb_cols.length; i++) {
          if (groupby.includes(chartLinks.datasource.gb_cols[i][0])) {
            isRun = true;
            form_data.groupby.push(chartLinks.datasource.gb_cols[i][0]);
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metric == chartLinks.datasource.metrics[i].metric_name) {
            isRun = true;
            form_data.metric = chartLinks.datasource.metrics[i].metric_name;
          }
        }
      }
      break;

    case 'country_map2':
      form_data.columns = '';
      columns = '';
      if (chartLinks.datasource && chartLinks.datasource.filterable_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.filterable_cols.length; i++) {
          if (entity == chartLinks.datasource.filterable_cols[i][0]) {
            isRun = true;
            form_data.entity = chartLinks.datasource.filterable_cols[i][0];
          }
          if (columns == chartLinks.datasource.filterable_cols[i][0]) {
            isRun = true;
            form_data.columns = chartLinks.datasource.filterable_cols[i][0];
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metric == chartLinks.datasource.metrics[i].metric_name) {
            isRun = true;
            form_data.metric = chartLinks.datasource.metrics[i].metric_name;
          }
        }
      }

      if (chartLinks.datasource && chartLinks.datasource.gb_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.gb_cols.length; i++) {
          if (groupby.includes(chartLinks.datasource.gb_cols[i][0])) {
            isRun = true;
            form_data.groupby.push(chartLinks.datasource.gb_cols[i][0]);
          }
        }
      }

      break;

    case 'country_map':
      if (chartLinks.datasource && chartLinks.datasource.filterable_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.filterable_cols.length; i++) {
          if (entity == chartLinks.datasource.filterable_cols[i][0]) {
            isRun = true;
            form_data.entity = chartLinks.datasource.filterable_cols[i][0];
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metric == chartLinks.datasource.metrics[i].metric_name) {
            isRun = true;
            form_data.metric = chartLinks.datasource.metrics[i].metric_name;
          }
        }
      }
      break;

    case 'gauge':
    case 'big_number_total':
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metric == chartLinks.datasource.metrics[i].metric_name) {
            isRun = true;
            form_data.metric = chartLinks.datasource.metrics[i].metric_name;
          }
        }
      }
      break;

    case 'pie':
      if (chartLinks.datasource && chartLinks.datasource.gb_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.gb_cols.length; i++) {
          if (groupby.includes(chartLinks.datasource.gb_cols[i][0])) {
            isRun = true;
            form_data.groupby.push(chartLinks.datasource.gb_cols[i][0]);
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metrics.includes(chartLinks.datasource.metrics[i].metric_name)) {
            isRun = true;
            form_data.metrics.push(chartLinks.datasource.metrics[i].metric_name);
          }
        }
      }
      break;

    case 'predictive':
      if (chartLinks.datasource && chartLinks.datasource.metrics_combo.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics_combo.length; i++) {
          if (pred_line == chartLinks.datasource.metrics_combo[i][0]) {
            isRun = true;
            form_data.pred_line = chartLinks.datasource.metrics_combo[i][0];
          }
          if (pred_upper == chartLinks.datasource.metrics_combo[i][0]) {
            isRun = true;
            form_data.pred_upper = chartLinks.datasource.metrics_combo[i][0];
          }
          if (pred_lower == chartLinks.datasource.metrics_combo[i][0]) {
            isRun = true;
            form_data.pred_lower = chartLinks.datasource.metrics_combo[i][0];
          }
        }
      }

      form_data.granularity_sqla = '';
      if (chartLinks.datasource && chartLinks.datasource.granularity_sqla.length > 0) {
        for (let i = 0; i < chartLinks.datasource.granularity_sqla.length; i++) {
          if (granularity_sqla == chartLinks.datasource.granularity_sqla[i][0]) {
            isRun = true;
            form_data.granularity_sqla = chartLinks.datasource.granularity_sqla[i][0];
          }
        }
      }

      break;

    case 'treemap':
      if (chartLinks.datasource && chartLinks.datasource.gb_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.gb_cols.length; i++) {
          if (groupby.includes(chartLinks.datasource.gb_cols[i][0])) {
            isRun = true;
            form_data.groupby.push(chartLinks.datasource.gb_cols[i][0]);
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metrics.includes(chartLinks.datasource.metrics[i].metric_name)) {
            isRun = true;
            form_data.metrics.push(chartLinks.datasource.metrics[i].metric_name);
          }
        }
      }
      break;

    case 'pivot_table':
      if (chartLinks.datasource && chartLinks.datasource.gb_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.gb_cols.length; i++) {
          if (groupby.includes(chartLinks.datasource.gb_cols[i][0])) {
            isRun = true;
            form_data.groupby.push(chartLinks.datasource.gb_cols[i][0]);
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metrics.includes(chartLinks.datasource.metrics[i].metric_name)) {
            isRun = true;
            form_data.metrics.push(chartLinks.datasource.metrics[i].metric_name);
          }
        }
      }
      form_data.columns = [];
      columns = [];
      if (chartLinks.datasource && chartLinks.datasource.gb_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.gb_cols.length; i++) {
          if (columns.includes(chartLinks.datasource.gb_cols[i][0])) {
            isRun = true;
            form_data.columns.push(chartLinks.datasource.gb_cols[i][0]);
          }
        }
      }
      break;

    case 'table':
      if (form_data.table_grid_view) {
        if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
          for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
            if (metrics.includes(chartLinks.datasource.metrics[i].metric_name)) {
              isRun = true;
              form_data.metrics.push(chartLinks.datasource.metrics[i].metric_name);
            }
          }
        }
        if (chartLinks.datasource && chartLinks.datasource.columns.length > 0) {
          for (let i = 0; i < chartLinks.datasource.columns.length; i++) {
            if (all_columns.includes(chartLinks.datasource.columns[i][0])) {
              isRun = true;
              form_data.all_columns.push(chartLinks.datasource.columns[i][0]);
            }
          }
        }
      }
      break;

    case 'word_cloud':
      if (chartLinks.datasource && chartLinks.datasource.gb_cols.length > 0) {
        for (let i = 0; i < chartLinks.datasource.gb_cols.length; i++) {
          if (series == chartLinks.datasource.gb_cols[i][0]) {
            isRun = true;
            form_data.series = chartLinks.datasource.gb_cols[i][0];
          }
        }
      }
      if (chartLinks.datasource && chartLinks.datasource.metrics.length > 0) {
        for (let i = 0; i < chartLinks.datasource.metrics.length; i++) {
          if (metric == chartLinks.datasource.metrics[i].metric_name) {
            isRun = true;
            form_data.metric = chartLinks.datasource.metrics[i].metric_name;
          }
        }
      }
      break;
  }
  return isRun;
};

export const helperLoopingCollorPallete = async (colorPaletteJsonFileArgs, colorPaletteArgs) => {
  for (var i = 0; i < colorPaletteJsonFileArgs.length; i++) {
    colorPaletteArgs['palette' + (i + 1)] = colorPaletteJsonFileArgs[i];
  }
  return colorPaletteArgs;
};

export const helperGetExplorerChart = async (
  exploreArgs,
  exploreJsonUrl,
  tokenArgs,
  exploreUrl,
  service,
  fdata,
  param?,
  message?
) => {
  if (tokenArgs) {
    exploreUrl = exploreUrl ? `${exploreUrl}&token=${tokenArgs}` : exploreUrl;
    exploreJsonUrl = exploreJsonUrl ? `${exploreJsonUrl}&token=${tokenArgs}` : exploreJsonUrl;
  }
  let exploreResult = await service.loadPostData(exploreUrl ? exploreUrl : exploreJsonUrl, exploreUrl ? {} : param);
  exploreArgs = exploreResult ? (exploreResult.response ? exploreResult.response : exploreResult) : exploreResult;

  // if (tokenArgs) {
  //   // let exploreResult = await loadChartData(
  //   //   exploreUrl ? exploreUrl : exploreJsonUrl,
  //   //   exploreUrl ? {} : param,
  //   //   message,
  //   //   service
  //   // );
  //   let exploreResult = await service.loadPostData(exploreUrl ? exploreUrl : exploreJsonUrl, exploreUrl ? {} : param);
  //   exploreArgs = exploreResult ? (exploreResult.response ? exploreResult.response : exploreResult) : exploreResult;
  // } else {
  //   // let exploreResult = await loadChartData(
  //   //   exploreUrl ? exploreUrl : exploreJsonUrl,
  //   //   exploreUrl ? {} : param,
  //   //   message,
  //   //   service
  //   // );
  //   let exploreResult = await service.loadPostData(exploreUrl ? exploreUrl : exploreJsonUrl, exploreUrl ? {} : param);
  //   exploreArgs = exploreResult ? (exploreResult.response ? exploreResult.response : exploreResult) : exploreResult;
  //   if (exploreArgs) {
  //     exploreArgs.form_data = fdata ? fdata : exploreArgs.form_data;
  //   }
  // }
  return exploreArgs;
};

// helper untuk generate static url explorer
// argumen id adalah id dari chart
export const helperGenerateExploreUrl = (id) => {
  return `/${urlExplore}?form_data=%7B%22slice_id%22%3A${id}%7D`;
};

// helper untuk generate static url explorer JSON
// argumen id adalah id dari chart
// "/api/v2": API versi 2
export const helperGenerateExploreJsonUrl = (id) => {
  // return `/api/chart/explore_json/?form_data=%7B%22slice_id%22%3A${id}%7D`;
  return `/api/v2/chart/explore_json/?form_data=%7B%22slice_id%22%3A${id}%7D`;
};

export const loadPostExploreJsonResult = async (exploreJsonUrl, param, service) => {
  let exploreJsonResult = await service.loadPostData(exploreJsonUrl, param);
  return exploreJsonResult
    ? exploreJsonResult.response
      ? exploreJsonResult.response
      : exploreJsonResult
    : exploreJsonResult;
};

export const parseDate = (dateStr) => {
  if (isNaN(dateStr)) {
    //Checked for numeric
    var dt = new Date(dateStr);
    if (dateStr && dateStr.length) {
      if (dateStr.length < 9) {
        return false;
      }
    } else {
      return false;
    }

    if (Array.isArray(dateStr)) {
      return false;
    }

    let arr_date = dateStr.split('/');
    if (arr_date.length === 1) {
      arr_date = dateStr.split('-');
      if (arr_date.length <= 1) return false;
    }
    let new_text = arr_date[1] + '/' + arr_date[2] + '/' + arr_date[0];
    let isDate = new Date(new_text);
    if (String(isDate) != 'Invalid Date') {
      return true;
    }

    if (dateStr.length > 0) {
      if (dateStr.substring(0, 1) == "'" || dateStr.substring(0, 1) == '"') {
        return false;
      }
      if (dateStr.substring(13, 14) === ':' && dateStr.substring(16, 17) === ':') {
        return true;
      }
      if (dateStr.substring(10, 11) === 'T' && dateStr.substring(19, 20) === 'Z') {
        return true;
      }
    }

    if (isNaN(dt.getTime())) {
      //Checked for date
      return false; //Return string if not date.
    } else {
      return true; //Return date **Can do further operations here.
    }
  } else {
    return false; //Return string as it is number
  }
};

export const reformatNumber = (num, numberFormat, explore, d3) => {
  let formaterNumber = formatNumberIdFile;
  let locale =
    explore.form_data.format_number_id === 'true' ? 'ID' : explore.form_data.format_number_id === true ? 'ID' : 'EN';
  // let locale = data.form_data.format_number_id ? 'ID' : 'EN';
  d3.formatDefaultLocale(formaterNumber[locale]);

  let localeStr;
  if (locale === 'ID') localeStr = 'id-ID';
  else if (locale === 'EN') localeStr = 'en-US';
  let value = reformat_number(d3, num, numberFormat, locale, localeStr);
  return value;
};

export const setInitialDate = (
  param,
  explore,
  isDateFilter,
  isInitialDateFilter,
  isOnDateFilter,
  exploreArgs,
  sinceDate,
  untilDate
) => {
  if (
    explore !== undefined &&
    explore.form_data.initial_date_filter != null &&
    explore.form_data.initial_date_filter !== '' &&
    explore.form_data.initial_date_filter !== undefined &&
    !isDateFilter &&
    !isInitialDateFilter &&
    !isOnDateFilter
  ) {
    let initialDate =
      explore.form_data.initial_date_filter === 'current_date' ? moment(new Date()) : moment(explore.latest_date);
    let result;
    if (explore.form_data.filter_date_type === 'date')
      result = date_picker_handler(moment, undefined, initialDate, 'date_picker');
    else if (explore.form_data.filter_date_type === 'month')
      result = month_picker_handler(moment, undefined, initialDate, 'date_picker');
    else if (explore.form_data.filter_date_type === 'year')
      result = year_picker_handler(moment, undefined, initialDate, 'date_picker');
    param.form_data.since = exploreArgs.form_data.since = sinceDate = result[0];
    param.form_data.until = exploreArgs.form_data.until = untilDate = result[1];
  }
  return param;
};

export const getUrl = (data) => {
  const [ds, dsType] = data.form_data.datasource.split('__');
  let exploreUrl = `${urlExplore}${dsType}/${ds}`;
  return exploreUrl;
};

export const customColorPalette = (colorPaletteArgs, colorPaletteJsonFile) => {
  let colorPalette = colorPaletteArgs;
  for (var i = 0; i < colorPaletteJsonFile.length; i++) {
    colorPalette['palette' + (i + 1)] = colorPaletteJsonFile[i];
  }
  return colorPalette;
};

export const helperGetData = async (url, service) => {
  let result = await service.getApi(url);
  return result.result.response ? result.result.response : result.result;
};

export const helperPostData = async (url, param, service) => {
  let result = await service.postApi(url, param);
  return result.result.response ? result.result.response : result.result;
};

export const findNestedObj = (entireObj, keyToFind, valToFind) => {
  let foundObj;
  JSON.stringify(entireObj, (_, nestedValue) => {
    if (nestedValue && nestedValue[keyToFind] === valToFind) {
      foundObj = { ...nestedValue };
      foundObj.expanded = !foundObj.expanded;
    }
    return nestedValue;
  });
  return foundObj;
};

export const handleExpandedNestedObject = (loop, item, id) => {
  let isFound = false;
  loop = loop.map((data) => {
    if (!isFound) {
      if (data.id === id) {
        data = item;
        isFound = true;
      } else {
        if (data.children && data.children.length > 0) {
          data.children = handleExpandedNestedObject(data.children, item, id);
        }
      }
    }

    return data;
  });
  console.log(loop);
  return loop;
};

export const handleMovedNestedObject = (loop, item, targetId, type?) => {
  loop = loop.map((data) => {
    if (data.id === targetId) {
      if (type === 'inside') {
        if (data.slug) {
          // data.children.push(item);
          data = { ...data, children: [ ...data.children, item ] };
        } else {
          data = {
            ...data,
            children: data.children.concat([item]),
          };
        }
      }
    } else {
      if (data.children.length > 0) {
        data.children = handleMovedNestedObject(data.children, item, targetId, type);
      }
    }
    return data;
  });

  if (type !== 'inside') {
    const targetIndex = loop.findIndex((c) => c.id === targetId);
    if (targetIndex > -1) {
      if (type == 'before') loop.splice(targetIndex, 0, item);
      else loop.splice(targetIndex + 1, 0, item);
    }
  }
  
  return loop;
};

export const removeChildren = (list: any, itemId: string) => {
  return list.map((data: any) => {
    if (data.children?.length > 0) {
      let children = data.children.filter((child: any) => child.id !== itemId);
      data = { ...data, children: removeChildren(children, itemId) };
    }

    return data;
  });
};

export const addChildren = (data) => {
  let obj = [];
  data.map((data) => {
    obj.push({ ...data, children: data.children ? addChildren(data.children) : [] });
  });
  return obj;
};

export const setUrlApplicationLogin = (value) => {
  return `/#/auth/application_login?slug=${value.slug}`;
};

export const findTypeCheckByUrl = () => {
  if (window.location.href.includes('application')) {
    return 'application';
  } else if (window.location.href.includes('dashboard/view')) {
    return 'dashboardview';
  } else if (window.location.href.includes('dashboard/view/shared')) {
    return 'dashboardview';
  } else if (window.location.href.includes('dashboardeditor')) {
    return 'dashboard';
  } else if (window.location.href.includes('dashboardvisualization')) {
    return 'dashboard';
  } else if (
    window.location.href.includes('datavisualization') ||
    window.location.href.includes('sharevisualization')
  ) {
    return 'chart';
  } else if (window.location.href.includes('app_preview')) {
    return 'app_preview';
  }
};

export const getURLParameter = (name) => {
  return (
    decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.href) || [null, ''])[1].replace(
        /\+/g,
        '%20'
      )
    ) || null
  );
};
