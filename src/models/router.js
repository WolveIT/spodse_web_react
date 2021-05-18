const namespace = "router";

export const toggleSidebarCollapsed = () => ({
  type: `${namespace}/toggleSidebarCollapsed`,
});

export const setComputedRoutes = (computedRoutes) => ({
  type: `${namespace}/setState`,
  computedRoutes,
});

export default {
  namespace,
  state: {
    computedRoutes: undefined,
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
