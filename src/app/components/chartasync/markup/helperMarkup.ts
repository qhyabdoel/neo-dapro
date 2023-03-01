export const setConfigChart = (data, isFilter, isDateFilter, isInitialDateFilter, isView) => {
  let html = '';
  let groupby_arrs = data.form_data.groupby_arrs;
  if (data.form_data.markup_type == 'html') {
    if (data.data.css != null) {
      html += `<style>` + data.data.css + `</style>\n`;
    }
    html += data.data.html;
    for (let i = 0; i < groupby_arrs.length; i++) {
      // cek is isFilter
      if (isFilter) {
        if (data.data.records && data.data.records.length > 0) {
          for (let j = 0; j < data.data.records.length; j++) {
            let regex = new RegExp('#' + groupby_arrs[i].key + '#', 'g');
            let regex2 = new RegExp('#' + String(groupby_arrs[i].key).toLowerCase() + '#', 'g');
            let value = data.data.records[j][groupby_arrs[i].value];
            if (value) {
              html = html
                .replace('#' + groupby_arrs[i].key + '#', value)
                .replace('#' + String(groupby_arrs[i].key).toLowerCase() + '#', value)
                .replace(regex, value)
                .replace(regex2, value);
            }
          }
        }
      } else if (
        data.form_data.initial_date_filter !== null &&
        data.form_data.initial_date_filter !== '' &&
        data.form_data.initial_date_filter &&
        !isDateFilter &&
        !isInitialDateFilter
      ) {
        if (data.data.records && data.data.records.length > 0) {
          for (let j = 0; j < data.data.records.length; j++) {
            let regex = new RegExp('#' + groupby_arrs[i].key + '#', 'g');
            let regex2 = new RegExp('#' + String(groupby_arrs[i].key).toLowerCase() + '#', 'g');
            let value = data.data.records[j][groupby_arrs[i].value];
            if (value) {
              html = html
                .replace('#' + groupby_arrs[i].key + '#', value)
                .replace('#' + String(groupby_arrs[i].key).toLowerCase() + '#', value)
                .replace(regex, value)
                .replace(regex2, value);
            }
          }
        }
      } else {
        if (data.data.records && data.data.records.length > 0) {
          for (let j = 0; j < data.data.records.length; j++) {
            let regex = new RegExp('#' + groupby_arrs[i].key + '#', 'g');
            let regex2 = new RegExp('#' + String(groupby_arrs[i].key).toLowerCase() + '#', 'g');
            let value = data.data.records[j][groupby_arrs[i].value];
            if (value) {
              html = html
                .replace('#' + groupby_arrs[i].key + '#', value)
                .replace('#' + String(groupby_arrs[i].key).toLowerCase() + '#', value)
                .replace(regex, value)
                .replace(regex2, value);
            }
          }
        }
      }
    }
    if (data.data.js != null) {
      html += `<script>` + data.data.js + `</script>\n`;
    }
  } else {
    html = data.data.html;
    for (let i = 0; i < groupby_arrs.length; i++) {
      // cek is isFilter
      if (isFilter) {
        if (data.data.records && data.data.records.length > 0) {
          for (let j = 0; j < data.data.records.length; j++) {
            let regex = new RegExp('#' + groupby_arrs[i].key + '#', 'g');
            let regex2 = new RegExp('#' + String(groupby_arrs[i].key).toLowerCase() + '#', 'g');
            let value = data.data.records[j][groupby_arrs[i].value];
            if (value && value != '') {
              html = html
                .replace('#' + groupby_arrs[i].key + '#', value)
                .replace('#' + String(groupby_arrs[i].key).toLowerCase() + '#', value)
                .replace(regex, value)
                .replace(regex2, value);
            }
          }
        }
      } else {
        if (isView) {
          if (data.data.records && data.data.records.length > 0) {
            for (let j = 0; j < data.data.records.length; j++) {
              let regex = new RegExp('#' + groupby_arrs[i].key + '#', 'g');
              let regex2 = new RegExp('#' + String(groupby_arrs[i].key).toLowerCase() + '#', 'g');
              let value = data.form_data.records[j][groupby_arrs[i].value];
              if (value && value != '') {
                html = html
                  .replace('#' + groupby_arrs[i].key + '#', value)
                  .replace('#' + String(groupby_arrs[i].key).toLowerCase() + '#', value)
                  .replace(regex, value)
                  .replace(regex2, value);
              }
            }
          }
        } else {
          if (data.form_data.records && data.form_data.records.length > 0) {
            for (let j = 0; j < data.form_data.records.length; j++) {
              let regex = new RegExp('#' + groupby_arrs[i].key + '#', 'g');
              let regex2 = new RegExp('#' + String(groupby_arrs[i].key).toLowerCase() + '#', 'g');
              let value = data.form_data.records[j][groupby_arrs[i].value];
              if (value && value != '') {
                html = html
                  .replace('#' + groupby_arrs[i].key + '#', value)
                  .replace('#' + String(groupby_arrs[i].key).toLowerCase() + '#', value)
                  .replace(regex, value)
                  .replace(regex2, value);
              }
            }
          }
        }
      }
    }
  }

  return html;
};
