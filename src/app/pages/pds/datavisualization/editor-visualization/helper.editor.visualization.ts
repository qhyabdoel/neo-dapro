import { rest_api } from 'src/app/libs/configs';

export const topbar_option_chart = (topbarOptions, type, messages, translationService, formData, isSharePage?) => {
  return {
    menuName: messages ? messages.APPLICATIONS.APP : '',
    isTitle: type && ['app_preview', 'dashboardview'].includes(type) ? false : true,
    title: topbarOptions ? topbarOptions.title : '',

    isButtonToggleLeft: true,
    buttonToggleLeftName: '',
    buttonToggleLeftTooltip: '',

    isButtonToggleRight: true,
    buttonToggleRightname: '',
    buttonToggleRightTooltip: '',

    isButtonNew: type && ['app_preview', 'dashboardview'].includes(type) ? false : true,
    buttonNewName: '',
    buttonNewTooltip: '',

    isButtonEdit: type && type === 'dashboardview' && !isSharePage ? true : false,
    buttonEditName: '',
    buttonEditTooltip: '',

    isTitleOnSharePage: isSharePage,

    isButtonSave: type && ['app_preview', 'dashboardview'].includes(type) ? false : true,
    buttonSaveName: '',
    buttonSaveTooltip: '',

    isButtonPreview: type && ['chart', 'dashboardview', 'app_preview'].includes(type) ? false : true,
    buttonPreviewName: '',
    buttonPreviewTooltip: '',
    isButtonTabs: type && !['application', 'app_preview'].includes(type) ? true : false,
    buttonTabs:
      type && type !== 'application' && !isSharePage
        ? [
            {
              name: 'Chart',
              title: translationService.getSelectedLanguage() == 'en' ? 'CHART' : 'GRAFIK',
              isActive: type === 'chart',
              class: 'zmdi zmdi-chart',
              routerUrl: '/pds/listdatavisualization',
            },
            {
              name: 'Dashboard',
              title: translationService.getSelectedLanguage() == 'en' ? 'DASHBOARD' : 'DASBOR',
              isActive: type === 'dashboard' || type === 'dashboardview',
              class: 'zmdi zmdi-view-dashboard',
              routerUrl: '/pds/dashboardvisualization',
            },
          ]
        : [],
    chartAction: handleRightActioTopbar(type, formData, isSharePage),
  };
};

const static_chart_option = {
  name: 'chart',
  title: 'Chart',
  // subTitle: 'Chart',
  getUrl: `${rest_api.API_CHART_LIST}`,
  deleteUrl: `api/chart/delete`,
  deleteIdField: 'id',
  searchField: 'ds_name',
  infoLoopField: 'menu',
  translateHeaderTitle: 'MODULE.DATA_VISUAL.CHART.LEFT_BAR.CL',
  identity: 'id',
};

export const leftbar_option_chart = [
  {
    name: 'dataset',
    title: 'Dataset',
    //   subTitle: 'Dataset',
    getUrl: `${rest_api.CHART_DATASOURCE}`,
    deleteUrl: ``,
    deleteIdField: 'uid',
    searchField: 'query',
    infoLoopField: 'menu',
    translateHeaderTitle: 'MODULE.DATA_VISUAL.CHART.LEFT_BAR.DL',
  },
  static_chart_option,
];

export const leftbar_option_dashboard = [
  static_chart_option,
  {
    name: 'dashboard',
    title: 'Dashboard',
    //   subTitle: 'Dasboard',
    getUrl: `${rest_api.API_DASHBOARD_LIST}`,
    deleteUrl: `api/dashboard/delete`,
    deleteIdField: 'id',
    searchField: 'dashboard_title',
    infoLoopField: 'menu',
    translateHeaderTitle: 'MODULE.DATA_VISUAL.DASHBOARD.LEFT_BAR.DL',
    identity: 'slug',
  },
];

export const leftbar_option_application = [
  {
    name: 'application',
    title: 'Application',
    subTitle: 'Dasboard',
    getUrl: `${rest_api.API_APPLICATION_LIST}`,
    deleteUrl: `${rest_api.API_APPLICATION_LIST}/slug/delete`,
    deleteIdField: 'slug',
    searchField: 'title',
    infoLoopField: 'menu',
    translateHeaderTitle: 'MODULE.DATA_APPLICATIONS.LEFT_BAR.APP_LIST',
    identity: '__application_id',
  },
];

