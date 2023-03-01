export const static_active_tabs_sort = [
  {
    value: false,
    label: 'ASC',
  },
  {
    value: true,
    label: 'DESC',
  },
];

export const static_table_general = (form_data) => {
  return [
    {
      name: 'gridview_list_view',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.LV',
      value: form_data.gridview_list_view,
      visualType: ['table'],
      trigger: ['table_grid_view'],
    },
    {
      name: 'search_main_column',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.SMCGV',
      value: form_data.search_main_column,
      visualType: ['table'],
      trigger: ['table_grid_view'],
    },
    {
      name: 'search_second_column',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.SSC',
      value: form_data.search_second_column,
      visualType: ['table'],
      trigger: ['table_grid_view'],
    },
  ];
};

export const static_format_bar = (form_data) => {
  return [
    {
      name: 'y_axis_format',
      label: ['big_number_total', 'pie'].includes(form_data.viz_type)
        ? 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.FN'
        : 'Y Axis Format',
      model: form_data.y_axis_format,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      type: ['dist_bar', 'horizontal_bar', 'line', 'box_plot', 'big_number_total', 'predictive', 'scatter'],
    },
    {
      name: 'format_number_tooltips',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.FN',
      model: form_data.format_number_tooltips,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.CTFN',
      type: ['dist_bar', 'horizontal_bar', 'line', 'dual_line', 'box_plot'],
    },
    {
      name: 'number_format',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.NF',
      model: form_data.number_format,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.NF',
      type: [
        'directed_force',
        'heatmap',
        'gauge',
        'treemap',
        'map',
        'country_map',
        'country_map2',
        'pivot_table',
        'sunburst',
      ],
    },
    {
      name: 'x_axis_format',
      label: 'X Axis Format',
      model: form_data.x_axis_format,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.CD',
      type: ['line', 'predictive', 'scatter'],
      //  list nya list_table_timestamp_format
    },
    {
      name: 'y_axis_format',
      label: form_data.viz_type === 'pie' ? 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.NF' : 'Left Y Axis Format',
      model: form_data.y_axis_format,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.CD',
      type: ['dual_line', 'pie'],
    },
    {
      name: 'y_axis_2_format',
      label: 'Right Y Axis Format',
      model: form_data.y_axis_2_format,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.CD',
      type: ['dual_line'],
    },
  ];
};

export const static_chart_label_bar = (form_data) => {
  return [
    {
      name: 'x_axis_label',
      label: 'X Axis Label',
      value: form_data ? form_data.x_axis_label || '' : '',
      type: 'text',
      visualType: [
        'horizontal_bar',
        'dist_bar',
        'line',
        'dual_line',
        'box_plot',
        'histogram',
        'bubble',
        'predictive',
        'scatter',
      ],
    },
    {
      name: 'y_axis_label',
      label: form_data ? (form_data.viz_type === 'dual_line' ? 'Left Y Axis Label' : 'Y Axis Label') : '',
      value: form_data ? form_data.y_axis_label || '' : '',
      type: 'text',
      visualType: ['horizontal_bar', 'dist_bar', 'line', 'dual_line', 'box_plot', 'histogram', 'bubble'],
    },
    {
      name: 'y_axis_line',
      label: 'Right Y Axis Label',
      value: form_data ? form_data.y_axis_line || '' : '',
      type: 'text',
      visualType: ['horizontal_bar', 'dist_bar', 'dual_line'],
    },
  ];
};

export const static_color_scheme = [
  ['#1DAB69', '#F3C404', '#EE2558', '#2887C3', '#B66DFF', '#A4A4A4', '#FE6DB6', '#EE9E64', '#95DABB', '#B3CEE3'],
  ['#6DB6FF', '#FB7293', '#9FE6B8', '#9D96F5', '#E4E9BE', '#9AD0EC', '#E7BCF3', '#B3E283', '#FF9F7F', '#D9D9D9'],
  ['#FC9A99', '#E21A1C', '#B2DF8A', '#33A02B', '#A5CEE2', '#2887C3', '#FDBE6F', '#FF7F00', '#CAB2D6', '#6A3D9A'],
  ['#E51A1D', '#2887C3', '#4DAF4A', '#984EA3', '#FF7F00', '#FFFF33', '#A75629', '#F781BE', '#999999'],
  ['#e9857d', '#95b7d1', '#a2d893', '#c49cd2', '#feb956', '#eded73', '#c2b498', '#eb9ec4', '#cecece'],
  ['#1EA9BE', '#1DAB69', '#F3C404', '#EE2558', '#FF8105', '#8C8C8C', '#CDCDCD'],
];

