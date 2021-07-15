import React, { useCallback } from "react";
import { Form, Input, Button } from "antd";
import { isValidEmail, isValidPassword } from "../../utils/validations";
import { loginWithEmail } from "../../models/auth";
import { connect } from "dva";
import { Link } from "react-router-dom";
import Hover from "../../components/Hover";

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const Login = ({ login, loading }) => {
  const onFinish = useCallback(
    (values) => login(values.email, values.password),
    [login]
  );

  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ marginBottom: 32 }}>Login</h1>
      <Form style={{ textAlign: "left" }} {...layout} onFinish={onFinish}>
        <Form.Item
          label="Email"
          name="email"
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
          <Input type="email" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
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
          <Input.Password />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button loading={loading} type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      </Form>
      <div style={{ float: "right", fontSize: 12 }}>
        New User?{" "}
        <Hover hoverStyle={{ textDecoration: "underline" }}>
          <Link to="/signup" style={{ fontWeight: "500" }}>
            Signup
          </Link>
        </Hover>
      </div>
    </div>
  );
};

export default connect(({ auth }) => ({ loading: auth.loading.login }), {
  login: loginWithEmail,
})(Login);
