import { rest_api } from 'src/app/libs/configs';

export const topbar_option_application = (messages) => {
  return {
    menuName: messages.APPLICATIONS.APP,
    isTitle: true,
    title: '',

    isButtonToggleLeft: true,
    buttonToggleLeftName: '',
    buttonToggleLeftTooltip: '',

    isButtonToggleRight: true,
    buttonToggleRightname: '',
    buttonToggleRightTooltip: '',

    isButtonNew: true,
    buttonNewName: '',
    buttonNewTooltip: '',

    isButtonSave: true,
    buttonSaveName: '',
    buttonSaveTooltip: '',

    isButtonPreview: true,
    buttonPreviewName: '',
    buttonPreviewTooltip: '',
  };
};

export const leftbar_option_application = [
  {
    name: 'application',
    title: 'Application',
    subTitle: 'Dasboard',
    getUrl: `${rest_api.API_APPLICATION_LIST}`,
    deleteUrl: `${rest_api.API_APPLICATION_LIST}/slug/delete`,
    deleteIdField: 'slug',
    searchField: 'title',
    infoLoopField: 'menu',
    translateHeaderTitle: 'MODULE.DATA_APPLICATIONS.LEFT_BAR.APP_LIST',
  },
];
