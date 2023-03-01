import { generateLegend, chartGrid, axisFormater, CHART_CONSTANTS } from '.';
import { convert_metric_to_verbose, extract_date_filter, get_format_date } from 'src/app/libs/helpers/utility';
import moment from 'moment';

declare var d3: any;

const generateSeries = (data) => {
    let scheme = data.form_data.color_scheme != 'bnbColors' ? data.form_data.color_scheme : 'palette1';
    let formatDate = get_format_date(data.form_data.x_axis_format);
    let colorPalette = CHART_CONSTANTS.general.collorPalette[scheme] || [];

    // mapping data dots, areas, & lines
    var yFormat = d3.format(data.form_data.y_axis_format);
    
    // mapping dots
    var chartDots = {
        name: data.data.dots[0].key,
        data: data.data.dots[0].values.map((item:any) => {
            let val2 = yFormat != undefined
                ? data.form_data.y_axis_format == '.3s'
                ? axisFormater(item.y, data)
                : yFormat(item.y).replace('m', '').replace('M', '')
                : String(item.y).replace('m', '').replace('M', '');

            if (data.form_data.y_log_scale) val2 = val2 > 0 ? Math.log10(val2) : 0;
            
            return [
                moment(item.x).format(formatDate),
                parseFloat(val2)
            ];
        }),
        type: 'scatter',
        symbol: 'circle',
        symbolSize: 10,
        emphasis: { label: { show: true, position: 'left', fontSize: 16 } },
        itemStyle: { color: () => colorPalette[Math.floor(Math.random() * colorPalette.length)] },
    };
    
    // mapping lines
    var chartLines = {
        name: convert_metric_to_verbose(data.data.lines[0].key, data),
        type: 'line',
        data: data.data.lines[0].values.map((v) =>
        yFormat != undefined
            ? data.form_data.y_axis_format == '.3s'
            ? axisFormater(v.y, data)
            : yFormat(parseFloat(v.y))
            : parseFloat(v.y)
        ),
        showSymbol: false,
    };

    // mapping areas
    var areas = data.data.areas;

    // upper
    var chartAreasUpper = {
        name: convert_metric_to_verbose(areas[0].key, data),
        data: areas[0].values.map((v) => {
            if (Number(v.upper) > Number(v.lower)) {
                return yFormat != undefined
                ? data.form_data.y_axis_format == '.3s'
                    ? axisFormater(v.upper, data)
                    : yFormat(parseFloat(v.upper))
                : parseFloat(v.upper);
            } else {
                return yFormat != undefined
                ? data.form_data.y_axis_format == '.3s'
                    ? axisFormater(v.lower, data)
                    : yFormat(parseFloat(v.lower))
                : parseFloat(v.lower);
            }
        }),
        type: 'line'
    };

    // lower
    var chartAreasLower = {
        name: convert_metric_to_verbose(areas[1].key, data),
        data: areas[1].values.length > 0
            ? areas[1].values.map((v) => {
                if (Number(v.upper) > Number(v.lower)) {
                return yFormat != undefined
                    ? data.form_data.y_axis_format == '.3s'
                    ? axisFormater(v.upper, data)
                    : yFormat(parseFloat(v.upper))
                    : parseFloat(v.upper);
                } else {
                return yFormat != undefined
                    ? data.form_data.y_axis_format == '.3s'
                    ? axisFormater(v.lower, data)
                    : yFormat(parseFloat(v.lower))
                    : parseFloat(v.lower);
                }
            })
            : [],
        type: 'line'
    };

    return [chartDots, chartLines, chartAreasUpper, chartAreasLower];
}

export const setConfigChartScatter = (data:any) => {
    let formatDate = get_format_date(data.form_data.x_axis_format);

    return {
        xAxis: [{
            type: data.form_data.x_log_scale ? 'log' : 'category',
            logBase: 10,
            data: data.data.dots[0].values.map((item:any) => moment(item.x).format(formatDate)),
            name: data.form_data.x_axis_label || '',
            nameLocation: 'center',
            nameGap: 35,
            show: true,
            position: 'bottom',
            axisLabel: { fontSize: 10 },
        }],
        yAxis: [{
            type: 'value',
            data: [],
            name: data.form_data.y_axis_label || '',
            nameLocation: 'center',
            nameGap: 35,
            axisLabel: {
                formatter: (value: any) => axisFormater(value, data),
                fontSize: 10,
            },
            show: true,
            position: 'left',
            splitLine: { lineStyle: { type: 'dashed', color: '#8c8c8c' } },
            axisLine: { show: true },
        }],
        series: generateSeries(data),
        label: { color: 'auto' },
    };
}