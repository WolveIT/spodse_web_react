import {serverTimestamp, currUser} from './firebase_config';
import {verifyEnum} from './utils';

const metadata = {
  created: (at = serverTimestamp(), by = currUser().uid) => ({
    createdAt: at,
    createdBy: by,
  }),
  updated: (at = serverTimestamp(), by = currUser().uid) => ({
    updatedAt: at,
    updatedBy: by,
  }),
};

const image = ({thumbnail = null, medium = null, large = null}) => ({
  thumbnail,
  medium,
  large,
});

const location = ({address, city, lat, lng}) => ({
  address,
  city,
  lat,
  lng,
});

const ratingDetails = ({averageRating = 0, totalRatings = 0}) => ({
  averageRating,
  totalRatings,
});

const dues = ({value, percentage, dueDate, isDefaulter}) => ({
  value,
  minRemaining: (percentage / 100) * value,
  dueDate,
  isDefaulter,
});

const status = ({
  value,
  description = null,
  timestamp = serverTimestamp(),
}) => ({
  value,
  description,
  timestamp,
});

const userProfileBasic = ({uid, displayName, type}) => ({
  uid,
  displayName,
  type: verifyEnum(type, ['driver', 'customer', 'transporter', 'admin']),
});

const Protos = {
  metadata,
  image,
  location,
  ratingDetails,
  status,
  userProfileBasic,
  dues,
};

export default Protos;
