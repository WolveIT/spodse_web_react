import { connect } from "dva";
import React from "react";
import { Redirect, useLocation } from "react-router-dom";
import PageSpinner from "../Spinner/PageSpinner";

const RouteCustomWrapper = connect(({ auth }) => ({
  isLoggedIn: auth.user,
  isBusiness: auth.isBusiness,
}))(({ isLoggedIn, isBusiness, children }) => {
  const { pathname } = useLocation();

  if (isLoggedIn === undefined || (isLoggedIn && isBusiness === undefined))
    return <PageSpinner text="Loading" />;

  if (isLoggedIn && !isBusiness && !pathname.startsWith("/no-account")) {
    return (
      <Redirect
        to={{
          pathname: "/no-account",
        }}
      />
    );
  }

  if (
    ((isLoggedIn && isBusiness) || !isLoggedIn) &&
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
