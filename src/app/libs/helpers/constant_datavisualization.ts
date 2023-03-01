const modifyArray = (arr) => {
  return arr.map((item) => [item, item]);
};

export const static_layout_directed = modifyArray(['circular', 'force']);
export const static_row_limit = modifyArray([3, 5, 10, 20, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000]);

export const static_bottom_margin = modifyArray(['auto', 50, 75, 100, 125, 150, 200]);

export const static_table_timestamp_format = [
  ['smart_date', 'Adaptative formating'],
  ['%d/%m/%Y', '%d/%m/%Y | 14/01/2019'],
  ['%m/%d/%Y', '%m/%d/%Y | 01/14/2019'],
  ['%Y-%m-%d', '%Y-%m-%d | 2019-01-14'],
  ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M:%S | 2019-01-14 01:32:10'],
  ['%d-%m-%Y %H:%M:%S', '%d-%m-%Y %H:%M:%S | 14-01-2019 01:32:10'],
  ['%H:%M:%S', '%H:%M:%S | 01:32:10'],
];

export const static_style_tooltips = [
  ['item', 'Single'],
  ['axis', 'Full'],
];

export const static_rotate_axis = modifyArray([90, 60, 45, 30, 15, 0, -15, -30, -45, -60, -90]);

export const static_line_interpolation = modifyArray(['basic', 'smooth', 'step-line']);

export const static_page_length2 = modifyArray([1, 5, 10, 25, 50, 75, 100]);
export const static_link_length = modifyArray([10, 50, 100, 200, 250, 500]);
export const static_charge = modifyArray([-50, -75, -100, -150, -200, -250, -500, -1000]);

export const static_rotation = [
  ['random', 'random'],
  ['flat', 'flat'],
  ['square', 'square'],
  ['circle', 'circle'],
  ['cardioid', 'cardioid'],
  ['diamond', 'diamond'],
  ['triangle-forward', 'triangle-forward'],
  ['triangle', 'triangle'],
];

export const static_spiral = [
  ['archimedean', 'archimedean'],
  ['rectangular', 'rectangular'],
];

export const static_horizontal_bar_sorter = [
  ['y_axis', 'Y Axis'],
  ['value', 'Value'],
];
export const static_cols_notification = modifyArray(['==', '!=', '>', '<', '>=', '<=']);
export const static_cols = modifyArray(['in', 'not in', '==', '!=', '>', '<', '>=', '<=']);
export const static_pandas_aggfunc = modifyArray(['sum', 'mean', 'min', 'max']);
export const static_granularity = modifyArray([
  'all',
  '5 seconds',
  '30 seconds',
  '1 minute',
  '5 minutes',
  '1 hour',
  '6 hour',
  '1 day',
  '7 days',
  'one day',
  'week',
  'week_starting_sunday',
  'week_ending_saturday',
  'month',
]);
export const static_spectrums = {
  blue_white_yellow: ['#00d1c1', 'white', '#ffb400'],
  fire: ['white', 'yellow', 'red', 'black'],
  white_black: ['white', 'black'],
  black_white: ['black', 'white'],
  dark_blue: ['#EBF5F8', '#6BB1CC', '#357E9B', '#1B4150', '#092935'],
  pink_grey: ['#E70B81', '#FAFAFA', '#666666'],
  ['green/yellow/red']: ['green', 'yellow', 'red'],
};
export const static_shape = [
  ['circle', 'Circle'],
  ['cardioid', 'Cardioid'],
  ['diamond', 'Diamond'],
  ['triangle-forward', 'Triangle-forward'],
  ['triangle', 'Triangle'],
  ['pentagon', 'Pentagon'],
  ['star', 'Star'],
];
export const static_scale = [
  ['linear', 'Linear'],
  ['logN', 'Log N'],
  ['akarN', 'Akar N'],
  ['N', 'N'],
];

