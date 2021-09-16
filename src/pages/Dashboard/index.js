import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "dva";
import PeopleTabs from "../EventDetail/peopleTabs";
import { fetchLatestEvent } from "../../models/event";
import PageSpinner from "../../components/Spinner/PageSpinner";
import { Empty, Statistic, Tooltip, Typography, Divider } from "antd";
import styles from "./index.module.scss";
import {
  CaretLeftOutlined,
  CaretRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  MailOutlined,
  TeamOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import PrivateTag from "../MyEvents/PrivateTag";
import moment from "moment";
import Countdown from "antd/lib/statistic/Countdown";
import { transformDates } from "../../utils";
import LazyList from "../../components/LazyList";
import { useQuery } from "../../hooks/useQuery";

const colors = {
  success: "#389e0d",
  warning: "#faad14",
  danger: "#ff4d4f",
};

function Navigator({ offset, event, updateQuery }) {
  const onNext = useCallback(() => {
    updateQuery({
      offset: event ? event.endsAt.toDate().getTime() : offset,
      queryCursor: event ? "startAfter" : "endAt",
    });
  }, [event]);

  const onPrevious = useCallback(() => {
    updateQuery({
      offset: event ? event.endsAt.toDate().getTime() : offset,
      queryCursor: event ? "endBefore" : "startAt",
    });
  }, [event]);

  return (
    <div className={styles.navigator}>
      <Tooltip title="Previous">
        <CaretLeftOutlined style={{ fontSize: 24 }} onClick={onPrevious} />
      </Tooltip>
      <Tooltip title="Next">
        <CaretRightOutlined style={{ fontSize: 24 }} onClick={onNext} />
      </Tooltip>
    </div>
  );
}

function Header({ event }) {
  return (
    <div className={styles.header}>
      <Typography.Title>{event.title}</Typography.Title>
      <PrivateTag isPrivate={event.isPrivate} />
    </div>
  );
}

function StatsCard({ color, title, icon, val1, val2 }) {
  return (
    <Statistic
      style={{ borderColor: color }}
      className={styles.stats}
      title={
        <div style={{ color }} className={styles.stats_title}>
          {icon}
          <h3>{title}</h3>
        </div>
      }
      value={val1 || 0}
      suffix={val2 !== undefined ? `/ ${val2 || 0}` : undefined}
    />
  );
}

function PerksSection({ event }) {
  const perks = Object.entries(event.perks || {});
  if (!perks.length) return null;

  return (
    <div className={styles.perks_section}>
      <Divider className={styles.perks_divider} type="vertical" />
      <Typography.Text className={styles.perks_heading}>
        Perks Consumed
      </Typography.Text>
      <Divider />
      <LazyList
        listHeight="40vh"
        dataSource={perks}
        renderItem={([title, max]) => {
          const percent =
            ((event.stats?.totalPerksAvailed?.[title] || 0) /
              ((event.stats?.totalWent || 1) * (max || 1))) *
            100;
          return (
            <div className={styles.perk_item}>
              <span>{title}</span>
              <div>
                <span>{event.stats?.totalPerksAvailed?.[title] || 0}</span>
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

function Schedule({ event }) {
  return (
    <div className={styles.schedule}>
      {event.startsAt.format("D MMM YY")} {event.startsAt.format("HH:mm")} -{" "}
      {event.endsAt.format("D MMM YY")} {event.endsAt.format("HH:mm")}
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
    <div>
      {timeStatus === 0 ? (
        <Typography.Text className={styles.event_completed}>
          Event Ended
        </Typography.Text>
      ) : (
        <Countdown
          prefix={<ClockCircleOutlined style={{ marginRight: 4 }} />}
          format="D [days], H[h], m[m], s[s]"
          title={
            <span className={styles.countdown_title}>
              {timeStatus === 1 ? "Ending In" : "Starting In"}
            </span>
          }
          value={timeStatus === 1 ? event.endsAt : event.startsAt}
        />
      )}
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { event, loading } = useSelector(({ event }) => ({
    event: event.latest,
    loading: event.loading.fetchLatest,
  }));
  const [query, updateQuery] = useQuery();
  const offset = +query.get("offset");
  const queryCursor = query.get("queryCursor");

  useEffect(() => {
    dispatch(fetchLatestEvent({ queryCursor, offset }));
  }, [offset, queryCursor]);

  if (event) transformDates(event);

  return (
    <>
      <Navigator offset={offset} updateQuery={updateQuery} event={event} />
      {loading ? (
        <PageSpinner spinnerProps={{ size: "default" }} fixed={false} />
      ) : event ? (
        <div className={styles.container}>
          <div className={styles.upper}>
            <Header event={event} />
            <Divider style={{ marginTop: 12 }} />
            <Schedule event={event} />
            <div className={styles.stats_section}>
              <StatsCard
                color={colors.warning}
                icon={<TeamOutlined />}
                title="Registrations"
                val1={event.attendeesCount}
                val2={event.maxAttendees}
              />
              <StatsCard
                color="purple"
                icon={<MailOutlined />}
                title="Invites Accepted"
                val1={event.stats?.totalInvitesAccepted}
                val2={event.stats?.totalInvited}
              />
              <StatsCard
                color={colors.success}
                icon={<CheckCircleOutlined />}
                title="People Went"
                val1={event.stats?.totalWent}
                val2={event.attendeesCount}
              />
              <StatsCard
                color="#4267B2"
                icon={<LikeOutlined />}
                title="Likes"
                val1={Object.keys(event.likes || {}).length}
              />
              <PerksSection event={event} />
            </div>
            <Counter event={event} />
            <Statistic
              style={{ marginTop: "1rem" }}
              prefix={<UnlockOutlined />}
              title="Age Limit"
              value={event.ageLimit || 0}
            />
          </div>
          <Divider style={{ margin: 0 }} />
          <div className={styles.lower}>
            <PeopleTabs event={event} listHeight="calc(30vh - 63px)" />
          </div>
        </div>
      ) : (
        <Empty className={styles.empty} description="Event Not Found!" />
      )}
    </>
  );
}
