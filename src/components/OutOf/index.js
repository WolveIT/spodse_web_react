import React from "react";

export default function OutOf({
  count,
  total,
  countColor = "#44C311",
  style,
  ...props
}) {
  return (
    <span style={style} {...props}>
      <span style={{ color: countColor, fontWeight: 500 }}>{count}</span>/
      {total}
    </span>
  );
}