export const static_select_country_overlay = ['Indonesia', 'Usa'].map((s) => [s.toString().toLowerCase(), s]);
export const static_select_country = [
  'Indonesia',
  'Indonesia_kabupaten',
  'Belgium',
  'Brazil',
  'China',
  'Egypt',
  'France',
  'Germany',
  'Italy',
  'Morocco',
  'Netherlands',
  'Russia',
  'Singapore',
  'Spain',
  'Uk',
  'Ukraine',
  'Usa',
].map((s) => [s.toString().toLowerCase(), s]);
export const static_select_province = [
  'Aceh',
  'Bali',
  'Banten',
  'Bengkulu',
  'Daerah Istimewa Yogyakarta',
  'DKI Jakarta',
  'Gorontalo',
  'Jambi',
  'Jawa Barat',
  'Jawa Tengah',
  'Jawa Timur',
  'Kalimantan Barat',
  'Kalimantan Selatan',
  'Kalimantan Tengah',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Kepulauan Bangka Belitung',
  'Kepulauan Riau',
  'Lampung',
  'Maluku Utara',
  'Maluku',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Papua Barat',
  'Papua',
  'Riau',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tengah',
  'Sulawesi Tenggara',
  'Sulawesi Utara',
  'Sumatera Barat',
  'Sumatera Selatan',
  'Sumatera Utara',
].map((s) => [s.replace(/ /g, '-').replace(/\./g, '-').toLowerCase(), s]);
export const static_legend_orient = [
  ['horizontal', 'Horizontal'],
  ['vertical', 'Vertical'],
];
export const static_legend_type = [
  ['plain', 'Plain'],
  ['scroll', 'Scroll'],
];
export const static_dist_bar_sorter = [
  ['x_axis', 'X Axis'],
  ['value', 'Value'],
];

export const static_page_length = modifyArray([0, 5, 10, 25, 50, 100, 200, 500, 1000]);

export const static_y_axis_format = [
  ['.3s', 'Default'],
  [',', '12,345'],
  ['.1f', '1200.0'],
  ['.3f', '12345.432'],
  [',.2f', '1,500.00'],
  ['s', '1.5k'],
  ['.1s', '2k'],
  ['.2s', '1.5k'],
  [',.2%', '150,000.00%'],
  ['+,', '+12,345.4321'],
  ['$,.2f', '$12,345.43'],
  [',.2r', '12,345,678'],
];

export const static_mode = [
  ['value', 'Value'],
  ['percent', 'Percentage'],
];
export const static_gauge_label_type = [
  ['value', 'Value'],
  ['percent', 'Percentage'],
  // ["category", "Category"],
  // ["status_percent", "Percentage and Value"],
];
export const static_pie_label_type = [
  ['key', 'Category Name'],
  ['value', 'Value'],
  ['percent', 'Percentage'],
  ['percent_around', 'Percentage Around'],
  ['key_value', 'Category and Value'],
  ['key_percent', 'Category and Percentage'],
  ['key_percent_around', 'Category and Percentage Around'],
];

export const staticfilterDateTypeListComparison = [
  ['static_date', 'Is Static Date'],
  ['static_month', 'Is Static Month'],
  ['static_year', 'Is Static Year'],
  ['date', 'Date'],
  ['month', 'Month'],
  ['year', 'Year'],
];

export const staticcolumnFormatList = [
  ['date', 'Date'],
  ['number', 'Number'],
];
export const staticfontFamilyList = [
  ['Impact', 'Impact'],
  ['Helvetica', 'Helvetica'],
  ['Open Sans', 'Open Sans'],
  ['Roboto', 'Roboto'],
  ['Verdana', 'Verdana'],
  ['sans-serif', 'Sans Serif'],
  ['Montserrat', 'Montserrat'],
  ['Lato', 'Lato'],
  ['Oswald', 'Oswald'],
  ['Poppins', 'Poppins'],
  ['Raleway', 'Raleway'],
];
export const staticinitialFilterDateList = [
  ['current_date', 'Current Date'],
  ['latest_date', 'Latest Date'],
  ['custom_date', 'Custom Date'],
];
export const statictable_selected_column = [];
export const statictable_selected_column_width = [];

