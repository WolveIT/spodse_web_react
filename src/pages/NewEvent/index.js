import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Progress,
  Select,
  Switch,
  Tooltip,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { historyBackWFallback } from "../../utils";
import TagsList from "../../components/TagsList";
import ImagePicker from "../../components/ImagePicker";
import Title from "antd/lib/typography/Title";
import styles from "./index.module.scss";
import FilePicker from "../../components/FilePicker";
import Theme from "../../utils/theme";
import Event from "../../services/event";
import { globalErrorHandler } from "../../utils/errorHandler";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { connect, useSelector } from "dva";
import { fetchEvent, setFormData } from "../../models/event";
import PageSpinner from "../../components/Spinner/PageSpinner";
import EventPreview from "../../components/EventPreview";
import {
  InfoCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Hover from "../../components/Hover";
import MuiDateTimePicker from "../../components/MuiDateTimePicker";

const genres = ["Food & Drink", "Festival", "Event", "Sports"];

function EventPreviewCard() {
  const event = useSelector(({ event }) => event.formData);
  return <EventPreview data={event} />;
}

function NewEvent({ event, fetchEvent, fetchLoading, setFormData }) {
  const eventId = useParams().eventId;
  const pathname = useLocation().pathname;
  const editMode = pathname.slice(pathname.lastIndexOf("/") + 1) === "edit";
  const history = useHistory();

  useEffect(() => {
    if (editMode && event?.id !== eventId) fetchEvent(eventId);
  }, []);

  const [form] = Form.useForm();
  const [ticketAnswer, setTicketAnswer] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [minDate, setMinDate] = useState(new Date());
  const [progress, setProgress] = useState();
  const [showDeadline, setShowDeadline] = useState(false);

  useEffect(() => {
    if (editMode && event && !fetchLoading) {
      form.setFieldsValue({
        ...event,
        startDate: event.startsAt.toDate(),
        endDate: event.endsAt.toDate(),
        closesAt: event.closesAt.toDate(),
        images: event.images.map((img) => ({ src: img, type: "image/" })),
        sponsorImages: event.sponsorImages.map((img) => ({
          src: img,
          type: "image/",
        })),
        logoImage: [{ src: event.logoImage, type: "image/" }],
        perks: Object.entries(event.perks).map(([title, qty]) => {
          const split = qty.split("-");
          return {
            title,
            qty: split[1],
            qtyType: split[0],
          };
        }),
      });
      setMinDate(event.startsAt.toDate());
      setShowDeadline(event.endsAt.toDate() !== event.closesAt.toDate());
    }
  }, [event, fetchLoading]);

  const onSubmit = useCallback(
    (data) => {
      data.startsAt = data.startDate;
      data.endsAt = data.endDate;
      data.closesAt = data.closesAt;
      if (data.isPrivate === undefined) data.isPrivate = false;
      if (editMode) data.eventId = eventId;
      data.perks =
        data.perks
          ?.filter((item) => item.title?.length)
          .reduce(
            (acc, curr) => ({
              ...acc,
              [curr.title]: `${curr.qtyType}-${curr.qty}` || 1,
            }),
            {}
          ) || {};
      setProgress(0);
      Event[editMode ? "update" : "create"](data, setProgress)
        .then((eventId) => {
          message.success(
            `Event ${editMode ? "updated" : "created"} Successfully!`
          );
          if (editMode) {
            historyBackWFallback("/events/my_events");
          } else {
            form.resetFields();
            setTicketAnswer(false);
            history.push(`/events/${eventId}`);
          }
        })
        .catch(globalErrorHandler)
        .finally(setProgress);
    },
    [form]
  );

  const onValuesChange = useCallback(() => {
    if (form.getFieldValue("startDate")) {
      setMinDate(form.getFieldValue("startDate"));
    }
    setFormData(form.getFieldsValue());
  }, []);

  if (editMode && (!event || fetchLoading))
    return <PageSpinner spinnerProps={{ size: "default" }} fixed={false} />;

  return (
    <>
      <Title style={{ marginTop: 0, paddingTop: 0 }}>
        {editMode ? "Update" : "Create New"} Event
      </Title>
      <Form
        style={{ marginTop: 16 }}
        onFinish={onSubmit}
        onFinishFailed={console.log}
        onValuesChange={onValuesChange}
        form={form}
        layout="vertical"
        name="new-event-form"
      >
        <Form.Item
          name="title"
          label="Event Title"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter event's title" />
        </Form.Item>

        <Form.Item name="logoImage" label="Logo">
          <ImagePicker count={1} />
        </Form.Item>

        <Form.Item
          name="genre"
          label="Event Genre"
          rules={[{ required: true }]}
        >
          <Select
            allowClear
            showSearch
            style={{ width: 230, textTransform: "capitalize" }}
            placeholder="Select a genre"
          >
            {genres.map((genre) => (
              <Select.Option key={genre} value={genre}>
                {genre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="startDate"
          label="Start Date"
          initialValue=""
          rules={[{ required: true }]}
          style={{ width: 230 }}
        >
          <MuiDateTimePicker
            placeholder="Enter Start Date"
            onChange={setStartDate}
            minDateTime={Date.now()}
          />
        </Form.Item>

        {(startDate || editMode) && (
          <Form.Item
            name="endDate"
            label="End Date"
            initialValue=""
            rules={[{ required: true }]}
            style={{ width: 230 }}
          >
            <MuiDateTimePicker
              placeholder="Enter End Date"
              minDateTime={minDate.getTime() + 300000}
            />
          </Form.Item>
        )}

        <Form.Item
          name="location"
          label="Event Address"
          rules={[{ required: true }]}
          style={{ marginTop: 12 }}
        >
          <Input placeholder="Enter event's address" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Short Description"
          rules={[{ required: false }]}
          style={{ marginTop: 12 }}
        >
          <Input.TextArea
            autoSize={{ maxRows: 15, minRows: 5 }}
            className={styles.textarea}
            allowClear
            placeholder="Describe your event to your audience"
          />
        </Form.Item>

        <Divider />

        <Form.Item
          name="maxAttendees"
          label="Attendees Limit"
          dependencies={["ticketAnswer"]}
          rules={[
            ({ getFieldValue }) => ({
              required: ["internal", "external"].includes(
                getFieldValue("ticketAnswer")
              ),
            }),
            {
              min: event?.attendeesCount || 1,
              type: "number",
              message: `Should be atleast equal to ${
                event?.attendeesCount || 1
              }`,
            },
          ]}
        >
          <InputNumber
            style={{ width: 230 }}
            min={1}
            max={99999}
            placeholder="Enter Limit"
          />
        </Form.Item>

        <Form.Item name="ageLimit" label="Attendees Age Limit">
          <InputNumber
            style={{ width: 230 }}
            min={3}
            max={199}
            placeholder="Enter Age"
          />
        </Form.Item>

        <Form.Item
          name="closesAtSwitch"
          label="Registrations Deadline"
          dependencies={["endDate", "startDate"]}
        >
          <Switch
            checked={showDeadline}
            onChange={() => {
              setShowDeadline(!showDeadline);
            }}
          />
        </Form.Item>

        <Form.Item
          name="closesAt"
          dependencies={["endDate", "startDate"]}
          rules={[{ required: showDeadline }]}
          hidden={!showDeadline}
          style={{ width: 230 }}
        >
          <MuiDateTimePicker
            placeholder="Enter Registration Deadline"
            maxDateTime={form.getFieldValue("endDate")}
            minDateTime={Date.now()}
          />
        </Form.Item>

        <Form.Item
          rules={[{ required: true }]}
          initialValue={false}
          name="ticketAnswer"
          label="Ticketeting"
        >
          <Select
            disabled={editMode}
            onChange={setTicketAnswer}
            style={{ width: 230 }}
            defaultValue={false}
          >
            <Select.Option key="no-ticket" value={false}>
              No Tickets
            </Select.Option>
            <Select.Option key="internal" value={"internal"}>
              Autogenerate Tickets
            </Select.Option>
            <Select.Option key="external" value={"external"}>
              Upload Tickets File
            </Select.Option>
          </Select>
        </Form.Item>

        {ticketAnswer === "external" && (
          <Form.Item
            rules={[{ required: true, message: "File is required" }]}
            name="externalTicketsFile"
          >
            <FilePicker
              width={240}
              accept=".xlsx,.xls,.txt,.csv"
              multiple={false}
            />
          </Form.Item>
        )}

        {form.getFieldValue("ticketAnswer") && (
          <Form.List name="perks">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ field, name, fieldKey, ...rest }) => (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "65%",
                      marginBottom: 12,
                    }}
                  >
                    <Form.Item
                      {...rest}
                      name={[name, "title"]}
                      fieldKey={[fieldKey, "title"]}
                      noStyle
                    >
                      <Input placeholder="Enter Coupon Title" />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, "qty"]}
                      fieldKey={[fieldKey, "qty"]}
                      noStyle
                    >
                      <InputNumber
                        style={{ width: 140 }}
                        placeholder="Quantity"
                        min={1}
                      />
                    </Form.Item>
                    <Form.Item
                      {...rest}
                      name={[name, "qtyType"]}
                      fieldKey={[fieldKey, "qtyType"]}
                      noStyle
                      initialValue="p"
                    >
                      <Select defaultValue="p" style={{ minWidth: 108 }}>
                        <Select.Option value="p">Per Person</Select.Option>
                        <Select.Option value="e">Per Event</Select.Option>
                      </Select>
                    </Form.Item>
                    <Hover hoverStyle={{ color: "#333" }}>
                      <MinusCircleOutlined
                        style={{
                          marginLeft: 10,
                          fontSize: 20,
                          color: "#3337",
                          transition: "color 0.4s",
                        }}
                        onClick={() => remove(name)}
                      />
                    </Hover>
                  </div>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={add}
                    style={{ width: "calc(65% - 30px)" }}
                    icon={<PlusOutlined />}
                  >
                    Add Coupon
                    <Tooltip
                      title={
                        <span>
                          You can add coupons/perks such as drinks, snacks,
                          wrist bands etc. on top of tickets for event
                          attendees. <br />
                          Tickets validators will be able to scan QR code and
                          validate an attendee's coupon(s) using the mobile app.
                        </span>
                      }
                    >
                      <InfoCircleOutlined
                        style={{ float: "right", marginTop: 4 }}
                      />
                    </Tooltip>
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        )}

        <Divider />

        <Form.Item name="isPrivate" label="Private Event">
          <Switch defaultChecked={editMode ? event?.isPrivate : false} />
        </Form.Item>

        <Form.Item name="tags" label="Tags">
          <TagsList />
        </Form.Item>

        <Divider />

        <Form.Item name="images" label="Upload Images">
          <ImagePicker count={4} />
        </Form.Item>

        <Divider />

        {form.getFieldValue("ticketAnswer") && (
          <Form.Item name="sponsorImages" label="Sponsor Images">
            <ImagePicker count={4} />
          </Form.Item>
        )}

        <Form.Item>
          <Button
            disabled={progress !== undefined}
            type="primary"
            htmlType="submit"
          >
            Submit
          </Button>
          {progress !== undefined ? (
            <Progress
              style={{ marginLeft: 8, position: "relative", bottom: 2 }}
              type="circle"
              percent={Math.round(progress)}
              width={28}
              strokeColor={Theme.get()}
            />
          ) : null}
        </Form.Item>
      </Form>
      <EventPreviewCard />
    </>
  );
}

export default connect(
  ({ event }) => ({
    event: event.current,
    fetchLoading: event.loading.fetchCurrent,
  }),
  { fetchEvent, setFormData }
)(NewEvent);
