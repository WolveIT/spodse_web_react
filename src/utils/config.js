import Home from "../pages/Home";
import NotFound from "../pages/404";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import { DashboardOutlined } from "@ant-design/icons";

//order of the rotues matter as they are rendered within the main 'Switch'
//component as they are ordered in the array

export const routes = [
  {
    title: "Dashboard", //reqd for main-menu-item and sub-menu-item
    icon: DashboardOutlined,
    route: {
      //route config for react-router-dom
      path: "/", //reqd
      exact: true,
    },
    layoutType: "dashboard", //configure your own layout types in the Router.js file (default:'empty') (inherited by sub routes)
    authType: "only-authenticated", //authentication type, configure in Router.js file (default:'none') (inherited by sub routes)
    component: Home, //component to render in the designated layout's children
    menuItem: true, //should this route be showed in the nav bar as a menu item (NOT inherited by sub routes)
  },
  {
    route: {
      path: "/login",
    },
    layoutType: "auth",
    authType: "only-unauthenticated",
    component: Login,
  },
  {
    route: {
      path: "/signup",
    },
    layoutType: "auth",
    authType: "only-unauthenticated",
    component: Signup,
  },
  {
    route: {
      path: "/",
    },
    component: NotFound,
  },
];
