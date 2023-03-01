import moment from 'moment';
import { generateFormatDate, helperGenerateSpecificFormat } from './helperLine';

export const findSelectedValue = (selectedFilter, exploreJson, extraFilter, filteredChartType, idFilter) => {
  let selected = '';
  if (filteredChartType === 'pie' && extraFilter.length > 0 && idFilter === exploreJson.form_data.slice_id) {
    extraFilter.map((data, index) => {
      if (data.val.length > 0) {
        if (exploreJson.data.key.includes(data.val[0])) {
          selected = data.val[0] || '';
        } else if (index === 0) {
          selected = '';
        }
      } else {
        selected = '';
      }
    });
  }
  if (['dist_bar', 'horizontal_bar', 'line'].includes(filteredChartType)) {
    if (['dist_bar', 'horizontal_bar'].includes(filteredChartType)) {
      if (idFilter === exploreJson.form_data.slice_id) {
        selected = selectedFilter;
      } else {
        selected = '';
      }
    } else {
      selected = selectedFilter;
    }
  }

  return selected;
};

export const helperInitialDate = (exploreJson) => {
  let since = null;
  let until = null;
  if (exploreJson && exploreJson.form_data.initial_date_filter) {
    if (exploreJson.form_data.initial_date_filter === 'current_date') {
      // Initial Date Filter: Current Date
      let currentDate = new Date();
      if (exploreJson.form_data.filter_date_type === 'date') {
        since = moment(currentDate).startOf('day');
        until =
          exploreJson.form_data.filter_date === 'date_range_picker'
            ? moment(currentDate).endOf('month')
            : moment(currentDate).endOf('day');
      } else if (exploreJson.form_data.filter_date_type === 'month') {
        since = moment(currentDate).startOf('month').format();
        until = moment(currentDate).endOf('month').format();
      } else if (exploreJson.form_data.filter_date_type === 'year') {
        since = moment(currentDate).startOf('year').startOf('month');
        until = moment(currentDate).endOf('year').endOf('month');
      }
      since = since;
      until = until;
    } else if (exploreJson.form_data.initial_date_filter === 'latest_date') {
      // Initial Date Filter: Latest Date
      if (exploreJson.form_data.filter_date_type === 'date') {
        since = moment(exploreJson.latest_date).startOf('day');
        until =
          exploreJson.form_data.filter_date === 'date_range_picker'
            ? moment(exploreJson.latest_date).endOf('month')
            : moment(exploreJson.latest_date).endOf('day');
      } else if (exploreJson.form_data.filter_date_type === 'month') {
        since = moment(exploreJson.latest_date).startOf('month');
        until = moment(exploreJson.latest_date).endOf('month');
      } else if (exploreJson.form_data.filter_date_type === 'year') {
        since = moment(exploreJson.latest_date).startOf('year').startOf('month');
        until = moment(exploreJson.latest_date).endOf('year').endOf('month');
      }
      since = since;
      until = until;
    } else {
      // Initial Date Filter: Default
      since = moment(exploreJson.form_data.since).startOf('day');
      until = moment(exploreJson.form_data.until).endOf('day');
      since = since;
      until = until;
    }
  }
  return { since, until };
};

export const helperLineChartOnClick = (exploreJson, params, selectedFilter) => {
  const formatdate = generateFormatDate(exploreJson.form_data.time_grain_sqla, exploreJson.form_data.x_axis_format);
  let idFilter = 0;
  let extraFilter = [];
  let select = null;

  idFilter = exploreJson.form_data.slice_id;
  if (params.componentType !== 'markPoint') {
    select = `${params.seriesName}=${params.dataIndex},${params.data}`;
  }

  if (selectedFilter !== select && params.componentType !== 'markPoint') {
    selectedFilter = select;
    const { since, until } = helperGenerateSpecificFormat(
      exploreJson.form_data.time_grain_sqla,
      moment(params.name, formatdate).format('YYYY-MM-DD')
    );
    extraFilter.push({
      col: '__from',
      op: 'in',
      val: since || '',
    });
    extraFilter.push({
      col: '__to',
      op: 'in',
      val: until || '',
    });
    extraFilter.push({
      col: '__time_col',
      op: 'in',
      val: exploreJson.form_data.granularity_sqla,
    });
    if (exploreJson.form_data.style_tooltips === 'item' && exploreJson.form_data.groupby.length > 0) {
      extraFilter.push({
        col: exploreJson.form_data.groupby[0],
        op: '==',
        val: params.seriesName,
      });
    }
  } else {
    selectedFilter = '';
  }

  return { extraFilter, idFilter, selectedFilter };
};

