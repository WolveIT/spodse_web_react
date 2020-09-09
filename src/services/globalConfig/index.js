import { refs } from "../utils/firebase_config";
import Firestore from "../firestore";

const seperatorIndex = (string, opts) => {
  for (let i = 0; i < string.length; ++i) {
    if (opts.includes(string[i])) return i;
  }
  return -1;
};

const get = async (id) => {
  const ref = refs.config.doc(id);
  let config = {};
  const obj = await Firestore.get(ref);
  for (let key in obj) {
    if (key !== id) config[key] = obj[key].value;
  }
  return config;
};
const get_value = (id, key, fallback) => {
  const ref = refs.config.doc(id);
  let seperator = seperatorIndex(key, ["[", "."]);
  let start = key;
  let stop = "";

  if (seperator !== -1) {
    start = key.slice(0, seperator - 1);
    stop = key.slice(seperator);
  }
  return Firestore.get_value(ref, `${start}.value${stop}`, fallback);
};

let GlobalConfig = {
  get,
  get_value,
};

export default GlobalConfig;
