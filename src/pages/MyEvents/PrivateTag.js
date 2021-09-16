import { Tag } from "antd";
import React from "react";

export default function PrivateTag({ isPrivate, style }) {
  return (
    <Tag
      color={isPrivate ? "#BD2C6A" : "#0072BB"}
      style={{
        height: 26,
        width: 60,
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        ...(style || {}),
      }}
    >
      {isPrivate ? "Private" : "Public"}
    </Tag>
  );
}
