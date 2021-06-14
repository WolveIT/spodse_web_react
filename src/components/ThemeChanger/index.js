import React, { useCallback, useEffect, useState } from "react";
import { List, Popover } from "antd";
import Theme from "../../utils/theme";
import { setPopoverWidth } from "../PopoverWidth";
import { BgColorsOutlined } from "@ant-design/icons";

export default function ThemeChanger({
  containerStyle,
  containerProps,
  itemStyle,
  itemProps,
  style,
}) {
  const [themeColor, setThemeColor] = useState(Theme.get());

  const changeTheme = useCallback(
    (color) => {
      if (color !== themeColor) {
        Theme.set(color).then(function () {
          setThemeColor(color);
        });
      }
    },
    [themeColor]
  );

  const onVisibleChange = useCallback((visible) => {
    if (visible) setPopoverWidth("120px");
    else setTimeout(() => setPopoverWidth("unset"), 200);
  }, []);

  return (
    <Popover
      onVisibleChange={onVisibleChange}
      title="Select Theme"
      content={
        <List
          dataSource={Theme.colors}
          grid={{ column: 3 }}
          renderItem={(color) => (
            <div
              onClick={(e) => changeTheme(color)}
              className="grid-center"
              {...itemProps}
              style={{
                cursor: "pointer",
                borderRadius: "50%",
                width: 26,
                height: 26,
                display: "flex !important",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 4,
                border: color === themeColor ? "2px solid #777" : "none",
                ...(itemStyle || {}),
              }}
            >
              <div
                style={{
                  backgroundColor: color,
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                }}
              />
            </div>
          )}
          {...containerProps}
          style={{
            width: "100%",
            marginRight: -4,
            marginBottom: -10,
            ...(containerStyle || {}),
          }}
        />
      }
      trigger={["click"]}
    >
      <BgColorsOutlined
        title="Change Theme"
        style={{ fontSize: 24, color: themeColor, ...(style || {}) }}
      />
    </Popover>
  );
}
