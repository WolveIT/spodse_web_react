import React, { useCallback, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "dva";
import { useHistory, useParams } from "react-router-dom";
import { useQuery } from "../../hooks/useQuery";
import EventActions from "../MyEvents/Actions";
import PageSpinner from "../../components/Spinner/PageSpinner";
import {
  addValidators,
  fetchGoing,
  fetchInvited,
  fetchValidators,
  inviteUsers,
  listenEvent,
  unsubEvent,
} from "../../models/event";
import Center from "../../components/Center";
import {
  Card,
  Collapse,
  Descriptions,
  Divider,
  Empty,
  Input,
  List,
  Popover,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import moment from "moment";
import ReadMore from "react-read-more-read-less";
import Theme from "../../utils/theme";
import PrivateTag from "../MyEvents/PrivateTag";
import OutOf from "../../components/OutOf";
import TagsList from "../../components/TagsList";
import ImagePicker from "../../components/ImagePicker";
import LazyList from "../../components/LazyList";
import { capitalize, placeholderAvatar } from "../../utils";
import ServerImg from "../../components/ServerImg";
import UserSearch from "./userSearch";
import {
  DeleteOutlined,
  InfoCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Event from "../../services/event";
import AlertPopup from "../../components/AlertPopup";
import CustomIcon from "../../components/Icon";

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

function InvitationMessageBox({ value, onChange }) {
  return (
    <Collapse
      style={{ marginLeft: -16, marginRight: -16, marginBottom: -12 }}
      expandIcon={({ isActive }) => (
        <RightOutlined
          style={{ fontSize: 9, color: Theme.get() }}
          rotate={isActive ? 90 : 0}
        />
      )}
      collapsible="header"
      ghost
    >
      <Collapse.Panel
        header={
          <span
            style={{
              fontSize: 12,
              position: "relative",
              left: -6,
              top: -1,
              color: Theme.get(),
            }}
          >
            Customize Invitation Message
          </span>
        }
        key="1"
      >
        <div style={{ position: "relative" }}>
          <Input.TextArea
            value={value}
            onChange={onChange}
            placeholder="Type your invitation message here"
            style={{ marginTop: -8, resize: "none" }}
            autoSize={{ minRows: 4, maxRows: 4 }}
          />
          <div style={{ position: "absolute", top: -6, right: 6 }}>
            <Tooltip
              title={
                <div>
                  {`Use double curly braces`}{" "}
                  <span style={{ color: "#00FFFF" }}> {`{{}}`} </span>{" "}
                  {`to embed dynamic data in your message. You can also use basic HTML tags like`}{" "}
                  <strong>{`<strong>,<em>,<a>`}</strong>{" "}
                  {`etc. to customize markup of your message.`}
                  <br />
                  <br />
                  Supported Parameters:
                  <br />
                  <span
                    style={{ color: "#00FFFF" }}
                  >{`{{inviteeDetails.displayName}}`}</span>{" "}
                  - Will be replaced by name of each invitee
                  <br />
                  <br />
                  <span
                    style={{ color: "#00FFFF" }}
                  >{`{{inviteeDetails.email}}`}</span>{" "}
                  - Will be replaced by email of each invitee
                  <br />
                  <br />
                  <span
                    style={{ color: "#00FFFF" }}
                  >{`{{inviteeDetails.profilePicture}}`}</span>{" "}
                  - Will be replaced by profile picture's url of each invitee
                  <br />
                  <br />
                </div>
              }
            >
              <InfoCircleOutlined
                style={{ fontSize: 15, color: Theme.get() }}
              />
            </Tooltip>
          </div>
        </div>
      </Collapse.Panel>
    </Collapse>
  );
}

function InviteUserSearch() {
  const dispatch = useDispatch();

  const { loading, eventId, exclusions, inviterName, eventTitle } = useSelector(
    ({ event, user }) => ({
      loading: event.loading.inviteUsers,
      eventId: event.current?.id,
      exclusions: [
        ...new Set([
          ...event.invitedList.map((e) => e.inviteeDetails?.email),
          ...event.goingList.map((e) => e.email),
        ]),
      ],
      eventTitle: event.current?.title,
      inviterName: user.current?.displayName || "",
    })
  );

  const [msg, setMsg] = useState(
    `Hi {{inviteeDetails.displayName}}!\nYou've been invited by ${inviterName} to join their event <strong>${eventTitle}</strong>. Click the button below to join the event.`
  );

  const onMessageChange = useCallback(({ target }) => {
    setMsg(target.value);
  }, []);

  const onSubmit = useCallback(
    (emails, successCallback) => {
      dispatch(
        inviteUsers(eventId, emails, msg, () => {
          successCallback && successCallback();
          dispatch(fetchInvited(eventId, true));
        })
      );
    },
    [msg]
  );

  return (
    <>
      <UserSearch
        loading={loading}
        exclusions={exclusions}
        onSubmit={onSubmit}
        submitText="Invite"
        dataKey="email"
      />
      <InvitationMessageBox value={msg} onChange={onMessageChange} />
    </>
  );
}

function ValidatorsUserSearch() {
  const dispatch = useDispatch();
  const { loading, eventId, exclusions } = useSelector(({ event }) => ({
    loading: event.loading.addValidators,
    eventId: event.current?.id,
    exclusions: event.validatorsList.map((e) => e.userDetails?.uid),
  }));

  const onSubmit = useCallback((uids, successCallback) => {
    dispatch(
      addValidators(eventId, uids, () => {
        successCallback && successCallback();
        dispatch(fetchValidators(eventId, true));
      })
    );
  }, []);

  return (
    <UserSearch
      maxLength={249}
      loading={loading}
      exclusions={exclusions}
      onSubmit={onSubmit}
      submitText="Add"
      dataKey="uid"
    />
  );
}

function FieldValue({ field, value }) {
  if (!value) return null;
  return (
    <p style={{ color: "#5d5d5d", fontSize: 12, display: "flex" }}>
      <span style={{ display: "inline-block", fontWeight: "500", width: 90 }}>
        {field}
      </span>
      <span>{value}</span>
    </p>
  );
}

function UserCard({
  profilePicture,
  displayName,
  date,
  status,
  onDelete,
  onSuccessDelete,
  ticketInfo,
}) {
  const onClick = useCallback(() => {
    AlertPopup({
      title: "Delete User",
      message: "Are you sure you want to delete this user?",
      okText: "delete",
      okButtonProps: { danger: true },
      onOk: () => {
        return Promise.resolve(onDelete?.method(...onDelete.args)).then(
          onSuccessDelete
        );
      },
    });
  }, []);

  const actions = [];
  if (ticketInfo)
    actions.push(
      <Tooltip title="Ticket Info">
        <Popover
          trigger="click"
          content={
            <div>
              <FieldValue field="Ticket No." value={ticketInfo.id} />
              <FieldValue
                field="Ticket Status"
                value={capitalize(ticketInfo.status?.value || "N/A")}
              />
              <FieldValue
                field="Used On"
                value={
                  ticketInfo.status?.value === "consumed" &&
                  moment(ticketInfo.status.timestamp?.toDate()).format(
                    "D MMM YY - h:m a"
                  )
                }
              />
              <FieldValue
                field="Validated By"
                value={ticketInfo.validatorDetails?.displayName}
              />
            </div>
          }
          title="Ticket Info"
        >
          <CustomIcon
            style={{
              fontSize: 15,
              color: ticketInfo.status?.value === "consumed" && "#42ba96",
            }}
            type="icon-ticket"
          />
        </Popover>
      </Tooltip>
    );
  if (onDelete?.method)
    actions.push(
      <Tooltip title="Delete">
        <DeleteOutlined onClick={onClick} />
      </Tooltip>
    );

  return (
    <List.Item actions={actions}>
      <List.Item.Meta
        avatar={
          <ServerImg
            src={profilePicture}
            style={{ borderRadius: "50%", width: 40, height: 40 }}
            loader={{ shape: "circle", type: "skeleton" }}
            fallback={placeholderAvatar}
          />
        }
        title={displayName}
        description={moment(date).format("D MMM YY - h:m a")}
      />
      {status && (
        <span
          style={{
            fontWeight: 500,
            marginRight: 24,
            fontSize: 13,
            color: status === "accepted" ? "#42ba96" : "#F29339",
          }}
        >
          {status === "accepted" ? "Accepted" : "Pending"}
        </span>
      )}
    </List.Item>
  );
}

function EventDetail({
  event,
  listenEvent,
  unsubEvent,
  going,
  goingLoading,
  invited,
  invitedLoading,
  validators,
  validatorsLoading,
  fetchGoing,
  fetchInvited,
  fetchValidators,
  tickets,
}) {
  const { eventId } = useParams();
  const peopleTab = useQuery().get("peopleTab") || "1";
  const history = useHistory();

  const loadGoing = useCallback(
    (reset) => {
      fetchGoing(eventId, reset);
    },
    [eventId]
  );

  const loadInvited = useCallback(
    (reset) => {
      fetchInvited(eventId, reset);
    },
    [eventId]
  );

  const loadValidators = useCallback(
    (reset) => {
      fetchValidators(eventId, reset);
    },
    [eventId]
  );

  const loaders = {
    1: loadGoing,
    2: loadInvited,
    3: loadValidators,
  };

  //add listener to the current event
  useEffect(() => {
    listenEvent(eventId);
    loaders[peopleTab] && loaders[peopleTab](true);
    return () => {
      unsubEvent();
    };
  }, [peopleTab]);

  if (event === undefined)
    return <PageSpinner spinnerProps={{ size: "default" }} fixed={false} />;

  if (!event)
    return (
      <Center>
        <Empty description="Event Not Found!" />
      </Center>
    );

  event.closesAt = moment(event.closesAt.toDate());
  const now = moment();
  const regClosed = event.closesAt.isBefore(now);
  const occupied = event.attendeesCount >= event.maxAttendees;
  const allowNewInvites = !(regClosed || occupied);
  const isEnded = moment(event.endsAt?.toDate()).isBefore(now);
  const hasTickets = ["internal", "external"].includes(event.ticketAnswer);

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
        <Label style={{ marginBottom: 4, display: "inline-block" }}>
          People
        </Label>
        <Tabs
          activeKey={peopleTab}
          onChange={(key) => {
            history.push({
              search: "?" + new URLSearchParams({ peopleTab: key }),
            });
          }}
        >
          <Tabs.TabPane tab={`Going (${event.attendeesCount})`} key="1">
            <LazyList
              listHeight={375}
              onEndReached={loadGoing}
              loading={goingLoading}
              dataSource={going}
              renderItem={(item) => (
                <UserCard
                  key={item.key}
                  profilePicture={item.profilePicture}
                  displayName={item.displayName}
                  date={item.createdAt}
                  onDelete={{
                    method: Event.remove_user,
                    args: [{ uid: item.id, eventId }],
                  }}
                  onSuccessDelete={() => loadGoing(true)}
                  ticketInfo={(() => {
                    const key = Object.keys(tickets).find(
                      (e) => tickets[e]?.uid === item.id
                    );
                    return key ? { id: key, ...tickets[key] } : undefined;
                  })()}
                />
              )}
            />
          </Tabs.TabPane>
          <Tabs.TabPane
            tab={
              `Invited` +
              (typeof event.stats?.totalInvited === "number"
                ? ` (${event.stats?.totalInvited})`
                : "")
            }
            key="2"
          >
            {allowNewInvites ? (
              <>
                <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 500 }}>
                  Invite users
                </div>
                <InviteUserSearch />
                <Divider style={{ marginBottom: 8 }} />
              </>
            ) : null}
            <LazyList
              listHeight={375}
              onEndReached={loadInvited}
              loading={invitedLoading}
              dataSource={invited}
              renderItem={(item) => (
                <UserCard
                  key={item.key}
                  date={item.createdAt}
                  status={item.status?.value}
                  profilePicture={item.inviteeDetails?.profilePicture}
                  displayName={
                    item.inviteeDetails?.displayName ||
                    item.inviteeDetails?.email
                  }
                  onDelete={
                    item.status?.value === "pending" && {
                      method: Event.remove_invited,
                      args: [{ invitationId: item.id, eventId }],
                    }
                  }
                  onSuccessDelete={() => loadInvited(true)}
                />
              )}
            />
          </Tabs.TabPane>
          {hasTickets && (
            <Tabs.TabPane
              tab={
                `Validators` +
                (typeof event.stats?.totalValidators === "number"
                  ? ` (${event.stats?.totalValidators})`
                  : "")
              }
              key="3"
            >
              {isEnded ? null : (
                <>
                  <div
                    style={{ fontSize: 12, marginBottom: 6, fontWeight: 500 }}
                  >
                    Add Ticket Validators
                  </div>
                  <ValidatorsUserSearch />
                  <Divider style={{ marginBottom: 8 }} />
                </>
              )}
              <LazyList
                listHeight={375}
                onEndReached={loadValidators}
                loading={validatorsLoading}
                dataSource={validators}
                renderItem={(item) => (
                  <UserCard
                    key={item.key}
                    profilePicture={item.userDetails?.profilePicture}
                    displayName={item.userDetails?.displayName}
                    date={item.createdAt}
                    onDelete={
                      item.userDetails?.uid !==
                        (event.organizerId || event.organizer) && {
                        method: Event.remove_validator,
                        args: [{ uid: item.userDetails?.uid, eventId }],
                      }
                    }
                    onSuccessDelete={() => loadValidators(true)}
                  />
                )}
              />
            </Tabs.TabPane>
          )}
          <Tabs.TabPane
            tab={
              `Likes` +
              (event.likes ? ` (${Object.keys(event.likes).length})` : "")
            }
            key="4"
          >
            <LazyList
              listHeight={375}
              dataSource={Object.entries(event.likes || {})
                .map(([key, val]) => ({ key, id: key, ...(val || {}) }))
                .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)}
              renderItem={(item) => (
                <UserCard
                  key={item.key}
                  profilePicture={item.profilePicture}
                  displayName={item.displayName}
                  date={item.timestamp?.toDate()}
                />
              )}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Card>
  );
}

export default connect(
  ({ event }) => ({
    event: event.current,
    going: event.goingList,
    invited: event.invitedList,
    validators: event.validatorsList,
    goingLoading: event.loading.goingList,
    invitedLoading: event.loading.invitedList,
    validatorsLoading: event.loading.validatorsList,
    tickets: event.tickets?.tickets || {},
  }),
  {
    listenEvent,
    unsubEvent,
    fetchGoing,
    fetchInvited,
    fetchValidators,
  }
)(EventDetail);
