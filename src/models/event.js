import { message } from "antd";
import Algolia from "../services/algolia";
import Event from "../services/event";
import Firestore from "../services/firestore";
import { currUser, db, refs } from "../services/utils/firebase_config";
import PaginatedList from "../services/utils/paginated_list/firestorePaginatedList";
import { dispatch, toFirestoreTime } from "../utils";
import { localErrorHandler } from "../utils/errorHandler";
import { isValidEmail } from "../utils/validations";
import Fuse from "fuse.js";

const namespace = "event";

async function fetchUserTickets(users, ticketsList, eventId) {
  const keys = Object.keys(ticketsList);
  const tickets = await Promise.all(
    users.map((user) => {
      const ticket = keys.find((t) => ticketsList[t] === user.id);
      return ticket
        ? Firestore.get(refs.eventTickets(eventId).doc(ticket))
        : Promise.resolve();
    })
  );
  return tickets;
}

async function fetchUsersList(docs) {
  const users = await Promise.all(
    docs.map((doc) => Firestore.get(doc._original.ref.parent.parent))
  );
  return users;
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

export const fetchLatestEvent = ({ dir, offset, eventId }) => ({
  type: `${namespace}/fetchLatest`,
  dir,
  offset,
  eventId,
});

export const fetchEventByMonth = ({ month, year }) => ({
  type: `${namespace}/fetchByMonth`,
  month,
  year,
});

export const fetchStats = () => ({
  type: `${namespace}/fetchStats`,
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

export const resendInviteAll = ({ eventId, message }) => ({
  type: `${namespace}/resendInviteAll`,
  eventId,
  message,
});

export const inviteUsers = (
  eventId,
  emails,
  message,
  perks = {},
  onComplete
) => ({
  type: `${namespace}/inviteUsers`,
  eventId,
  emails,
  message,
  perks,
  onComplete,
});

export const addValidators = (eventId, uids, onComplete) => ({
  type: `${namespace}/addValidators`,
  eventId,
  uids,
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

let validatorsNoMore = false;
export const fetchValidators = (eventId, reset = false) => ({
  type: `${namespace}/fetchValidators`,
  reset,
  eventId,
});

export const clearValidators = () => {
  validatorsNoMore = false;
  return {
    type: `${namespace}/setState`,
    validatorsList: [],
    validatorsListInstance: null,
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

export const searchPeople = ({ eventId, term, tab, paginate = false }) => {
  return {
    type: `${namespace}/searchPeople`,
    eventId,
    term,
    tab,
    paginate,
  };
};

export const resetSearchPeople = () => {
  return {
    type: `${namespace}/resetSearchPeople`,
  };
};

export default {
  namespace,
  state: {
    current: undefined,
    latest: undefined,
    monthEvents: [],
    stats: undefined,
    tickets: undefined,
    createEventProgress: undefined,
    list: [],
    goingList: [],
    invitedList: [],
    validatorsList: [],
    searchResultsMode: false,
    searchResults: [],
    searchResultsPage: 0,
    searchResultsNoMore: false,
    listInstance: null,
    goingListInstance: null,
    invitedListInstance: null,
    validatorsListInstance: null,
    formData: {},
    loading: {
      fetchCurrent: false,
      fetchLatest: false,
      fetchByMonth: false,
      stats: false,
      createEvent: false,
      goingList: false,
      invitedList: false,
      validatorsList: false,
      list: false,
      searchResults: false,
      inviteUsers: false,
      addValidators: false,
      resendInviteAll: false,
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

      const unsub1 = Firestore.listen(
        refs.events.doc(eventId),
        (event) => {
          dispatch(saveEvent(event));
        },
        (error) => {
          localErrorHandler({ namespace, error });
          dispatch(saveEvent(null));
        }
      );

      const unsub2 = Firestore.listen(
        refs.eventTicketsList(eventId),
        (tickets) => {
          dispatch({
            type: `${namespace}/setState`,
            tickets,
          });
        },
        (error) => {
          localErrorHandler({ namespace, error });
          dispatch({
            type: `${namespace}/setState`,
            tickets: null,
          });
        }
      );

      yield take(`${namespace}/unsubCurrent`);
      unsub1 && unsub1();
      unsub2 && unsub2();
    },

    *fetchCurrent({ eventId }, { all, call, put }) {
      try {
        yield put(startLoading("fetchCurrent"));

        const [event, tickets] = yield all([
          call(Firestore.get, refs.events.doc(eventId)),
          call(Firestore.get, refs.eventTickets(eventId)),
        ]);
        yield put({ type: "setState", tickets, current: event });

        yield put(stopLoading("fetchCurrent"));
      } catch (error) {
        localErrorHandler({
          namespace,
          error,
          stopLoading: "fetchCurrent",
        });
      }
    },

    *fetchLatest({ dir, offset, eventId }, { put, call }) {
      try {
        yield put(startLoading("fetchLatest"));

        let query = refs.events;
        if (eventId) query = query.doc(eventId);
        else
          query = query
            .where("organizerId", "==", currUser().uid)
            .orderBy("endsAt", dir === "prev" ? "desc" : "asc")
            .startAfter(offset ? toFirestoreTime(offset) : db.Timestamp.now())
            .limit(1);

        let event = yield call(
          eventId ? Firestore.get : Firestore.get_list,
          query
        );
        if (!eventId) event = event.docs[0];
        if (event) {
          const tickets = yield call(
            Firestore.get,
            refs.eventTicketsList(event.id)
          );
          yield put({ type: "setState", tickets });
        }
        yield put({ type: "setState", latest: event || null });

        yield put(stopLoading("fetchLatest"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "fetchLatest" });
      }
    },

    *fetchByMonth({ month, year }, { put, call }) {
      try {
        yield put(startLoading("fetchByMonth"));
        const st = new Date(year, month, 1);
        const et = new Date(year, month + 1, 0);
        const events = yield call(
          Firestore.get_list,
          refs.events
            .where("organizerId", "==", currUser().uid)
            .where("startsAt", ">=", st)
            .where("startsAt", "<=", et)
        );
        yield put({ type: "setState", monthEvents: events.docs });
        yield put(stopLoading("fetchByMonth"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "fetchByMonth" });
      }
    },

    *fetchStats(_, { put, call }) {
      try {
        yield put(startLoading("stats"));
        const stats = yield call(
          Firestore.get,
          refs.userEventStats(currUser().uid)
        );
        yield put({ type: "setState", stats });
        yield put(stopLoading("stats"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "stats" });
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
            baseQuery: refs.allUserEventsGoing
              .where("eventID", "==", eventId)
              .orderBy("createdAt", "desc"),
          });

        yield put({
          type: "setState",
          goingListInstance: listInstance,
        });

        const docs = yield call(listInstance.get_next);
        if (docs.length < perBatch) goingNoMore = true;
        const ticketsList = yield select((state) => state[namespace].tickets);
        const users = yield call(fetchUsersList, docs);
        const tickets = yield call(
          fetchUserTickets,
          users,
          ticketsList || {},
          eventId
        );

        yield put({
          type: "appendList",
          name: "goingList",
          list: users.map((user, i) => ({
            key: user.id,
            ticket: tickets[i],
            ...user,
            createdAt: docs[i].createdAt.toDate(),
          })),
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
            baseQuery: refs.eventInvites(eventId).orderBy("createdAt", "desc"),
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

    *fetchValidators({ eventId, reset }, { put, select, call }) {
      try {
        if (reset === true) yield put(clearValidators());
        let [listInstance, loading] = yield select((state) => [
          state[namespace].validatorsListInstance,
          state[namespace].loading.validatorsList,
        ]);
        if (reset !== true && (validatorsNoMore || loading)) return;

        yield put(startLoading("validatorsList"));

        if (!listInstance)
          listInstance = new PaginatedList({
            perBatch,
            baseQuery: refs.eventsAccControl
              .where("eventDetails.id", "==", eventId)
              .where("role", "==", "ticket-validator")
              .orderBy("stats.totalTicketsValidated", "desc")
              .orderBy("createdAt", "desc"),
          });

        yield put({
          type: "setState",
          validatorsListInstance: listInstance,
        });

        const docs = yield call(listInstance.get_next);
        if (docs.length < perBatch) validatorsNoMore = true;

        yield put({
          type: "appendList",
          name: "validatorsList",
          list: docs.map((item) => ({
            key: item.id,
            ...item,
            createdAt: item?.createdAt?.toDate(),
          })),
        });
        yield put(stopLoading("validatorsList"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "validatorsList" });
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
            baseQuery: refs.events
              .where("organizerId", "==", currUser().uid)
              .orderBy("createdAt", "desc"),
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

    *inviteUsers(
      { eventId, emails, message, perks, onComplete },
      { put, call }
    ) {
      try {
        emails = emails.filter(isValidEmail);
        if (!emails.length) throw new Error("No emails provided!");

        yield put(startLoading("inviteUsers"));
        yield call(Event.invite_users, { eventId, emails, message, perks });
        yield put(stopLoading("inviteUsers"));
        if (typeof onComplete === "function") onComplete();
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "inviteUsers" });
      }
    },

    *addValidators({ eventId, uids, onComplete }, { put, call }) {
      try {
        if (!uids.length) throw new Error("No users to add!");

        yield put(startLoading("addValidators"));
        yield call(Event.add_validators, { eventId, uids });
        yield put(stopLoading("addValidators"));
        if (typeof onComplete === "function") onComplete();
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "addValidators" });
      }
    },

    *searchPeople({ eventId, term, tab, paginate }, { put, call, select }) {
      try {
        if (
          term?.length < 3 ||
          !["going", "invited", "validators", "likes"].includes(tab)
        )
          return;

        yield put({ type: "setState", searchResultsMode: true });
        if (tab === "likes") {
          const event = yield select((state) => state[namespace].current);
          const fuse = new Fuse(
            Object.entries(event.likes || {}).map(([key, val]) => ({
              key,
              id: key,
              ...(val || {}),
            })),
            {
              minMatchCharLength: 2,
              keys: ["displayName", "email"],
              threshold: 0.4,
            }
          );
          yield put({
            type: "setState",
            searchResults: fuse.search(term).map((el) => el.item),
          });
          return;
        }

        yield put(startLoading("searchResults"));
        const {
          searchResultsPage,
          searchResultsNoMore,
          tickets: ticketsList,
          searchResults,
        } = yield select((state) => state[namespace]);

        if (paginate && searchResultsNoMore) {
          yield put(stopLoading("searchResults"));
          return;
        }

        const res = yield call([Algolia[tab], "search"], term, {
          hitsPerPage: perBatch,
          page: paginate ? searchResultsPage + 1 : 0,
          filters: `eventId:${eventId}`,
        });

        res.hits.forEach((item) => {
          if (item.createdAt) item.createdAt = new Date(item.createdAt);
          item.id = item.objectID;
          item.key = item.objectID;
        });

        if (tab === "going") {
          res.hits.forEach((user, i) => {
            user.id = user.uid;
          });
          const tickets = yield call(
            fetchUserTickets,
            res.hits,
            ticketsList || {},
            eventId
          );
          res.hits.forEach((user, i) => {
            user.ticket = tickets[i];
          });
        }

        yield put({
          type: "setState",
          searchResults: paginate ? searchResults.concat(res.hits) : res.hits,
          searchResultsPage: paginate ? searchResultsPage + 1 : 0,
          searchResultsNoMore: res.hits.length < perBatch,
        });
        yield put(stopLoading("searchResults"));
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "searchResults" });
      }
    },

    *resendInviteAll({ eventId, message: msg }, { put, call }) {
      try {
        yield put(startLoading("resendInviteAll"));
        yield call(Event.resend_invite_all, { eventId, message: msg });
        yield put(stopLoading("resendInviteAll"));
        message.success("Re sent invitations to all pending invitees!");
      } catch (error) {
        localErrorHandler({ namespace, error, stopLoading: "resendInviteAll" });
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
    resetSearchPeople(state) {
      return {
        ...state,
        searchResultsMode: false,
        searchResults: [],
        searchResultsPage: 0,
        searchResultsNoMore: false,
        loading: { ...state.loading, searchResults: false },
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
