import React from "react";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

export default function AlertPopup({
  title,
  message,
  okText = "ok",
  cancelText = "cancel",
  onOk,
  onCancel,
  cancellable = true,
  ...ModalProps
}) {
  Modal.confirm({
    title,
    content: message,
    okText,
    cancelText,
    onOk,
    onCancel,
    maskClosable: cancellable,
    cancelButtonProps: {
      style: typeof onCancel === "function" ? { display: "none" } : undefined,
    },
    icon: <ExclamationCircleOutlined />,
    okType: "default",
    ...ModalProps,
  });
}
