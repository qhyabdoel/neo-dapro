export const setConfigChartHistogram = (data, explore, colorPalette) => {
  if (data.data == undefined) data = explore;
  let theme = data.form_data.color_scheme
    ? data.form_data.color_scheme != 'bnbColors'
      ? data.form_data.color_scheme
      : 'palette1'
    : 'palette1';
  let fromdata = '';
  let dataReplaceText = '';
  let dataReplaceValue = '';
  if (data.data != undefined) {
    fromdata = JSON.stringify(data.data);
    dataReplaceText = fromdata.split('text').join('name');
    dataReplaceValue = dataReplaceText.split('size').join('value');
  } else {
    // for shared visual
    fromdata = JSON.stringify(explore.data);
    dataReplaceText = fromdata.split('text').join('name');
    dataReplaceValue = dataReplaceText.split('size').join('value');
  }
  return {
    tooltip: {
      renderMode: 'html',
      confine: true,
      extraCssText: 'z-index: 1000',
    },
    grid: {
      top: '3%',
      bottom: '3%',
    },
    series: [
      {
        type: 'wordCloud',
        gridSize: 2,
        sizeRange: [
          Math.min(Math.max(Number(data.form_data.size_from), 12), 60) || 12,
          Math.min(Math.max(Number(data.form_data.size_to), 12), 60) || 60,
        ],
        rotationRange: data.form_data.rotation === 'random' ? [-90, 90] : [0, 0],
        shape: data.form_data.shape || 'pentagon',
        rotationStep: 45,
        left: 'center',
        top: 'center',
        width: '100%',
        height: '100%',
        right: null,
        padding: 0,
        bottom: null,
        drawOutOfBound: false,
        textStyle: {
          normal: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: function () {
              let getColotPallete = colorPalette[theme];
              return getColotPallete[Math.floor(Math.random() * getColotPallete.length)];
            },
          },
          emphasis: {},
        },
        data: JSON.parse(dataReplaceValue),
      },
    ],
  };
};

export const getConfigChartHistogram = async (data, explore, colorPalette) => {
  let config = {};
  if (data) {
    config = await setConfigChartHistogram(data, explore, colorPalette);
  }
  return config;
};
