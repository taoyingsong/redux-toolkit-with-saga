
# README
# Installation
```
yarn add redux-toolkit-with-saga
# or 
npm install redux-toolkit-with-saga --save
```

# Introduction
1. This package integrate Saga into RTK, you can use Saga like Demo.(The 
structure is a little like [Dva](https://dvajs.com/guide/)) <br />
2. This package is especially suitable for large projects that need to be gradually transformed.(
You can collect the callEffects from the return values and use as needed)

# API:
## Parameters 
```js
function createSliceWithSaga({
  // A name, used in action types
  name: string,

  // The initial state for the reducer
  initialState: any,

  // An object of "case reducers". Key names will be used to generate actions.
  reducers: Object<string, ReducerFunction | ReducerAndPrepareObject>

  // effect functions
  effects: Object<string, SliceEffect<any>>,

  // A "builder callback" function used to add more reducers, or
  // an additional object of "case reducers", where the keys should be other
  // action types
  extraReducers?:
  | Object<string, ReducerFunction>
  | ((builder: ActionReducerMapBuilder<State>) => void)
})
```

## Return Value
```js
{
    name : string,
    reducer : ReducerFunction,
    actions : Record<string, ActionCreator>,
    caseReducers: Record<string, CaseReducer>,
    callEffects: CallEffects,
    effectActions: SliceEffects,
}
```

# Demo
```js
import { fetchTestData } from './api';
const testInitialState = {...}
const testSageSlice = createSliceWithSaga({
  name: 'test',
  initialState: testInitialState,
  reducers: {
    getTestStart(state: TestState) {
      state.isLoading = true;
      state.error = null;
    },
    getTestSuccess(state, { payload }: PayloadAction<any>) {
        ...
    },
    getTestFailure(state: TestState) {
      state.isLoading = true;
      state.error = null;
    },
  },
  effects: {
    * fetchTestList({ payload }) {
      yield put({ type: 'test/getTestStart' });
      try {
        const result = yield call(fetchTestData, payload);
        yield put({
          type: 'test/getTestSuccess',
          payload: result
        });
      } catch (err) {
        yield put({
          type: 'test/getTestFailure',
          payload: err.toString()
        });
      }
    }
  }
});

export const {
  getTestStart,
  getTestSuccess,
  getTestFailure
} = testSageSlice.actions;
export const {
  fetchTestList
} = testSageSlice.effectActions;
export const testCallEffects = testSageSlice.callEffects;
export default testSageSlice.reducer;
```

```js
// you can create root saga like this
import { createRootSaga } from 'redux-toolkit-with-saga'
const rootSaga = createRootSaga([
  testCallEffects
]);
```