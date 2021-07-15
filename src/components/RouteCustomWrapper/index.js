import { connect } from "dva";
import React from "react";
import { Redirect, useLocation } from "react-router-dom";
import PageSpinner from "../Spinner/PageSpinner";

const RouteCustomWrapper = connect(({ auth }) => ({
  isLoggedIn: auth.user,
  customClaims: auth.customClaims,
}))(({ isLoggedIn, customClaims, children }) => {
  const { pathname } = useLocation();

  if (isLoggedIn === undefined || (isLoggedIn && customClaims === undefined))
    return <PageSpinner text="Loading" />;

  if (
    isLoggedIn &&
    !customClaims?.business &&
    !pathname.startsWith("/no-account")
  ) {
    return (
      <Redirect
        to={{
          pathname: "/no-account",
        }}
      />
    );
  } else if (pathname.startsWith("/no-account"))
    return (
      <Redirect
        to={{
          pathname: "/",
        }}
      />
    );

  return children;
});

export default RouteCustomWrapper;
