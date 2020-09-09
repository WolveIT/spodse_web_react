import React from "react";
import Center from "../Center";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function PageSpinner({ text, centerProps, spinnerProps }) {
  return (
    <Center
      style={{ position: "fixed", left: 0, right: 0, top: 0, bottom: 0 }}
      {...centerProps}
    >
      <div
        style={{
          display: "inline-block",
          textAlign: "center",
        }}
      >
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 28 }} spin />}
          tip={text}
          size="large"
          {...spinnerProps}
        />
      </div>
    </Center>
  );
}
