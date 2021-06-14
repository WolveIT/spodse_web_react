import React, { useCallback } from "react";
import { Menu } from "antd";
import { routes } from "../../utils/config";
import { Link, useLocation, matchPath } from "react-router-dom";
import { connect } from "dva";
import { getRoutePath } from "utils";
const { SubMenu } = Menu;

function getParentKeys(key, arr = []) {
  const lastDot = key.lastIndexOf(".");
  if (lastDot === -1) return arr;

  key = key.slice(0, lastDot);
  arr.push(key);
  return getParentKeys(key, arr);
}

export default connect(({ router }) => ({ cr: router.computedRoutes }))(
  function MainMenu({ cr, height }) {
    const menuRenderer = useCallback((routes, prefix = "", basePath = "") => {
      return routes
        .filter((route) => route.menuItem)
        .map((route, i) => {
          const path = getRoutePath(basePath, route.route?.path || "");

          if (route.subRoutes) {
            return (
              <SubMenu
                key={prefix + i}
                icon={<route.icon />}
                title={route.title}
              >
                {menuRenderer(route.subRoutes, prefix + i + ".", path)}
              </SubMenu>
            );
          }

          return (
            <Menu.Item icon={<route.icon />} key={prefix + i}>
              <Link to={path}>{route.title}</Link>
            </Menu.Item>
          );
        });
    }, []);

    const pathname = useLocation().pathname;
    const selectedKey = cr.find((r) => matchPath(pathname, r.route)).key;

    return (
      <Menu
        style={{ height }}
        defaultOpenKeys={getParentKeys(selectedKey)}
        selectedKeys={[selectedKey]}
        mode="inline"
        theme="dark"
      >
        {menuRenderer(routes)}
      </Menu>
    );
  }
);
