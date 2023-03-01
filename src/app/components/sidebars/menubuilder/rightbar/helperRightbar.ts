import { helperRequireFormValue, helperValidateFormVisualType } from 'src/app/libs/helpers/data-visualization-helper';

export const top_bar_type_action = [
  'enable_information_glossary',
  'enable_global_search',
  'enable_notification_center',
  'enable_application_setting',
];
export const sub_top_bar_type_action = ['enable_back_button', 'enable_breadcrumb', 'enable_refresh_page_button'];

export const setFormData = (data, position, type) => {
  data = {
    ...data,
    options: {
      ...data.options,
      [position]: {
        ...data.options[position],
        [type]: !data.options[position][type],
      },
    },
  };
  return data;
};

export const static_form_data = (assetJsonData, data?) => {
  return {
    slug: data ? data.slug : '',
    title: data ? data.title : '',
    password: data ? data.password : '',
    options: {
      publish: data ? data.options.publish : false,
      login_style: data ? data.options.login_style : assetJsonData.login_style[0].value || 'CONST_LOGIN_STYLE_1',
      label_style: data ? data.options.label_style : assetJsonData.login_style[0].label_style || 'Login_Style_1',
      image_style: data
        ? data.options.image_style
        : assetJsonData.login_style[0].image_style || 'assets/images/left-theme.png',
      selected_dashboard: data ? data.options.selected_dashboard : null,
      enable_login_page: data ? data.options.enable_login_page : true,
      logo_login: data ? data.options.logo_login : '',
      background_image: data
        ? data.options.background_image
        : assetJsonData.login_style[0].background_image || 'assets/images/login-dark-bg.svg',
      topbar_option: {
        logo: data ? data.options.logo : '/assets/images/logo_paques.svg',
        enable_global_search: data ? data.options.enable_global_search : false,
        enable_notification_center: data ? data.options.enable_notification_center : false,
        enable_application_setting: data ? data.options.enable_application_setting : true,
        enable_information_glossary: data ? data.options.enable_information_glossary : true,
        text_information_glossary: data ? data.options.text_information_glossary : '',
      },
      sub_topbar_option: {
        enable_back_button: data ? data.options.enable_back_button : true,
        enable_breadcrumb: data ? data.options.enable_breadcrumb : true,
        enable_refresh_page_button: data ? data.options.enable_refresh_page_button : true,
      },
      menu: data ? data.menu : [],
      enable_icon_default: data ? data.options.enable_icon_default || false : false,
    },
    menu: data ? data.menu : [],
  };
};

export const isValidate = (menu, popupMessage, messages) => {
  let validate = true;
  if (menu.length == 0 || menu == null) {
    popupMessage = {
      title: messages.APPLICATIONS.W,
      desc: messages.APPLICATIONS.MSG_VAM,
    };
    validate = false;
    return { validate, popupMessage };
  }
  if (menu.length > 0) {
    if (menu[0].dashboard_id == '' || menu[0].dashboard_id == null || menu[0].dashboard_id == 'null') {
      popupMessage = {
        title: messages.APPLICATIONS.W,
        desc: messages.APPLICATIONS.MSG_VAMDIFM,
      };
      validate = false;
    }
  }
  return { validate, popupMessage };
};

export const setDataSave = (formData, menu) => {
  return {
    menu: menu,
    options: formData.options,
    password: formData.password,
    title: formData.title,
  };
};

export const findMenuAndChangeTitle = (menu, id, title) => {
  let listMenu = JSON.stringify(menu, (_, nestedValue) => {
    if (nestedValue && nestedValue['id'] === id) {
      nestedValue = { ...nestedValue, title: title };
    }
    return nestedValue;
  });

  return JSON.parse(listMenu);
};

export const static_active_collapse_application = {
  applicationProperty: true,
  topbarOption: false,
  subTopbarOption: false,
  option: false,
};

export const static_active_collapse_dashboard = {
  dashboardProperty: true,
  dashboardOptions: false,
};

export const static_active_collapse_chart = {
  datasource: false,
  chartOption: false,
  filter: false,
  time: false,
  visualization: true,
  notification: false,
  query: false,
  chartGridView: false,
  commonGroup: false,
  chartFormatGroup: false,
  chartColorGroup: false,
  chartSortGroup: false,
  chartMarginGroup: false,
  dualAxisGroup: false,
  chartLabelGroup: false,
  chartLagendGroup: false,
  chartFilterGroup: false,
  customDisplayGroup: false,
};

