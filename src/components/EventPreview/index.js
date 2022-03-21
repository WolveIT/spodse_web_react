import React, { useState } from "react";
import moment from "moment";
import CustomIcon from "../Icon";
import NLines from "../NLines";
import { placeholderImg } from "../../utils";
import { Switch } from "antd";

export function getGenreColor(genre) {
  const selector = {
    "Food & Drink": "#fbc02d",
    Festival: "#e91e63",
    Event: "#9c27b0",
    Sports: "#1565C0",
  };

  return selector[genre] || "#1565c055";
}

export function EventCard({
  data,
  visible = true,
  bottom,
  style,
  className,
  onTitleClick,
}) {
  return (
    <div
      className={className}
      style={{
        width: 300,
        borderRadius: 16,
        boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.5)",
        color: "#201A05",
        backgroundColor: "#fff",
        fontFamily: "Nunito Sans, sans-serif",
        transform: visible
          ? "translateY(0px)"
          : `translateY(calc(100% + ${bottom} + 40px))`,
        transition: "transform 0.3s",
        ...(style || {}),
      }}
    >
      <img
        style={{
          width: "100%",
          height: 175,
          objectFit: "cover",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
        alt="event cover"
        src={
          typeof data.images?.[0] === "string"
            ? data.images[0]
            : data.images?.[0]?.src || placeholderImg
        }
      />
      <div style={{ padding: "14px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>{moment(data.startDate || new Date()).format("D.M.YYYY")}</div>
          <div
            style={{
              width: "60%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              className="ellipsis"
              style={{
                width: "calc(100% - 22px)",
                textAlign: "right",
              }}
            >
              {data.location || "Event's Address"}
            </div>
            <CustomIcon
              style={{ marginLeft: 8, color: "#000" }}
              type="icon-location"
            />
          </div>
        </div>
        <div
          onClick={onTitleClick}
          style={{
            display: "inline-block",
            backgroundColor: getGenreColor(data.genre),
            borderRadius: 6,
            padding: "3px 9px",
            paddingTop: 5,
            fontSize: 16,
            fontWeight: 900,
            margin: "2px 0px 2px -6px",
            cursor: onTitleClick && "pointer",
          }}
        >
          {data.title || "Event's Title"}
        </div>
        <NLines lines={2}>
          {data.description ||
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec molestie ac odio quis elementum. Nulla rutrum aliquet gravida."}
        </NLines>
      </div>
    </div>
  );
}

export default function EventPreview({
  data,
  left,
  right = "32px",
  top,
  bottom = "32px",
}) {
  const [visible, setVisible] = useState(true);
  return (
    <div
      style={{
        position: "fixed",
        left,
        right,
        bottom,
        top,
        zIndex: 10,
        pointerEvents: visible ? undefined : "none",
      }}
    >
      <EventCard data={data} visible={visible} bottom={bottom} />
      <Switch
        style={{ marginTop: 16, float: "right", pointerEvents: "visible" }}
        checked={visible}
        onChange={setVisible}
        checkedChildren="Preview"
        unCheckedChildren="Preview"
      />
    </div>
  );
}
