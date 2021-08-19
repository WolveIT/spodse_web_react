import Firestore from "../services/firestore";
import { refs } from "../services/utils/firebase_config";
import { localErrorHandler } from "../utils/errorHandler";

const namespace = "user";

const startLoading = (loadingType) => ({ type: "startLoading", loadingType });
const stopLoading = (loadingType) => ({ type: "stopLoading", loadingType });

export const fetchUser = (uid) => ({ type: `${namespace}/fetchCurrent`, uid });

export default {
  namespace,
  state: {
    current: undefined,
    loading: {
      fetchCurrent: false,
    },
  },

  effects: {
    *fetchCurrent({ uid }, { put, call }) {
      try {
        yield put(startLoading("fetchCurrent"));
        const user = yield call(Firestore.get, refs.users.doc(uid));
        yield put({ type: "setState", current: user });
        yield put(stopLoading("fetchCurrent"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "fetchCurrent" });
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
