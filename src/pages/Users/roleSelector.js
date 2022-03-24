import { message, Select, Switch } from "antd";
import React, { useCallback, useState } from "react";
import AlertPopup from "../../components/AlertPopup";
import AppUser from "../../services/appUser";
import { globalErrorHandler } from "../../utils/errorHandler";
import Role, { useIsSuperAdminRole } from "../../utils/userRole";

const { Option } = Select;

function RoleSelector({
  role,
  user,
  value: propValue,
  onChange: propOnChange,
  style,
  allowAnySelection,
  noRestrictions,
  ...props
}) {
  const [value, setValue] = useState(role);
  const isSuperAdmin = useIsSuperAdminRole();

  const onChange = useCallback((newRole) => {
    let sendEmailAlert = true;
    AlertPopup({
      title: "Change Role",
      message: (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>{`Are you sure you want to change this user's role to ${newRole}?`}</div>
          <div
            style={{
              fontSize: "0.75rem",
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-end",
            }}
          >
            <span style={{ marginRight: "0.5rem" }}>Send Email Alert</span>
            <Switch
              size="small"
              defaultChecked={true}
              onChange={(checked) => (sendEmailAlert = checked)}
            />
          </div>
        </div>
      ),
      onOk: () =>
        AppUser.change_role({
          uid: user.id,
          newRole,
          sendEmailAlert,
        })
          .then(() => {
            setValue(newRole);
            message.success("User role changed successfully!");
          })
          .catch(globalErrorHandler),
    });
  }, []);

  return (
    <Select
      {...props}
      disabled={
        !noRestrictions &&
        !isSuperAdmin &&
        [Role.types.ADMIN, Role.types.SUPER_ADMIN].includes(propValue || value)
      }
      value={propValue || value}
      style={style}
      onChange={propOnChange || onChange}
    >
      {allowAnySelection ? <Option value="any-role">Any Role</Option> : null}
      <Option value={Role.types.NORMAL}>User</Option>
      <Option value={Role.types.BUSINESS}>Business Owner</Option>
      <Option
        value={Role.types.ADMIN}
        disabled={!noRestrictions && !isSuperAdmin}
      >
        Admin
      </Option>
      <Option
        value={Role.types.SUPER_ADMIN}
        disabled={!noRestrictions && !isSuperAdmin}
      >
        Super Admin
      </Option>
    </Select>
  );
}

export default RoleSelector;
