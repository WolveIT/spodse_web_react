import React, { useCallback } from "react";
import { Dropdown, Menu } from "antd";
import {
  DownOutlined,
  LoadingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { connect } from "dva";
import { logout } from "../../models/auth";
import Avatar from "antd/lib/avatar/avatar";
import AlertPopup from "../../components/AlertPopup";

function HeaderMenu({ loading, logout, displayName }) {
  const onLogout = useCallback(() => {
    AlertPopup({
      title: "Logout",
      message: "Are you sure you want to logout?",
      onOk: logout,
    });
  });

  return (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item
            disabled={loading}
            onClick={onLogout}
            icon={loading ? <LoadingOutlined /> : <LogoutOutlined />}
          >
            Logout
          </Menu.Item>
        </Menu>
      }
      trigger={["click"]}
    >
      <a
        style={{
          color: "#eee",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
        }}
        onClick={(e) => e.preventDefault()}
      >
        {displayName}
        <DownOutlined style={{ fontSize: 16, marginLeft: 8, marginTop: 2 }} />
        <Avatar
          style={{ marginLeft: 16 }}
          src="https://w7.pngwing.com/pngs/312/283/png-transparent-man-s-face-avatar-computer-icons-user-profile-business-user-avatar-blue-face-heroes.png"
        />
      </a>
    </Dropdown>
  );
}

export default connect(
  ({ auth }) => ({
    loading: auth.loading.logout,
    displayName: auth.user?.email,
  }),
  {
    logout,
  }
)(HeaderMenu);
