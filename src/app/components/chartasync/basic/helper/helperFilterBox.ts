export const setConfigChartFilterBox = (data: any) => {
  // dummy data when raw.data is empty
  // data = { ...data, data: [] };
  let options = {
    data: data.data,
  };
  return options;
};
