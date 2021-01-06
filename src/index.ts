import {
  createSlice,
  CreateSliceOptions,
  SliceCaseReducers,
  Slice,
  createAction,
} from '@reduxjs/toolkit';
import { takeLatest, takeEvery, call, all, take, fork } from 'redux-saga/effects';

export type SliceEffect<A = any> = {
  (args?: any): A;
}
export type SliceEffects = {
  [Key: string]: SliceEffect<any>;
};

export interface SliceWithSagaOptions<
    State = any,
    CR extends SliceCaseReducers<State> = SliceCaseReducers<State>,
    Name extends string = string,
    Effects extends SliceEffects = SliceEffects
 > extends CreateSliceOptions {
  effects?: Effects;
}

interface Watcher {
  (): any;
}

export type Watchers = Watcher[];

export interface SagaSlice extends Slice {
  effectActions: SliceEffects;
  watchers: Watchers;
}

export function getWatcherType(sliceName: string, effectKey: string): string {
  return `${sliceName}/${effectKey}`;
}

export function getWatcher(
    watcherType: string,
    effect: SliceEffect,
): Watcher {
  let type = 'takeEvery';
  switch (type) {
    case 'takeLatest':
      return function* () {
        yield takeLatest(watcherType, effect);
      };
    default:
      return function* () {
        yield takeEvery(watcherType, effect);
      };
  }
}
export function createSliceWithSaga<
    State,
    CaseReducers extends SliceCaseReducers<State>,
    Name extends string = string,
    Effects extends SliceEffects = SliceEffects
  >(
    options: SliceWithSagaOptions<State, CaseReducers, Name, Effects>
): SagaSlice {
  const { effects, name: sliceName } = options;

  delete options.effects;
  const _sliceResult = createSlice(options);

  const actionCreators: Record<string, SliceEffect<any>> = {};
  const sagas: Watchers = [];

  if (effects) {
    const effectsNames = Object.keys(effects);
    effectsNames.forEach((effectKey) => {
      const watcherType = getWatcherType(sliceName, effectKey);

      /**
       * const increment = createAction<number | undefined>('counter/increment')
       *
       * // 返回
       * const increment === (payload) => {
       *    if(payload) {
       *      return { type: 'counter/increment', payload}
       *    }
       *    return { type: 'counter/increment' }
       * }
       *
       * // 执行返回函数
       * increment() === { type: 'counter/increment' }
       * increment(3) === { type: 'counter/increment', payload: 3 }
       *
       */
      actionCreators[effectKey] = createAction(watcherType);
      sagas.push(getWatcher(watcherType, effects[effectKey]));
    });
  }

  return {
    watchers: sagas,
    effectActions: actionCreators,
    ..._sliceResult,
  };
}
