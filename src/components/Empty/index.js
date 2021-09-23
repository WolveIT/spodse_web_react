import React from "react";
import { Empty as EmptyAntd } from "antd";

export default function Empty({ containerStyle, ...props }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        ...(containerStyle || {}),
      }}
    >
      <EmptyAntd {...props} />
    </div>
  );
}
