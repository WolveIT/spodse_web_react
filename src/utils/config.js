import {
  CalendarOutlined,
  DashboardOutlined,
  PlusCircleOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import RouteCustomWrapper from "../components/RouteCustomWrapper";

export const authService = "firebase"; //possible values: 'firebase', 'mock'

//order of the rotues matter as they are rendered within the main 'Switch'
//component as they are ordered in the array
export const routes = [
  {
    title: "Home", //reqd for main-menu-item and sub-menu-item
    icon: DashboardOutlined,
    route: {
      //route config for react-router-dom
      path: "/", //if starts with a "/" then indicates an absolute path otherwise indicates a path relative to it's parent's path
      exact: true,
    },
    layoutType: "dashboard", //configure your own layout types in the Router.js file (default:'empty') (inherited by sub routes)
    authType: "only-authenticated", //authentication type, configure in Router.js file (default:'none') (inherited by sub routes)
    component: require("pages/Dashboard").default, //component to render in the designated layout's children (if no component is given, no route is created)
    menuItem: true, //should this route be showed in the nav bar as a menu item (NOT inherited by sub routes)
  },
  {
    title: "Events",
    icon: CalendarOutlined,
    route: {
      path: "/events",
    },
    layoutType: "dashboard",
    authType: "only-authenticated",
    menuItem: true,
    subRoutes: [
      {
        title: "New Event",
        icon: PlusCircleOutlined,
        route: {
          path: "new_event",
          exact: true,
        },
        component: require("pages/NewEvent").default,
        menuItem: true,
      },
      {
        title: "My Events",
        icon: UnorderedListOutlined,
        route: {
          path: "my_events",
          exact: true,
        },
        component: require("pages/MyEvents").default,
        menuItem: true,
      },
      {
        route: {
          path: ":eventId/edit",
        },
        component: require("pages/NewEvent").default,
        menuItem: false,
      },
      {
        route: {
          path: ":eventId",
        },
        component: require("pages/EventDetail").default,
        menuItem: false,
      },
    ],
  },
  {
    title: "Settings",
    icon: SettingOutlined,
    route: {
      path: "/settings",
      exact: true,
    },
    layoutType: "dashboard",
    authType: "only-authenticated",
    component: require("pages/Settings").default,
    menuItem: true,
  },
  {
    route: {
      path: "/login",
    },
    layoutType: "auth",
    authType: "only-unauthenticated",
    component: require("../pages/Login").default,
  },
  {
    route: {
      path: "/signup",
    },
    layoutType: "auth",
    authType: "only-unauthenticated",
    component: require("../pages/Signup").default,
  },
  {
    route: {
      path: "/no-account",
    },
    layoutType: "empty",
    authType: "only-authenticated",
    component: require("../pages/NoAccount").default,
  },
  {
    route: {
      path: "/",
    },
    component: require("../pages/404").default,
  },
];

export const routeCustomWrapper = RouteCustomWrapper;