export const static_action_right_bar = (text, icon) => {
  return {
    text,
    icon,
  };
};

export const setValRequiredForm = (viz, explore, exploreJson) => {
  if (!exploreJson.form_data) return;

  return helperRequireFormValue(viz, explore, explore.form_data, exploreJson);
};

export const validateForm = (viz, form_data, messages) => {
  let isFormValidate = false;
  let validate_messages = [];
  let vizType = !form_data.viz_type ? viz : form_data.viz_type;

  if (form_data.viz_type == 'scatter' && viz == 'predictive') {
    vizType = 'predictive';
  }

  if (form_data.viz_type == 'histogram' && viz == 'histogram') {
    vizType = 'histogram';
  }

  if (form_data.viz_type == 'osmmap' && viz == 'histogram') {
    vizType = 'histogram';
  }

  if (viz == 'preview') {
    isFormValidate = false;
    validate_messages.push(messages.CHART.MSG_PCVT);
  }
  //Time validation
  if (form_data.initial_date_filter && form_data.initial_date_filter) {
    if (form_data.granularity_sqla === null || !form_data.granularity_sqla) {
      validate_messages.push(messages.CHART.MSG_TCR);
    }
    if (form_data.filter_date === null || !form_data.filter_date) {
      validate_messages.push(messages.CHART.MSG_DFR);
    }
    if (form_data.filter_date_type === null || !form_data.filter_date_type) {
      validate_messages.push(messages.CHART.MSG_DFTCR);
    }
  }

  validate_messages = helperValidateFormVisualType(viz, isFormValidate, form_data, messages, validate_messages);
  if (validate_messages.length > 0) {
    isFormValidate = true;
  }

  return { isFormValidate, validate_messages };
};

