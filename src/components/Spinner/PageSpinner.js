import React from "react";
import Center from "../Center";
import { Spin } from "antd";

export default function PageSpinner({
  text,
  fixed = true,
  centerProps,
  spinnerProps,
}) {
  return (
    <Center
      style={
        fixed
          ? { position: "fixed", left: 0, right: 0, top: 0, bottom: 0 }
          : { height: "100%", width: "100%" }
      }
      {...centerProps}
    >
      <div
        style={{
          display: "inline-block",
          textAlign: "center",
        }}
      >
        <Spin tip={text} size="large" {...spinnerProps} />
      </div>
    </Center>
  );
}
