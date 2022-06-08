import { functions } from "../utils/firebase_config";

function send_manual({ uids = [], title, body, dataPayload = {} }) {
  return functions().httpsCallable("notificationSend")({
    uids,
    title,
    body,
    dataPayload,
  });
}

const Notification = {
  send_manual,
};

export default Notification;
