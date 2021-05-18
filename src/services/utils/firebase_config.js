import firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";

export const db = firebase.firestore;
export const auth = firebase.auth;

export const firebaseConfig = {
  //place your firebase config here
  projectId: "placeholder-project-id",
};
//initialize firebase with above config
firebase.initializeApp(firebaseConfig);

/****************** firestore refs ******************/
const users = db().collection("users");
const config = db().collection("config");
/*****************************************/

export const refs = {
  users,
  config,
};

export const currUser = () => auth().currentUser;
export const serverTimestamp = () => db.FieldValue.serverTimestamp();
