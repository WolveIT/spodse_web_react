import React, { useCallback, useState } from "react";
import Title from "antd/lib/typography/Title";
import { Button, Form, Input, message, Progress, Switch, Tooltip } from "antd";
import AppUser from "../../services/appUser";
import { globalErrorHandler } from "../../utils/errorHandler";
import { useLocation } from "react-router-dom";
import { historyBackWFallback } from "../../utils";
import Theme from "../../utils/theme";
import { isValidEmail, isValidPassword } from "../../utils/validations";
import {
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { randString } from "../../services/utils/utils";
import RoleSelector from "../Users/roleSelector";
import Role from "../../utils/userRole";
import { MuiDatePicker } from "../../components/MuiDateTimePicker";
import newEventStyles from "../NewEvent/index.module.scss";
import moment from "moment";
import ImagePicker from "../../components/ImagePicker";
import debounce from "lodash.debounce";
import Firestore from "../../services/firestore";
import { refs } from "../../services/utils/firebase_config";

export const status = {
  INDEFINITE: "indefinite",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

const onSettleUsername = debounce((val, setUsernameStatus) => {
  if (!val?.length || val?.length < 3 || val?.includes(" ")) {
    return setUsernameStatus(status.INDEFINITE);
  }
  setUsernameStatus(status.LOADING);
  Firestore.get(refs.displayNames.doc(val))
    .then((doc) => {
      if (!doc) setUsernameStatus(status.SUCCESS);
      else setUsernameStatus(status.ERROR);
    })
    .catch((e) => {
      setUsernameStatus(status.ERROR);
      globalErrorHandler(e);
    });
}, 1200);

function getUsernameSuffix(usernameStatus) {
  switch (usernameStatus) {
    case status.INDEFINITE:
      return " ";
    case status.LOADING:
      return <LoadingOutlined spin style={{ color: Theme.get() }} />;
    case status.SUCCESS:
      return (
        <Tooltip title="Username is available!">
          <CheckOutlined style={{ color: "#28A745" }} />
        </Tooltip>
      );
    case status.ERROR:
      return (
        <Tooltip title="Username is already taken!">
          <CloseOutlined style={{ color: "#DC3444" }} />
        </Tooltip>
      );
  }
}

export default function NewUser() {
  const [progress, setProgress] = useState();
  const pathname = useLocation().pathname;
  const [form] = Form.useForm();
  const [usernameStatus, setUsernameStatus] = useState(status.INDEFINITE);

  const onPasswordGenerate = useCallback(() => {
    form.setFieldsValue({ password: randString(10) });
  }, []);

  const onSubmit = useCallback((data) => {
    data.birthDate = moment(data.birthDate).format("DD/MM/YYYY");
    setProgress(0);
    AppUser.create(data, setProgress)
      .then(() => {
        message.success(`User created successfully!`);
        historyBackWFallback("users/list");
      })
      .catch(globalErrorHandler)
      .finally(setProgress);
  }, []);

  const onUsernameChange = useCallback((e) => {
    const { value } = e.target;
    onSettleUsername(value, setUsernameStatus);
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
          name="username"
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
          name="username"
          label="Username"
          rules={[
            { required: true },
            { min: 3, type: "string" },
            {
              validator: (_, val) =>
                val.includes(" ")
                  ? Promise.reject("Username can not have spaces")
                  : Promise.resolve(),
            },
          ]}
        >
          <Input
            suffix={getUsernameSuffix(usernameStatus)}
            onChange={onUsernameChange}
            placeholder="Unique username"
          />
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
            disabled={
              progress !== undefined || usernameStatus !== status.SUCCESS
            }
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
