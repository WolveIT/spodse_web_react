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

/****************** firestore refs ******************/
const users = db().collection("users");
const events = db().collection("events");
const eventTickets = (eventId) =>
  events.doc(eventId).collection("private").doc("tickets");
const config = db().collection("config");
/*****************************************/

export const refs = {
  users,
  events,
  eventTickets,
  config,
};

export const currUser = () => auth().currentUser;
export const serverTimestamp = () => db.FieldValue.serverTimestamp();
