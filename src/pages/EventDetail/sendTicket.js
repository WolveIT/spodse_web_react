import { SendOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Popover,
  Spin,
  Tabs,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { globalErrorHandler } from "../../utils/errorHandler";

const { TabPane } = Tabs;

function CopyTabPane({ ticketURL, getLink }) {
  const [link, setLink] = useState(ticketURL);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!link) {
      setLoading(true);
      Promise.resolve(getLink?.())
        .catch(globalErrorHandler)
        .then((url) => {
          setLink(url);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <div
      className="flex-center"
      style={{ height: 212, width: 230, flexDirection: "column" }}
    >
      {loading ? (
        <Spin tip="Generating link..." />
      ) : (
        <>
          <h3 style={{ marginBottom: "2rem" }}>QR Code Link</h3>
          <a target="blank" href={link}>
            {link}
          </a>
          <Button
            style={{ marginTop: "0.75rem" }}
            onClick={() => {
              navigator.clipboard.writeText(link);
              message.success("Link copied to clipboard");
            }}
          >
            Copy to clipboard
          </Button>
        </>
      )}
    </div>
  );
}

function SendTicket({ onSubmit, getLink, email, ticketURL }) {
  const [loading, setLoading] = useState(false);
  const [isPhone, setIsPhone] = useState(true);
  const [isEmail, setIsEmail] = useState(true);
  const [visible, setVisible] = useState(false);

  const onFinish = useCallback(
    (data) => {
      setLoading(true);
      Promise.resolve(onSubmit?.(isEmail, isPhone ? `+47${data.phone}` : false))
        .catch(globalErrorHandler)
        .then(() => {
          message.success("Ticket has been sent successfully!");
          setVisible(false);
        })
        .finally(() => setLoading(false));
    },
    [isPhone, isEmail]
  );

  return (
    <Popover
      visible={visible}
      onVisibleChange={setVisible}
      trigger="click"
      title="Share QR code"
      content={
        <Tabs defaultActiveKey="1">
          <TabPane tab="Send Link" key="1">
            <Form layout="vertical" onFinish={onFinish}>
              <div style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={isEmail}
                  onChange={(e) => setIsEmail(e.target.checked)}
                >
                  Email
                </Checkbox>
              </div>
              <Form.Item hidden={!isEmail} name="email" initialValue={email}>
                <Input disabled />
              </Form.Item>
              <div style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={isPhone}
                  onChange={(e) => setIsPhone(e.target.checked)}
                >
                  Phone
                </Checkbox>
              </div>
              <Form.Item
                rules={[
                  {
                    validator: (_, val) =>
                      !val || !isPhone
                        ? Promise.resolve()
                        : /^\d{8}$/g.test(val)
                        ? Promise.resolve()
                        : Promise.reject("phone number is not valid"),
                  },
                ]}
                hidden={!isPhone}
                name="phone"
              >
                <Input addonBefore="+47" placeholder="phone number" />
              </Form.Item>
              <Form.Item style={{ marginBottom: 8 }}>
                <Button
                  disabled={!isPhone && !isEmail}
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                >
                  Send
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane tab="Copy Link" key="2">
            <CopyTabPane getLink={getLink} ticketURL={ticketURL} />
          </TabPane>
        </Tabs>
      }
    >
      <SendOutlined
        style={{
          transform: "rotate(-45deg)",
          position: "relative",
          top: "-2px",
          right: "-2px",
        }}
      />
    </Popover>
  );
}

export default SendTicket;
