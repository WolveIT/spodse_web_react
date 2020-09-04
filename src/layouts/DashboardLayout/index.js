import React from "react";
import { Container, useTheme, Grid, Typography } from "@material-ui/core";
import Sidebar from "./sidebar";
import { connect } from "dva";

const Header = connect(({ auth }) => ({
  displayName: auth.user?.displayName,
  email: auth.user?.email,
}))((props) => {
  return (
    <div
      style={{
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: "0px 12px",
        height: "64px",
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography
        style={{
          color: "#fff",
          position: "absolute",
          right: "24px",
        }}
      >
        {props.displayName || props.email}
      </Typography>
    </div>
  );
});

export default function DashboardLayout({ children }) {
  return (
    <Grid container style={{ height: "100vh" }}>
      <Sidebar />
      <Grid item xs>
        <Header />
        <div style={{ height: "calc(100% - 64px)", position: "relative" }}>
          {children}
        </div>
      </Grid>
    </Grid>
  );
}
