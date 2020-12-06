# README
#API:
##Parameters 
```
function createSliceWithSaga({
  // A name, used in action types
  name: string,
  // The initial state for the reducer
  initialState: any,
  // An object of "case reducers". Key names will be used to generate actions.
  reducers: Object<string, ReducerFunction | ReducerAndPrepareObject>
  // generator functions
  effects: Object<string, GeneratorFunction>,
  // A "builder callback" function used to add more reducers, or
  // an additional object of "case reducers", where the keys should be other
  // action types
  extraReducers?:
  | Object<string, ReducerFunction>
  | ((builder: ActionReducerMapBuilder<State>) => void)
})
```

##Return Value
```
{
    name : string,
    reducer : ReducerFunction,
    actions : Record<string, ActionCreator>,
    caseReducers: Record<string, CaseReducer>,
    watchers: SagaWatcherFunction,
    effectActions: Record<string, ActionCreator>,
}
```

#Demo
```
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
} = testSageSlice.effectActions; // action with caseSagas
export default testSageSlice.reducer;
export const testSagasWatchers = testSageSlice.watchers;

```