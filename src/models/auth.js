import MockAuth from "../services/mockAuth";
import FirebaseAuth from "../services/auth";
import { localErrorHandler } from "../utils/errorHandler";
import { message } from "antd";
import { authService } from "../utils/config";
import Business from "../services/business";
import Storage from "../services/storage";
import { refs } from "../services/utils/firebase_config";
import { globalState } from "../utils";
import { fetchUser } from "./user";

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

export const signup = ({ email, password, displayName, profilePicture }) => ({
  type: `${namespace}/signup`,
  email,
  password,
  displayName,
  profilePicture,
});

export const logout = () => ({ type: `${namespace}/logout` });

export const fetchCustomClaims = () => ({
  type: `${namespace}/fetchCustomClaims`,
});

export const makeBusiness = () => ({
  type: `${namespace}/makeBusiness`,
});

const startLoading = (loadingType) => ({ type: "startLoading", loadingType });
const stopLoading = (loadingType) => ({ type: "stopLoading", loadingType });

export default {
  namespace,
  state: {
    user: undefined,
    holdSetAuthUser: false,
    customClaims: undefined,
    loading: {
      login: false,
      signup: false,
      makeBusiness: false,
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

    *signup({ email, password, displayName, profilePicture }, { put, call }) {
      try {
        yield put(startLoading("signup"));
        yield put({ type: "setState", isBusinessEmail: undefined });
        yield call(Auth.signup, {
          email,
          password,
          displayName,
        });
        if (profilePicture)
          yield put({ type: "setState", holdSetAuthUser: true });

        const res = yield call(Auth.login_with_email, email, password);

        if (profilePicture) {
          const [imageUrl] = yield call(Storage.upload, {
            uploadPath: `/ProfilePictures/${res.user.uid}/`,
            files: profilePicture,
          });
          const updater = () =>
            refs.users.doc(res.user.uid).update({ profilePicture: imageUrl });
          yield call(updater);
          yield put({
            type: "setState",
            holdSetAuthUser: false,
            user: res.user,
          });
        }

        yield put(stopLoading("signup"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "signup" });
      }
    },

    *makeBusiness(_, { put, call }) {
      try {
        yield put(startLoading("makeBusiness"));
        yield call(Business.make_business);
        yield put(fetchCustomClaims());
        yield put(stopLoading("makeBusiness"));
        message.info("Business account created successfully!");
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "makeBusiness" });
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

    *fetchCustomClaims(_, { put, call, select }) {
      try {
        const prev = yield select((state) => state[namespace].customClaims);
        if (prev) return;

        const customClaims = yield call(Auth.get_claims, true);
        yield put({ type: "setState", customClaims });
      } catch (error) {
        console.log("error: ", error);
        localErrorHandler({ namespace, error });
      }
    },
  },

  subscriptions: {
    authSubscriber({ dispatch }) {
      return Auth.subscribe((user) => {
        if (user) {
          //if logged in
          dispatch(fetchCustomClaims());
          if (!globalState()[namespace].holdSetAuthUser) {
            console.log("Logged in");
            dispatch({ type: "setUser", user });
            dispatch(fetchUser(user.uid));
          }
        } else {
          //if logged out
          console.log("Logged out");
          dispatch({ type: "setState", user: null, customClaims: undefined });
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
