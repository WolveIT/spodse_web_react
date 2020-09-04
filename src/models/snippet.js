import { localErrorHandler } from "../utils/errorHandler";

const namespace = "snippet";

const startLoading = (loadingType) => ({ type: "startLoading", loadingType });
const stopLoading = (loadingType) => ({ type: "stopLoading", loadingType });

export default {
  namespace,
  state: {
    loading: {
      fakeApi: false,
    },
  },

  effects: {
    *fakeApi(_, { put, call, select }) {
      try {
        yield put(startLoading("fakeApi"));
        yield call(delay, 1200);
        yield put(stopLoading("fakeApi"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "fakeApi" });
      }
    },
  },

  subscriptions: {},

  reducers: {
    setState(state, newState) {
      return { ...state, ...newState };
    },
    startLoading(state, { loadingType }) {
      return { ...state, loading: { ...state.loading, [loadingType]: true } };
    },
    stopLoading(state, { loadingType }) {
      return { ...state, loading: { ...state.loading, [loadingType]: false } };
    },
  },
};
