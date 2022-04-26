import { Button } from "antd";
import { useDispatch, useSelector } from "dva";
import React from "react";
import { logout } from "../../models/auth";

export default function NoAccess() {
  const logoutLoading = useSelector(({ auth }) => auth.loading.logout);
  const dispatch = useDispatch();

  return (
    <div className="grid-center" style={{ height: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <h1>You don't have access to this page!</h1>
        <Button style={{ width: 130 }}>Request Access</Button>
        <Button
          style={{ width: 130 }}
          onClick={() => dispatch(logout())}
          loading={logoutLoading}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
