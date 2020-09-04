import React from "react";
import dva from "dva";
import Router from "./Router";
import auth from "./models/auth";
import order from "./models/order";
import { globalErrorHandler } from "./utils/errorHandler";
import Geo from "./services/utils/geolocation";

export const app = dva({
  onError: globalErrorHandler,
});

app.model(auth);
app.model(order);

app.router(() => <Router />);
export default app.start();

Geo.load_gmap_script();
