import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";

export const db = firebase.firestore;
export const auth = firebase.auth;
export const storage = firebase.storage;
export const functions = () => firebase.app().functions("europe-west1");

export const firebaseConfig = {
  apiKey: "AIzaSyBNL12vZzADKzk_TSVgYRn0UVDRK2VoYVs",
  authDomain: "spodse-800b3.firebaseapp.com",
  databaseURL: "https://spodse-800b3.firebaseio.com",
  projectId: "spodse-800b3",
  storageBucket: "spodse-800b3.appspot.com",
  messagingSenderId: "676923814639",
  appId: "1:676923814639:web:0c4ecb7127bbb3e573211a",
  measurementId: "G-0LY36EEN3G",
};
//initialize firebase with above config
firebase.initializeApp(firebaseConfig);

/****************** refs ******************/
const users = db().collection("users");

const userEventsGoing = (uid) =>
  db().collection("users").doc(uid).collection("eventsGoing");

const allUserEventsGoing = db().collectionGroup("eventsGoing");

const userEventStats = (uid) =>
  users.doc(uid).collection("private").doc("stats");

const userEventsOrganizing = (uid) =>
  db().collection("users").doc(uid).collection("eventsOrganizing");

const events = db().collection("events");

const eventTickets = (eventId) =>
  events.doc(eventId).collection("private").doc("tickets");

const eventInvites = (eventId) => events.doc(eventId).collection("invites");

const eventsAccControl = db().collection("eventsAccessControl");

const tickets = db().collection("tickets");

const config = db().collection("config");

const test = db().collection("test");

/*****************************************/

export const refs = {
  users,
  userEventsGoing,
  allUserEventsGoing,
  userEventStats,
  userEventsOrganizing,
  events,
  eventTickets,
  eventInvites,
  eventsAccControl,
  tickets,
  config,
  test,
};

export const currUser = () => auth().currentUser;
export const serverTimestamp = () => db.FieldValue.serverTimestamp();
