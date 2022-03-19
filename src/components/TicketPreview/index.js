import React from "react";
import { useSelector } from "dva";
import Marquee from "react-fast-marquee";
import styles from "./index.module.scss";
import qrcodeImg from "../../assets/images/qrcode.png";

function TicketPreview() {
  const event = useSelector(({ event }) => event.formData);

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
      {event.sponsorImages?.length ? (
        <Marquee gradient={false} speed={10} pauseOnHover>
          {event.sponsorImages.map((img) => (
            <img className={styles.sponsor_image} key={img.src} src={img.src} />
          ))}
        </Marquee>
      ) : null}
    </div>
  );
}

export default TicketPreview;