export const helperGenerateFormData = (visualType, form_data) => {
  /**
   * argument data from this.form_data
   * since, until, page_sort, column_styles and modify_form_datafrom argument but for testing only using dummy
   * removed since and until after integration completly done
   */
  let since = '';
  let until = '';
  let page_sort = [];
  // let column_styles = [];
  let modify_form_data = {};
  let records = [];
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
      modify_form_data = {
        groupby: form_data.groupby || [],
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        sort_aggregate_column: form_data.sort_aggregate_column || 'option1',
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        metrics: form_data.metrics && form_data.metrics.length > 0 ? form_data.metrics : [],
        granularity: form_data.granularity,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: form_data.initial_date_filter !== 'current_date' ? form_data.since || null : null,
        until: form_data.initial_date_filter !== 'current_date' ? form_data.until || null : null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        number_format: form_data.number_format || ',',
        initial_date_filter: form_data.initial_date_filter || '',
        chart_on_click_specific_col: form_data.chart_on_click_specific_col || false,
        chart_on_click_col: form_data.chart_on_click_col || '',
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        column_styles: form_data.column_styles,
        granularity_sqla: form_data.granularity_sqla || null,
        display_view_table: form_data.display_view_table || 'table',
        extra_filters: form_data.extra_filters || [],
      };
      if (visualType == 'pivot_table') {
        modify_form_data = {
          ...modify_form_data,
          viz_type: visualType || 'pivot_table',
          columns: form_data.columns || [],
          pandas_aggfunc: form_data.pandas_aggfunc || 'sum',
          pivot_margins: form_data.pivot_margins || true,
          combine_metric: form_data.combine_metric || false,
          granularity_sqla: form_data.granularity_sqla || null,
        };
      } else {
        page_sort = form_data.page_sort || [];
        if (form_data.table_filter_column) {
          if (form_data.table_filter_column) {
            page_sort = [];
            let sortOrder = form_data.table_sort_desc === true ? 'desc' : 'asc';
            let sortObj = {
              column: form_data.table_filter_column,
              order: sortOrder,
            };
            page_sort.push(sortObj);
          }
        }
        if (form_data.timeseries_limit_metric) {
          if (form_data.timeseries_limit_metric && !['undefined', 'null'].includes(form_data.timeseries_limit_metric)) {
            page_sort = [];
            let sortOrder = form_data.order_desc === true ? 'desc' : 'asc';
            let sortObj = {
              column: form_data.timeseries_limit_metric,
              order: sortOrder,
            };
            page_sort.push(sortObj);
          }
        }
        modify_form_data = {
          ...modify_form_data,
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
          table_grid_view: ['grid', 'list'].includes(form_data.display_view_table) || false,
          search_main_column: form_data.search_main_column || false,
          search_second_column: form_data.search_second_column || false,
          gridview_list_view: form_data.display_view_table === 'list',
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
          // tambahan
          search_filter: form_data.search_filter || null,
        };
      }
      break;
    case 'table_comparison':
      // if (form_data.base_columns && form_data.base_columns.length == 0) onChangeFilterComparison();
      modify_form_data = {
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
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        notifications: form_data.notifications || [],
        custom_column_format_arr: form_data.custom_column_format_arr || [],
        initial_date_filter: form_data.initial_date_filter || '',
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'pie':
      modify_form_data = {
        viz_type: visualType,
        metrics: form_data.metrics,
        tooltips: form_data.tooltips || [],
        // hide_label: form_data.hide_label || false,
        hide_label: form_data.pie_label_position === 'hide',
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
        // labels_outside: form_data.labels_outside,
        labels_outside: form_data.pie_label_position === 'outside',
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        notifications2: form_data.notifications2 || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        pie_sort_asc: form_data.pie_sort_asc || false,
        pie_label_position: form_data.pie_label_position || 'inside',
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'horizontal_bar':
    case 'dist_bar':
      modify_form_data = {
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
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        with_line: form_data.with_line || false,
        style_tooltips: form_data.style_tooltips || 'item',
        show_dual_axis_line: form_data.show_dual_axis_line || false,
        initial_date_filter: form_data.initial_date_filter || '',
        y_axis_bounds_min: String(form_data.y_axis_bounds_min) || null,
        y_axis_bounds_max: String(form_data.y_axis_bounds_max) || null,
        notifications: form_data.notifications || [],
        show_only_one_value: form_data.show_only_one_value || false,
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        is_first_axis_label: form_data.is_first_axis_label || false,
        is_axis_reverse: form_data.is_axis_reverse || false,
        set_default_series: form_data.set_default_series || null,
        extra_filters: form_data.extra_filters || [],
      };
      if (form_data.with_line) {
        modify_form_data = {
          ...modify_form_data,
          line_metric: form_data.line_metric || '',
          line_const: Number(form_data.line_const) || undefined,
        };
      }
      if (visualType == 'horizontal_bar') {
        modify_form_data = {
          ...modify_form_data,
          viz_type: visualType || 'horizontal_bar',
          horizontal_bar_sorter: form_data.horizontal_bar_sorter || 'value',
          left_margin: form_data.left_margin || 'auto',
          x_as_date: form_data.x_as_date || false,
        };
      } else {
        modify_form_data = {
          ...modify_form_data,
          viz_type: visualType || 'dist_bar',
          dist_bar_sorter: form_data.dist_bar_sorter || 'value',
          x_as_date: form_data.x_as_date || false,
        };
      }
      break;
    case 'histogram':
      modify_form_data = {
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
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        extra_filters: form_data.extra_filters || [],
      };
      break;

    case 'osmmap':
      modify_form_data = {
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
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'country_map2':
    case 'country_map':
    case 'map':
      modify_form_data = {
        viz_type: visualType || 'country_map',
        entity: form_data.entity || null,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        metric: form_data.metric && form_data.metric.length > 0 ? form_data.metric : null,
        number_format: form_data.number_format || ',',
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        show_legend: form_data.show_legend || false,
        hide_title: form_data.hide_title,
        extra_filters: form_data.extra_filters || [],
      };

      if (visualType == 'country_map') {
        modify_form_data = {
          ...modify_form_data,
          viz_type: visualType || 'country_map',
          select_country: form_data.select_country || 'indonesia',
          // select_province: form_data.select_country == 'indonesia' ? form_data.select_province || '' : null,
          select_province:
            form_data.select_province == 'null' || !form_data.select_province ? '' : form_data.select_province,
          map_label: form_data.map_label && form_data.map_label.length > 0 ? form_data.map_label : null || null,
          tooltips: form_data.tooltips && form_data.tooltips.length > 0 ? form_data.tooltips : [] || [],
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
        modify_form_data = {
          ...modify_form_data,
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
      modify_form_data = {
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
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        gauge_label_type: form_data.gauge_label_type || 'value',
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'big_number_total':
      modify_form_data = {
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
        metric: form_data.metric || 'count',
        // metric: form_data.metrics || 'count',
        zoomsize: Number(form_data.zoomsize) || 5,
        subheader: form_data.subheader || null,
        subheaderfontsize: Number(form_data.subheaderfontsize) || 2,
        y_axis_format: form_data.y_axis_format || ',',
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        extra_filters: form_data.extra_filters || [],
      };
      break;

    case 'word_cloud':
      modify_form_data = {
        viz_type: visualType,
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        series: form_data.series && form_data.series.length > 0 ? form_data.series : null,
        metric: form_data.metric && form_data.metric.length > 0 ? form_data.metric : null,
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
        since: form_data.since || null,
        until: form_data.until || null,
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'line':
    case 'dual_line':
      modify_form_data = {
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
        since: form_data.since || null,
        until: form_data.until || null,
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
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        format_number_tooltips: form_data.format_number_tooltips || ',',
        extra_filters: form_data.extra_filters || [],
      };

      if (visualType == 'dual_line') {
        modify_form_data = {
          ...modify_form_data,
          viz_type: visualType || 'dual_line',
          metric: form_data.metric && form_data.metric.length > 0 ? form_data.metric : null,
          metric_2: form_data.metric_2 || null,
          y_axis_2_format: form_data.y_axis_2_format || ',',
          show_legend: form_data.show_legend || false,
          y_axis_line: form_data.y_axis_line || '',
          y_axis_label: form_data.y_axis_label || '',
          x_axis_label: form_data.x_axis_label || '',
        };
      } else {
        modify_form_data = {
          ...modify_form_data,
          viz_type: visualType || 'line',
          metrics:
            form_data.metrics && form_data.metrics.length > 0
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
      if (form_data.groupby_arrs && form_data.groupby_arrs.length > 0) {
        for (let item of form_data.groupby_arrs) {
          all_columns.push(item.value);
        }
      }
      modify_form_data = {
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
        records: records && records.length > 0 ? records : form_data.records || [],
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        initial_date_filter: form_data.initial_date_filter || '',
        since: form_data.since || null,
        until: form_data.until || null,
        extra_filters: form_data.extra_filters || [],
      };
      if (form_data.markup_type == 'html')
        modify_form_data = {
          ...modify_form_data,
          js: form_data.js,
          css: form_data.css,
        };
      break;
    case 'bubble':
      modify_form_data = {
        viz_type: visualType || 'bubble',
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
        show_legend: form_data.show_legend || false,
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
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',

        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'filter_box':
      modify_form_data = {
        viz_type: visualType || 'filter_box',
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        groupby: form_data.groupby || [],
        metric: form_data.metric && form_data.metric.length > 0 ? form_data.metric : null,
        // metric: form_data.metric && form_data.metric.length > 0 ? form_data.metric : null,
        date_filter: form_data.date_filter || false,
        instant_filtering: form_data.instant_filtering,
        alphabet_filter: form_data.alphabet_filter || false,
        filter_control_alphabetic: form_data.filter_control_alphabetic || null,
        filter_checkbox: form_data.filter_checkbox || false,
        filter_control_checkbox: form_data.filter_control_checkbox || null,
        filter_checkbox_columns: form_data.groupby ? form_data.groupby.map((s) => [s, s]) : [],
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        filter_alignment_horizontal: form_data.filter_alignment_horizontal || false,
        initial_date_filter: form_data.initial_date_filter || '',
      };
      break;
    case 'predictive':
      modify_form_data = {
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
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'scatter':
      modify_form_data = {
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
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'treemap':
      modify_form_data = {
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
          form_data.metrics && form_data.metrics.length > 0
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
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        show_legend: form_data.show_legend || false,
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'sunburst':
      modify_form_data = {
        viz_type: 'sunburst',
        viz_type2: visualType || 'sunburst',
        hide_title: form_data.hide_title,
        hide_background: form_data.hide_background,
        choose_pallete: form_data.choose_pallete || 'default_pallete',
        legend_position: form_data.legend_position || 'top',
        legend_type: form_data.legend_type || 'scroll',
        legend_orient: form_data.legend_orient || 'horizontal',
        legend_width: form_data.legend_width || 400,
        groupby: form_data.groupby || [],
        metrics: form_data.metrics && form_data.metrics.length > 0 ? form_data.metrics : null,
        color_scheme: form_data.color_scheme || 'palette1',
        random_color: form_data.random_color || false,
        // treemap_ratio: Number(form_data.treemap_ratio) || 1,
        number_format: form_data.number_format || '.3s',
        granularity_sqla: form_data.granularity_sqla || null,
        time_grain_sqla: form_data.time_grain_sqla || null,
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        // hide_label: form_data.hide_label || false,
        // labels_outside: form_data.labels_outside || false,
        hide_label: form_data.pie_label_position === 'hide',
        labels_outside: form_data.pie_label_position === 'outside',
        pie_label_position: form_data.pie_label_position || 'inside',
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'directed_force':
      modify_form_data = {
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
        metric: form_data.metric && form_data.metric.length > 0 ? form_data.metric : null,
        show_label: form_data.show_label,
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
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
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        colorpickers: form_data.colorpickers || [],
        colorpickers2: form_data.colorpickers2 || [],
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'heatmap':
      modify_form_data = {
        viz_type: 'heatmap',
        metrics: form_data.metrics || [],
        heat_map: {
          metric_heat_map: form_data.heat_map.metric_heat_map || null,
          x_heat_map: form_data.heat_map.x_heat_map || null,
          y_heat_map: form_data.heat_map.y_heat_map || null,
          sort_asc_x: form_data.heat_map.sort_asc_x,
          sort_asc_y: form_data.heat_map.sort_asc_y,
          limit_x: parseInt(form_data.heat_map.limit_x, 10) || 10,
          limit_y: parseInt(form_data.heat_map.limit_y, 10) || 10,
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
        since: form_data.since || null,
        until: form_data.until || null,
        filters: form_data.filters || [],
        chart_on_click: form_data.chart_on_click,
        link_to: form_data.link_to || null,
        colorpickers: form_data.colorpickers || [],
        number_format: form_data.number_format || ',',
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        style_tooltips: form_data.style_tooltips || 'item',
        initial_date_filter: form_data.initial_date_filter || '',
        notifications: form_data.notifications || [],
        initial_chart_blank: form_data.initial_chart_blank || false,
        is_hide_togle_filter: form_data.is_hide_togle_filter || false,
        hide_date_picker: form_data.hide_date_picker || false,
        is_axis_reverse: form_data.is_axis_reverse || false,
        left_margin: form_data.left_margin || 'auto',
        x_as_date: form_data.x_as_date || false,
        extra_filters: form_data.extra_filters || [],
      };
      break;
    case 'box_plot':
      modify_form_data = {
        viz_type: visualType,
        viz_type2: visualType || 'box_plot',
        groupby: form_data.groupby || [],
        columns: form_data.columns || [],
        metrics:
          form_data.metrics && form_data.metrics.length > 0
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
        format_number_id: form_data.format_number_id === 'true' || form_data.format_number_id === true ? true : false,
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
        since: form_data.since || null,
        until: form_data.until || null,
        filter_date: form_data.filter_date || null,
        filter_date_type: form_data.filter_date_type || null,
        initial_date_filter: form_data.initial_date_filter || '',
        filters: form_data.filters || [],
        extra_filters: form_data.extra_filters || [],
      };
      break;
  }
  /**
   * missing return page_sort and column_styles
   */
  return { modify_form_data, form_data };
};

export const bubble_form_initial = (form_data, explore, list_row_limit) => {
  return [
    {
      name: 'series',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.G',
      model: form_data.series,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore?.datasource?.filterable_cols,
    },
    {
      name: 'entity',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.SUBG',
      model: form_data.entity,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CE',
      options: explore?.datasource?.filterable_cols,
    },
    {
      name: 'limit',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.RL',
      model: form_data.limit,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CL',
      options: list_row_limit,
    },
    {
      name: 'size',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.V',
      model: form_data.size,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.SM',
      options: explore?.datasource?.metrics_combo,
    },
    {
      name: 'x',
      label: 'X Axis',
      model: form_data.x,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.SM',
      options: explore?.datasource?.metrics_combo,
    },
    {
      name: 'y',
      label: 'Y Axis',
      model: form_data.y,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.SM',
      options: explore?.datasource?.metrics_combo,
    },
  ];
};

export const predictive_form_initial = (form_data, explore) => {
  return [
    {
      name: 'pred_line',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.ML',
      model: form_data.pred_line,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore?.datasource?.metrics_combo,
    },
    {
      name: 'pred_upper',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.UV',
      model: form_data.pred_upper,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore?.datasource?.metrics_combo,
    },
    {
      name: 'pred_lower',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.LV',
      model: form_data.pred_lower,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore?.datasource?.metrics_combo,
    },
    {
      name: 'pred_actual',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.AD',
      model: form_data.pred_actual,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore?.datasource?.metrics_combo,
    },
  ];
};

export const dual_line_form_initial = (form_data, explore) => {
  return [
    {
      name: 'pred_line',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.ML',
      model: form_data.pred_line,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore?.datasource?.metrics_combo,
    },
    {
      name: 'pred_upper',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.UV',
      model: form_data.pred_upper,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore?.datasource?.metrics_combo,
    },
    {
      name: 'pred_lower',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.LV',
      model: form_data.pred_lower,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore?.datasource?.metrics_combo,
    },
    {
      name: 'pred_actual',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.AD',
      model: form_data.pred_actual,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore?.datasource?.metrics_combo,
    },
  ];
};
export const heatmap_form_initial = (form_data, explore, list_row_limit) => {
  return [
    {
      name: 'x_heat_map',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.FX',
      model: form_data.heat_map.x_heat_map,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore.datasource.filterable_cols,
      field: 'ng-select',
      required: true,
    },
    {
      name: 'y_heat_map',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.FY',
      model: form_data.heat_map.y_heat_map,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CD',
      options: explore.datasource.filterable_cols,
      field: 'ng-select',
      required: true,
    },
    {
      name: 'sort_asc_x',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.SX',
      model: form_data.heat_map.sort_asc_x,
      field: 'checkbox',
    },
    {
      name: 'sort_asc_y',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.SY',
      model: form_data.heat_map.sort_asc_y,
      field: 'checkbox',
    },
    {
      name: 'limit_x',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.RL' + 'X',
      model: form_data.heat_map.limit_x,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CL',
      options: list_row_limit,
      field: 'select',
    },
    {
      name: 'limit_y',
      label: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.RL' + 'Y',
      model: form_data.heat_map.limit_y,
      placeholder: 'MODULE.DATA_VISUAL.CHART.RIGHT_BAR.QUERY.CL',
      options: list_row_limit,
      field: 'select',
    },
  ];
};

let x = {
  all_columns: [],
  bottom_margin: 'auto',
  chart_on_click: true,
  choose_pallete: 'default_pallete',
  color_scheme: 'palette1',
  colorpickers: [],
  datasource: '5779a434-6002-464b-a38d-8110bddd55db|tabular_1_2022021110004760__table',
  datasource_name: 'tabular_1_2022021110004760',
  filter_date: null,
  filter_date_type: null,
  filters: [],
  format_number_id: false,
  format_number_tooltips: '.3s',
  granularity_sqla: null,
  groupby: [],
  heat_map: {
    limit_x: 10,
    limit_y: 10,
    metric_heat_map: 'avg__kapal_tiba',
    sort_asc_x: true,
    sort_asc_y: true,
    x_heat_map: 'pelabuhan',
    y_heat_map: 'tanggal',
  },
  hide_background: false,
  hide_date_picker: false,
  hide_title: false,
  initial_chart_blank: false,
  initial_date_filter: null,
  is_axis_reverse: false,
  is_hide_togle_filter: false,
  left_margin: 'auto',
  legend_orient: 'horizontal',
  legend_position: 'top',
  legend_type: 'scroll',
  legend_width: 400,
  link_to: null,
  metrics: [],
  notifications: [],
  number_format: '.3s',
  order_desc: false,
  random_color: false,
  row_limit: 1000,
  show_label: false,
  show_label_sort: false,
  show_legend: true,
  since: '',
  slice_id: 15300,
  style_tooltips: 'item',
  time_grain_sqla: null,
  until: '',
  viz_type: 'heatmap',
  x_as_date: false,
  x_axis_label: null,
  y_axis_label: null,
};