export const default_state = {
  title: 'Untitled',
  ds_name: '',
  slice_id: '',
  viz_type: '-',
};

export const setCreateDashboard = (item) => {
  return {
    addMode: true,
    charts: item.charts,
    dashboard: {},
    dashboard_title: item.dashboard_title,
    slug: '',
  };
};

export const setWorkspaceData = (item) => {
  return {
    id: item ? item.id || item.slice_id : null,
    charts: item ? item.charts || item.slices : [],
    dashboard_title: item ? item.dashboard_title : 'Untitled',
    position_json: item ? item.position_json : [],
    css: item ? item.css : '',
    slug: item ? item.slug : '',
    default_filters: item ? item.default_filters : [],
    duplicate_slices: item ? item.duplicate_slices : [],
    isFromSelected: item ? item.isFromSelected || false : false,
  };
};

const staticChartAction = [
  {
    name: 'download',
    tooltips: 'MODULE.DATA_VISUAL.CHART.TOP_BAR.DC',
    icon: 'zmdi zmdi-download f-12 ml-1',
    text: '',
  },
  {
    name: 'share_chart',
    tooltips: 'MODULE.DATA_VISUAL.CHART.TOP_BAR.SC',
    icon: 'zmdi zmdi-chart f-12 ml-1',
    text: '',
  },
  {
    name: 'share_api',
    tooltips: 'MODULE.DATA_VISUAL.CHART.TOP_BAR.SA',
    icon: 'zmdi zmdi-link f-12 ml-1',
    text: '',
  },
  {
    name: 'embed_chart',
    tooltips: 'MODULE.DATA_VISUAL.CHART.TOP_BAR.EC',
    icon: 'zmdi zmdi-code f-12 ml-1',
    text: '',
  },
];
const handleRightActioTopbar = (type, formData, isSharePage?) => {
  switch (type) {
    case 'chart':
      return formData?.viz_type === 'markup'
        ? [
            {
              name: 'share_chart',
              tooltips: 'MODULE.DATA_VISUAL.CHART.TOP_BAR.SC',
              icon: 'zmdi zmdi-chart f-12 ml-1',
              text: '',
            },
            {
              name: 'share_api',
              tooltips: 'MODULE.DATA_VISUAL.CHART.TOP_BAR.SA',
              icon: 'zmdi zmdi-link f-12 ml-1',
              text: '',
            },
            {
              name: 'embed_chart',
              tooltips: 'MODULE.DATA_VISUAL.CHART.TOP_BAR.EC',
              icon: 'zmdi zmdi-code f-12 ml-1',
              text: '',
            },
          ]
        : staticChartAction;
    case 'dashboard':
      return [
        {
          name: 'share',
          tooltips: 'MODULE.DATA_VISUAL.DASHBOARD.TOP_BAR.BTN_SHARE',
          icon: 'zmdi zmdi-link f-12 ml-1',
          text: 'MODULE.DATA_VISUAL.DASHBOARD.TOP_BAR.BTN_SHARE',
        },
      ];
    case 'dashboardview':
    case 'app_preview':
      return isSharePage
        ? [
            {
              name: 'fullscreen',
              tooltips: 'MODULE.DATA_VISUAL.DASHBOARD.SUB_TOP_BAR.BTN_FULLSCREEN',
              icon: 'zmdi zmdi-fullscreen f-14 ml-1',
              text: '',
            },
            {
              name: 'refresh',
              tooltips: 'MODULE.DATA_VISUAL.DASHBOARD.SUB_TOP_BAR.BTN_REFRESH_ALL',
              icon: 'zmdi zmdi-refresh-alt f-14 ml-1',
              text: '',
            },
          ]
        : [
            {
              name: 'fullscreen',
              tooltips: 'MODULE.DATA_VISUAL.DASHBOARD.SUB_TOP_BAR.BTN_FULLSCREEN',
              icon: 'zmdi zmdi-fullscreen f-14 ml-1',
              text: '',
            },
            {
              name: 'refresh',
              tooltips: 'MODULE.DATA_VISUAL.DASHBOARD.SUB_TOP_BAR.BTN_REFRESH_ALL',
              icon: 'zmdi zmdi-refresh-alt f-14 ml-1',
              text: '',
            },
            {
              name: 'copy',
              tooltips: 'MODULE.DATA_VISUAL.DASHBOARD.SUB_TOP_BAR.BTN_COPY_URL',
              icon: 'zmdi zmdi-copy f-12 ml-1',
              text: '',
            },
            {
              name: 'send_email',
              tooltips: 'MODULE.DATA_VISUAL.DASHBOARD.SUB_TOP_BAR.BTN_SEND_TO_EMAIL',
              icon: 'zmdi zmdi-email f-12 ml-1',
              text: '',
            },
          ];
    default:
      return [];
  }
};

