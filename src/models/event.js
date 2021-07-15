import { message } from "antd";
import Event from "../services/event";
import Firestore from "../services/firestore";
import { currUser, refs } from "../services/utils/firebase_config";
import { PaginatedList } from "../services/utils/paginated_list";
import { delay } from "../services/utils/utils";
import { dispatch } from "../utils";
import { localErrorHandler } from "../utils/errorHandler";
import { isValidEmail } from "../utils/validations";

const namespace = "event";

async function fetchUsersList(docs) {
  const users = await Promise.all(
    docs.map((doc) => Firestore.get(doc._original.ref.parent.parent))
  );
  return users.map((user, i) => ({
    key: user.id,
    ...user,
    createdAt: docs[i].createdAt.toDate(),
  }));
}

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

export const inviteUsers = (eventId, emails, onComplete) => ({
  type: `${namespace}/inviteUsers`,
  eventId,
  emails,
  onComplete,
});

let invitedNoMore = false;
export const fetchInvited = (eventId, reset = false) => ({
  type: `${namespace}/fetchInvited`,
  eventId,
  reset,
});

export const clearInvited = () => {
  invitedNoMore = false;
  return {
    type: `${namespace}/setState`,
    invitedList: [],
    invitedListInstance: null,
  };
};

let goingNoMore = false;
export const fetchGoing = (eventId, reset = false) => ({
  type: `${namespace}/fetchGoing`,
  reset,
  eventId,
});

export const clearGoing = () => {
  goingNoMore = false;
  return {
    type: `${namespace}/setState`,
    goingList: [],
    goingListInstance: null,
  };
};

let noMore = false;
const perBatch = 15;
export const fetchEvents = (reset = false) => ({
  type: `${namespace}/fetchList`,
  reset,
});

export const clearEventsList = () => {
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
    createEventProgress: undefined,
    list: [],
    goingList: [],
    invitedList: [],
    listInstance: null,
    goingListInstance: null,
    invitedListInstance: null,
    formData: {},
    loading: {
      fetchCurrent: false,
      createEvent: false,
      goingList: false,
      invitedList: false,
      list: false,
      inviteUsers: false,
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

    *fetchGoing({ eventId, reset }, { put, select, call }) {
      try {
        if (reset === true) yield put(clearGoing());
        let [listInstance, loading] = yield select((state) => [
          state[namespace].goingListInstance,
          state[namespace].loading.goingList,
        ]);
        if (reset !== true && (goingNoMore || loading)) return;

        yield put(startLoading("goingList"));

        if (!listInstance)
          listInstance = new PaginatedList({
            perBatch,
            basicQuery: refs.allUserEventsGoing
              .where("eventID", "==", eventId)
              .orderBy("createdAt", "desc"),
          });

        yield put({
          type: "setState",
          goingListInstance: listInstance,
        });

        const docs = yield call(listInstance.get_next);
        if (docs.length < perBatch) goingNoMore = true;
        const users = yield call(fetchUsersList, docs);

        yield put({
          type: "appendList",
          name: "goingList",
          list: users,
        });
        yield put(stopLoading("goingList"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "goingList" });
      }
    },

    *fetchInvited({ eventId, reset }, { put, select, call }) {
      try {
        if (reset === true) yield put(clearInvited());
        let [listInstance, loading] = yield select((state) => [
          state[namespace].invitedListInstance,
          state[namespace].loading.invitedList,
        ]);
        if (reset !== true && (invitedNoMore || loading)) return;

        yield put(startLoading("invitedList"));

        if (!listInstance)
          listInstance = new PaginatedList({
            perBatch,
            basicQuery: refs.eventInvites(eventId).orderBy("createdAt", "desc"),
          });

        yield put({
          type: "setState",
          invitedListInstance: listInstance,
        });

        const docs = yield call(listInstance.get_next);
        if (docs.length < perBatch) invitedNoMore = true;

        yield put({
          type: "appendList",
          name: "invitedList",
          list: docs.map((item) => ({
            key: item.id,
            ...item,
            createdAt: item?.createdAt?.toDate(),
          })),
        });
        yield put(stopLoading("invitedList"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "invitedList" });
      }
    },

    *fetchList({ reset }, { select, put, call }) {
      try {
        if (reset === true) yield put(clearEventsList());
        let [listInstance, loading] = yield select((state) => [
          state[namespace].listInstance,
          state[namespace].loading.list,
        ]);
        if (reset !== true && (noMore || loading)) return;

        yield put(startLoading("list"));

        if (!listInstance)
          listInstance = new PaginatedList({
            perBatch,
            basicQuery: refs.events
              .where("organizerId", "==", currUser().uid)
              .orderBy("startsAt", "desc"),
          });

        yield put({
          type: "setState",
          listInstance,
        });

        const events = yield call(listInstance.get_next);
        if (events.length < perBatch) noMore = true;

        yield put({
          type: "appendList",
          name: "list",
          list: events.map((item) => ({ key: item.id, ...item })),
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

    *inviteUsers({ eventId, emails, onComplete }, { put, call, select }) {
      try {
        emails = emails.filter(isValidEmail);
        if (!emails.length) throw new Error("No emails provided!");

        yield put(startLoading("inviteUsers"));
        yield call(Event.invite_users, { eventId, emails });
        yield put(stopLoading("inviteUsers"));
        if (typeof onComplete === "function") onComplete();
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "inviteUsers" });
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
    setState2(state, { newState }) {
      return {
        ...state,
        ...(typeof newState === "function" ? newState(state) : newState),
      };
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
