import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GeneralState } from 'src/app/libs/store/states/general.states';

const generalSelector = createFeatureSelector<GeneralState>('general');

export const isError500EncounteredSelector = createSelector(generalSelector, (general) => general.isError500Encountered);

export const isLanguageChangeTriggeredSelector = createSelector(generalSelector, (general) => general.isLanguageChangeTriggered);
