import Protos from "../utils/protos";
import {
  serverTimestamp,
  refs,
  currUser,
  functions,
} from "../utils/firebase_config";
import Firestore from "../firestore";

const get_new_doc = ({
  dropoffLocation,
  waterAmount,
  tankerType,
  useWalletFirst,
  scheduledAt = null,
  customerPhoneNumber,
  customerDisplayName,
}) => {
  const doc = {
    dropoffLocation: Protos.location(dropoffLocation),
    bookingDetails: {
      waterAmount,
      tankerType,
    },
    useWalletFirst,
    customerDetails: {
      phoneNumber: customerPhoneNumber,
      displayName: customerDisplayName,
    },
    createdByAdmin: currUser().uid,
  };
  if (scheduledAt) {
    if (scheduledAt <= new Date()) throw "invalid value of scheduledAt";
    else doc.scheduledAt = scheduledAt;
  }
  return doc;
};

const create = ({
  dropoffLocation,
  waterAmount,
  tankerType,
  useWalletFirst = true,
  scheduledAt = null,
  customerPhoneNumber,
  customerDisplayName,
}) => {
  const data = get_new_doc({
    dropoffLocation,
    waterAmount,
    tankerType,
    useWalletFirst,
    scheduledAt,
    customerDisplayName,
    customerPhoneNumber,
  });
  return functions().httpsCallable("adminCreateOrder")(data);
};

const get_customer_by_phone = async (phoneNumber) => {
  const user = (
    await Firestore.get_list(
      refs.users.where("authPhoneNumber", "==", phoneNumber).limit(1)
    )
  ).docs[0];
  if (user) return Firestore.get(refs.customer(user.id));
};

const Order = {
  get_new_doc,
  create,
  get_customer_by_phone,
};

export default Order;
