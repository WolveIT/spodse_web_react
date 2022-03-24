import { refs } from "../services/utils/firebase_config";
import { PaginatedList } from "../services/utils/paginated_list";
import { localErrorHandler } from "../utils/errorHandler";

const namespace = "appUser";

const startLoading = (loadingType) => ({ type: "startLoading", loadingType });
const stopLoading = (loadingType) => ({ type: "stopLoading", loadingType });

export const saveUser = (currentUser) => ({
  type: `${namespace}/setState`,
  current: currentUser,
});

let noMore = false;
const perBatch = 15;
export const fetchUsers = (reset = false) => ({
  type: `${namespace}/fetchList`,
  reset,
});

export const clearUsersList = () => {
  noMore = false;
  return {
    type: `${namespace}/setState`,
    list: [],
    listInstance: null,
  };
};

export default {
  namespace,
  state: {
    current: undefined,
    latest: undefined,
    list: [],
    listInstance: null,
    loading: {
      list: false,
    },
  },

  effects: {
    *fetchList({ reset }, { select, put, call }) {
      try {
        if (reset === true) yield put(clearUsersList());
        let [listInstance, loading] = yield select((state) => [
          state[namespace].listInstance,
          state[namespace].loading.list,
        ]);
        if (reset !== true && (noMore || loading)) return;

        yield put(startLoading("list"));

        if (!listInstance)
          listInstance = new PaginatedList({
            perBatch,
            basicQuery: refs.users.orderBy("createdAt", "desc"),
          });

        yield put({
          type: "setState",
          listInstance,
        });

        const users = yield call(listInstance.get_next);
        if (users.length < perBatch) noMore = true;

        users.forEach((item) => (item.key = item.id));
        yield put({
          type: "appendList",
          name: "list",
          list: users,
        });
        yield put(stopLoading("list"));
      } catch (error) {
        localErrorHandler({
          namespace,
          error,
          stopLoading: "list",
        });
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
    appendList(state, { name, list }) {
      return { ...state, [name]: state[name].concat(list) };
    },
  },
};
