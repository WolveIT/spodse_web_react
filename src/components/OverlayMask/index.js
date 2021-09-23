import React from "react";
import useMeasure from "react-use-measure";

export default function OverlayMask({
  children,
  visible = false,
  mode = "light",
  opacity = 0.7,
  content = "",
}) {
  const [ref, bounds] = useMeasure();

  return (
    <>
      {React.cloneElement(children, { ref })}
      {visible && (
        <div
          style={{
            width: bounds.width,
            height: bounds.height,
            position: "fixed",
            zIndex: 999,
            left: bounds.left,
            right: bounds.right,
            top: bounds.top,
            bottom: bounds.bottom,
            display: "grid",
            placeItems: "center",
            background:
              mode === "light"
                ? `rgba(255,255,255,${opacity})`
                : `rgba(0,0,0,${opacity})`,
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
