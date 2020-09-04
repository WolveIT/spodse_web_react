import React, { useState, isValidElement, useCallback } from "react";
import { Container, Typography, TextField, useTheme } from "@material-ui/core";
import { isValidEmail } from "../../utils/validations";
import { loginWithEmail } from "../../models/auth";
import Button from "../../components/Button";
import { connect } from "dva";

export default connect(({ auth }) => ({ loading: auth.loading.login }), {
  loginWithEmail,
})(function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const theme = useTheme();

  const handleEmail = useCallback((e) => {
    setEmail(e.target.value);
  });

  const handlePassword = useCallback((e) => {
    setPassword(e.target.value);
  });

  const handleLogin = useCallback(() => {
    props.loginWithEmail(email, password);
  });

  return (
    <div>
      <Typography align="center" variant="h3">
        Login
      </Typography>
      <Container
        style={{
          display: "flex",
          flexDirection: "column",
          width: theme.breakpoints.width("sm"),
          maxWidth: "80%",
          marginTop: "32px",
          justifyContent: "space-between",
          height: "190px",
        }}
      >
        <TextField
          name="email"
          label="Email"
          required
          type="email"
          error={!isValidEmail(email)}
          onChange={handleEmail}
          value={email}
        />
        <TextField
          name="password"
          label="Password"
          required
          type="password"
          onChange={handlePassword}
          value={password}
        />
        <Button
          onClick={handleLogin}
          title="Login"
          style={{ marginTop: "16px" }}
          loading={props.loading}
        />
      </Container>
    </div>
  );
});
