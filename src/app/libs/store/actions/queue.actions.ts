import { createAction, props } from "@ngrx/store";

export const PushQueue = createAction(
  '[PushQueue] Action',
  props<{ queue: QueueItem }>(),
);

export const PopQueue = createAction(
  '[PopQueue] Action',
);