export const staticcolumn_width_arr = [
  { style: '0 0 100% !important;', width: '100%' },
  { style: '0 0 75% !important;', width: '75%' },
  { style: '0 0 60% !important;;', width: '60%' },
  { style: '0 0 55% !important;', width: '55%' },
  { style: '0 0 50% !important;', width: '50%' },
  { style: '0 0 45% !important;', width: '45%' },
  { style: '0 0 40% !important;', width: '40%' },
  { style: '0 0 35% !important;', width: '35%' },
  { style: '0 0 30% !important;', width: '30%' },
  { style: '0 0 25% !important;', width: '25%' },
  { style: '0 0 20% !important;', width: '20%' },
  { style: '0 0 15% !important;', width: '15%' },
  { style: '0 0 10% !important;', width: '10%' },
  { style: '0 0 5% !important;', width: '5%' },
  { style: '0 0 2% !important;', width: '2%' },
];

export const static_operators_arr = [
  { val: 'in', type: 'array', useSelect: true, multi: true },
  { val: 'not in', type: 'array', useSelect: true, multi: true },
  {
    val: '==',
    type: 'string',
    useSelect: true,
    multi: false,
    havingOnly: true,
  },
  {
    val: '!=',
    type: 'string',
    useSelect: true,
    multi: false,
    havingOnly: true,
  },
  { val: '>=', type: 'string', havingOnly: true },
  { val: '<=', type: 'string', havingOnly: true },
  { val: '>', type: 'string', havingOnly: true },
  { val: '<', type: 'string', havingOnly: true },
  { val: 'regex', type: 'string', datasourceTypes: ['druid'] },
];

export const static_time_grain_sqla = (messages) => [
  ['hour', messages ? messages.CHART.HOUR : 'Hour'],
  ['day', messages ? messages.CHART.DAY : 'Day'],
  ['month', messages ? messages.CHART.MONTH : 'Month'],
  ['year', messages ? messages.CHART.YEAR : 'Year'],
];

export const static_list_time_grain_sqla = (messages) => {
  return [
    { value: 'hour', label: messages ? messages.CHART.HOUR : 'Hour' },
    { value: 'day', label: messages ? messages.CHART.DAY : 'Day' },
    { value: 'month', label: messages ? messages.CHART.MONTH : 'Month' },
    { value: 'year', label: messages ? messages.CHART.YEAR : 'Year' },
  ];
};

export const staticfilterDateList = (messages) => [
  ['date_picker', messages ? messages.CHART.DATE_PICKER : 'Date Picker'],
  ['date_range_picker', messages ? messages.CHART.DATE_RANGE_PICKER : 'Date Range Picker'],
];
export const staticfilterDateTypeList = (messages) => [
  ['date', messages ? messages.CHART.DATE : 'Date'],
  ['month', messages ? messages.CHART.MONTH : 'Month'],
  ['year', messages ? messages.CHART.YEAR : 'Year'],
];

// export const static_open_dialog = {
//   setting: false,
//   notification: false,
//   help: false,
//   language: false,
//   user: false,
// };

export const static_bar_type_query = [
  {
    value: 'dist_bar',
    label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.VBC',
  },
  {
    value: 'horizontal_bar',
    label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.HBC',
  },
];

export const static_bar_with_line_query = [
  ['line_metric', 'Line Metric'],
  ['line_constanta', 'Line Constanta'],
];

export const static_table_type_query = [
  {
    value: 'table',
    label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.T',
  },
  {
    value: 'pivot_table',
    label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.PT',
  },
];

export const static_active_tabs_table_chart = [
  {
    value: 'group',
    label: 'Group',
  },
  {
    value: 'not_group',
    label: 'Not Group',
  },
];

export const static_line_type_query = [
  {
    value: 'line',
    label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.LINE_CHART',
  },
  {
    value: 'dual_line',
    label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.DLA',
  },
];

export const static_map_type_query = [
  {
    value: 'country_map',
    label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CM',
  },
];

export const static_list_formula = {
  description: null,
  expression: 'Sum(column_name)',
  metric_name: 'sum__column_name',
  verbose_name: 'column_name (Sum)',
  warning_text: null,
  is_formula: true,
};

