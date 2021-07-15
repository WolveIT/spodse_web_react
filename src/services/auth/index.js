import throttle from "lodash.throttle";
import Business from "../business";
import { auth, currUser } from "../utils/firebase_config";

const login_with_email = async (email, password) =>
  auth().signInWithEmailAndPassword(email, password);

const logout = () => {
  return auth().signOut();
};

const signup = async ({ email, password, displayName }) =>
  Business.create_business_account({
    email,
    password,
    displayName,
  });

const get_claims = async (forceRefresh) => {
  const res = await currUser().getIdTokenResult(forceRefresh);
  return res.claims;
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
  signup,
  get_claims,
  curr_user: currUser,
};

export default Auth;
