import { createReducer, on } from '@ngrx/store';

import { SetIsError500Encountered, SetIsLanguageChangeTriggered } from 'src/app/libs/store/actions/general.actions';
import { GeneralState } from 'src/app/libs/store/states/general.states';

const initialState: GeneralState = {
  isError500Encountered: false,
  isLanguageChangeTriggered: false,
};

export const generalReducer = createReducer(
  initialState,
  on(SetIsError500Encountered, (state: GeneralState, props: any) => {
    return {
      ...state,
      isError500Encountered: props.isError500Encountered,
    };
  }),
  on(SetIsLanguageChangeTriggered, (state: GeneralState, props: any) => {
    return {
      ...state,
      isLanguageChangeTriggered: props.isLanguageChangeTriggered,
    };
  }),
);