export const initial_form_data = (form_data) => {
  return {
    datasource: form_data ? form_data.datasource || '' : undefined,
    datasource_name: form_data ? form_data.datasource_name || '' : undefined,
    sort_asc_x: form_data ? form_data.sort_asc_x || false : undefined,
    sort_asc_y: form_data ? form_data.sort_asc_y || false : undefined,
    heat_map: form_data
      ? form_data.heat_map || {
          limit_x: 10,
          limit_y: 10,
          metric_heat_map: null,
          sort_asc_x: true,
          sort_asc_y: true,
          x_heat_map: null,
          y_heat_map: null,
        }
      : undefined,
    is_first_axis_label: form_data ? form_data.is_first_axis_label || false : undefined,
    is_axis_reverse: form_data ? form_data.is_axis_reverse || false : undefined,
    set_default_series: form_data ? form_data.set_default_series || [] : undefined,
    filter_comparison: form_data ? form_data.filter_comparison || 'latest_date' : undefined,
    comparison: form_data ? form_data.comparison || [] : undefined,
    base_columns: form_data ? form_data.base_columns || [] : undefined,
    style_tooltips: form_data ? form_data.style_tooltips || 'item' : undefined,
    with_line: form_data ? form_data.with_line || false : undefined,
    line_metric: form_data ? form_data.line_metric || '' : undefined,
    line_const: form_data ? form_data.line_const || false : undefined,
    hide_title: form_data ? form_data.hide_title || false : undefined,
    hide_background: form_data ? form_data.hide_background || false : undefined,
    show_label_sort: form_data ? form_data.show_label_sort || false : undefined,
    // add show label field for directed force
    show_label: form_data ? form_data.show_label || true : undefined,
    // add group field for directed force
    group: form_data ? form_data.group || '' : undefined,
    sort_aggregate_column: form_data ? form_data.sort_aggregate_column || 'option1' : undefined,
    choose_pallete: form_data ? form_data.choose_pallete || 'default_pallete' : undefined,
    legend_width: form_data ? form_data.legend_width || 400 : undefined,
    legend_position: form_data ? form_data.legend_position || 'top' : undefined,
    legend_type: form_data ? setLegendType(form_data) : undefined,
    legend_orient: form_data ? form_data.legend_orient || 'horizontal' : undefined,
    label_position: form_data ? form_data.label_position || 'bottom' : undefined,
    show_border: form_data ? form_data.show_border || false : undefined,
    is_filterable: form_data ? form_data.is_filterable || true : undefined,
    label_initial_date: form_data ? form_data.label_initial_date || false : undefined,
    border_position: form_data ? form_data.border_position || undefined : undefined,
    with_animation: form_data ? form_data.with_animation || false : undefined,
    curvenes: form_data ? form_data.curvenes || undefined : undefined,
    repulsion: form_data ? form_data.repulsion || 100 : undefined,
    layout_directed: form_data ? form_data.layout_directed || 'force' : undefined,
    rotate_axis: form_data ? form_data.rotate_axis || 0 : undefined,
    list_rotate_axis: form_data ? form_data.list_rotate_axis || [] : undefined,
    zoomsize: form_data ? form_data.zoomsize || 4 : undefined,
    subheaderfontsize: form_data ? form_data.subheaderfontsize || 2 : undefined,
    color_scheme: form_data ? form_data.color_scheme || undefined : undefined,
    horizontal_bar_sorter: form_data ? form_data.horizontal_bar_sorter || 'value' : undefined,
    filters: form_data ? form_data.filters || [] : undefined,
    colorpickers: form_data ? form_data.colorpickers || [] : undefined,
    colorpickers2: form_data ? form_data.colorpickers2 || [] : undefined,
    groupby_arrs: form_data ? form_data.groupby_arrs || [] : undefined,
    area_chart: form_data ? form_data.area_chart || false : undefined,
    stack_area_chart: form_data ? form_data.stack_area_chart || false : undefined,
    having_filters: form_data ? form_data.having_filters || false : undefined,
    palleteDefault: form_data ? form_data.palleteDefault || 'palette1' : undefined,
    component: form_data ? form_data.component || [] : undefined,
    columns: form_data ? form_data.columns || [] : undefined,
    records: form_data ? form_data.records || [] : undefined,
    table_timestamp_format: form_data ? form_data.table_timestamp_format || '%d/%m/%Y' : undefined,
    include_search: form_data ? form_data.include_search || false : undefined,
    search_multi_columns: form_data ? form_data.search_multi_columns || false : undefined,
    static_number: form_data ? form_data.static_number || false : undefined,
    include_time: form_data ? form_data.include_time || false : undefined,
    order_desc: form_data ? form_data.order_desc || false : undefined,
    page_length: form_data ? form_data.page_length || 0 : undefined,
    granularity_sqla: form_data ? form_data.granularity_sqla || '' : undefined,
    since: form_data ? form_data.since || '' : undefined,
    until: form_data ? form_data.until || '' : undefined,
    size_to: form_data ? form_data.size_to || 60 : undefined,
    subheader: form_data ? form_data.subheader || undefined : undefined,
    rotation: form_data ? form_data.rotation || 'random' : undefined,
    shape: form_data ? form_data.shape || 'diamond' : undefined,
    x_axis_format: form_data ? form_data.x_axis_format || undefined : undefined,
    y_axis_2_format: form_data ? form_data.y_axis_2_format || '.3s' : undefined,
    metric_2: form_data ? form_data.metric_2 || undefined : undefined,
    list_shape: form_data ? form_data.list_shape || [] : undefined,
    list_rotation: form_data ? form_data.list_rotation || [] : undefined,
    metric: form_data ? form_data.metric || '' : undefined,
    errorMessage: form_data ? form_data.errorMessage || '' : undefined,
    showVerboseName: form_data ? form_data.showVerboseName || false : undefined,
    // loaded:form_data.loaded || false: undefined,
    // errors:form_data.errors || this.errors: undefined,
    // getRenderChart:form_data.getRenderChart || this.getRenderChart: undefined,
    // notGroupBy:form_data.notGroupBy || this.notGroupBy: undefined,
    // leftSidebar:form_data.leftSidebar || this.leftSidebar: undefined,
    // rightSidebar:form_data.rightSidebar || this.rightSidebar: undefined,
    // chartName:form_data.chartName || this.chartName: undefined,
    metrics: form_data ? form_data.metrics || [] : undefined,
    groupby: form_data ? form_data.groupby || [] : undefined,
    show_legend: form_data ? form_data.show_legend || false : undefined,
    show_row_limit: form_data ? form_data.show_row_limit || false : undefined,
    row_limit: form_data ? form_data.row_limit || 1000 : undefined,
    limit: form_data ? form_data.limit || 1000 : undefined,
    time_grain_sqla: form_data ? form_data.time_grain_sqla || '' : undefined,
    mapGeoJSON: form_data ? form_data.mapGeoJSON || undefined : undefined,
    myHtml: form_data ? form_data.myHtml || '' : undefined,
    typeHtml: form_data ? form_data.typeHtml || '' : undefined,
    order_by_cols: form_data ? form_data.order_by_cols || [] : undefined,
    granularity: form_data ? form_data.granularity || undefined : undefined,
    // druid_time_origin: form_data ? form_data.table_filter_column || undefined: undefined,
    table_filter_column: form_data ? form_data.table_filter_column || null : null,
    table_sort_desc: form_data ? form_data.table_sort_desc || false : undefined,
    table_grid_view: form_data ? form_data.table_grid_view || false : undefined,
    search_main_column: form_data ? form_data.search_main_column || false : undefined,
    search_second_column: form_data ? form_data.search_second_column || false : undefined,
    gridview_list_view: form_data ? form_data.gridview_list_view || false : undefined,
    table_font_size: form_data ? form_data.table_font_size || 10 : undefined,
    table_font_family: form_data ? form_data.table_font_family || undefined : undefined,
    pie_label_type: form_data ? form_data.pie_label_type || 'key_value' : undefined,
    donut: form_data ? form_data.donut || false : undefined,
    labels_outside: form_data ? form_data.labels_outside || false : undefined,
    pie_sort_asc: form_data ? form_data.pie_sort_asc || false : undefined,
    all_columns: form_data ? form_data.all_columns || [] : undefined,
    show_bar_value: form_data ? form_data.show_bar_value || false : undefined,
    bar_stacked: form_data ? form_data.bar_stacked || false : undefined,
    count_stacked: form_data ? form_data.count_stacked || false : undefined,
    show_only_one_value: form_data ? form_data.show_only_one_value || false : undefined,
    dist_bar_sorter: form_data ? form_data.dist_bar_sorter || undefined : undefined,
    x_as_date: form_data ? form_data.x_as_date || false : undefined,
    show_total_numeric_column: form_data ? form_data.show_total_numeric_column || false : undefined,
    page_size: form_data ? form_data.page_size || 10 : undefined,
    page_index: form_data ? form_data.page_index || 1 : undefined,
    page_sort: form_data ? form_data.page_sort || [] : undefined,
    y_axis_format: form_data ? form_data.y_axis_format || form_data.y_axis_format || '.3s' : undefined,
    format_number_tooltips: form_data ? form_data.format_number_tooltips || '.3s' : undefined,
    bottom_margin: form_data ? form_data.bottom_margin || 'auto' : undefined,
    x_axis_label: form_data ? form_data.x_axis_label || undefined : undefined,
    y_axis_label: form_data ? form_data.y_axis_label || undefined : undefined,
    y_axis_line: form_data ? form_data.y_axis_line || undefined : undefined,
    // reduce_x_ticks: form_data ? form_data.reduce_x_ticks || false: undefined,
    // show_controls: form_data ? form_data.show_controls || false: undefined,
    entity: form_data ? form_data.entity || undefined : undefined,
    map_label: form_data ? form_data.map_label || undefined : undefined,
    tooltips: form_data ? form_data.tooltips || [] : undefined,
    select_country: form_data ? form_data.select_country || 'indonesia' : undefined,
    select_province: form_data ? form_data.select_province || '' : undefined,
    number_format: form_data ? form_data.number_format || '.3s' : undefined,
    // linear_color_scheme: this.linear_color_scheme: undefined,
    // lower_limit: this.lower_limit || 1000: undefined,
    // upper_limit: this.upper_limit || 100000: undefined,
    timeseries_limit_metric: form_data ? form_data.timeseries_limit_metric || null : null,
    // show_brush: this.show_brush || false: undefined,
    // rich_tooltip: this.rich_tooltip || true: undefined,
    show_markers: form_data ? form_data.show_markers || false : undefined,
    line_interpolation: form_data ? form_data.line_interpolation || 'basic' : undefined,
    // list_line_interpolation: this.list_line_interpolation || []: undefined,
    // contribution: this.contribution || false: undefined,
    // x_axis_showminmax: this.x_axis_showminmax || true: undefined,
    // left_margin: this.left_margin || 'auto': undefined,
    // y_axis_showminmax: this.y_axis_showminmax || true: undefined,
    // y_log_scale: this.y_log_scale || false: undefined,
    // y_axis_bounds: this.y_axis_bounds || [undefined: undefined, undefined]: undefined,
    // code2: this.code2: undefined,
    js: form_data ? form_data.js || '' : undefined,
    css: form_data ? form_data.css || '' : undefined,
    code: form_data ? form_data.code || '' : undefined,
    markup_type: form_data ? form_data.markup_type || 'html' : undefined,
    series: form_data ? form_data.series || undefined : undefined,
    size: form_data ? form_data.size || undefined : undefined,
    max_bubble_size: form_data ? form_data.max_bubble_size || '25' : undefined,
    x: form_data ? form_data.x || undefined : undefined,
    x_log_scale: form_data ? form_data.x_log_scale || false : undefined,
    y: form_data ? form_data.y || undefined : undefined,
    viz_type: form_data ? form_data.viz_type || '' : undefined,
    row: form_data ? form_data.row || undefined : undefined,
    // onKeyupDebounce: this.onKeyupDebounce: undefined,
    // slice: this.slice: undefined,
    // searchText: this.searchText: undefined,
    // visualType: this.visualType: undefined,
    // visualName: this.visualName: undefined,
    // formData: this.formData: undefined,
    // sharedData: this.sharedData: undefined,
    slice_id: form_data ? form_data.slice_id || undefined : undefined,
    // y_axis_bounds_min: this.y_axis_bounds_min || undefined: undefined,
    // y_axis_bounds_max: this.y_axis_bounds_max || undefined: undefined,
    pred_actual: form_data ? form_data.pred_actual || undefined : undefined,
    pred_line: form_data ? form_data.pred_line || undefined : undefined,
    pred_upper: form_data ? form_data.pred_upper || undefined : undefined,
    pred_lower: form_data ? form_data.pred_lower || undefined : undefined,
    date_filter: form_data ? form_data.date_filter || '' : undefined,
    instant_filtering: form_data ? form_data.instant_filtering || false : undefined,
    alphabet_filter: form_data ? form_data.alphabet_filter || false : undefined,
    filter_control_alphabetic: form_data ? form_data.filter_control_alphabetic || undefined : undefined,
    filter_checkbox: form_data ? form_data.filter_checkbox || false : undefined,
    filter_control_checkbox: form_data ? form_data.filter_control_checkbox || undefined : undefined,
    filter_alignment_horizontal: form_data ? form_data.filter_alignment_horizontal || false : undefined,
    treemap_ratio: form_data ? form_data.treemap_ratio || '' : undefined,
    link_length: form_data ? form_data.link_length || '' : undefined,
    charge: form_data ? form_data.charge || '' : undefined,
    chart_on_click: form_data ? form_data.chart_on_click || false : undefined,
    // link_to: this.link_to: undefined,
    format_number_id: form_data ? form_data.format_number_id : undefined,
    custom_condition: form_data ? form_data.custom_condition || false : undefined,
    custom_condition_arr: form_data ? form_data.custom_condition_arr || [] : undefined,
    // list_gauge_label_type: this.list_gauge_label_type: undefined,
    max_value: form_data ? form_data.max_value || false : undefined,
    show_axis_label: form_data ? form_data.show_axis_label || false : undefined,
    gauge_label_type: form_data ? form_data.gauge_label_type || 'value' : undefined,
    show_needle: form_data ? form_data.show_needle || false : undefined,
    // hide_overlay: this.hide_overlay || false: undefined,
    hide_label: form_data ? form_data.hide_label || false : undefined,
    hide_value: form_data ? form_data.hide_value || false : undefined,
    is_point_tooltip: form_data ? form_data.is_point_tooltip || false : undefined,
    // point_comparations: this.point_comparations || []: undefined,
    filterDateList: form_data ? form_data.filterDateList || [] : undefined,
    filterDateTypeList: form_data ? form_data.filterDateTypeList || [] : undefined,
    // columnFormatList: form_data ? form_data.columnFormatList || this.columnFormatList || []: undefined,
    // fontFamilyList: form_data ? form_data.fontFamilyList || this.fontFamilyList || []: undefined,
    filter_item: form_data ? form_data.filter_item || '' : undefined,
    filter_label: form_data ? form_data.filter_label || '' : undefined,
    filter_date: form_data ? form_data.filter_date || '' : undefined,
    filter_date_type: form_data ? form_data.filter_date_type || '' : undefined,
    filter_checkbox_columns: form_data ? form_data.filter_checkbox_columns || [] : undefined,
    alphabetic_filter_columns: form_data ? form_data.alphabetic_filter_columns || [] : undefined,
    initialFilterDateList: form_data ? form_data.initialFilterDateList || [] : undefined,
    initial_date_filter: form_data ? form_data.initial_date_filter || '' : undefined,
    // notifications: form_data ? form_data.notifications || this.notifications || undefined: undefined,
    // notifications2: form_data ? form_data.notifications2 || this.notifications2 || undefined: undefined,
    chart_on_click_specific_col: form_data ? form_data.chart_on_click_specific_col || false : undefined,
    chart_on_click_col: form_data ? form_data.chart_on_click_col || '' : undefined,
    custom_column_format_arr: form_data ? form_data.custom_column_format_arr || [] : undefined,
    table_selected_column: form_data ? form_data.table_selected_column || [] : undefined,
    initial_chart_blank: form_data ? form_data.initial_chart_blank || false : undefined,
    is_hide_togle_filter: form_data ? form_data.is_hide_togle_filter || false : undefined,
    hide_date_picker: form_data ? form_data.hide_date_picker || false : undefined,
    custom_width_column_arr: form_data ? form_data.custom_width_column_arr || [] : undefined,
    spiral: form_data ? form_data.spiral || '' : undefined,
    scale: form_data ? form_data.scale || '' : undefined,
    font_size: form_data ? form_data.font_size || 10 : undefined,
    font_family: form_data ? form_data.font_family || '' : undefined,
    // one_word_perline: form_data ? form_data.one_word_perline || this.one_word_perline: undefined,
    // orientation: form_data ? form_data.orientation || this.orientation: undefined,
    // orientation_from: form_data ? form_data.orientation_from || this.orientation_from: undefined,
    // orientation_to: form_data ? form_data.orientation_to || this.orientation_to: undefined,
    // distance: form_data ? form_data.distance || this.distance: undefined,
    column_styles: form_data ? form_data.column_styles || [] : undefined,
    display_view_table: form_data ? setDisplayView(form_data) : '',
    pandas_aggfunc: form_data ? form_data.pandas_aggfunc || 'max' : undefined,
    pie_label_position: form_data ? setPieLabelPosition(form_data) : '',
    column_target: form_data ? form_data.column_target || '' : undefined,
    domain: form_data ? form_data.domain || '' : undefined,
    extra_filters: form_data ? form_data.extra_filters || [] : undefined,
    chart_tooltip: form_data ? form_data.chart_tooltip || false : undefined,
    show_dual_axis_line: form_data ? form_data.show_dual_axis_line || false : undefined,
  };
};

