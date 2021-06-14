import React, { useCallback } from "react";
import { Badge, Dropdown, List, Menu, Popover, Layout } from "antd";
import {
  BellOutlined,
  CaretDownOutlined,
  DownOutlined,
  LoadingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { connect } from "dva";
import { logout } from "../../models/auth";
import Avatar from "antd/lib/avatar/avatar";
import AlertPopup from "../../components/AlertPopup";
import avatar from "../../assets/images/avatar.png";
import ThemeChanger from "../../components/ThemeChanger";

const { Header: AntdHeader } = Layout;

function Notifications({ count }) {
  return (
    <div style={{ marginRight: 20, display: "flex" }}>
      <Popover
        title="Notifications"
        content={
          <List
            style={{ height: "60vh", width: 300, overflow: "auto" }}
            itemLayout="horizontal"
            dataSource={Array(count).fill({ title: "New notification Title" })}
            renderItem={(item) => {
              return (
                <List.Item>
                  <List.Item.Meta
                    title={<a href="/">{item.title}</a>}
                    description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                  />
                </List.Item>
              );
            }}
          />
        }
        trigger={["click"]}
      >
        <Badge count={count}>
          <BellOutlined
            title="Notifications"
            style={{ fontSize: 20, cursor: "pointer" }}
          />
        </Badge>
      </Popover>
    </div>
  );
}

function AvatarMenu({ logoutLoading, logout, displayName }) {
  const onLogout = useCallback(() => {
    AlertPopup({
      title: "Logout",
      message: "Are you sure you want to logout?",
      onOk: logout,
    });
  }, [logout]);

  return (
    <Dropdown
      overlay={
        <Menu>
          <div style={{ padding: "8px 12px" }}>{displayName}</div>
          <Menu.Item
            disabled={logoutLoading}
            onClick={onLogout}
            icon={logoutLoading ? <LoadingOutlined /> : <LogoutOutlined />}
          >
            Logout
          </Menu.Item>
        </Menu>
      }
      trigger={["click"]}
    >
      <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
        <Avatar size="small" title={displayName} src={avatar} />
        <CaretDownOutlined style={{ marginLeft: 2 }} />
      </div>
    </Dropdown>
  );
}

function Header(props) {
  return (
    <AntdHeader
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        background: "unset",
        paddingRight: 32,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}></div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <ThemeChanger style={{ marginRight: 20 }} />
        <Notifications count={0} />
        <AvatarMenu {...props} />
      </div>
    </AntdHeader>
  );
}

export default connect(
  ({ auth }) => ({
    logoutLoading: auth.loading.logout,
    displayName: auth.user?.email,
  }),
  {
    logout,
  }
)(Header);
