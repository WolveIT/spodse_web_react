import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "dva";
import styles from "./index.module.scss";
import { useQuery } from "../../hooks/useQuery";
import {
  fetchEventByMonth,
  fetchLatestEvent,
  fetchStats,
} from "../../models/event";
import { transformDates } from "../../utils";
import PageSpinner from "../../components/Spinner/PageSpinner";
import { EventCard } from "../../components/EventPreview";
import { Calendar, Statistic, Typography, Tooltip, Spin } from "antd";
import {
  CaretLeftOutlined,
  CaretRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  MailOutlined,
  RiseOutlined,
  ShareAltOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Line, RingProgress } from "@ant-design/charts";
import Countdown from "antd/lib/statistic/Countdown";
import moment from "moment";
import Theme from "../../utils/theme";
import { useHistory } from "react-router-dom";
import OverlayMask from "../../components/OverlayMask";
import LazyList from "../../components/LazyList";
import Empty from "../../components/Empty";

export const colors = {
  success: "#389e0d",
  warning: "#faad14",
  danger: "#ff4d4f",
};

function Navigator({ offset, dir, event, updateQuery }) {
  const onNext = useCallback(() => {
    if (!event && dir === "next") return;
    updateQuery({
      offset: event ? event.endsAt.valueOf() : offset - 1,
      dir: "next",
      eventId: undefined,
    });
  }, [event]);

  const onPrevious = useCallback(() => {
    if (!event && dir === "prev") return;
    updateQuery({
      offset: event ? event.endsAt.valueOf() : offset + 1,
      dir: "prev",
      eventId: undefined,
    });
  }, [event]);

  return (
    <div className={styles.navigator}>
      <Tooltip title="Previous">
        <CaretLeftOutlined onClick={onPrevious} />
      </Tooltip>
      <Tooltip title="Next">
        <CaretRightOutlined onClick={onNext} />
      </Tooltip>
    </div>
  );
}

function StatsCard({ color, title, icon, val1, val2 }) {
  return (
    <div className={styles.stats}>
      <Statistic
        title={
          <div style={{ color }} className={styles.stats_title}>
            {icon}
            <h3>{title}</h3>
          </div>
        }
        value={val1 || 0}
        suffix={val2 !== undefined ? `/ ${val2 || 0}` : undefined}
      />
      {Number.isInteger(val1) && Number.isInteger(val2) && (
        <RingProgress
          statistic={{
            content: { style: { color: "rgba(0, 0, 0, 0.45)" } },
          }}
          height={72}
          width={72}
          percent={val1 / (val2 || 1)}
          color={[color, "#E8EDF3"]}
        />
      )}
    </div>
  );
}

function Counter({ event }) {
  const now = moment();
  const timeStatus = event.endsAt.isBefore(now)
    ? 0 //past
    : event.startsAt.isAfter(now)
    ? 2 //future
    : 1; //present

  return (
    <div style={{ alignSelf: "flex-start", display: "flex" }}>
      {timeStatus === 0 ? (
        <Typography.Text className={styles.event_completed}>
          Event Ended
        </Typography.Text>
      ) : (
        <Countdown
          prefix={<ClockCircleOutlined style={{ marginRight: 4 }} />}
          format={`${
            timeStatus === 1 ? "[Ending In]" : "[Starting In]"
          }: D [days], H[h], m[m], s[s]`}
          title={null}
          valueStyle={{ fontSize: 20 }}
          value={timeStatus === 1 ? event.endsAt : event.startsAt}
        />
      )}
    </div>
  );
}

