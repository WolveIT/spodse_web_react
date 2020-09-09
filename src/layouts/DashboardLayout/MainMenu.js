import React, { useCallback } from "react";
import { Menu } from "antd";
import { routes } from "../../utils/config";
import { Link } from "react-router-dom";
import { setSelectedMenuKey } from "../../models/router";
import { connect } from "dva";
const { SubMenu } = Menu;

function getParentKeys(key, arr = []) {
  const lastDot = key.lastIndexOf(".");
  if (lastDot === -1) return arr;

  key = key.slice(0, lastDot);
  arr.push(key);
  return getParentKeys(key, arr);
}

export default connect(
  ({ router }) => ({ selectedMenuKey: router.selectedMenuKey }),
  { setSelectedMenuKey }
)(function Sidebar({ selectedMenuKey, setSelectedMenuKey }) {
  const menuRenderer = useCallback((routes, prefix = "", basePath = "") => {
    return routes
      .filter((route) => route.menuItem)
      .map((route, i) => {
        if (route.subRoutes)
          return (
            <SubMenu key={prefix + i} icon={<route.icon />} title={route.title}>
              {menuRenderer(
                route.subRoutes,
                prefix + i + ".",
                basePath + route.route?.path || ""
              )}
            </SubMenu>
          );
        return (
          <Menu.Item icon={<route.icon />} key={prefix + i}>
            <Link
              onClick={() => setSelectedMenuKey(prefix + i)}
              to={basePath + route.route.path}
            >
              {route.title}
            </Link>
          </Menu.Item>
        );
      });
  });

  return (
    <Menu
      defaultOpenKeys={getParentKeys(selectedMenuKey)}
      selectedKeys={[selectedMenuKey]}
      mode="inline"
      theme="dark"
    >
      {menuRenderer(routes)}
    </Menu>
  );
});
