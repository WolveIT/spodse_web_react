const namespace = "router";

const startLoading = (loadingType) => ({ type: "startLoading", loadingType });
const stopLoading = (loadingType) => ({ type: "stopLoading", loadingType });

export const setSelectedMenuKey = (key) => ({
  type: `${namespace}/setState`,
  selectedMenuKey: key,
});

export const toggleSidebarCollapsed = () => ({
  type: `${namespace}/toggleSidebarCollapsed`,
});

export default {
  namespace,
  state: {
    selectedMenuKey: "0",
    sidebarCollapsed: false,
    loading: {},
  },

  effects: {},

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
    toggleSidebarCollapsed(state) {
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    },
  },
};
