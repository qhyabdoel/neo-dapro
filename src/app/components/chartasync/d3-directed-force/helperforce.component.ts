import { reformat_number } from 'src/app/libs/helpers/utility';

export const distinctArrayObject = (array_object, d3, fd?) => {
  const result = [];
  const map = new Map();
  if (array_object && array_object.length > 0) {
    for (const item of array_object) {
      if (!map.has(item.target)) {
        map.set(item.target, true);
        result.push({
          id: item.target,
          value: item.value,
          fvalue: reformatNumber(item.value, fd.number_format, fd.format_number_id, d3),
          group: 1,
        });
      }
      if (!map.has(item.source)) {
        map.set(item.source, true);
        result.push({
          id: item.source,
          value: item.value,
          fvalue: reformatNumber(item.value, fd.number_format, fd.format_number_id, d3),
          group: 1,
        });
      }
    }
  }
  return result;
};

const reformatNumber = (num, numberFormat, format_number_id, d3) => {
  if (!numberFormat) numberFormat = ',';
  let locale = format_number_id ? 'ID' : 'EN';
  let localeStr;
  if (locale === 'ID') localeStr = 'id-ID';
  else if (locale === 'EN') localeStr = 'en-US';
  let value = reformat_number(d3, num, numberFormat, locale, localeStr);
  return value;
};
