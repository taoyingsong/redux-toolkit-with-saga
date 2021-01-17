
# README
# Installation
```
yarn add redux-toolkit-with-saga
# or 
npm install redux-toolkit-with-saga --save
```

# Introduction
1. With this package you can integrate Saga into RTK, 
organize code like the structure of [Dva](https://dvajs.com/guide/)) or use Saga separately from RTK<br />
2. This package is especially suitable for large projects that need to be gradually transformed.(
You can collect the callEffects from the return values and use as needed)

# API:
## 1. createSliceWithSaga：
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
**Return Value Type**
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

## 2. createSagaSlice:
```js
function createSagaSlice({
  // A name, used in action types
  name: string,

  // effect functions
  effects: Object<string, SliceEffect<any>>,

})
```
**Return Value Type**
```js
{
    callEffects: CallEffects,
    effectActions: SliceEffects,
}
```

# Demo1
```js
import { fetchTestData } from './api';
const testInitialState = {...}
const testSliceWithSaga = createSliceWithSaga({
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
} = testSliceWithSaga.actions;
export const {
  fetchTestList
} = testSliceWithSaga.effectActions;
export const testCallEffects = testSliceWithSaga.callEffects;
export default testSliceWithSaga.reducer;
```

```js
// you can create root saga like this
import { createRootSaga } from 'redux-toolkit-with-saga'
const rootSaga = createRootSaga([
  testCallEffects
]);
```

# Demo2
```js
import { fetchTestData } from './api';
const testInitialState = {...}
const testSlice = createSlice({
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
  }
});

export const {
  getTestStart,
  getTestSuccess,
  getTestFailure
} = testSlice.actions;
export default testSlice.reducer;

const testSagaSlice = createSagaSlice({
  name: testSlice.name,
  effects: {
    * fetchTestList({ payload }) {
      yield put(getTestStart());
      try {
        const result = yield call(fetchTestData, payload);
        yield put(getTestSuccess(result));
      } catch (err) {
        yield put(getTestFailure(err.toString()));
      }
    }
  }
})

export const {
  fetchTestList
} = testSagaSlice.effectActions;
export const testCallEffects = testSagaSlice.callEffects;
```

```js
// you can create root saga like this
import { createRootSaga } from 'redux-toolkit-with-saga'
const rootSaga = createRootSaga([
  testCallEffects
]);
```