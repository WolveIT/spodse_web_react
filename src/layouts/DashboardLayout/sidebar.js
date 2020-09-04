import React, { useState, useCallback } from "react";
import {
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
} from "@material-ui/core";
import ExitToApp from "@material-ui/icons/ExitToApp";
import Menu from "@material-ui/icons/Menu";
import { Link } from "react-router-dom";
import { connect } from "dva";
import { logout } from "../../models/auth";
import { routes } from "../../utils/config";
import AlertPopup from "../../components/AlertPopup";

export default connect(({ auth }) => ({ loading: auth.loading.logout }), {
  logout,
})(function Sidebar(props) {
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  const onLogout = useCallback(() => {
    AlertPopup({
      title: "Logout",
      message: "Are you sure you want to logout?",
      onOk: props.logout,
      onCancel: () => {},
    });
  });

  return (
    <Grid
      style={{
        height: "100%",
        backgroundColor: theme.palette.primary.dark,
        transition: "width 0.3s",
        width: open ? "270px" : "90px",
        maxWidth: "50%",
      }}
      item
    >
      <Container
        style={{
          backgroundColor: "rgba(0,0,0,0.2)",
          padding: "0px 12px",
          height: "64px",
          flexDirection: "row",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link style={{ flex: 1 }} to="/">
          {open ? (
            <Typography
              variant="h6"
              component="h2"
              style={{
                color: "#86eafa",
                textAlign: "center",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              Waterlink Admin
            </Typography>
          ) : (
            <img
              width="32px"
              height="32px"
              style={{ borderRadius: "12px" }}
              src={require("../../assets/images/waterlink-logo.jpg")}
            />
          )}
        </Link>
        <IconButton
          style={{ padding: "none", margin: "none" }}
          onClick={() => setOpen(!open)}
        >
          <Menu style={{ color: "#cce3ff" }} />
        </IconButton>
      </Container>
      <List
        style={{ paddingTop: "32px", paddingBottom: "32px" }}
        component="nav"
      >
        {routes.map((item) => (
          <Link key={item.title} style={{ flex: 1 }} to={item.route.path}>
            <ListItem button>
              <ListItemIcon>
                <item.icon
                  style={{
                    color: theme.palette.background.paper,
                    marginLeft: "13px",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                style={{
                  color: open
                    ? theme.palette.background.paper
                    : theme.palette.primary.dark,
                }}
                primary={open ? item.title : "."}
              />
            </ListItem>
          </Link>
        ))}
        <ListItem
          disabled={props.loading}
          key="logout"
          onClick={onLogout}
          button
        >
          <ListItemIcon>
            <ExitToApp
              style={{
                color: theme.palette.background.paper,
                marginLeft: "13px",
              }}
            />
          </ListItemIcon>
          <ListItemText
            style={{
              color: open
                ? theme.palette.background.paper
                : theme.palette.primary.dark,
            }}
            primary={open ? "Logout" : "."}
          />
          {props.loading && (
            <CircularProgress
              size={18}
              style={{ color: theme.palette.background.paper }}
            />
          )}
        </ListItem>
      </List>
    </Grid>
  );
});
