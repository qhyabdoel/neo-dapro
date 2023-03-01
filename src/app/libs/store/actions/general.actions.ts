import { createAction, props } from '@ngrx/store';

// export enum GeneralActionTypes {
//   SetOpenDialogNavbar = '[SetOpenDialogNavbar] Action',
// }

// export const SetOpenDialogNavbar = createAction(GeneralActionTypes.SetOpenDialogNavbar, props<{ open: any }>());

export const SetIsError500Encountered = createAction('[SetIsError500Encountered] Action', props<{ isError500Encountered: boolean }>());

export const SetIsLanguageChangeTriggered = createAction('', props<{ isLanguageChangeTriggered: boolean }>());
