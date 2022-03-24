import React from "react";
import { useSelector } from "dva";
import Marquee from "react-fast-marquee";
import styles from "./index.module.scss";
import qrcodeImg from "../../assets/images/qrcode.png";
import ServerImg from "../ServerImg";

function TicketPreview({ event }) {
  event = useSelector(({ event: e }) => event || e.formData);

  if (!Array.isArray(event.perks) && Object.keys(event.perks || {}).length) {
    event = {
      ...event,
      perks: Object.entries(event.perks).reduce((acc, [title, val]) => {
        const [qtyType, qty] = val.split("-");
        return [...acc, { title, qty, qtyType }];
      }, []),
    };
  }

  const mainSponsorImage =
    event.sponsorImages?.[0] || event.mainSponsorImage?.[0];

  return (
    <div className={styles.container}>
      <h3>Your entry ticket</h3>
      <p>Ticket available</p>
      <img className={styles.qrcode} src={qrcodeImg} />
      {event.perks?.filter?.((item) => item.title && item.qty && item.qtyType)
        .length ? (
        <>
          <p>Perks available with this ticket:</p>
          <div className={styles.perks_list}>
            {event.perks.map(({ title, qty, qtyType }) =>
              title && qty && qtyType ? (
                <div className={styles.perk_tag}>
                  {title}
                  {qtyType === "p" ? `: ${qty}` : ""}
                </div>
              ) : null
            )}
          </div>
        </>
      ) : null}
      {mainSponsorImage ? (
        <ServerImg
          src={mainSponsorImage.src || mainSponsorImage}
          defaultHeight={40}
          defaultWidth={40}
          style={{ height: 60, maxWidth: 150, objectFit: "contain" }}
        />
      ) : null}
    </div>
  );
}

export default TicketPreview;
