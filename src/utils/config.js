import Dashboard from "@material-ui/icons/Dashboard";
import Toc from "@material-ui/icons/Toc";
import People from "@material-ui/icons/People";
import AccountBalanceWalletIcon from "@material-ui/icons/AccountBalanceWallet";
import Home from "../pages/Home";
import Orders from "../pages/Orders";
import Users from "../pages/Users";
import Accounts from "../pages/Accounts";
import NotFound from "../pages/404";
import Signup from "../pages/Signup";
import Login from "../pages/Login";

export const routes = [
  {
    title: "Dashboard", //reqd for main-menu-item and sub-menu-item
    icon: Dashboard,
    route: { //route config for react-router-dom
      path: "/",
      exact: true,
    },
    layoutType="dashboard", //configure your own layout types in the Router.js file (default:'empty')
    authType="only-authenticated", //authentication type, configure in Router.js file (default:'none')
    component: Home, //component to render in the designated layout's children
    type: "main-menu-item", //enum: main-menu-item, sub-menu-item, none (default:'none')
  },
  {
    title: "Orders",
    icon: Toc,
    route: {
      path: "/orders",
    },
    layoutType="dashboard",
    authType="only-authenticated",
    component: Orders,
    type: "main-menu-item",
  },
  {
    title: "Users",
    icon: People,
    route: {
      path: "/users",
    },
    layoutType="dashboard",
    authType="only-authenticated",
    component: Users,
    type: "main-menu-item",
  },
  {
    title: "Accounts",
    icon: AccountBalanceWalletIcon,
    route: {
      path: "/accounts",
    },
    layoutType="dashboard",
    authType="only-authenticated",
    component: Accounts,
    type: "main-menu-item",
  },
  {
    route: {
      path: "/login",
    },
    layoutType="auth",
    authType="only-unauthenticated",
    component: Login,
  },
  {
    route: {
      path: "/signup",
    },
    layoutType="auth",
    authType="only-unauthenticated",
    component: Signup,
  },
  {
    route: {
      path: "/",
    },
    layoutType="auth",
    authType="only-unauthenticated",
    component: NotFound,
  },
];