export const static_custom_display = (form_data) => {
  return [
    {
      name: 'hide_title',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.HD',
      model: form_data.hide_title,
      type: [
        'dist_bar',
        'horizontal_bar',
        'line',
        'dual_line',
        'pie',
        'treemap',
        'sunburst',
        'directed_force',
        'bubble',
        'country_map',
        'country_map2',
        'map',
        'word_cloud',
        'gauge',
        'big_number_total',
        'predictive',
        'pivot_table',
        'box_plot',
        'heatmap',
        'scatter',
        'markup',
        'table',
        'filter_box',
        'table_comparison',
        'histogram',
      ],
      field: 'checkbox',
    },
    {
      name: 'hide_background',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.HB',
      model: form_data.hide_background,
      type: [
        'dist_bar',
        'horizontal_bar',
        'line',
        'dual_line',
        'pie',
        'treemap',
        'sunburst',
        'directed_force',
        'bubble',
        'country_map',
        'country_map2',
        'map',
        'word_cloud',
        'gauge',
        'big_number_total',
        'predictive',
        'box_plot',
        'heatmap',
        'scatter',
        'markup',
        'table',
        'filter_box',
        'table_comparison',
        'histogram',
      ],
      field: 'checkbox',
    },
    {
      name: 'show_border',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.SBORDER',
      model: form_data.show_border,
      type: ['big_number_total'],
      field: 'checkbox',
    },
    {
      name: 'border_position',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.BP',
      model: form_data.border_position,
      type: ['big_number_total'],
      field: 'button',
    },
  ];
};

