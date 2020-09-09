import React from "react";
import { Layout } from "antd";
import logo from "../../assets/images/logo.png";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import HeaderMenu from "./HeaderMenu";
import { Link } from "react-router-dom";

const { Header: AntdHeader } = Layout;

export default function Header({ collapsed, toggleCollapsed }) {
  return (
    <AntdHeader
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {collapsed ? (
          <MenuUnfoldOutlined
            style={{ color: "#fff", fontSize: 18 }}
            onClick={toggleCollapsed}
          />
        ) : (
          <MenuFoldOutlined
            style={{ color: "#fff", fontSize: 18 }}
            onClick={toggleCollapsed}
          />
        )}
        <Link to="/">
          <img
            alt="site-logo"
            src={logo}
            style={{
              height: 40,
              marginLeft: "16px",
            }}
          />
        </Link>
      </div>
      <HeaderMenu />
    </AntdHeader>
  );
}
