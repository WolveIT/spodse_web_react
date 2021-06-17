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
}) {
  const history = useHistory();

  const onView = useCallback(() => {
    saveEvent(event);
    history.push(`/events/${event.id}`);
  }, [event]);

  const onEdit = useCallback(() => {
    saveEvent(event);
    history.push(`/events/${event.id}/edit`);
  }, [event]);

  const onDelete = useCallback(() => {
    AlertPopup({
      title: "Delete Event",
      message: "Are you sure you want to delete this event?",
      onOk: () =>
        Event.delete(event.id).then(() => {
          dispatch(deleteEventFromState(event.id));
          message.success("Event deleted successfully!");
        }),
    });
  }, [event]);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {showView && (
        <Hover
          element={<EyeOutlined onClick={onView} />}
          style={{ marginRight: 8, transition: "color 0.4s" }}
          hoverStyle={{ color: Theme.get() }}
        />
      )}
      {showEdit && (
        <Hover
          element={<EditOutlined onClick={onEdit} />}
          style={{ marginRight: 8 }}
          hoverStyle={{ color: Theme.get(), transition: "color 0.4s" }}
        />
      )}
      {showDelete && (
        <Hover
          element={<DeleteOutlined onClick={onDelete} />}
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
