import React, { useCallback, useEffect } from "react";
import { connect } from "dva";
import { Table, Spin } from "antd";
import moment from "moment";
import { loadEvents } from "../../models/event";
import { throttle } from "lodash";
import EventActions from "./Actions";
import PrivateTag from "./PrivateTag";
import OutOf from "../../components/OutOf";

function AllEvents(props) {
  useEffect(() => {
    props.loadEvents("reset");
    const table = document.querySelector(".events-table");

    const onTableScroll = throttle((e) => {
      const clientHeight = e.target.clientHeight;
      const currentScroll = e.target.scrollTop;
      const maxScroll = e.target.scrollHeight - clientHeight;
      const delta = maxScroll - currentScroll;
      const remainingPercent = (delta / clientHeight) * 100;

      if (remainingPercent < 10) props.loadEvents();
    }, 500);

    table.addEventListener("scroll", onTableScroll);
    return () => table.removeEventListener("scroll", onTableScroll);
  }, []);

  const columns = [
    {
      title: "No.",
      key: "serialNo",
      render: (_, __, i) => <span>{i + 1}</span>,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Schedule",
      dataIndex: "startsAt",
      key: "schedule",
      render: (e, data) => {
        const startsAt = moment(e.toDate());
        const endsAt = moment(data.endsAt.toDate());
        return (
          <span>
            {startsAt.format("D MMM YY")} - {startsAt.format("HH:mm")}
            <br />
            {endsAt.format("D MMM YY")} - {endsAt.format("HH:mm")}
          </span>
        );
      },
    },
    {
      title: "Genre",
      dataIndex: "genre",
      key: "genre",
      render: (e) => <span style={{ textTransform: "capitalize" }}>{e}</span>,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Going",
      dataIndex: "maxAttendees",
      key: "maxAttendees",
      render: (e, event) => <OutOf count={event.attendeesCount} total={e} />,
    },
    {
      title: "Public/Private",
      dataIndex: "isPrivate",
      key: "isPrivate",
      render: (e) => <PrivateTag isPrivate={e} />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, event) => <EventActions event={event} />,
    },
  ];

  return (
    <div
      className="events-table"
      style={{
        overflow: "auto",
        position: "absolute",
        bottom: 0,
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Table
        style={{ width: "100%" }}
        sticky
        columns={columns}
        pagination={false}
        loading={props.loading && !props.events}
        dataSource={props.events}
        footer={(data) => (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin
              style={{ visibility: props.loading ? "visible" : "hidden" }}
              tip="Loading..."
            />
          </div>
        )}
      />
    </div>
  );
}

export default connect(
  ({ event }) => ({
    events: event.list,
    loading: event.loading.list,
  }),
  {
    loadEvents,
  }
)(AllEvents);
