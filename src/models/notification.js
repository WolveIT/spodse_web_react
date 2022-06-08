import { localErrorHandler } from "../utils/errorHandler";
import Notification from "../services/notification";

const namespace = "notification";

const startLoading = (loadingType) => ({ type: "startLoading", loadingType });
const stopLoading = (loadingType) => ({ type: "stopLoading", loadingType });

export const sendManualNotification = (
  { uids, title, body, dataPayload },
  onSuccess
) => ({
  type: `${namespace}/sendManual`,
  uids,
  title,
  body,
  dataPayload,
  onSuccess,
});

export default {
  namespace,
  state: {
    loading: {
      sendManual: false,
    },
  },

  effects: {
    *sendManual({ uids, title, body, dataPayload, onSuccess }, { put, call }) {
      try {
        yield put(startLoading("sendManual"));
        yield call(Notification.send_manual, {
          uids,
          title,
          body,
          dataPayload,
        });
        yield put(stopLoading("sendManual"));
        if (typeof onSuccess === "function") onSuccess();
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "sendManual" });
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
