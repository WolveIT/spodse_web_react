import { Button, Form, Input } from "antd";
import React, { useCallback } from "react";
import {
  isValidEmail,
  isValidName,
  isValidPassword,
} from "../../utils/validations";
import ImagePicker from "../../components/ImagePicker";
import { Link } from "react-router-dom";
import Hover from "../../components/Hover";
import { connect } from "dva";
import { signup } from "../../models/auth";

const layout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 14,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

function Signup({ loading, signup }) {
  const onFinish = useCallback(
    ({ profilePicture, ...rest }) =>
      signup({ profilePicture: profilePicture[0], ...rest }),
    [signup]
  );

  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ marginBottom: 32 }}>Signup</h1>
      <Form style={{ textAlign: "left" }} onFinish={onFinish} {...layout}>
        <Form.Item
          name="displayName"
          label="Full Name"
          rules={[
            { required: true, message: "Full Name is required" },
            {
              validator: (_, val) =>
                isValidName(val)
                  ? Promise.resolve()
                  : Promise.reject("Must contain atleast 3 characters"),
            },
          ]}
        >
          <Input placeholder="Enter your name" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: "Email is required" },
            {
              validator: (_, val) =>
                isValidEmail(val)
                  ? Promise.resolve()
                  : Promise.reject("Email is invalid"),
            },
          ]}
        >
          <Input type="email" placeholder="Enter your email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Choose Password"
          rules={[
            { required: true, message: "Password is required" },
            {
              validator: (_, val) =>
                isValidPassword(val)
                  ? Promise.resolve()
                  : Promise.reject("Must contain atleast 6 characters"),
            },
          ]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>
        <Form.Item name="profilePicture" label="Profile Picture">
          <ImagePicker count={1} />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button loading={loading} type="primary" htmlType="submit">
            Signup
          </Button>
        </Form.Item>
      </Form>
      <div style={{ float: "right", fontSize: 12 }}>
        Already a user?{" "}
        <Hover hoverStyle={{ textDecoration: "underline" }}>
          <Link to="/login" style={{ fontWeight: "500" }}>
            Login
          </Link>
        </Hover>
      </div>
    </div>
  );
}

export default connect(({ auth }) => ({ loading: auth.loading.signup }), {
  signup,
})(Signup);
