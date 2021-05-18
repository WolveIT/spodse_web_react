import MockAuth from "../services/mockAuth";
import FirebaseAuth from "../services/auth";
import { localErrorHandler } from "../utils/errorHandler";
import { message } from "antd";
import { authService } from "../utils/config";

const AuthServices = {
  mock: MockAuth,
  firebase: FirebaseAuth,
};
const Auth = AuthServices[authService];

const namespace = "auth";

export const loginWithEmail = (email, password) => ({
  type: `${namespace}/loginWithEmail`,
  email,
  password,
});
export const logout = () => ({ type: `${namespace}/logout` });

const startLoading = (loadingType) => ({ type: "startLoading", loadingType });
const stopLoading = (loadingType) => ({ type: "stopLoading", loadingType });

export default {
  namespace,
  state: {
    user: undefined,
    loading: {
      login: false,
      logout: false,
    },
  },

  effects: {
    // Login with phone number
    *loginWithEmail({ email, password }, { put, call }) {
      try {
        yield put(startLoading("login"));
        yield call(Auth.login_with_email, email, password);
        yield put(stopLoading("login"));
        message.success("Logged in successfully!");
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "login" });
      }
    },

    *logout(_, { put, call }) {
      try {
        yield put(startLoading("logout"));
        yield call(Auth.logout);
        yield put(stopLoading("logout"));
        message.info("successfully logged out!");
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "logout" });
      }
    },
  },

  subscriptions: {
    authSubscriber({ dispatch }) {
      return Auth.subscribe((user) => {
        if (user) {
          //if logged in
          console.log("Logged in");
          dispatch({ type: "setUser", user });
        } else {
          //if logged out
          console.log("Logged out");
          dispatch({ type: "clearUser" });
        }
      });
    },
  },

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
    setConfirmation(state, payload) {
      return {
        ...state,
        confirmResult: payload.confirmResult,
        phoneNumber: payload.phoneNumber || state.phoneNumber,
      };
    },
    setUser(state, { user }) {
      return { ...state, user };
    },
    clearUser(state) {
      return { ...state, user: null };
    },
  },
};
