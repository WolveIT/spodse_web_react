import React, { useCallback, useEffect, useState } from "react";
import {
  Popover,
  Tabs,
  Tooltip,
  List,
  Divider,
  Collapse,
  Input,
  Empty,
} from "antd";
import LazyList from "../../components/LazyList";
import AlertPopup from "../../components/AlertPopup";
import { capitalize, placeholderAvatar, transformDates } from "../../utils";
import moment from "moment";
import CustomIcon from "../../components/Icon";
import {
  DeleteOutlined,
  InfoCircleOutlined,
  PieChartOutlined,
  RightOutlined,
} from "@ant-design/icons";
import ServerImg from "../../components/ServerImg";
import Theme from "../../utils/theme";
import { useDispatch, useSelector } from "dva";
import {
  addValidators,
  fetchGoing,
  fetchInvited,
  fetchValidators,
  inviteUsers,
} from "../../models/event";
import UserSearch from "./userSearch";
import { useQuery } from "../../hooks/useQuery";
import Event from "../../services/event";

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

function InviteUserSearch({ event }) {
  const dispatch = useDispatch();

  const { loading, exclusions, inviterName } = useSelector(
    ({ event, user }) => ({
      loading: event.loading.inviteUsers,
      exclusions: [
        ...new Set([
          ...event.invitedList.map((e) => e.inviteeDetails?.email),
          ...event.goingList.map((e) => e.email),
        ]),
      ],
      inviterName: user.current?.displayName || "",
    })
  );

  const [msg, setMsg] = useState(
    `Hi {{inviteeDetails.displayName}}!\nYou've been invited by ${inviterName} to join their event <strong>${event.title}</strong>. Click the button below to join the event.`
  );

  const onMessageChange = useCallback(({ target }) => {
    setMsg(target.value);
  }, []);

  const onSubmit = useCallback(
    (emails, successCallback) => {
      dispatch(
        inviteUsers(event.id, emails, msg, () => {
          successCallback && successCallback();
          dispatch(fetchInvited(event.id, true));
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

function ValidatorsUserSearch({ event }) {
  const dispatch = useDispatch();
  const { loading, exclusions } = useSelector(({ event }) => ({
    loading: event.loading.addValidators,
    exclusions: event.validatorsList.map((e) => e.userDetails?.uid),
  }));

  const onSubmit = useCallback(
    (uids, successCallback) => {
      dispatch(
        addValidators(event.id, uids, () => {
          successCallback && successCallback();
          dispatch(fetchValidators(event.id, true));
        })
      );
    },
    [event.id]
  );

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

export function UserCard({
  profilePicture,
  displayName,
  date,
  status,
  onDelete,
  onSuccessDelete,
  ticketInfo,
  validationStats,
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
  if (validationStats)
    actions.push(
      <Tooltip title="Stats">
        <Popover
          trigger="click"
          content={
            <div>
              <FieldValue
                field="Tickets"
                value={validationStats.totalTicketsValidated || 0 + ""}
                key="tickets"
              />
              {Object.entries(validationStats.perksValidated || {}).map(
                ([perk, val]) => (
                  <FieldValue key={perk} field={perk} value={val + ""} />
                )
              )}
            </div>
          }
          title="Validation Stats"
        >
          <PieChartOutlined />
        </Popover>
      </Tooltip>
    );
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
  if (status)
    actions.push(
      <span
        style={{
          display: "inline-block",
          fontWeight: 500,
          fontSize: 13,
          color: status === "accepted" ? "#42ba96" : "#F29339",
          marginRight: status === "accepted" && 24,
        }}
      >
        {status === "accepted" ? "Accepted" : "Pending"}
      </span>
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
      {false && status && (
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

export default function PeopleTabs({ event, listHeight = 375 }) {
  const [query, updateQuery] = useQuery();
  const peopleTab = query.get("peopleTab") || "1";
  const dispatch = useDispatch();
  const {
    going,
    invited,
    validators,
    goingLoading,
    invitedLoading,
    validatorsLoading,
    tickets,
  } = useSelector(({ event }) => ({
    going: event.goingList,
    invited: event.invitedList,
    validators: event.validatorsList,
    goingLoading: event.loading.goingList,
    invitedLoading: event.loading.invitedList,
    validatorsLoading: event.loading.validatorsList,
    tickets: event.tickets?.tickets || {},
  }));

  const loadGoing = useCallback(
    (reset) => {
      dispatch(fetchGoing(event.id, reset));
    },
    [event.id]
  );

  const loadInvited = useCallback(
    (reset) => {
      dispatch(fetchInvited(event.id, reset));
    },
    [event.id]
  );

  const loadValidators = useCallback(
    (reset) => {
      dispatch(fetchValidators(event.id, reset));
    },
    [event.id]
  );

  const loaders = {
    1: loadGoing,
    2: loadInvited,
    3: loadValidators,
  };

  useEffect(() => {
    loaders[peopleTab] && loaders[peopleTab](true);
  }, [peopleTab]);

  transformDates(event);
  const now = moment();
  const regClosed = event.closesAt.isBefore(now);
  const occupied = event.attendeesCount >= event.maxAttendees;
  const allowNewInvites = !(regClosed || occupied);
  const isEnded = event.endsAt?.isBefore(now);
  const hasTickets = ["internal", "external"].includes(event.ticketAnswer);

  return (
    <Tabs
      activeKey={peopleTab}
      onChange={(key) => {
        updateQuery({ peopleTab: key });
      }}
    >
      <Tabs.TabPane tab={`Going (${event.attendeesCount})`} key="1">
        <LazyList
          listHeight={listHeight}
          onEndReached={loadGoing}
          loading={goingLoading}
          dataSource={going}
          emptyContent={<Empty />}
          renderItem={(item) => (
            <UserCard
              key={item.key}
              profilePicture={item.profilePicture}
              displayName={item.displayName}
              date={item.createdAt}
              onDelete={{
                method: Event.remove_user,
                args: [{ uid: item.id, eventId: event.id }],
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
            <InviteUserSearch event={event} />
            <Divider style={{ marginBottom: 8 }} />
          </>
        ) : null}
        <LazyList
          listHeight={listHeight}
          onEndReached={loadInvited}
          loading={invitedLoading}
          dataSource={invited}
          emptyContent={<Empty />}
          renderItem={(item) => (
            <UserCard
              key={item.key}
              date={item.createdAt}
              status={item.status?.value}
              profilePicture={item.inviteeDetails?.profilePicture}
              displayName={
                item.inviteeDetails?.displayName || item.inviteeDetails?.email
              }
              onDelete={
                item.status?.value === "pending" && {
                  method: Event.remove_invited,
                  args: [{ invitationId: item.id, eventId: event.id }],
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
              <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 500 }}>
                Add Ticket Validators
              </div>
              <ValidatorsUserSearch event={event} />
              <Divider style={{ marginBottom: 8 }} />
            </>
          )}
          <LazyList
            listHeight={listHeight}
            onEndReached={loadValidators}
            loading={validatorsLoading}
            dataSource={validators}
            emptyContent={<Empty />}
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
                    args: [{ uid: item.userDetails?.uid, eventId: event.id }],
                  }
                }
                validationStats={item.stats}
                onSuccessDelete={() => loadValidators(true)}
              />
            )}
          />
        </Tabs.TabPane>
      )}
      <Tabs.TabPane
        tab={
          `Likes` + (event.likes ? ` (${Object.keys(event.likes).length})` : "")
        }
        key="4"
      >
        <LazyList
          listHeight={listHeight}
          dataSource={Object.entries(event.likes || {})
            .map(([key, val]) => ({ key, id: key, ...(val || {}) }))
            .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)}
          emptyContent={<Empty />}
          renderItem={(item) => (
            <UserCard
              key={item.key}
              profilePicture={item.profilePicture}
              displayName={item.displayName || "N/A"}
              date={item.timestamp?.toDate()}
            />
          )}
        />
      </Tabs.TabPane>
    </Tabs>
  );
}
