import { functions } from "../utils/firebase_config";

const make_business = () => functions().httpsCallable("makeBusiness")({});

const create_business_account = ({ email, password, displayName }) =>
  functions().httpsCallable("createBusinessAccount")({
    email,
    password,
    displayName,
  });

const Business = {
  make_business,
  create_business_account,
};

export default Business;
