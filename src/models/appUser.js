import Algolia from "../services/algolia";
import { db, refs } from "../services/utils/firebase_config";
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

export const saveFilters = ({ searchTerm, role }) => {
  return {
    type: `${namespace}/saveFilters`,
    searchTerm,
    role,
  };
};

export const applyFilters = (paginate = false, byPass = false) => {
  return {
    type: `${namespace}/applyFilters`,
    paginate,
    byPass,
  };
};

export const deleteUserFromState = ({ uid }) => {
  return {
    type: `${namespace}/deleteUserFromState`,
    uid,
  };
};

export default {
  namespace,
  state: {
    current: undefined,
    latest: undefined,
    list: [],
    listInstance: null,
    filters: {
      searchTerm: "",
      role: "",
    },
    filtersMode: false,
    filterResults: [],
    filterResultsPage: 0,
    filterResultsNoMore: false,
    loading: {
      list: false,
      filters: false,
    },
  },

  effects: {
    *fetchList({ reset }, { select, put, call }) {
      try {
        if (reset === true) yield put(clearUsersList());
        let [listInstance, loading, role] = yield select((state) => [
          state[namespace].listInstance,
          state[namespace].loading.list,
          state[namespace].filters.role,
        ]);
        if (reset !== true && (noMore || loading)) return;

        yield put(startLoading("list"));

        let query = refs.users;
        if (role) query = query.where("role", "==", role);

        if (!listInstance)
          listInstance = new PaginatedList({
            perBatch,
            basicQuery: query.orderBy("createdAt", "desc"),
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

    *applyFilters({ paginate, byPass }, { put, call, select }) {
      try {
        const { searchTerm, role } = yield select(
          (state) => state[namespace].filters
        );
        const { filtersMode } = yield select((state) => state[namespace]);

        if (searchTerm?.length < 3) {
          if (filtersMode || byPass) {
            yield put({ type: "resetSearchUsers" });
            yield put(fetchUsers(true));
          }
          return;
        }

        yield put({ type: "setState", filtersMode: true });
        yield put(startLoading("filters"));
        const { filterResultsPage, filterResultsNoMore, filterResults } =
          yield select((state) => state[namespace]);

        if (paginate && filterResultsNoMore) {
          yield put(stopLoading("filters"));
          return;
        }

        const res = yield call([Algolia.users, "search"], searchTerm, {
          hitsPerPage: perBatch,
          page: paginate ? filterResultsPage + 1 : 0,
          filters: role ? `role:${role}` : undefined,
        });

        res.hits.forEach((item) => {
          if (item.createdAt)
            item.createdAt = new db.Timestamp.fromMillis(item.createdAt);
          item.id = item.objectID;
          item.key = item.objectID;
        });

        yield put({
          type: "setState",
          filterResults: paginate ? filterResults.concat(res.hits) : res.hits,
          filterResultsPage: paginate ? filterResultsPage + 1 : 0,
          filterResultsNoMore: res.hits.length < perBatch,
        });
        yield put(stopLoading("filters"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "filters" });
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
    deleteUserFromState(state, { uid }) {
      return { ...state, list: state.list.filter((item) => item.id !== uid) };
    },
    saveFilters(state, { searchTerm, role }) {
      return {
        ...state,
        filters: {
          searchTerm:
            searchTerm === undefined ? state.filters.searchTerm : searchTerm,
          role: role === undefined ? state.filters.role : role,
        },
      };
    },
    resetSearchUsers(state) {
      return {
        ...state,
        filtersMode: false,
        filterResults: [],
        filterResultsPage: 0,
        filterResultsNoMore: false,
        loading: { ...state.loading, filters: false },
      };
    },
  },
};
