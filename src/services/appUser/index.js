import Storage from "../storage";
import { functions, refs } from "../utils/firebase_config";
import { delay, randomNumber } from "../utils/utils";

async function create(
  {
    email,
    password,
    displayName,
    role,
    sendEmailAlert,
    profilePicture,
    ...data
  },
  progress
) {
  progress = typeof progress === "function" ? progress : () => {};
  const initialSeed = randomNumber(1, 10);
  const { data: res } = await functions().httpsCallable(
    "adminCreateUserAccount"
  )({
    email,
    password,
    displayName,
    role,
    sendEmailAlert,
    profilePicture: "",
    ...data,
  });
  progress(initialSeed);

  const finalSeed = randomNumber(0.8, 0.95) * 100 - initialSeed;
  if (profilePicture?.length) {
    [profilePicture] = await Storage.upload(
      {
        uploadPath: `/ProfilePictures/${res.uid}/`,
        files: profilePicture,
      },
      (v) => {
        progress(initialSeed + v * finalSeed);
      }
    );
    await refs.users.doc(res.uid).update({ profilePicture });
  } else {
    await delay(300);
  }

  progress(100);
  await delay(200);
}

async function change_role({ uid, newRole, sendEmailAlert }) {
  return functions().httpsCallable("adminChangeUserRole")({
    uid,
    newRole,
    sendEmailAlert,
  });
}

async function _delete({ uid, deleteEvents = false }) {
  return functions().httpsCallable("adminDeleteUserAccount")({
    uid,
    deleteEvents,
  });
}

const AppUser = {
  create,
  change_role,
  delete: _delete,
};

export default AppUser;
