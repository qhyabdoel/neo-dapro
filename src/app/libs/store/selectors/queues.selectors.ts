import { createFeatureSelector, createSelector } from "@ngrx/store";
import { QueuesState } from "src/app/libs/store/states";

const queuesSelector = createFeatureSelector<QueuesState>('queues');

export const fifoQueuesSelector = createSelector(queuesSelector, (queues) => queues.fifoQueues);

