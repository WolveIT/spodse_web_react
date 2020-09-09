import { serverTimestamp, currUser } from "./firebase_config";

const metadata = (at = serverTimestamp(), by = currUser().uid) => ({
  createdAt: at,
  createdBy: by,
  updatedAt: at,
  updatedBy: by,
});

const image = ({ thumbnail = null, medium = null, large = null }) => ({
  thumbnail,
  medium,
  large,
});

const location = ({ address, city, lat, lng }) => ({
  address,
  city,
  lat,
  lng,
});

const ratingDetails = ({ averageRating = 0, totalRatings = 0 }) => ({
  averageRating,
  totalRatings,
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

const Protos = {
  metadata,
  image,
  location,
  ratingDetails,
  status,
};

export default Protos;