const setDisplayView = (form_data) => {
  if (!form_data.table_grid_view && !form_data.gridview_list_view) {
    return 'table';
  }
  if (form_data.table_grid_view && !form_data.gridview_list_view) {
    return 'grid';
  }
  if (form_data.table_grid_view && form_data.gridview_list_view) {
    return 'list';
  }
};

const setPieLabelPosition = (form_data) => {
  if (!form_data.labels_outside && !form_data.hide_label) {
    return 'inside';
  }
  if (form_data.labels_outside) {
    return 'outside';
  }
  if (form_data.hide_label) {
    return 'hide';
  }
};

const setLegendType = (form_data) => {
  if (form_data.viz_type === 'heatmap') {
    return ['piecewise', 'continuous'].includes(form_data.legend_type) ? form_data.legend_type || '' : 'continuous';
  }
  return form_data.legend_type || '';
};
// export const helperObjectShareData = (exploreObj, params) => {
//   return {
//     themes: exploreObj && params.id ? exploreObj.explore.form_data.color_scheme : [],
//     title: exploreObj && params.id ? exploreObj.explore.slice.slice_name : 'Untitled',
//     hasActivity: true,
//     index: null,
//     myChartID: params && params.id ? params.slice_id || params.id : '',
//     data: null,
//     typeChart: exploreObj ? exploreObj.explore.form_data.viz_type : 'preview',
//     mapGeoJSON: null,
//     url: null,
//     explore: exploreObj
//       ? { ...exploreObj.explore, form_data: initial_form_data(exploreObj.explore.form_data) }
//       : {
//           form_data: initial_form_data(null),
//         },
//     exploreJson: exploreObj
//       ? { ...exploreObj.exploreJson, form_data: initial_form_data(exploreObj.exploreJson.form_data) }
//       : {
//           form_data: initial_form_data(null),
//         },
//   };
// };
