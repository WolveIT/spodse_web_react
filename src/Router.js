import React from "react";
import {
  Switch,
  Route as RouterRoute,
  Redirect,
  useLocation,
  BrowserRouter,
} from "react-router-dom";
import { connect } from "dva";
import { AlertWrapper } from "./components/Alert";
import { DialogContext } from "./components/AlertPopup";
import PageSpinner from "./components/Spinner/PageSpinner";
import { routes } from "./utils/config";

//layouts
import EmptyLayout from "./layouts/EmptyLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// export const history = createBrowserHistory();
export default function Router() {
  return (
    <BrowserRouter>
      <DialogContext />
      <AlertWrapper />
      <Switch>
        {routes.map((config, i) => (
          <Route
            key={i.toString()}
            layoutType={config.layoutType}
            authType={config.authType}
            {...config.route}
          >
            <config.component />
          </Route>
        ))}
      </Switch>
    </BrowserRouter>
  );
}

const LayoutWrapper = ({ type, children }) => {
  switch (type) {
    case "empty":
      return <EmptyLayout>{children}</EmptyLayout>;
    case "auth":
      return <AuthLayout>{children}</AuthLayout>;
    case "dashboard":
      return <DashboardLayout>{children}</DashboardLayout>;
    case "none":
    default:
      return children;
  }
};

const AuthWrapper = connect(({ auth }) => ({
  isLoggedIn: auth.user,
}))(({ isLoggedIn, type, children }) => {
  const location = useLocation();

  switch (type) {
    case "only-authenticated":
      if (isLoggedIn === undefined) return <PageSpinner text="Loading" />;
      else if (isLoggedIn === null)
        return (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        );
      return children;
    case "only-unauthenticated":
      if (isLoggedIn === undefined) return <PageSpinner text="Loading" />;
      else if (isLoggedIn !== null)
        return (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location },
            }}
          />
        );
      return children;
    case "none":
    default:
      return children;
  }
});

const Route = ({
  authType = "none",
  layoutType = "empty",
  children,
  ...props
}) => {
  return (
    <RouterRoute {...props}>
      <AuthWrapper type={authType}>
        <LayoutWrapper type={layoutType}>{children}</LayoutWrapper>
      </AuthWrapper>
    </RouterRoute>
  );
};