export const static_format_number_chart_options = [
  {
    value: true,
    label: 'Indonesia ',
  },
  {
    value: false,
    label: 'US-International',
  },
];

export const static_display_view_table_chart_options = (form_data) => [
  {
    value: 'table', //form_data.table_grid_view && form_data.gridview_list_view
    label: 'Table ',
    name: '',
  },
  {
    value: 'grid',
    label: 'Grid View',
    name: 'table_grid_view',
  },
  {
    value: 'list',
    label: 'List View',
    name: 'gridview_list_view',
  },
];

export const static_label_position_pie_chart_options = (form_data) => [
  {
    value: 'inside', //!form_data.labels_outside && !form_data.hide_label
    label: 'Inside Chart',
    name: '',
  },
  {
    value: 'outside',
    label: 'Outside Chart',
    name: 'labels_outside',
  },
  {
    value: 'hide',
    label: 'Hide Label',
    name: 'hide_label',
  },
];

export const static_list_area_map = [
  { label: 'Indonesia', value: '', group: 'Indonesia' },
  { label: 'Aceh', value: 'aceh', group: 'Indonesia' },
  { label: 'Bali', value: 'bali', group: 'Indonesia' },
  { label: 'Banten', value: 'banten', group: 'Indonesia' },
  { label: 'Bengkulu', value: 'bengkulu', group: 'Indonesia' },
  { label: 'Daerah Istimewa Yogyakarta', value: 'daerah-istimewa-yogyakarta', group: 'Indonesia' },
  { label: 'DKI Jakarta', value: 'dki-jakarta', group: 'Indonesia' },
  { label: 'Gorontalo', value: 'gorontalo', group: 'Indonesia' },
  { label: 'Jambi', value: 'jambi', group: 'Indonesia' },
  { label: 'Jawa Barat', value: 'jawa-barat', group: 'Indonesia' },
  { label: 'Jawa Tengah', value: 'jawa-tengah', group: 'Indonesia' },
  { label: 'Jawa Timur', value: 'jawa-timur', group: 'Indonesia' },
  { label: 'Kalimantan Barat', value: 'kalimantan-barat', group: 'Indonesia' },
  { label: 'Kalimantan Selatan', value: 'kalimantan-selatan', group: 'Indonesia' },
  { label: 'Kalimantan Tengah', value: 'kalimantan-tengah', group: 'Indonesia' },
  { label: 'Kalimantan Timur', value: 'kalimantan-timur', group: 'Indonesia' },
  { label: 'Kalimantan Utara', value: 'kalimantan-utara', group: 'Indonesia' },
  { label: 'Kepulauan Bangka Belitung', value: 'kepulauan-bangka-belitung', group: 'Indonesia' },
  { label: 'Kepulauan Riau', value: 'kepulauan-riau', group: 'Indonesia' },
  { label: 'Lampung', value: 'lampung', group: 'Indonesia' },
  { label: 'Maluku Utara', value: 'maluku-utara', group: 'Indonesia' },
  { label: 'Maluku', value: 'maluku', group: 'Indonesia' },
  { label: 'Nusa Tenggara Barat', value: 'nusa-tenggara-barat', group: 'Indonesia' },
  { label: 'Nusa Tenggara Timur', value: 'nusa-tenggara-timur', group: 'Indonesia' },
  { label: 'Papua Barat', value: 'papua-barat', group: 'Indonesia' },
  { label: 'Papua', value: 'papua', group: 'Indonesia' },
  { label: 'Riau', value: 'riau', group: 'Indonesia' },
  { label: 'Sulawesi Barat', value: 'sulawesi-barat', group: 'Indonesia' },
  { label: 'Sulawesi Selatan', value: 'sulawesi-selatan', group: 'Indonesia' },
  { label: 'Sulawesi Tengah', value: 'sulawesi-tengah', group: 'Indonesia' },
  { label: 'Sulawesi Tenggara', value: 'sulawesi-tenggara', group: 'Indonesia' },
  { label: 'Sulawesi Utara', value: 'sulawesi-utara', group: 'Indonesia' },
  { label: 'Sumatera Barat', value: 'sumatera-barat', group: 'Indonesia' },
  { label: 'Sumatera Selatan', value: 'sumatera-selatan', group: 'Indonesia' },
  { label: 'Sumatera Utara', value: 'sumatera-utara', group: 'Indonesia' },
  { label: 'Peta Dishub', value: 'sumatera-utara', group: '' },
  { label: 'Polda Aceh', value: 'polda-aceh', group: 'Polda' },
  { label: 'Polda Bali', value: 'polda-bali', group: 'Polda' },
];

