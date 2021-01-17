import { createSlice, CreateSliceOptions, SliceCaseReducers, Slice, createAction } from '@reduxjs/toolkit';
import { takeLatest, takeEvery, CallEffect, call, all, take, fork } from 'redux-saga/effects';

type Watcher = () => any;

export type SliceEffect<A = any> = (args?: any) => A;
export type SliceEffects = {
  [Key: string]: SliceEffect<any>;
};
export type CallEffects = CallEffect[];

export function createRootSaga(callEffects: CallEffects[]): any {
  let rootCallEffects: CallEffects = [];
  callEffects.forEach((callEffect: CallEffects) => {
    rootCallEffects = [...rootCallEffects, ...callEffect];
  });
  return function* () {
    yield all(rootCallEffects);
  };
}

export function getWatcherType(sliceName: string, effectKey: string): string {
  return `${sliceName}/${effectKey}`;
}

export function getWatcher(sageType: string, watcherType: string, effect: SliceEffect): Watcher {
  switch (sageType) {
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

/**
 * dva style
 * @param options
 */
export interface SliceWithSagaOptions<
    State = any,
    CR extends SliceCaseReducers<State> = SliceCaseReducers<State>,
    Name extends string = string,
    Effects extends SliceEffects = SliceEffects
    > extends CreateSliceOptions {
  effects?: Effects;
}
export interface SliceSaga extends Slice {
  effectActions: SliceEffects;
  callEffects: CallEffects;
}
export function createSliceWithSaga<
  State,
  CaseReducers extends SliceCaseReducers<State>,
  Name extends string = string,
  Effects extends SliceEffects = SliceEffects
>(options: SliceWithSagaOptions<State, CaseReducers, Name, Effects>): SliceSaga {
  const { effects, name: sliceName } = options;

  delete options.effects;
  const _sliceResult = createSlice(options);

  const actionCreators: Record<string, SliceEffect<any>> = {};
  const callEffects: CallEffects = [];

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
      callEffects.push(call(getWatcher('takeEvery', watcherType, effects[effectKey])));
    });
  }

  return {
    callEffects,
    effectActions: actionCreators,
    ..._sliceResult,
  };
}

/**
 * plugin style
 */
export interface SagaSliceOptions<
    Name extends string = string,
    Effects extends SliceEffects = SliceEffects
> {
  name: Name;
  effects: Effects;
}
export interface SagaSlice {
  effectActions: SliceEffects;
  callEffects: CallEffects;
}
export function createSagaSlice<
    Name extends string = string,
    Effects extends SliceEffects = SliceEffects
    >(options: SagaSliceOptions<Name, Effects>): SagaSlice {
  const { effects, name: sliceName } = options;

  const actionCreators: Record<string, SliceEffect<any>> = {};
  const callEffects: CallEffects = [];

  if (effects) {
    const effectsNames = Object.keys(effects);
    effectsNames.forEach((effectKey) => {
      const watcherType = getWatcherType(sliceName, effectKey);

      actionCreators[effectKey] = createAction(watcherType);
      callEffects.push(call(getWatcher('takeEvery', watcherType, effects[effectKey])));
    });
  }

  return {
    callEffects,
    effectActions: actionCreators,
  };
}
