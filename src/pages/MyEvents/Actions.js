import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import React, { useCallback } from "react";
import { connect } from "dva";
import AlertPopup from "../../components/AlertPopup";
import Hover from "../../components/Hover";
import Theme from "../../utils/theme";
import { deleteEventFromState, saveEvent } from "../../models/event";
import { useHistory } from "react-router-dom";
import { message, Spin } from "antd";
import Event from "../../services/event";
import { dispatch } from "../../utils";

function EventActions({
  event,
  saveEvent,
  showView = true,
  showEdit = true,
  showDelete = true,
  iconSize = 16,
}) {
  const history = useHistory();

  const onView = useCallback(
    (e) => {
      e.stopPropagation();
      saveEvent(event);
      history.push(`/events/${event.id}`);
    },
    [event]
  );

  const onEdit = useCallback(
    (e) => {
      e.stopPropagation();
      saveEvent(event);
      history.push(`/events/${event.id}/edit`);
    },
    [event]
  );

  const onDelete = useCallback(
    (e) => {
      e.stopPropagation();
      AlertPopup({
        title: "Delete Event",
        message: "Are you sure you want to delete this event?",
        okText: "delete",
        okButtonProps: { danger: true },
        onOk: () =>
          Event.delete(event.id).then(() => {
            dispatch(deleteEventFromState(event.id));
            message.success("Event deleted successfully!");
          }),
      });
    },
    [event]
  );

  const ended = event.endsAt?.toDate?.() < new Date();

  return (
    <div style={{ display: "flex", alignItems: "center", zIndex: 99 }}>
      {showView && (
        <Hover
          element={
            <EyeOutlined style={{ fontSize: iconSize }} onClick={onView} />
          }
          style={{ marginRight: iconSize / 1.5, transition: "color 0.4s" }}
          hoverStyle={{ color: Theme.get() }}
        />
      )}
      {showEdit && (
        <Hover
          element={
            <EditOutlined
              style={{ fontSize: iconSize, color: ended && "#C6C6C6" }}
              onClick={
                !ended
                  ? onEdit
                  : (e) => {
                      e.stopPropagation();
                    }
              }
              title={ended && "Event Ended"}
            />
          }
          style={{ marginRight: iconSize / 1.5 }}
          hoverStyle={
            !ended && { color: Theme.get(), transition: "color 0.4s" }
          }
        />
      )}
      {showDelete && (
        <Hover
          element={
            <DeleteOutlined style={{ fontSize: iconSize }} onClick={onDelete} />
          }
          style={{ transition: "color 0.4s" }}
          hoverStyle={{ color: Theme.get() }}
        />
      )}
    </div>
  );
}

export default connect(undefined, {
  saveEvent,
})(EventActions);
