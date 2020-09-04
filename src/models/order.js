import { localErrorHandler } from "../utils/errorHandler";
import GlobalConfig from "../services/globalConfig";
import Order from "../services/order";
import { docToData, removeKey } from "../services/utils/utils";

const namespace = "order";

const startLoading = (loadingType) => ({ type: "startLoading", loadingType });
const stopLoading = (loadingType) => ({ type: "stopLoading", loadingType });

export const fetchTransport = () => ({ type: `${namespace}/fetchTransport` });
export const loadPhoneSuggestion = (phoneNumber) => ({
  type: `${namespace}/loadPhoneSuggestion`,
  phoneNumber,
});

export default {
  namespace,
  state: {
    transport: undefined,
    phoneSuggestion: [],
    loading: {
      transport: false,
      phoneSuggestion: false,
    },
  },

  effects: {
    *fetchTransport(action, { put, call, select }) {
      try {
        const prev = yield select((state) => state[namespace].transport);
        if (prev?.length > 0) return;

        yield put(startLoading("transport"));

        let transport = [];
        const tankers = yield call(
          GlobalConfig.get_value,
          "transport",
          "tankerTypes"
        );
        for (let [type, config] of Object.entries(tankers)) {
          for (let [gallons, price] of Object.entries(config.gallons))
            transport.push({
              type,
              waterAmount: gallons,
              price,
              cancellation: config.cancellation.customer,
            });
        }
        yield put({ type: "setState", transport });
        yield put(stopLoading("transport"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "transport" });
        yield put({ type: "setState", transport: [] });
      }
    },

    *loadPhoneSuggestion({ phoneNumber }, { put, call }) {
      try {
        yield put(startLoading("phoneSuggestion"));
        const customer = yield call(Order.get_customer_by_phone, phoneNumber);
        if (customer)
          yield put({
            type: "setState",
            phoneSuggestion: [
              removeKey({ ...customer, phoneNumber }, "_original"),
            ],
          });
        else yield put({ type: "setState", phoneSuggestion: [] });
        yield put(stopLoading("phoneSuggestion"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "phoneSuggestion" });
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
