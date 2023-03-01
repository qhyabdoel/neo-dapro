import { createReducer, on } from '@ngrx/store';

import { QueuesState } from "src/app/libs/store/states";
import { PushQueue, PopQueue } from "src/app/libs/store/actions/queue.actions";

const initialQueuesState: QueuesState = {
  fifoQueues: [],
};

export const queuesReducer = createReducer(
  initialQueuesState,
  on(PushQueue, (state, prop) => {
    const _fifoQueues = state.fifoQueues && state.fifoQueues.length > 0 ? [...state.fifoQueues] : [];
    _fifoQueues.push(prop.queue);

    return {
      ...state,
      fifoQueues: _fifoQueues,
    };
  }),
  on(PopQueue, (state) => {
    let _fifoQueues = state.fifoQueues && state.fifoQueues.length > 0 ? [...state.fifoQueues] : [];
    _fifoQueues = _fifoQueues.filter((_fifoQueue, i) => i > 0);

    return {
      ...state,
      fifoQueues: _fifoQueues,
    };
  }),
);
