import React, { useEffect } from "react";
import { connect } from "dva";
import { useParams } from "react-router";
import EventActions from "../MyEvents/Actions";
import PageSpinner from "../../components/Spinner/PageSpinner";
import { listenEvent, unsubEvent } from "../../models/event";
import Center from "../../components/Center";
import { Card, Descriptions, Divider, Empty, Tag, Typography } from "antd";
import moment from "moment";
import ReadMore from "react-read-more-read-less";
import Theme from "../../utils/theme";
import PrivateTag from "../MyEvents/PrivateTag";
import OutOf from "../../components/OutOf";
import TagsList from "../../components/TagsList";
import ImagePicker from "../../components/ImagePicker";

function Schedule({ event }) {
  const startsAt = moment(event.startsAt.toDate());
  const endsAt = moment(event.endsAt.toDate());
  return (
    <Descriptions.Item>
      {startsAt.format("D MMM YY")} {startsAt.format("HH:mm")} -{" "}
      {endsAt.format("D MMM YY")} {endsAt.format("HH:mm")}
    </Descriptions.Item>
  );
}

function Label({ children, style }) {
  return (
    <span style={{ fontWeight: 500, color: "#333", ...(style || {}) }}>
      {children}
    </span>
  );
}

function EventDetail({ event, listenEvent, unsubEvent }) {
  const { eventId } = useParams();

  //add listener to the current event
  useEffect(() => {
    listenEvent(eventId);
    return () => {
      unsubEvent();
    };
  }, []);

  if (event === undefined)
    return <PageSpinner spinnerProps={{ size: "default" }} fixed={false} />;

  if (!event)
    return (
      <Center>
        <Empty description="Event Not Found!" />
      </Center>
    );

  event.closesAt = moment(event.closesAt.toDate());
  const regClosed = event.closesAt.isBefore(moment());

  return (
    <Card
      title={
        <Typography.Title style={{ fontSize: 20, marginBottom: 0 }}>
          {event.title}
        </Typography.Title>
      }
      extra={<EventActions showView={false} event={event} />}
    >
      <Descriptions>
        <Descriptions.Item label={<Label>Event Id</Label>}>
          {event.id}
        </Descriptions.Item>
        <Descriptions.Item label={<Label>Schedule</Label>}>
          <Schedule event={event} />
        </Descriptions.Item>
      </Descriptions>
      <Descriptions>
        <Descriptions.Item
          style={{ textTransform: "capitalize" }}
          label={<Label>Genre</Label>}
        >
          {event.genre}
        </Descriptions.Item>
        <Descriptions.Item label={<Label>Address</Label>}>
          {event.location}
        </Descriptions.Item>
      </Descriptions>
      {event.description ? (
        <div style={{ whiteSpace: "pre-wrap", paddingBottom: 16 }}>
          <Label style={{ marginBottom: 4, display: "block" }}>
            Description:
          </Label>
          <ReadMore
            charLimit={300}
            readMoreText={"Read more"}
            readLessText={"Read less"}
            readMoreStyle={{
              color: Theme.get(),
              fontWeight: 500,
              cursor: "pointer",
            }}
            readLessStyle={{
              color: Theme.get(),
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {event.description}
          </ReadMore>
        </div>
      ) : null}

      <Divider />

      <Descriptions>
        <Descriptions.Item label={<Label>People Going</Label>}>
          <OutOf count={event.attendeesCount} total={event.maxAttendees} />
        </Descriptions.Item>
        <Descriptions.Item label={<Label>Registrations Deadline</Label>}>
          {event.closesAt.format("D MMM YY")} {event.closesAt.format("HH:mm")}
          <Tag
            style={{ marginLeft: 6 }}
            color={regClosed ? "error" : "processing"}
          >
            {regClosed ? "closed" : "open"}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
      <Descriptions>
        <Descriptions.Item label={<Label>Public/Private</Label>}>
          <PrivateTag isPrivate={event.isPrivate} />
        </Descriptions.Item>
        {event.ageLimit ? (
          <Descriptions.Item label={<Label>Age Limit</Label>}>
            {event.ageLimit}
          </Descriptions.Item>
        ) : null}
      </Descriptions>

      <Divider />

      <Descriptions>
        <Descriptions.Item label={<Label>Tags</Label>}>
          {event.tags?.length ? (
            <TagsList editable={false} value={[...event.tags]} />
          ) : (
            "No Tags"
          )}
        </Descriptions.Item>
      </Descriptions>

      {event.images?.length ? (
        <div>
          <Label style={{ marginBottom: 4, display: "inline-block" }}>
            Images:
          </Label>
          <ImagePicker
            value={event.images.map((img) => ({ src: img, type: "image/" }))}
            editable={false}
            count={event.images.length}
          />
        </div>
      ) : null}
    </Card>
  );
}

export default connect(
  ({ event }) => ({
    event: event.current,
  }),
  { listenEvent, unsubEvent }
)(EventDetail);
