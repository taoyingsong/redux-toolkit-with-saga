import { Action, AnyAction } from 'redux';
import {
  createSlice,
  CreateSliceOptions,
  Slice,
  PayloadAction,
  PayloadActionCreator,
  ActionCreatorWithoutPayload,
  PrepareAction,
  createAction,
  ActionCreatorWithPreparedPayload,
} from '@reduxjs/toolkit';
import { call, takeLatest, all, CallEffect, take, fork, AllEffect, takeEvery } from 'redux-saga/effects';

export type Effect<A extends Action = AnyAction> = (action: A) => any;

export type SliceEffects = {
  [Key: string]: Effect<PayloadAction<any>>;
};
//
// type ActionCreatorForEffectWithPrepare<CR extends { prepare: any }> = ActionCreatorWithPreparedPayload<
//   CR['prepare'],
//   string
// >;
//
// type ActionCreatorForEffects<CR> = CR extends (action: infer Action) => any
//   ? Action extends { payload: infer P }
//     ? PayloadActionCreator<P>
//     : ActionCreatorWithoutPayload
//   : ActionCreatorWithoutPayload;
//
// export type SliceEffectActions<Effects extends SliceEffects> = {
//   [Type in keyof Effects]: Effects[Type] extends { prepare: any }
//     ? ActionCreatorForEffectWithPrepare<Effects[Type]>
//     : ActionCreatorForEffects<Effects[Type]>;
// };

declare type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
export type ValidateEffects<ACR extends SliceEffects> = ACR &
  {
    [T in keyof ACR]: ACR[T] extends {
      saga(action?: infer A): any;
    }
      ? {
          prepare(...a: never[]): Omit<A, 'type'>;
        }
      : {};
  };

export interface SliceWithSagaOptions<CR extends SliceEffects = SliceEffects> extends CreateSliceOptions {
  effects?: ValidateEffects<CR>;
}

export interface SagaSlice extends Slice {
  effectActions: any;
  watchers: any;
}

export function getWatcherType(sliceName: string, effectKey: string): string {
  return `${sliceName}/${effectKey}`;
}

export function getWatcher(
  watcherType: string = 'takeEvery',
  effect: Effect<PayloadAction<any>>,
  args?: any[],
): any {
  switch (watcherType) {
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

export function createSliceWithSaga<Effects extends SliceEffects>(options: SliceWithSagaOptions<Effects>): SagaSlice {
  const { effects, name: sliceName } = options;

  // RTK执行部分
  delete options.effects;
  const _sliceResult = createSlice(options);

  const actionCreators: Record<string, ActionCreatorWithPreparedPayload<any[], any, string, never, never>> = {};
  const sagas: CallEffect[] = [];

  if (effects) {
    const effectsNames = Object.keys(effects);
    effectsNames.forEach((effectKey) => {
      const watcherType = getWatcherType(sliceName, effectKey);
      // let prepareCallback: PrepareAction<any> | undefined;

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

      // saga的这部分可以不用prepareCallback， RTK的action部分可以有
      // actionCreators[effectKey] = prepareCallback
      //     ? createAction(watcherType, prepareCallback)
      //     : createAction(watcherType);

      sagas.push(getWatcher(watcherType, effects[effectKey]));
    });
  }

  return {
    watchers: sagas,
    effectActions: actionCreators,
    ..._sliceResult,
  };
}
