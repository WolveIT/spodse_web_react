import React from "react";
import { Dropdown, Menu, message, Switch, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import Role, { useRole } from "../../utils/userRole";
import AlertPopup from "../../components/AlertPopup";
import AppUser from "../../services/appUser";
import { globalErrorHandler } from "../../utils/errorHandler";
import { dispatch } from "../../utils";
import { deleteUserFromState } from "../../models/appUser";

const actions = [
  (user) => ({
    title: "Copy UID",
    icon: <CopyOutlined />,
    onClick: () => {
      navigator.clipboard.writeText(user.id);
      message.success("Copied!");
    },
  }),
  (user, role) => ({
    title: "Delete",
    icon: <DeleteOutlined />,
    onClick: () => {
      let deleteEvents = false;
      AlertPopup({
        title: "Confirm Delete",
        message: (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>{`Are you sure you want to delete this user's account?`}</div>
            <div
              style={{
                fontSize: "0.75rem",
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-end",
              }}
            >
              <span style={{ marginRight: "0.5rem" }}>Delete Events</span>
              <Switch
                style={{ marginRight: "0.5rem" }}
                size="small"
                defaultChecked={false}
                onChange={(checked) => (deleteEvents = checked)}
              />
              <Tooltip title="Enabling this will delete all the events of this user. Use this with caution!">
                <InfoCircleOutlined />
              </Tooltip>
            </div>
          </div>
        ),
        onOk: () =>
          AppUser.delete({ uid: user.id, deleteEvents })
            .then(() => {
              dispatch(deleteUserFromState({ uid: user.id }));
              message.info("User successfully deleted!");
            })
            .catch(globalErrorHandler),
      });
    },
    disabled:
      [Role.types.ADMIN, Role.types.SUPER_ADMIN].includes(user.role) &&
      !Role.is_super_admin(role),
  }),
  (user, role) =>
    !Role.is_super_admin(role)
      ? null
      : {
          title: "Verify Email",
          icon: <CheckCircleOutlined />,
          onClick: () => {
            AlertPopup({
              title: "Verify user's email address",
              message: (
                <span>
                  If user's email is not already verified, then this action will
                  verify it, otherwise nothing will happen.
                  <br />
                  Are you sure to continue?
                </span>
              ),
              onOk: () =>
                AppUser.verify_email({ uid: user.id }).then(() => {
                  message.success("User account successfully verified");
                }),
            });
          },
        },
];

function Actions({ user }) {
  const role = useRole();
  const menu = (
    <Menu>
      {actions.map((item) => {
        const action = item(user, role);
        if (!action) return null;
        return <Menu.Item {...action}>{action.title}</Menu.Item>;
      })}
    </Menu>
  );

  return (
    <Dropdown trigger="click" overlay={menu}>
      <MoreOutlined />
    </Dropdown>
  );
}

export default Actions;
