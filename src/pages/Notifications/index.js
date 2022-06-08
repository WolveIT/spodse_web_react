import { Button, Form, Input, message, Switch } from "antd";
import Title from "antd/lib/typography/Title";
import { useDispatch, useSelector } from "dva";
import React, { useCallback, useState } from "react";
import FirestoreAlgoliaSelect from "../../components/LazySelect/FirestoreAlgoliaSelect";
import ServerImg from "../../components/ServerImg";
import { sendManualNotification } from "../../models/notification";
import Algolia from "../../services/algolia";
import { refs } from "../../services/utils/firebase_config";
import { placeholderAvatar } from "../../utils";

function Notifications() {
  const [form] = Form.useForm();
  const [isSelectedUsers, setIsSelectedUsers] = useState(false);
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.notification.loading.sendManual);

  const onSubmit = useCallback((data) => {
    if (data.dataPayload) data.dataPayload = JSON.parse(data.dataPayload);
    dispatch(
      sendManualNotification(data, () => {
        form.resetFields();
        message.success("Notification has been sent successfully!");
      })
    );
  }, []);

  return (
    <>
      <Title style={{ marginTop: 0, paddingTop: 0 }}>New Notification</Title>

      <Form
        style={{ marginTop: 16, position: "relative" }}
        onFinish={onSubmit}
        onFinishFailed={console.log}
        form={form}
        layout="vertical"
        name="new-notification-form"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 8 }}
      >
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="Title of the notification" />
        </Form.Item>
        <Form.Item name="body" label="Body" rules={[{ required: true }]}>
          <Input placeholder="Body of the notification" />
        </Form.Item>
        <Form.Item
          name="dataPayload"
          label="Data (JSON)"
          rules={[
            {
              validator: (_, val) => {
                if (!val) return Promise.resolve();
                try {
                  JSON.parse(val);
                  return Promise.resolve();
                } catch (error) {
                  return Promise.reject("must be a valid JSON");
                }
              },
            },
          ]}
        >
          <Input.TextArea
            autoSize={{ minRows: 4, maxRows: 6 }}
            placeholder="Data Payload in JSON (optional)"
          />
        </Form.Item>
        <Form.Item
          name="isSelectedUsers"
          label="Selected Users Only?"
          rules={[{ required: true }]}
          initialValue={false}
        >
          <Switch onChange={setIsSelectedUsers} defaultChecked={false} />
        </Form.Item>

        {isSelectedUsers ? (
          <Form.Item
            label="Select Users"
            name="uids"
            rules={[{ required: true }]}
          >
            <FirestoreAlgoliaSelect
              mode="multiple"
              index={Algolia.users}
              baseQuery={refs.users}
              renderItem={(item) => ({
                node: (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <ServerImg
                      src={item.profilePicture}
                      style={{ borderRadius: "50%", width: 28, height: 28 }}
                      loader={{ shape: "circle", type: "skeleton" }}
                      fallback={placeholderAvatar}
                    />
                    <div style={{ marginLeft: "0.75rem" }}>
                      <span>{item.displayName}</span>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#9c9c9c",
                          marginTop: "-0.25rem",
                        }}
                      >
                        {item.email}
                      </div>
                    </div>
                  </div>
                ),
              })}
              valueResolver={(item) => item.id}
              idResolver={(val) => val}
              labelResolver={(item) => item.displayName}
              optionLabelProp="label"
            />
          </Form.Item>
        ) : null}

        <Form.Item>
          <Button loading={loading} type="primary" htmlType="submit">
            Send Now
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

export default Notifications;
