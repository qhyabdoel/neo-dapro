import moment from 'moment';
import { parseDate, reformatNumber } from 'src/app/libs/helpers/data-visualization-helper';
import * as formatNumberIdFile from 'src/assets/data/formatNumberID.json';
declare var d3: any;
export const setConfigPivotTable = (data: any, sanitizer: any) => {
  let formaterNumber = formatNumberIdFile;
  const html = sanitizer.bypassSecurityTrustHtml(
    data.data.html.replace('dataframe table', 'dataframe table-pivot table-pivot-hidden')
  );

  setTimeout(function () {
    let locale = data.form_data.format_number_id ? 'ID' : 'EN';
    d3.formatDefaultLocale(formaterNumber[locale]);
    reformatNumberTable(data);
    $('.table-pivot').DataTable();
    $('.table-pivot').removeClass('table-pivot-hidden');
  }, 100);

  return { html };
};

const reformatNumberTable = async (explore) => {
  const container = $('.pivot-container');
  let ini = this;
  // jQuery hack to format number
  container.find('table tbody tr').each(function () {
    $(this)
      .find('td')
      .each(function (i) {
        const tdText = $(this)[0].textContent;
        let isUtc = parseDate(tdText);
        if (!isUtc && !isNaN(tdText as any) && tdText !== '') {
          let num = reformatNumber(tdText, explore.form_data.number_format, explore, d3);
          $(this)[0].innerHTML = num;
          $(this)[0].textContent = num;
          $(this).css('text-align', 'right');
        } else if (isUtc && tdText !== '') {
          let formatedDate = moment(tdText).format('DD/MM/YYYY');
          $(this)[0].innerHTML = formatedDate;
          $(this)[0].textContent = formatedDate;
        }
      });
    $(this)
      .find('th')
      .each(function (i) {
        const tdText = $(this)[0].textContent;
        let isUtc = parseDate(tdText);
        if (!isUtc && !isNaN(tdText as any) && tdText !== '') {
          let num = reformatNumber(tdText, explore.form_data.number_format, explore, d3);
          $(this)[0].innerHTML = num;
          $(this)[0].textContent = num;
        } else if (isUtc && tdText !== '') {
          let formatedDate = moment(tdText).format('DD/MM/YYYY');
          $(this)[0].innerHTML = formatedDate;
          $(this)[0].textContent = formatedDate;
        }
      });
  });

  container.find('table tfoot tr').each(function () {
    $(this)
      .find('td')
      .each(function (i) {
        const tdText = $(this)[0].textContent;
        let isUtc = parseDate(tdText);
        if (!isUtc && !isNaN(tdText as any) && tdText !== '') {
          let num = reformatNumber(tdText, explore.form_data.number_format, explore, d3);
          $(this)[0].innerHTML = num;
          $(this)[0].textContent = num;
          $(this).css('text-align', 'right');
        } else if (isUtc && tdText !== '') {
          let formatedDate = moment(tdText).format('DD/MM/YYYY');
          $(this)[0].innerHTML = formatedDate;
          $(this)[0].textContent = formatedDate;
        }
      });
    $(this)
      .find('th')
      .each(function (i) {
        const tdText = $(this)[0].textContent;
        let isUtc = parseDate(tdText);
        if (!isUtc && !isNaN(tdText as any) && tdText !== '') {
          let num = reformatNumber(tdText, explore.form_data.number_format, explore, d3);
          $(this)[0].innerHTML = num;
          $(this)[0].textContent = num;
        } else if (isUtc && tdText !== '') {
          let formatedDate = moment(tdText).format('DD/MM/YYYY');
          $(this)[0].innerHTML = formatedDate;
          $(this)[0].textContent = formatedDate;
        }
      });
  });

  // reformat all di head & body
  container.find('table thead tr').each(function () {
    $(this)
      .find('th')
      .each(function (i) {
        const tdText = $(this)[0].textContent;
        if (!isNaN(tdText as any) && tdText !== '') {
          let num = reformatNumber(tdText, explore.form_data.number_format, explore, d3);
          $(this)[0].innerHTML = num;
          $(this)[0].textContent = num;
        }
      });
  });
};
