import moment from 'moment';

//Configuration chart function
export const setInitialDate = (param, explore) => {
  if (
    param !== undefined &&
    param.form_data.initial_date_filter != null &&
    param.form_data.initial_date_filter != '' &&
    param.form_data.initial_date_filter !== undefined
  ) {
    if (param.form_data.initial_date_filter !== undefined && param.form_data.initial_date_filter === 'latest_date') {
      if (param.form_data.filter_date_type === 'date') {
        param.form_data.since = moment(explore.latest_date).startOf('day').format('YYYY-MM-DDTHH:mm:ss');
        param.form_data.until = moment(explore.latest_date).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
      } else if (param.form_data.filter_date_type === 'month') {
        param.form_data.since = moment(explore.latest_date).startOf('month').format('YYYY-MM-DDTHH:mm:ss');
        param.form_data.until = moment(explore.latest_date).endOf('month').format('YYYY-MM-DDTHH:mm:ss');
      } else if (param.form_data.filter_date_type === 'year') {
        param.form_data.since = moment(explore.latest_date)
          .startOf('year')
          .startOf('month')
          .format('YYYY-MM-DDTHH:mm:ss');
        param.form_data.until = moment(explore.latest_date).endOf('year').endOf('month').format('YYYY-MM-DDTHH:mm:ss');
      }
    } else {
      param.form_data.since = '';
      param.form_data.until = '';
    }
  }
  return param;
};

export const alphabeth = [
  ['a', 'A'],
  ['b', 'B'],
  ['c', 'C'],
  ['d', 'D'],
  ['e', 'E'],
  ['f', 'F'],
  ['g', 'G'],
  ['h', 'H'],
  ['i', 'I'],
  ['j', 'J'],
  ['k', 'K'],
  ['l', 'L'],
  ['m', 'M'],
  ['n', 'N'],
  ['o', 'O'],
  ['p', 'P'],
  ['q', 'Q'],
  ['r', 'R'],
  ['s', 'S'],
  ['t', 'T'],
  ['u', 'U'],
  ['v', 'V'],
  ['w', 'W'],
  ['x', 'X'],
  ['y', 'Y'],
  ['z', 'Z'],
];
