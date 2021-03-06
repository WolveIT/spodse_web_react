import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Popover,
  Tabs,
  Tooltip,
  List,
  Divider,
  Collapse,
  Input,
  Empty,
  Modal,
  Form,
  InputNumber,
  message,
  Spin,
  Button,
} from "antd";
import LazyList from "../../components/LazyList";
import AlertPopup from "../../components/AlertPopup";
import { capitalize, placeholderAvatar, transformDates } from "../../utils";
import moment from "moment";
import CustomIcon from "../../components/Icon";
import {
  CopyOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PieChartOutlined,
  RightOutlined,
  ReloadOutlined,
  CheckCircleFilled,
  SendOutlined,
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
  resendInviteAll,
} from "../../models/event";
import UserSearch from "./userSearch";
import { useQuery } from "../../hooks/useQuery";
import Event from "../../services/event";
import TabSearch from "./tabSearch";
import PerksInfo from "./perksInfo";
import { globalErrorHandler } from "../../utils/errorHandler";
import SendTicket from "./sendTicket";

let __invitationMsg__ = "";
function getInvitationMsg() {
  return __invitationMsg__;
}

export function FieldValue({ field, value }) {
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

function InvitationMessageBox({ value, onChange, event }) {
  const loading = useSelector((state) => state.event.loading.resendInviteAll);
  const dispatch = useDispatch();

  return (
    <Collapse
      style={{ marginLeft: -16, marginRight: -16, marginBottom: -16 }}
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
          <div style={{ position: "relative", left: -6, top: -1 }}>
            <span style={{ fontSize: 12, color: Theme.get() }}>
              Customize Invitation Message
            </span>
            <Button
              onClick={(e) => {
                dispatch(
                  resendInviteAll({ message: value, eventId: event.id })
                );
                e.stopPropagation();
              }}
              loading={loading}
              style={{ padding: 0, position: "absolute", right: -6 }}
              type="link"
            >
              Resend All Pending
            </Button>
          </div>
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
    `Hi {{inviteeDetails.displayName}}.\nYou have been invited to join <strong>${event.title}</strong>.\nYou should have a mobile device to accept this invitation.\nClick here on your mobile phone to join event.`
  );

  useEffect(() => {
    __invitationMsg__ = msg;
  }, [msg]);

  const [modal, setModal] = useState(false);
  const [form] = Form.useForm();

  const onMessageChange = useCallback(({ target }) => {
    setMsg(target.value);
  }, []);

  const onSubmit = useCallback(
    (emails, successCallback, perks) => {
      dispatch(
        inviteUsers(event.id, emails, msg, perks, () => {
          successCallback && successCallback();
          dispatch(fetchInvited(event.id, true));
        })
      );
    },
    [msg]
  );

  const onInvite = useCallback((...args) => {
    if (
      Object.keys(event.perks).filter((p) => event.perks[p].startsWith("p"))
        .length
    )
      setModal(args);
    else onSubmit(...args);
  }, []);

  const onModalSubmit = useCallback(() => {
    const args = [...modal];
    args[2] = form.getFieldsValue();
    onSubmit(...args);
    setModal(false);
  }, [modal]);

  return (
    <>
      <UserSearch
        loading={loading}
        exclusions={exclusions}
        onSubmit={onInvite}
        submitText="Invite"
        dataKey="email"
      />
      <InvitationMessageBox
        event={event}
        value={msg}
        onChange={onMessageChange}
      />
      <Modal
        title="Select Coupons"
        visible={!!modal}
        onOk={onModalSubmit}
        onCancel={() => setModal(false)}
      >
        <Form form={form}>
          {Object.keys(event.perks)
            .filter((p) => event.perks[p].startsWith("p"))
            .map((p) => (
              <Form.Item
                label={p}
                name={p}
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
                initialValue={+event.perks[p].slice(2)}
              >
                <InputNumber
                  style={{ width: 140 }}
                  placeholder="Quantity"
                  min={0}
                />
              </Form.Item>
            ))}
        </Form>
      </Modal>
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

function ResendInvitation({ onClick }) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    Promise.resolve(onClick?.())
      .catch(globalErrorHandler)
      .then(() => {
        message.success("Event invitation has been resnt!");
      })
      .finally(() => setLoading(false));
  };

  return loading ? (
    <Spin size="small" />
  ) : (
    <ReloadOutlined onClick={handleClick} />
  );
}

export function UserCard({
  profilePicture,
  displayName,
  email,
  ticketURL,
  date,
  onResendInvite,
  onSendTicket,
  getLink,
  status,
  onDelete,
  onSuccessDelete,
  validationStats,
  ticketInfo,
  perks,
  onPerksEdit,
  invitationLink,
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

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(invitationLink);
    message.success("Invitation link copied to clipboard!");
  }, [invitationLink]);

  const actions = [];

  if (status)
    actions.push(
      <Tooltip placement="bottom" title={capitalize(status)}>
        {status === "accepted" ? (
          <CheckCircleFilled style={{ color: "#42ba96", fontSize: 15 }} />
        ) : status === "pending" ? (
          <CustomIcon type="icon-waiting" style={{ fontSize: 16 }} />
        ) : (
          <CustomIcon type="icon-not-available" style={{ fontSize: 15 }} />
        )}
      </Tooltip>
    );

  if (onResendInvite && status === "pending") {
    actions.push(
      <Tooltip placement="bottom" title="Resend Invitation">
        <span>
          <ResendInvitation onClick={onResendInvite} />
        </span>
      </Tooltip>
    );
  }

  if (onSendTicket && email && status === "pending") {
    actions.push(
      <Tooltip placement="bottom" title="Send Ticket (QR Code)">
        <span>
          <SendTicket
            ticketURL={ticketURL}
            email={email}
            onSubmit={onSendTicket}
            getLink={getLink}
          />
        </span>
      </Tooltip>
    );
  }

  if (validationStats)
    actions.push(
      <Tooltip placement="bottom" title="Stats">
        <Popover
          trigger="click"
          content={
            <div>
              <FieldValue
                field="Tickets"
                value={validationStats.totalTicketsValidated || 0 + ""}
                key="tickets"
              />
              {Object.entries(validationStats.perksValidated || {})
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([perk, val]) => (
                  <FieldValue key={perk} field={perk} value={val + ""} />
                ))}
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
      <Tooltip placement="bottom" title="Ticket Info">
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

  if (perks)
    actions.push(
      <Tooltip title="Coupons" placement="bottom">
        <span>
          <PerksInfo perks={perks} onEdit={onPerksEdit} />
        </span>
      </Tooltip>
    );

  if (invitationLink) {
    actions.push(
      <Tooltip placement="bottom" title="Copy Invitation Link">
        <CopyOutlined onClick={onCopy} />
      </Tooltip>
    );
  }

  if (onDelete?.method)
    actions.push(
      <Tooltip placement="bottom" title="Delete">
        <DeleteOutlined
          style={{ cursor: onDelete.disabled && "not-allowed" }}
          onClick={!onDelete.disabled && onClick}
        />
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
        title={
          <>
            {displayName}
            {email && (
              <div
                style={{
                  fontWeight: "normal",
                  color: "rgba(0, 0, 0, 0.45)",
                  fontSize: 12,
                }}
              >
                {email}
              </div>
            )}
          </>
        }
        description={moment(date).format("D MMM YY - h:m a")}
      />
    </List.Item>
  );
}

export default function PeopleTabs({ event, listHeight = 375 }) {
  const [query, updateQuery] = useQuery("replace");
  const peopleTab = query.get("peopleTab") || "going";
  const searchFunc = useRef();
  const dispatch = useDispatch();
  const [_, refreshComponent] = useState();
  const {
    going,
    invited,
    validators,
    goingLoading,
    invitedLoading,
    validatorsLoading,
    searchMode,
    searchResults,
    searchLoading,
  } = useSelector(({ event }) => ({
    going: event.goingList,
    invited: event.invitedList,
    validators: event.validatorsList,
    goingLoading: event.loading.goingList,
    invitedLoading: event.loading.invitedList,
    validatorsLoading: event.loading.validatorsList,
    searchMode: event.searchResultsMode,
    searchResults: event.searchResults,
    searchLoading: event.loading.searchResults,
  }));

  const getSearchFunc = useCallback((func) => {
    searchFunc.current = func;
  }, []);

  const loadGoing = useCallback(
    (reset) => {
      if (searchMode && reset !== true) return searchFunc.current(true);
      dispatch(fetchGoing(event.id, reset));
    },
    [event.id, searchMode]
  );

  const loadInvited = useCallback(
    (reset) => {
      if (searchMode && reset !== true) {
        return searchFunc.current(true);
      }
      dispatch(fetchInvited(event.id, reset));
    },
    [event.id, searchMode]
  );

  const loadValidators = useCallback(
    (reset) => {
      if (searchMode && reset !== true) return searchFunc.current(true);
      dispatch(fetchValidators(event.id, reset));
    },
    [event.id, searchMode]
  );

  const loaders = {
    going: loadGoing,
    invited: loadInvited,
    validators: loadValidators,
    likes: () => {},
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
  const tabKeys = Object.keys(loaders);

  return (
    <div style={{ position: "relative" }}>
      <Tabs
        activeKey={peopleTab}
        onChange={(key) => {
          updateQuery({ peopleTab: key });
        }}
      >
        <Tabs.TabPane tab={`Going (${event.attendeesCount})`} key={tabKeys[0]}>
          <LazyList
            listHeight={listHeight}
            onEndReached={loadGoing}
            loading={searchMode ? searchLoading : goingLoading}
            dataSource={searchMode ? searchResults : going}
            emptyContent={<Empty />}
            renderItem={(item) => (
              <UserCard
                key={item.key}
                profilePicture={item.profilePicture}
                displayName={item.displayName}
                email={item.email}
                date={item.createdAt}
                perks={item.ticket?.perks}
                onPerksEdit={
                  item.ticket &&
                  ((perks) =>
                    Event.update_ticket_perks({
                      eventId: event.id,
                      ticketId: item.ticket.id,
                      perks,
                    }).then(() => {
                      Object.keys(item.ticket?.perks || {}).forEach((perk) => {
                        item.ticket.perks[perk] = {
                          ...item.ticket.perks[perk],
                          allotted: perks[perk].allotted,
                        };
                      });
                      refreshComponent(Date.now());
                    }))
                }
                onDelete={{
                  method: Event.remove_user,
                  args: [{ uid: item.id, eventId: event.id }],
                }}
                onSuccessDelete={() => loadGoing(true)}
                ticketInfo={item.ticket}
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
          key={tabKeys[1]}
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
            loading={searchMode ? searchLoading : invitedLoading}
            dataSource={searchMode ? searchResults : invited}
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
                email={item.inviteeDetails?.email}
                ticketURL={item.ticketURL}
                invitationLink={item.invitationLink}
                perks={Object.entries(item.perks || {}).reduce(
                  (acc, [key, val]) => ({
                    ...acc,
                    [key]: { allotted: val.split("-")[1] },
                  }),
                  {}
                )}
                onPerksEdit={
                  item.status?.value === "pending" &&
                  ((perks) =>
                    Event.update_invite_perks({
                      eventId: event.id,
                      inviteId: item.id,
                      perks,
                    }).then(() => {
                      Object.keys(item.perks || {}).forEach((perk) => {
                        item.perks[perk] = `p-${perks[perk].allotted}`;
                      });
                      refreshComponent(Date.now());
                    }))
                }
                onResendInvite={() =>
                  Event.resend_invite({
                    invitationId: item.id,
                    eventId: event.id,
                    message: getInvitationMsg(),
                  })
                }
                onSendTicket={(email, phone) =>
                  Event.send_ticket({
                    eventId: event.id,
                    invitationId: item.id,
                    email,
                    phone,
                  })
                }
                getLink={() =>
                  Event.get_ticket_link({
                    eventId: event.id,
                    invitationId: item.id,
                  })
                }
                onDelete={{
                  method: Event.remove_invited,
                  disabled: item.status?.value === "accepted",
                  args: [{ invitationId: item.id, eventId: event.id }],
                }}
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
            key={tabKeys[2]}
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
              loading={searchMode ? searchLoading : validatorsLoading}
              dataSource={searchMode ? searchResults : validators}
              emptyContent={<Empty />}
              renderItem={(item) => (
                <UserCard
                  key={item.key}
                  profilePicture={item.userDetails?.profilePicture}
                  displayName={item.userDetails?.displayName}
                  email={item.userDetails?.email}
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
            `Likes` +
            (event.likes ? ` (${Object.keys(event.likes).length})` : "")
          }
          key={tabKeys[3]}
        >
          <LazyList
            listHeight={listHeight}
            dataSource={
              searchMode
                ? searchResults
                : Object.entries(event.likes || {})
                    .map(([key, val]) => ({ key, id: key, ...(val || {}) }))
                    .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
            }
            emptyContent={<Empty />}
            renderItem={(item) => (
              <UserCard
                key={item.key}
                profilePicture={item.profilePicture}
                email={item.email}
                displayName={item.displayName || "N/A"}
                date={item.timestamp?.toDate()}
              />
            )}
          />
        </Tabs.TabPane>
      </Tabs>
      <TabSearch
        tab={peopleTab}
        eventId={event.id}
        getSearchFunc={getSearchFunc}
      />
    </div>
  );
}
