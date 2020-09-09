import React, { useCallback } from "react";
import { Form, Input, Button } from "antd";
import { isValidEmail, isValidPassword } from "../../utils/validations";
import { loginWithEmail } from "../../models/auth";
import { connect } from "dva";

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
  const onFinish = useCallback((values) =>
    login(values.email, values.password)
  );

  return (
    <Form {...layout} onFinish={onFinish}>
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
  );
};

export default connect(({ auth }) => ({ loading: auth.loading.login }), {
  login: loginWithEmail,
})(Login);
