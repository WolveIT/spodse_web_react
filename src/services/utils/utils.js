import { messaging } from "./firebase_config";

export const verifyEnum = (value, enums) => {
  if (!enums.includes(value))
    throw `invalid enum type: ${value}. Expected on of ${enums.join(" | ")}`;
  return value;
};

export const docToData = (doc) =>
  doc.exists ? { id: doc.id, _original: doc, ...doc.data() } : null;

export const querySnapToData = (snap) => {
  let docs = [];
  if (!snap.empty) docs = snap.docs.map((doc) => docToData(doc));
  return { docs, _original: snap };
};

export const randHashString = (len) => {
  return "x".repeat(len).replace(/[xy]/g, (c) => {
    let r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const randomNumber = (min, max) => min + Math.random() * (max - min);

export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const removeKey = (obj, key) => {
  let newObj = Object.assign({}, obj);
  delete newObj[key];
  return newObj;
};

export const delay = (millis) => new Promise((res) => setTimeout(res, millis));

export const getDeviceId = () => "dummy-id";

export const checkAndUpdateToken = async (tokenMap, ref) => {
  //get previouslly stored token from the user's FCM token map
  const deviceId = getDeviceId();
  const storedToken = tokenMap[deviceId];

  //get the new FCM token if possible
  try {
    const currentToken = await messaging().getToken();
    if (currentToken !== storedToken)
      //if token refreshed then update it in the db
      await ref.update({
        ["fcmTokens." + deviceId]: currentToken,
      });
  } catch (e) {
    throw e;
  }
};

export const getProxyUrl = (url) =>
  "https://pacific-gorge-86477.herokuapp.com/" + url;