function EventsCalendar() {
  const dispatch = useDispatch();
  const { loading, events, eventId } = useSelector(({ event }) => ({
    events: event.monthEvents,
    loading: event.loading.fetchByMonth,
    eventId: event.latest?.id,
  }));
  const updateQuery = useQuery()[1];

  const fetchEvents = useCallback((date) => {
    dispatch(
      fetchEventByMonth({ month: date.get("month"), year: date.get("year") })
    );
  }, []);

  const dateCellRender = useCallback(
    (d) => {
      if (loading) return null;
      return (
        <div className={styles.marker_container}>
          {events
            ?.filter((e) => {
              const evtDate = e.startsAt.toDate();
              return (
                evtDate.getDate() === d.get("date") &&
                evtDate.getMonth() === d.get("month") &&
                evtDate.getFullYear() === d.get("year")
              );
            })
            .map((e) => (
              <Tooltip title={e.title} key={e.id}>
                <div
                  className={`${styles.marker} ${
                    e.id === eventId ? styles.active_marker : ""
                  }`}
                  style={{
                    background: Theme.get(),
                  }}
                  onClick={() => updateQuery({ eventId: e.id })}
                >
                  {e.id === eventId ? (
                    <>
                      <div>
                        <div>
                          <div></div>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </Tooltip>
            ))}
        </div>
      );
    },
    [events?.[0]?.id, loading, eventId]
  );

  useEffect(() => {
    fetchEvents(moment());
  }, []);

  return (
    <OverlayMask visible={loading} content={<Spin size="small" />}>
      <div className={styles.calendar}>
        <Calendar
          dateCellRender={dateCellRender}
          onPanelChange={fetchEvents}
          fullscreen={false}
        />
      </div>
    </OverlayMask>
  );
}

function HistoryProgressChart({ event, tickets }) {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector(({ event }) => ({
    stats: Object.entries(event.stats?.eventsHistory || {})
      .map(([eventId, obj]) => ({
        ...obj,
        eventId,
        timestamp: obj.timestamp.seconds,
      }))
      .sort((a, b) => a.timestamp - b.timestamp),
    loading: event.loading.stats,
  }));
  const now = moment();

  if (event?.startsAt?.isBefore(now) && event?.endsAt.isAfter(now)) {
    stats.push({
      timestamp: now.valueOf() / 1000,
      invitationSuccess:
        (Object.values(tickets || {}).filter(
          (t) => t?.status?.value === "consumed" && t?.isInvited
        ).length /
          (event.stats?.totalInvited || 1)) *
        100,
    });
  }

  if (stats.length === 1)
    stats.push({
      timestamp: now.valueOf() / 1000,
      invitationSuccess: stats[stats.length - 1].invitationSuccess,
    });

  useEffect(() => {
    dispatch(fetchStats());
  }, []);

  return (
    <div className={styles.is_graph}>
      <Typography.Title>Invitation Success History</Typography.Title>
      <OverlayMask visible={loading} content={<Spin size="small" />}>
        <div>
          {!stats.length && !loading ? (
            <Empty />
          ) : (
            <Line
              style={{ height: "99%" }}
              autoFit={true}
              color={Theme.get()}
              tooltip={{
                title: (timestamp) =>
                  moment(timestamp * 1000).format("Do MMM YYYY"),
                formatter: (data) => ({
                  name: "Invitation Success",
                  value: data.invitationSuccess.toFixed(2) + "%",
                }),
              }}
              xAxis={{
                label: { formatter: (v) => moment(v * 1000).format("M/YY") },
              }}
              yAxis={{ label: { formatter: (v) => v + "%" }, min: 0, max: 100 }}
              data={stats}
              xField="timestamp"
              yField="invitationSuccess"
              // stepType="hvh"
            />
          )}
        </div>
      </OverlayMask>
    </div>
  );
}

function AttendeesTrendGraph({ tickets }) {
  let divisions = 48;
  const went = Object.values(tickets || {}).filter(
    (t) => t?.status?.value === "consumed"
  );
  const data = (() => {
    const map = {};
    Array(divisions)
      .fill(0)
      .forEach((v, i) => (map[i] = v));
    went.forEach((t) => {
      const date = moment(t.status.timestamp.toDate());
      const val = Math.round(
        date.diff(date.clone().startOf("day"), "minutes") /
          ((24 * 60) / divisions)
      );
      map[val]++;
    });
    return Object.entries(map).map(([t, v]) => ({ time: t, value: v }));
  })();

  return (
    <div className={styles.at_graph}>
      <Typography.Title>Attendees Influx Trend</Typography.Title>
      <div>
        {went.length ? (
          <Line
            style={{ height: "99%" }}
            autoFit={true}
            color={Theme.get()}
            smooth={true}
            tooltip={{
              title: (v) => {
                const val = (v / divisions) * 24;
                const whole = Math.floor(val);
                const decimal = val - whole;
                return `${whole.toString().padStart(2, "0")}:${Math.round(
                  decimal * 60
                )
                  .toString()
                  .padStart(2, "0")} h`;
              },
              formatter: (data) => ({
                name: "Attendees Count",
                value: data.value,
              }),
            }}
            xAxis={{
              label: { formatter: (v) => (v / divisions) * 24 + "h" },
              tickCount: 24,
              min: 0,
              max: divisions,
            }}
            data={data}
            xField="time"
            yField="value"
          />
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
}

function PerksSection({ event }) {
  const perks = Object.entries(event.perks || {});

  return (
    <div className={styles.perks_section}>
      <Typography.Title>Coupons Consumed</Typography.Title>
      <LazyList
        listHeight="35vh"
        dataSource={perks.sort((a, b) => a[0].localeCompare(b[0]))}
        renderItem={([title, max]) => {
          const [qtyType, qty] = max.split("-");
          const denominator =
            qtyType === "p" ? event.stats?.totalWent * +qty : +qty;
          const percent =
            ((event.stats?.totalPerksAvailed?.[title] || 0) /
              (denominator || 1)) *
            100;
          return (
            <div className={styles.perk_item}>
              <span>
                {title}{" "}
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(0, 0, 0, 0.60)",
                  }}
                >
                  ({qtyType === "p" ? "Per Person" : "Per Event"})
                </span>
              </span>
              <div>
                <span>
                  {event.stats?.totalPerksAvailed?.[title] || 0} /{" "}
                  <span style={{ fontSize: 11 }}>{denominator}</span>
                </span>
                <span
                  style={{
                    color:
                      percent <= 33
                        ? colors.success
                        : percent <= 66
                        ? colors.warning
                        : colors.danger,
                  }}
                  className={styles.perk_percent}
                >
                  {Math.round(percent)}%
                </span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}

function Section1({ event, tickets }) {
  const history = useHistory();
  return (
    <div className={`${styles.sec_1} ${styles.sec}`}>
      <EventCard
        className={styles.event_card}
        imgStyle={{
          height: "15vh",
          minHeight: "80px",
        }}
        data={event}
        onTitleClick={() => history.push(`/events/${event.id}`)}
      />
      <StatsCard
        color={colors.warning}
        icon={<TeamOutlined />}
        title="Registrations"
        val1={event.attendeesCount}
        val2={event.maxAttendees}
      />
      <StatsCard
        color={colors.success}
        icon={<CheckCircleOutlined />}
        title="People Went"
        val1={event.stats?.totalWent}
        val2={event.attendeesCount}
      />
      <StatsCard
        color={"#005C5E"}
        icon={<RiseOutlined />}
        title="Invitees Went"
        val1={
          Object.values(tickets || {}).filter(
            (t) => t?.status?.value === "consumed" && t?.isInvited
          ).length
        }
        val2={event.stats?.totalInvited}
      />
      <StatsCard
        color="purple"
        icon={<MailOutlined />}
        title="Invites Accepted"
        val1={event.stats?.totalInvitesAccepted}
        val2={event.stats?.totalInvited}
      />
    </div>
  );
}

function Section2({ event, tickets }) {
  return (
    <div className={`${styles.sec_2} ${styles.sec}`}>
      <Counter event={event} />
      <AttendeesTrendGraph tickets={tickets} />
      <div className={styles.likes_shares}>
        <StatsCard
          color="#4267B2"
          icon={<LikeOutlined />}
          title="Likes"
          val1={Object.keys(event.likes || {}).length}
        />
        <StatsCard
          color="#FF4200"
          icon={<ShareAltOutlined />}
          title="Shares"
          val1={event.stats?.totalShares}
        />
      </div>
      <PerksSection event={event} />
    </div>
  );
}

function Section3({ event, tickets }) {
  return (
    <div className={`${styles.sec_3} ${styles.sec}`}>
      <EventsCalendar />
      <HistoryProgressChart event={event} tickets={tickets} />
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { event, tickets, loading } = useSelector(({ event }) => ({
    event: event.latest,
    loading: event.loading.fetchLatest || event.latest === undefined,
    tickets: event.tickets?.tickets,
  }));
  const [query, updateQuery] = useQuery();
  const offset = +query.get("offset");
  const dir = query.get("dir");
  const eventId = query.get("eventId");

  useEffect(() => {
    dispatch(fetchLatestEvent({ dir, offset, eventId }));
  }, [offset, dir, eventId]);

  if (event) {
    if (!event.schedule)
      event.schedule = [event.startsAt.toDate(), event.endsAt.toDate()];
    transformDates(event);
  }

  return (
    <div className={styles.container}>
      <Navigator
        offset={offset}
        dir={dir}
        updateQuery={updateQuery}
        event={event}
      />
      {loading ? (
        <PageSpinner spinnerProps={{ size: "default" }} fixed={false} />
      ) : event === null ? (
        <Empty />
      ) : (
        <>
          <Section1 event={event} tickets={tickets} />
          <Section2 event={event} tickets={tickets} />
        </>
      )}
      <Section3 event={event} tickets={tickets} />
    </div>
  );
}