export const static_custom_display_for_table = (form_data) => {
  return [
    {
      name: 'search_main_column',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.SMCGV',
      model: form_data.search_main_column,
      type: ['table'],
      field: 'checkbox',
      trigger: ['list', 'grid'],
    },
    {
      name: 'search_second_column',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.SSC',
      model: form_data.search_second_column,
      type: ['table'],
      field: 'checkbox',
      trigger: ['list', 'grid'],
    },
    {
      name: 'table_font_size',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.FS',
      model: form_data.table_font_size,
      type: ['table'],
      field: 'input',
      trigger: ['table'],
    },
    {
      name: 'table_font_family',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.FT',
      model: form_data.table_font_family,
      type: ['table'],
      field: 'select',
      trigger: ['table'],
    },
    {
      name: 'show_total_numeric_column',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.STV',
      model: form_data.show_total_numeric_column,
      type: ['table'],
      field: 'checkbox',
      trigger: ['table'],
    },
    {
      name: 'search_multi_columns',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.SMC',
      model: form_data.search_multi_columns,
      type: ['table'],
      field: 'checkbox',
      trigger: ['table'],
    },
    {
      name: 'static_number',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.DSN',
      model: form_data.static_number,
      type: ['table'],
      field: 'checkbox',
      trigger: ['table'],
    },
  ];
};
export const list_of_field_general = (form_data) => {
  return [
    {
      name: 'show_bar_value',
      label: 'Bar Values',
      value: form_data.show_bar_value,
      visualType: ['horizontal_bar', 'dist_bar'],
      type: 'checkbox',
    },
    {
      name: 'bar_stacked',
      label: 'Stacked Bar',
      value: form_data.bar_stacked,
      visualType: ['horizontal_bar', 'dist_bar'],
      type: 'checkbox',
    },
    {
      name: 'count_stacked',
      label: 'Count Stacked',
      value: form_data.count_stacked,
      visualType: ['horizontal_bar', 'dist_bar'],
      type: 'checkbox',
    },
    {
      name: 'donut',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.D',
      value: form_data.donut,
      visualType: ['pie'],
      type: 'checkbox',
    },
    {
      name: 'show_brush',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.RF',
      value: form_data.show_brush,
      visualType: ['line', 'box_plot'],
      type: 'checkbox',
    },
    {
      name: 'show_markers',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.SM',
      value: form_data.show_markers,
      visualType: ['line'],
      type: 'checkbox',
    },
    {
      name: 'x_log_scale',
      label: 'X Log Scale',
      value: form_data.x_log_scale,
      visualType: ['bubble'],
      type: 'checkbox',
    },
    {
      name: 'y_log_scale',
      label: 'Y Log Scale',
      value: form_data.y_log_scale,
      visualType: ['line', 'bubble'],
      type: 'checkbox',
    },
    {
      name: 'area_chart',
      label: 'Area Chart',
      value: form_data.area_chart,
      visualType: ['line'],
      type: 'checkbox',
    },
    {
      name: 'combine_metric',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.CM',
      value: form_data.combine_metric,
      visualType: ['pivot_table'],
      type: 'checkbox',
    },
    {
      name: 'is_point_tooltip',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.IPT',
      value: form_data.is_point_tooltip,
      visualType: ['map', 'country_map', 'country_map2'],
      type: 'checkbox',
    },
    {
      name: 'show_needle',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.SN',
      value: form_data.show_needle,
      visualType: ['gauge'],
      type: 'checkbox',
    },
    {
      name: 'custom_condition',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.CUSTOM_COND',
      value: form_data.custom_condition,
      visualType: ['gauge'],
      type: 'checkbox',
    },
    {
      name: 'is_axis_reverse',
      label: 'Is Axis Reverse',
      value: form_data.is_axis_reverse,
      visualType: ['heatmap'],
      type: 'checkbox',
    },
    {
      name: 'page_size',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.RPP',
      value: form_data.page_size,
      visualType: ['table'],
      type: 'select',
      // list_row_limit
    },
    {
      name: 'max_bubble_size',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.MBS',
      value: form_data.max_bubble_size,
      visualType: ['bubble'],
      type: 'select',
      // list_page_length2
    },
    {
      name: 'link_length',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.LL',
      value: form_data.link_length,
      visualType: ['directed_force'],
      type: 'select',
      // list_row_limit
    },
    {
      name: 'charge',
      label: 'Charge',
      value: form_data.charge,
      visualType: ['directed_force'],
      type: 'select',
      // list_page_length2
    },
    {
      name: 'rotation',
      label: 'Rotation',
      value: form_data.rotation,
      visualType: ['word_cloud'],
      type: 'select',
      // list_rotation
    },
    {
      name: 'spiral',
      label: 'Spiral',
      value: form_data.spiral,
      visualType: ['word_cloud'],
      type: 'select',
      // list_spiral
    },
    {
      name: 'scale',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.SCALE',
      value: form_data.scale,
      visualType: ['word_cloud'],
      type: 'select',
      // list_scale
    },
    {
      name: 'font_size',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.FS',
      value: form_data.font_size,
      visualType: ['word_cloud'],
      type: 'input',
      // list_spiral
    },
    {
      name: 'font_family',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.FT',
      value: form_data.font_family,
      visualType: ['word_cloud'],
      type: 'select',
      // list_scale
    },
    ///////
    {
      name: 'pandas_aggfunc',
      label: 'Summary Function',
      value: form_data.pandas_aggfunc,
      visualType: ['pivot_table'],
      type: 'select',
      // list_scale
    },
    {
      name: 'line_interpolation',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.LS',
      value: form_data.line_interpolation,
      visualType: ['line'],
      type: 'select',
      // list_spiral
    },
    {
      name: 'style_tooltips',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.ST',
      value: form_data.style_tooltips,
      visualType: ['horizontal_bar', 'dist_bar', 'line', 'box_plot'],
      type: 'select',
      // list_scale
    },
    {
      name: 'treemap_ratio',
      label: 'Ratio',
      value: form_data.treemap_ratio,
      visualType: ['treemap'],
      type: 'input',
    },
    {
      name: 'rotate_axis',
      label: 'Rotate X Axis',
      value: form_data.rotate_axis,
      visualType: ['horizontal_bar', 'dist_bar'],
      type: 'input',
    },
    {
      name: 'zoomsize',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.VFS',
      value: form_data.zoomsize,
      visualType: ['big_number_total'],
      type: 'input',
    },
    {
      name: 'range',
      label: 'X Axis Interval',
      value: form_data.range,
      visualType: ['histogram'],
      type: 'input',
    },
    {
      name: 'domain',
      label: 'X Axis Limit',
      value: form_data.domain,
      visualType: ['histogram'],
      type: 'input',
    },
    {
      name: 'chart_tooltip',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.OPTIONS.AT',
      value: form_data.chart_tooltip,
      visualType: ['histogram'],
      type: 'checkbox',
    },
  ];
};
