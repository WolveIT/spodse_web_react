import { Button } from "antd";
import { connect } from "dva";
import React from "react";
import { logout, makeBusiness } from "../../models/auth";

function NoAccount({ loading, makeBusiness, logout, logoutLoading }) {
  return (
    <div className="grid-center" style={{ height: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <h1>You don't have a business account yet!</h1>
        <Button style={{ width: 130 }} onClick={makeBusiness} loading={loading}>
          Request Access
        </Button>
        <Button style={{ width: 130 }} onClick={logout} loading={logoutLoading}>
          Logout
        </Button>
      </div>
    </div>
  );
}

export default connect(
  ({ auth }) => ({
    loading: auth.loading.makeBusiness,
    logoutLoading: auth.loading.logout,
  }),
  {
    makeBusiness,
    logout,
  }
)(NoAccount);