export const helperHandleFilterChartOnDashboard = (
  listOfChartOnDashboard,
  explore_json,
  isApplyDashboard,
  chartIndex
) => {
  let dashboardList = Object.assign([], listOfChartOnDashboard);
  let collectingAfterFilter = [];
  if (isApplyDashboard) {
    dashboardList.map(async (data) => {
      if (data.exploreJson.form_data.viz_type !== 'filter_box' && explore_json.form_data.slice_id === data.myChartID) {
        data = {
          ...data,
          exploreJson: explore_json,
        };
      }
      collectingAfterFilter.push(data);
    });
  } else {
    dashboardList.map((data, i) => {
      if (chartIndex === i) {
        data = {
          ...data,
          exploreJson: explore_json,
        };
      }
      collectingAfterFilter.push(data);
    });
  }
  return collectingAfterFilter;
};

export const helperHandleExtraFilter = (isExtraFilter, exploreJson, since, until) => {
  // this.isExtraFilter always get from store selector
  let extraFilter = Object.assign([], isExtraFilter);
  // collect all existing value column in extraFilter
  let collectingExistingColumnInExtraFilter = extraFilter.map(({ col }) => col);
  // condition if visualtype country_map
  if (exploreJson.form_data.viz_type === 'country_map') {
    extraFilter.push({
      col: exploreJson.form_data.entity,
      op: 'in',
      val: [],
    });
  }
  if (exploreJson.form_data.groupby && exploreJson.form_data.viz_type !== 'country_map') {
    let collectingGroupAndColumn = [];

    if (exploreJson.form_data.style_tooltips !== 'axis') {
      collectingGroupAndColumn = exploreJson.form_data.groupby;
    } else {
      collectingGroupAndColumn = exploreJson.form_data.groupby.concat(
        exploreJson.form_data.columns ? exploreJson.form_data.columns : []
      );
    }

    //  filter extraFilter only available in groupby
    extraFilter = extraFilter.filter((item) => collectingGroupAndColumn.includes(item.col));

    // if extraFilter empty push all value base on groupby
    if (extraFilter.length === 0) {
      // push default value val = []
      exploreJson.form_data.groupby.map((data) =>
        extraFilter.push({
          col: data,
          op: 'in',
          val: [],
        })
      );
      if (exploreJson.form_data.columns && exploreJson.form_data.style_tooltips !== 'axis') {
        exploreJson.form_data.columns.map((data) =>
          extraFilter.push({
            col: data,
            op: 'in',
            val: [],
          })
        );
      }
    }
    if (extraFilter.length > 0) {
      // form of an array
      exploreJson.form_data.groupby.map((item) => {
        if (!collectingExistingColumnInExtraFilter.includes(item)) {
          extraFilter.push({
            col: item,
            op: 'in',
            val: [],
          });
        }
      });
      if (exploreJson.form_data.columns && exploreJson.form_data.style_tooltips !== 'axis') {
        exploreJson.form_data.columns.map((item) => {
          if (!collectingExistingColumnInExtraFilter.includes(item)) {
            extraFilter.push({
              col: item,
              op: 'in',
              val: [],
            });
          }
        });
      }
    }
  }
  /**
   * condition if it has a date or time on the chart specific since and until
   * condition when type chart line with granularity
   */
  if (exploreJson.form_data.granularity_sqla) {
    extraFilter.push({
      col: '__from',
      op: 'in',
      val: since ? moment(since).format() : '',
    });
    extraFilter.push({
      col: '__to',
      op: 'in',
      val: until ? moment(until).format() : '',
    });
    extraFilter.push({
      col: '__time_col',
      op: 'in',
      val: exploreJson.form_data.granularity_sqla,
    });
  }

  return extraFilter;
};
