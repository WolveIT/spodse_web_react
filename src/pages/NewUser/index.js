import React, { useCallback, useState } from "react";
import Title from "antd/lib/typography/Title";
import { Button, Form, Input, message, Progress, Switch, Tooltip } from "antd";
import AppUser from "../../services/appUser";
import { globalErrorHandler } from "../../utils/errorHandler";
import { useLocation, useParams } from "react-router-dom";
import { historyBackWFallback } from "../../utils";
import Theme from "../../utils/theme";
import { isValidEmail, isValidPassword } from "../../utils/validations";
import { InfoCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { randString } from "../../services/utils/utils";
import RoleSelector from "../Users/roleSelector";
import Role from "../../utils/userRole";
import { MuiDatePicker } from "../../components/MuiDateTimePicker";
import newEventStyles from "../NewEvent/index.module.scss";
import moment from "moment";
import ImagePicker from "../../components/ImagePicker";

export default function NewUser() {
  const userId = useParams().userId;
  const [progress, setProgress] = useState();
  const pathname = useLocation().pathname;
  const editMode = pathname.slice(pathname.lastIndexOf("/") + 1) === "edit";
  const [form] = Form.useForm();

  const onPasswordGenerate = useCallback(() => {
    form.setFieldsValue({ password: randString(10) });
  }, []);

  const onSubmit = useCallback((data) => {
    data.birthDate = moment(data.birthDate).format("DD/MM/YYYY");
    setProgress(0);
    AppUser[editMode ? "update" : "create"](data, setProgress)
      .then(() => {
        message.success(
          `User ${editMode ? "updated" : "created"} Successfully!`
        );
        historyBackWFallback("users/list");
      })
      .catch(globalErrorHandler)
      .finally(setProgress);
  }, []);

  return (
    <>
      <Title style={{ marginTop: 0, paddingTop: 0 }}>Create New User</Title>
      <Form
        style={{ marginTop: 16, position: "relative" }}
        onFinish={onSubmit}
        onFinishFailed={console.log}
        form={form}
        layout="vertical"
        name="new-user-form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
      >
        {/* to disable browser */}
        <input
          name="email"
          type="email"
          style={{ width: 0, height: 0, border: 0, padding: 0 }}
        />
        <input
          name="password"
          type="password"
          style={{ width: 0, height: 0, border: 0, padding: 0 }}
        />

        <Form.Item
          name="displayName"
          label="Full Name"
          rules={[{ required: true }]}
        >
          <Input placeholder="User's Full Name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true },
            {
              validator: (_, val) =>
                isValidEmail(val)
                  ? Promise.resolve()
                  : Promise.reject("Email is invalid"),
            },
          ]}
        >
          <Input placeholder="User's Email Address" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true },
            {
              validator: (_, val) =>
                isValidPassword(val)
                  ? Promise.resolve()
                  : Promise.reject("Must contain atleast 6 characters"),
            },
          ]}
        >
          <Input.Password
            addonAfter={
              <Tooltip title="Generate Password">
                <SyncOutlined onClick={onPasswordGenerate} />
              </Tooltip>
            }
            placeholder="Create User's Password"
          />
        </Form.Item>

        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true }]}
          initialValue={Role.types.BUSINESS}
        >
          <RoleSelector />
        </Form.Item>

        <Form.Item initialValue="" name="phone" label="Phone Number">
          <Input placeholder="User's Phone Number" />
        </Form.Item>

        <Form.Item initialValue="" name="bio" label="Profile Bio">
          <Input.TextArea
            autoSize={{ maxRows: 5, minRows: 2 }}
            className={newEventStyles.textarea}
            allowClear
            placeholder="User's Profile Bio"
          />
        </Form.Item>

        <Form.Item name="birthDate" label="Date of Birth" initialValue="">
          <MuiDatePicker
            placeholder="Pick User's Date of Birth"
            maxDate={Date.now()}
          />
        </Form.Item>

        <Form.Item
          label={
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>Send Email Alert</span>
              <Tooltip title="An email with the login credentials will be sent to the user's email address with signin instructions">
                <InfoCircleOutlined style={{ marginLeft: 8 }} />
              </Tooltip>
            </div>
          }
          name="sendEmailAlert"
          initialValue={true}
        >
          <Switch defaultChecked={true} />
        </Form.Item>

        <Form.Item
          style={{ position: "absolute", top: 24, right: "25vw" }}
          name="profilePicture"
        >
          <ImagePicker width={200} height={200} count={1} />
        </Form.Item>

        <Form.Item>
          <Button
            disabled={progress !== undefined}
            type="primary"
            htmlType="submit"
          >
            Submit
          </Button>
          {progress !== undefined ? (
            <Progress
              style={{ marginLeft: 8, position: "relative", bottom: 2 }}
              type="circle"
              percent={Math.round(progress)}
              width={28}
              strokeColor={Theme.get()}
            />
          ) : null}
        </Form.Item>
      </Form>
    </>
  );
}
