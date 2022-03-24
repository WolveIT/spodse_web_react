import { connect } from "dva";
import React from "react";
import { Redirect, useLocation } from "react-router-dom";
import PageSpinner from "../Spinner/PageSpinner";
import Role from "../../utils/userRole";

const RouteCustomWrapper = connect(({ auth }) => ({
  isLoggedIn: auth.user,
  role: auth.role,
}))(({ isLoggedIn, role, children }) => {
  const { pathname } = useLocation();

  if (isLoggedIn === undefined || (isLoggedIn && role === undefined))
    return <PageSpinner text="Loading" />;

  const isAllowed = Role.is_allowed(role);
  if (isLoggedIn && !isAllowed && !pathname.startsWith("/no-account")) {
    return (
      <Redirect
        to={{
          pathname: "/no-account",
        }}
      />
    );
  }

  if (
    ((isLoggedIn && isAllowed) || !isLoggedIn) &&
    pathname.startsWith("/no-account")
  ) {
    return (
      <Redirect
        to={{
          pathname: "/",
        }}
      />
    );
  }

  return children;
});

export default RouteCustomWrapper;
