import React from "react";

export default function PrivateTag({ isPrivate, style }) {
  return (
    <span
      style={{
        backgroundColor: isPrivate ? "#BD2C6A" : "#0072BB",
        color: "#fff",
        fontWeight: 600,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 80,
        height: 30,
        borderRadius: 999,
        ...(style || {}),
      }}
    >
      {isPrivate ? "Private" : "Public"}
    </span>
  );
}