export const static_legend_heatmap = [
  ['piecewise', 'Plain'],
  ['continuous', 'Continuous'],
];

export const static_floating_card_dashboard = [
  // {
  //   type: 'Apply',
  //   icon: 'zmdi zmdi-check ml-1',
  //   typeChart: ['filter_box'],
  //   typePage: ['dashboardview', 'app_preview'],
  //   isEditor: false,
  // },
  {
    type: 'column_table',
    icon: 'zmdi zmdi-power-input',
    typeChart: ['table', 'pivot_table'],
    typePage: ['dashboardview', 'dashboard', 'app_preview'],
  },
  {
    type: 'fullscreen',
    icon: 'zmdi zmdi-fullscreen',
    typeChart: [
      'table',
      'pivot_table',
      'gauge',
      'big_number_total',
      'country_map',
      'markup',
      'treemap',
      'predictive',
      'scatter',
      'word_cloud',
      'table_comparison',
      'histogram',
      'dist_bar',
      'horizontal_bar',
      'line',
      'dual_line',
      'pie',
      'directed_force',
      'bubble',
      'heatmap',
      'sunburst',
    ],
    typePage: ['dashboardview', 'app_preview'],
  },
  {
    type: 'refresh',
    icon: 'zmdi zmdi-refresh-alt',
    typeChart: [
      'table',
      'pivot_table',
      'gauge',
      'big_number_total',
      'country_map',
      'markup',
      'treemap',
      'predictive',
      'scatter',
      'word_cloud',
      'table_comparison',
      'dual_line',
      'histogram',
      'dist_bar',
      'horizontal_bar',
      'line',
      'dual_line',
      'pie',
      'directed_force',
      'bubble',
      'heatmap',
      'sunburst',
    ],
    typePage: ['dashboardview', 'dashboard', 'app_preview'],
  },
  {
    type: 'edit',
    icon: 'zmdi zmdi-edit',
    typeChart: [
      'table',
      'pivot_table',
      'gauge',
      'big_number_total',
      'country_map',
      'markup',
      'treemap',
      'predictive',
      'scatter',
      'word_cloud',
      'table_comparison',
      'histogram',
      'dist_bar',
      'horizontal_bar',
      'line',
      'dual_line',
      'pie',
      'directed_force',
      'bubble',
      'heatmap',
      'sunburst',
      'filter_box',
    ],
    typePage: ['dashboard'],
  },
  {
    type: 'download',
    icon: 'zmdi zmdi-download',
    typeChart: [
      'table',
      'pivot_table',
      'gauge',
      'big_number_total',
      'country_map',
      'treemap',
      'predictive',
      'scatter',
      'word_cloud',
      'table_comparison',
      'dual_line',
      'histogram',
      'dist_bar',
      'horizontal_bar',
      'line',
      'dual_line',
      'pie',
      'directed_force',
      'bubble',
      'heatmap',
      'sunburst',
    ],
    typePage: ['dashboardview', 'app_preview'],
  },
  {
    type: 'delete',
    icon: 'zmdi zmdi-delete',
    typeChart: [
      'table',
      'pivot_table',
      'gauge',
      'big_number_total',
      'country_map',
      'markup',
      'treemap',
      'predictive',
      'scatter',
      'word_cloud',
      'table_comparison',
      'dual_line',
      'histogram',
      'dist_bar',
      'horizontal_bar',
      'line',
      'dual_line',
      'pie',
      'directed_force',
      'bubble',
      'heatmap',
      'sunburst',
      'filter_box',
    ],
    typePage: ['dashboard'],
  },
];
