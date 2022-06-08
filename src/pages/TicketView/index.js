import { Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "../../hooks/useQuery";
import QRCode from "qrcode";
import { globalErrorHandler } from "../../utils/errorHandler";
import PageSpinner from "../../components/Spinner/PageSpinner";
import styles from "./index.module.scss";

function TicketView() {
  const params = useParams();
  const [query] = useQuery();
  const title = query.get("eventTitle") || null;
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    QRCode.toDataURL(params.ticketId, { width: 220 })
      .then(setQrCode)
      .catch(globalErrorHandler)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner text="Loading Ticket..." />;

  return (
    <div className={styles.root}>
      {title ? <Typography.Title>Event: {title}</Typography.Title> : null}
      <h2>Your ticket for the event</h2>
      <img src={qrCode} />
      <p>Show this QR code at the entrance to get access to the event</p>
    </div>
  );
}

export default TicketView;
