import { CHART_CONSTANTS } from '.';

const generateDataWordcloud = (data) => {
  return data.map((data) => {
    return { value: data.size, name: data.text };
  });
};
export const setConfigChartWordcloud = (data: any) => {
  // dummy data when raw.data is empty
  // data = { ...data, data: [] };
  const colors = CHART_CONSTANTS.general.collorPalette[data.form_data.color_scheme] || [];
  return {
    // ======================================= START WORDCLOUD ==========================================================
    tooltip: {},
    series: [
      {
        type: 'wordCloud',
        sizeRange: [12, data.form_data.font_size],
        rotationRange: [0, 0],
        gridSize: 5,
        width: '100%',
        height: '90%',
        bottom: '15%',
        top: '0',
        shape: data.form_data.rotation ? data.form_data.rotation : 'circle',
        drawOutOfBound: false,
        keepAspect: true,
        textStyle: {
          fontFamily: data.form_data.font_family,
          fontWeight: 'bold',
          color: function () {
            return colors[Math.floor(Math.random() * colors.length)];
          },
        },
        emphasis: {
          textStyle: {
            color: '#fff',
          },
        },
        data: generateDataWordcloud(data.data),
      },
    ],
    // ======================================= END WORDCLOUD ==========================================================
  };
};
