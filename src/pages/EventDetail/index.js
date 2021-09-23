import React, { useEffect } from "react";
import { connect } from "dva";
import { useParams } from "react-router-dom";
import EventActions from "../MyEvents/Actions";
import PageSpinner from "../../components/Spinner/PageSpinner";
import { listenEvent, unsubEvent } from "../../models/event";
import Center from "../../components/Center";
import {
  Card,
  Collapse,
  Descriptions,
  Divider,
  Empty,
  Tag,
  Typography,
} from "antd";
import moment from "moment";
import ReadMore from "react-read-more-read-less";
import Theme from "../../utils/theme";
import PrivateTag from "../MyEvents/PrivateTag";
import OutOf from "../../components/OutOf";
import TagsList from "../../components/TagsList";
import ImagePicker from "../../components/ImagePicker";
import PeopleTabs from "./peopleTabs";
import { transformDates } from "../../utils";
import { colors } from "../Dashboard";
import styles from "./index.module.scss";
import LazyList from "../../components/LazyList";

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

function PerksSection({ event, listHeight }) {
  const perks = Object.entries(event.perks || {});

  return (
    <div className={styles.perks_section}>
      <LazyList
        listHeight={listHeight}
        dataSource={perks.sort((a, b) => a[0].localeCompare(b[0]))}
        renderItem={([title, max]) => {
          const [qtyType, qty] = max.split("-");
          return (
            <div className={styles.perk_item}>
              <div>
                <span>{title}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(0, 0, 0, 0.60)",
                    display: "inline-block",
                    marginLeft: 4,
                  }}
                >
                  (Max: {qty} {qtyType === "p" ? "Per Person" : "Per Event"})
                </span>
              </div>
              <span>{event.stats?.totalPerksAvailed?.[title] || 0}</span>
            </div>
          );
        }}
      />
    </div>
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

  transformDates(event);
  const now = moment();
  const regClosed = event.closesAt.isBefore(now);

  return (
    <Card
      style={{ marginBottom: 40 }}
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
          <Label style={{ marginBottom: 6, display: "inline-block" }}>
            Images:
          </Label>
          <ImagePicker
            width={180}
            height={140}
            value={event.images.map((img) => ({ src: img, type: "image/" }))}
            editable={false}
            count={event.images.length}
          />
        </div>
      ) : null}

      <Divider />

      <div>
        <Collapse style={{ width: 500 }} ghost>
          <Collapse.Panel header={<Label>Coupons Consumed</Label>}>
            <PerksSection event={event} listHeight={180} />
          </Collapse.Panel>
        </Collapse>
      </div>

      <Divider />

      <div>
        <Label style={{ marginBottom: 4, display: "inline-block" }}>
          People
        </Label>
        <PeopleTabs event={event} listHeight={375} />
      </div>
    </Card>
  );
}

export default connect(
  ({ event }) => ({
    event: event.current,
  }),
  {
    listenEvent,
    unsubEvent,
  }
)(EventDetail);
