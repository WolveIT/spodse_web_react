import React from "react";
import { Typography } from "antd";

export default function PlaceholderPage({ title, style }) {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        height: "100%",
        ...(style || {}),
      }}
    >
      <Typography.Title>{title}</Typography.Title>
    </div>
  );
}
