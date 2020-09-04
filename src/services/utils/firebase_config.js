import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";
import "firebase/database";
import "firebase/storage";
import "firebase/messaging";

export const db = firebase.firestore;
export const storage = firebase.storage;
export const messaging = firebase.messaging;
export const auth = firebase.auth;
export const functions = firebase.functions;
export const rtdb = firebase.database;

export const firebaseConfig = {
  apiKey: "AIzaSyB0C6-VB6QdWIplcqXqcFaAJzBq2CRHDdU",
  authDomain: "waterlink-prod.firebaseapp.com",
  databaseURL: "https://waterlink-prod.firebaseio.com",
  projectId: "waterlink-prod",
  storageBucket: "waterlink-prod.appspot.com",
  messagingSenderId: "216430620917",
  appId: "1:216430620917:web:969ac60e3867f0a5eb55bc",
  measurementId: "G-TP80W2WD3B",
};
firebase.initializeApp(firebaseConfig);

/****************** refs ******************/
const users = db().collection("users");

const driver = (uid) => users.doc(uid).collection("profiles").doc("driver");

const all_drivers = db()
  .collectionGroup("profiles")
  .where("userType", "==", "driver");

const driver_private = (uid) =>
  driver(uid).collection("private").doc("privateData");

const all_drivers_private = db()
  .collectionGroup("privateData")
  .where("userType", "==", "driver");

const driver_time_logs = (uid) => driver(uid).collection("timeLogs");

const customer = (uid) => users.doc(uid).collection("profiles").doc("customer");

const all_customers = db()
  .collectionGroup("profiles")
  .where("userType", "==", "customer");

const customer_private = (uid) =>
  customer(uid).collection("private").doc("privateData");

const all_customers_private = db()
  .collectionGroup("privateData")
  .where("userType", "==", "customer");

const transporter = (uid) =>
  users.doc(uid).collection("profiles").doc("transporter");

const all_transporters = db()
  .collectionGroup("profiles")
  .where("userType", "==", "transporter");

const transporter_private = (uid) =>
  transporter(uid).collection("private").doc("privateData");

const all_transporters_private = db()
  .collectionGroup("privateData")
  .where("userType", "==", "transporter");

const alerts = (uid) => users.doc(uid).collection("alerts");

const transaction_logs = db().collection("transactionLogs");

const reviews = db().collection("reviews");

const complaints = db().collection("complaints");

const offers = db().collection("offers");

const orders = db().collection("orders");

const order_private = (orderId) =>
  orders.doc(orderId).collection("orderPrivate").doc("privateData");

const order_trail = (orderId) =>
  orders.doc(orderId).collection("orderPrivate").doc("trail");

const config = db().collection("config");
/*****************************************/

export const refs = {
  users,
  driver,
  all_drivers,
  driver_private,
  all_drivers_private,
  driver_time_logs,
  customer,
  all_customers,
  customer_private,
  all_customers_private,
  transporter,
  all_transporters,
  transporter_private,
  all_transporters_private,
  alerts,
  transaction_logs,
  reviews,
  complaints,
  offers,
  orders,
  order_private,
  order_trail,
  config,
};

export const currUser = () => auth().currentUser;
export const serverTimestamp = () => db.FieldValue.serverTimestamp();
