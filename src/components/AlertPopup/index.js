import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { globalErrorHandler } from "../../utils/errorHandler";

function handleCb(cb) {
  if (typeof cb !== "function") return cb;
  return function () {
    const res = cb();
    if (res instanceof Promise) {
      return new Promise((_res) => {
        res.catch(globalErrorHandler).finally(_res);
      });
    }
    return res;
  };
}

export default function AlertPopup({
  title,
  message,
  okText = "ok",
  cancelText = "cancel",
  onOk,
  onCancel,
  cancellable = true,
  modalType = "confirm",
  ...ModalProps
}) {
  Modal[modalType]({
    title,
    content: message,
    okText,
    cancelText,
    onOk: handleCb(onOk),
    onCancel: handleCb(onCancel),
    maskClosable: cancellable,
    cancelButtonProps: {
      style: typeof onCancel === "function" ? { display: "none" } : undefined,
    },
    icon: <ExclamationCircleOutlined />,
    okType: "default",
    ...ModalProps,
  });
}
