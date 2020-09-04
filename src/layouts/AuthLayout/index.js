import React from "react";
import Center from "../../components/Center";

export default function AuthLayout({ children }) {
  return (
    <Center
      style={{
        height: "100vh",
      }}
    >
      {children}
    </Center>
  );
}
