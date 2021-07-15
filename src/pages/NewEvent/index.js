import {
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Progress,
  Select,
  Switch,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { historyBackWFallback, range } from "../../utils";
import moment from "moment";
import TagsList from "../../components/TagsList";
import ImagePicker from "../../components/ImagePicker";
import Title from "antd/lib/typography/Title";
import styles from "./index.module.scss";
import FilePicker from "../../components/FilePicker";
import Theme from "../../utils/theme";
import Event from "../../services/event";
import { globalErrorHandler } from "../../utils/errorHandler";
import { useLocation, useParams } from "react-router";
import { connect } from "dva";
import { fetchEvent, setFormData } from "../../models/event";
import PageSpinner from "../../components/Spinner/PageSpinner";
import EventPreview from "../../components/EventPreview";

const genres = ["food and drink", "festival", "event"];

export const disabledDate = (d, minDate, maxDate) => {
  if (d == null) {
    return null;
  }

  return (
    (minDate != null && d.isBefore(minDate) && !d.isSame(minDate, "day")) ||
    (maxDate != null && d.isAfter(maxDate) && !d.isSame(maxDate, "day"))
  );
};

export const disabledTime = (d, minDate, maxDate) => {
  let hours = [],
    mins = [];
  if (d == null) {
    return null;
  }

  if (minDate && d.isSame(minDate, "day")) {
    hours = [
      minDate.hour() > 0
        ? { start: 0, end: minDate.hour() - 1 }
        : { start: 0, end: -1 },
    ];
    mins = [
      (hour) =>
        hour === minDate.hour() && minDate.minutes() > 0
          ? { start: 0, end: minDate.minutes() - 1 }
          : { start: 0, end: -1 },
    ];
  }

  if (maxDate && d.isSame(maxDate, "day")) {
    hours.push({ start: maxDate.hour() + 1, end: 24 });
    mins.push((hour) =>
      hour === maxDate.hour()
        ? { start: maxDate.minutes() + 1, end: 60 }
        : { start: 0, end: -1 }
    );
  }

  return {
    disabledHours: () => {
      return hours.reduce(
        (acc, curr) => acc.concat(range(curr.start, curr.end)),
        []
      );
    },
    disabledMinutes: (hours) =>
      mins.reduce((acc, curr) => {
        const min = curr(hours);
        return acc.concat(range(min.start, min.end));
      }, []),
  };
};

function NewEvent({ event, fetchEvent, fetchLoading, setFormData }) {
  const eventId = useParams().eventId;
  const pathname = useLocation().pathname;
  const editMode = pathname.slice(pathname.lastIndexOf("/") + 1) === "edit";

  useEffect(() => {
    if (editMode && event?.id !== eventId) fetchEvent(eventId);
  }, []);

  const [form] = Form.useForm();
  const [ticketAnswer, setTicketAnswer] = useState(false);
  const [progress, setProgress] = useState();

  useEffect(() => {
    if (editMode && event) {
      form.setFieldsValue({
        ...event,
        schedule: [
          moment(event.startsAt.toDate()),
          moment(event.endsAt.toDate()),
        ],
        closesAt: moment(event.closesAt.toDate()),
        images: event.images.map((img) => ({ src: img, type: "image/" })),
      });
    }
  }, [event]);

  const onSubmit = useCallback(
    (data) => {
      data.startsAt = data.schedule[0].toDate();
      data.endsAt = data.schedule[1].toDate();
      data.closesAt = data.closesAt.toDate();
      if (editMode) data.eventId = eventId;
      setProgress(0);
      Event[editMode ? "update" : "create"](data, setProgress)
        .then(() => {
          console.log(data);
          message.success(
            `Event ${editMode ? "updated" : "created"} Successfully!`
          );
          if (editMode) {
            historyBackWFallback("/events/my_events");
          } else {
            form.resetFields();
            setTicketAnswer(false);
          }
        })
        .catch(globalErrorHandler)
        .finally(setProgress);
    },
    [form]
  );

  const onValuesChange = useCallback(() => {
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
        name="new-event-form"
      >
        <Form.Item
          name="title"
          label="Event Title"
          rules={[{ required: true }]}
        >
          <Input placeholder="Enter event's title" />
        </Form.Item>
        <Form.Item
          name="genre"
          label="Event Genre"
          rules={[{ required: true }]}
        >
          <Select
            allowClear
            showSearch
            style={{ width: 200, textTransform: "capitalize" }}
            placeholder="Select a genre"
            optionFilterProp="value"
            filterOption={(input, option) =>
              option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {genres.map((genre) => (
              <Select.Option
                style={{ textTransform: "capitalize" }}
                key={genre}
                value={genre}
              >
                {genre}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="schedule"
          label="Event Schedule"
          rules={[{ required: true }]}
        >
          <DatePicker.RangePicker
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            disabledDate={(current) =>
              current && current < moment().startOf("day")
            }
            disabledTime={(current) =>
              disabledTime(current, moment().add(1, "minutes"))
            }
          />
        </Form.Item>
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
          rules={[
            { required: true },
            {
              min: event?.attendeesCount || 1,
              type: "number",
              message: `Should be atleast equal to ${
                event?.attendeesCount || 1
              }`,
            },
          ]}
        >
          <InputNumber min={1} max={99999} placeholder="Enter Limit" />
        </Form.Item>
        <Form.Item name="ageLimit" label="Attendees Age Limit">
          <InputNumber min={3} max={199} placeholder="Enter Age" />
        </Form.Item>
        <Form.Item
          name="closesAt"
          label="Registrations Deadline"
          dependencies={["schedule"]}
          rules={[{ required: true }]}
        >
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            disabledDate={(current) => {
              if (current) {
                const end = form.getFieldValue("schedule")?.[1];
                return disabledDate(current, moment(), end);
              }
            }}
            disabledTime={(current) => {
              if (current) {
                const end = form.getFieldValue("schedule")?.[1];
                return disabledTime(current, moment(), end);
              }
            }}
            showTime={{ format: "HH:mm" }}
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
            style={{ width: 200 }}
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
              accept=".xlsx,.xls,.txt,.csv"
              width={240}
              multiple={false}
            />
          </Form.Item>
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
      <EventPreview />
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
