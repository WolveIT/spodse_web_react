import React from "react";
import dva from "dva";
import Router from "./Router";
import auth from "./models/auth";
import router from "./models/router";
import user from "./models/user";
import event from "./models/event";
import appUser from "./models/appUser";
import notification from "./models/notification";
import { globalErrorHandler } from "./utils/errorHandler";
import "antd/dist/antd.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import "styles/global.scss";

export const app = dva({
  onError: globalErrorHandler,
});

app.model(auth);
app.model(router);
app.model(user);
app.model(event);
app.model(appUser);
app.model(notification);

app.router(() => <Router />);
export default app.start();
