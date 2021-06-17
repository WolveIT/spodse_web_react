import { message } from "antd";
import Event from "../services/event";
import Firestore from "../services/firestore";
import { currUser, refs } from "../services/utils/firebase_config";
import { PaginatedList } from "../services/utils/paginated_list";
import { delay } from "../services/utils/utils";
import { dispatch } from "../utils";
import { localErrorHandler } from "../utils/errorHandler";

const namespace = "event";

const startLoading = (loadingType) => ({ type: "startLoading", loadingType });
const stopLoading = (loadingType) => ({ type: "stopLoading", loadingType });

export const saveEvent = (currentEvent) => ({
  type: `${namespace}/setState`,
  current: currentEvent,
});

export const fetchEvent = (eventId) => ({
  type: `${namespace}/fetchCurrent`,
  eventId,
});

export const listenEvent = (eventId) => ({
  type: `${namespace}/listenCurrent`,
  eventId,
});

export const unsubEvent = () => ({
  type: `${namespace}/unsubCurrent`,
});

export const deleteEvent = (eventId) => ({
  type: `${namespace}/delete`,
  eventId,
});

export const deleteEventFromState = (eventId) => ({
  type: `${namespace}/deleteFromList`,
  entity: "list",
  element: (el) => el.id === eventId,
});

export const setFormData = (data) => ({
  type: `${namespace}/setState`,
  formData: data,
});

let noMore = false;
const perBatch = 15;
export const loadEvents = (mode) => ({
  type: `${namespace}/fetchList`,
  mode,
});

export default {
  namespace,
  state: {
    current: undefined,
    createEventProgress: undefined,
    list: [],
    listInstance: null,
    formData: {},
    loading: {
      fetchCurrent: false,
      createEvent: false,
      list: false,
      refresh: false,
      delete: false,
    },
  },

  effects: {
    *createEvent(data, { put, call, select }) {
      try {
        yield put(startLoading("createEvent"));
        yield call(Event.create, data);
        yield put(stopLoading("createEvent"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "createEvent" });
      }
    },

    *listenCurrent({ eventId }, { take, put }) {
      yield put(unsubEvent());

      const unsub = Firestore.listen(
        refs.events.doc(eventId),
        (event) => {
          dispatch(saveEvent(event));
        },
        (error) => {
          localErrorHandler({ namespace, error });
          dispatch(saveEvent(null));
        }
      );

      yield take(`${namespace}/unsubCurrent`);
      unsub && unsub();
    },

    *fetchCurrent({ eventId }, { call, put }) {
      try {
        yield put(startLoading("fetchCurrent"));

        const event = yield call(Firestore.get, refs.events.doc(eventId));
        yield put({ type: "setState", current: event });

        yield put(stopLoading("fetchCurrent"));
      } catch (error) {
        localErrorHandler({
          namespace,
          error,
          stopLoading: "fetchCurrent",
        });
      }
    },

    *fetchList({ mode }, { select, put, call }) {
      try {
        if (mode === "refresh" || mode === "reset" || !noMore)
          yield put(startLoading(mode === "refresh" ? "refresh" : "list"));

        let listInstance;

        if (mode === "refresh" || mode === "reset") {
          noMore = false;
          listInstance = new PaginatedList({
            perBatch,
            basicQuery: refs.events
              .where("organizerId", "==", currUser().uid)
              .orderBy("startsAt", "desc"),
          });

          yield put({ type: "setState", list: [] });
        } else {
          listInstance = yield select((state) => state[namespace].listInstance);
        }

        yield put({
          type: "setState",
          listInstance,
        });

        const events = yield call(listInstance.get_next);
        if (events.length < perBatch) noMore = true;

        yield put({
          type: "appendList",
          list: events.map((item) => ({ key: item.id, ...item })),
        });
        yield put(stopLoading(mode === "refresh" ? "refresh" : "list"));
      } catch (error) {
        localErrorHandler({
          namespace,
          error,
          stopLoading: mode === "refresh" ? "refresh" : "list",
        });
      }
    },

    *delete({ eventId }, { put, call }) {
      try {
        yield put(startLoading("delete"));
        yield call(Event.delete, eventId);
        yield put(deleteEventFromState(eventId));
        yield put(stopLoading("delete"));
        message.success("Event deleted successfully!");
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "delete" });
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
    appendList(state, { list }) {
      return { ...state, list: state.list.concat(list) };
    },
    deleteFromList(state, { entity, element }) {
      return {
        ...state,
        [entity]: state[entity].filter((el) =>
          typeof element === "function" ? !element(el) : el !== element
        ),
      };
    },
  },
};
