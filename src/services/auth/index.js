import throttle from "lodash.throttle";
import { auth, currUser, functions } from "../utils/firebase_config";

const login_with_email = async (email, password) => {
  const isAdmin = (await functions().httpsCallable("isAdminEmail")({ email }))
    .data;
  if (!isAdmin) throw "Admin account does not exist against this email address";
  await auth().signInWithEmailAndPassword(email, password);
};

const logout = () => {
  return auth().signOut();
};

const subscribe = (handler) => {
  //throttle handler to prevent it being called multiple times for the same event
  return auth().onAuthStateChanged(
    throttle(handler, 2000, { trailing: false })
  );
};

const Auth = {
  login_with_email,
  logout,
  subscribe,
  curr_user: currUser,
};

export default Auth;
