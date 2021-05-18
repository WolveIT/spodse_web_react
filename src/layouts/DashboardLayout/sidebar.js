import React from "react";
import { Layout, Drawer } from "antd";
import MainMenu from "./MainMenu";

const { Sider } = Layout;

export default function Sidebar({ collapsed, toggleCollapsed }) {
  return (
    <>
      <Sider collapsed={collapsed} width={200} className="hide-on-xs">
        <MainMenu />
      </Sider>
      <Drawer
        placement={"left"}
        closable={false}
        onClose={toggleCollapsed}
        visible={!collapsed}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ display: "none " }}
        className={"show-on-xs"}
      >
        <MainMenu />
      </Drawer>
    </>
  );
}
