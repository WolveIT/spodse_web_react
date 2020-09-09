import React, { useEffect } from "react";
import {
  Switch,
  Route as RouterRoute,
  Redirect,
  useLocation,
  BrowserRouter,
} from "react-router-dom";
import { connect } from "dva";
import PageSpinner from "./components/Spinner/PageSpinner";
import { routes } from "./utils/config";

//layouts
import EmptyLayout from "./layouts/EmptyLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

const routeRenderer = (
  routes,
  prefix = "",
  basePath = "",
  parentConfig = {}
) => {
  return routes.map((route, i) => {
    if (route.subRoutes) {
      //if a root with child roots has it's own path and corresponding component
      //then it should be rendered as a seperate route
      if (route.route?.path && route.component)
        return (
          <>
            {routeRenderer(
              route.subRoutes,
              prefix + i + ".",
              basePath + route.route?.path || "",
              route
            )}
            <Route
              key={prefix + i}
              layoutType={route.layoutType || parentConfig.layoutType}
              authType={route.authType || parentConfig.authType}
              {...route.route}
              path={basePath + route.route.path}
            >
              <route.component />
            </Route>
          </>
        );

      return routeRenderer(
        route.subRoutes,
        prefix + i + ".",
        basePath + route.route?.path || "",
        route
      );
    }

    return (
      <Route
        key={prefix + i}
        layoutType={route.layoutType || parentConfig.layoutType}
        authType={route.authType || parentConfig.authType}
        {...route.route}
        path={basePath + route.route.path}
      >
        <route.component />
      </Route>
    );
  });
};

export default function Router() {
  return (
    <BrowserRouter>
      <Switch>{routeRenderer(routes)}</Switch>
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
