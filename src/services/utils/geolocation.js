import { randHashString, getProxyUrl } from "./utils";
import debounce from "lodash.debounce";

/* global google */

const MAP_API_KEY = "AIzaSyB0C6-VB6QdWIplcqXqcFaAJzBq2CRHDdU";

const default_region = {
  lat: 24.831,
  lng: 67.0646,
};

const get_region = (lat, lng) => ({
  lat: lat || default_region.lat,
  lng: lng || default_region.lng,
});

const init_map = (
  id,
  loc = { lat: default_region.lat, lng: default_region.lng },
  zoom = 8,
  mapOptions = {
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
  }
) => {
  if (typeof id !== "string") return;
  return new Geo.google.maps.Map(document.getElementById(id), {
    center: get_region(loc.lat, loc.lng),
    zoom,
    ...mapOptions,
  });
};

const to_deg = function (rad) {
  return (rad * 180) / Math.PI;
};

const to_rad = function (deg) {
  return (deg * Math.PI) / 180;
};

const get_bearing = (p1, p2) => {
  const y = p2.longitude - p1.longitude;
  const x = p2.latitude - p1.latitude;
  const bearing = Math.atan2(y, x);
  return to_deg(bearing);
};

const bearing_to_reach_angle = (p1, p2, angle = 20) => {
  const currBearing = 90 - get_bearing(p1, p2);
  return angle - currBearing;
};

const get_distance = (lat1, lng1, lat2, lng2) => {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lng2 - lng1) * p))) / 2;

  return 12742000 * Math.asin(Math.sqrt(a));
};

const get_location = ({
  enableHighAccuracy = false,
  maximumAge = 120000,
  timeout = 7000,
}) =>
  new Promise((res, rej) => {
    navigator.geolocation.getCurrentPosition(
      (loc) =>
        res({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          heading: loc.coords.heading,
          accuracy: loc.coords.accuracy,
          altitude: loc.coords.altitude,
          altitudeAccuracy: loc.coords.altitudeAccuracy,
          speed: loc.coords.speed,
          timestamp: loc.timestamp,
        }),
      (error) => rej(error),
      { enableHighAccuracy, timeout, maximumAge }
    );
  });

const reverse_geocode = async (lat, lng) => {
  const res = await fetch(
    getProxyUrl(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${MAP_API_KEY}`
    )
  );
  const json = await res.json();
  if (json.status !== "OK") throw json.status;
  const result = json.results[0];
  return {
    address: result.formatted_address,
    city:
      result.address_components.find((item) => item.types.includes("locality"))
        ?.long_name ||
      result.address_components.find((item) =>
        item.types.includes("administrative_area_level_3")
      )?.long_name ||
      result.address_components.find((item) =>
        item.types.includes("sublocality")
      )?.long_name ||
      null,
  };
};

const fetch_place = async (placeId) => {
  const res = await fetch(
    getProxyUrl(
      `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&sessiontoken=${randHashString(
        16
      )}&fields=geometry&key=${MAP_API_KEY}`
    )
  );
  const json = await res.json();
  if (json.status !== "OK") throw json.status;
  return json.result.geometry.location;
};

const auto_complete_search = debounce(
  (
    { text, lat, lng, radius = 30000, countryCode = "PK" },
    success,
    error = (e) => console.log("Geo.auto_complete_search Error:", e)
  ) => {
    const loc = get_region(lat, lng);
    lat = loc.lat;
    lng = loc.lng;

    fetch(
      getProxyUrl(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&sessiontoken=${randHashString(
          16
        )}&origin=${lat},${lng}&location=${lat},${lng}&radius=${radius}&components=country:${countryCode}&key=${MAP_API_KEY}`
      )
    )
      .then((res) => res.json())
      .then((json) => {
        if (json.status !== "OK") throw json.status;
        success(
          json.predictions.map((obj) => {
            return {
              name: obj.structured_formatting.main_text,
              fullName: obj.description,
              distance: obj.distance_meters,
              id: obj.place_id,
            };
          })
        );
      })
      .catch(error);
  },
  1200
);

const load_gmap_script = () => {
  if (!Geo.google) {
    new Promise((resolve) => {
      window.initMap = () => {
        Geo.google = google;
        delete window.initMap;
        return resolve(google);
      };

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_API_KEY}&callback=initMap`;
      script.async = true;
      document.body.appendChild(script);
    });
  }
};

const Geo = {
  MAP_API_KEY,
  default_region,
  get_region,
  init_map,
  to_deg,
  to_rad,
  get_bearing,
  bearing_to_reach_angle,
  get_distance,
  get_location,
  reverse_geocode,
  fetch_place,
  auto_complete_search,
  load_gmap_script,
  google: null,
};

export default Geo;
