import React from "react";
import styles from "./index.module.scss";
const playStore = require("../../assets/images/playstore.png");
const appStore = require("../../assets/images/appstore.png");

export default function DownloadApp() {
  return (
    <div className={styles.container}>
      <h1>
        Welcome to Spodse
        <span aria-label="Congratulations" role="img">
          🎉
        </span>
      </h1>
      <div className={styles.desc}>
        Please <strong>download</strong> our IOS or Android app using the
        buttons given below to continue.
      </div>
      <div className={styles.icons_sec}>
        <a href="https://apps.apple.com/no/app/spodse-as/id1534184541?l=nb">
          <img alt="download on appstore" src={appStore} />
        </a>
        <a href="https://play.google.com/store/apps/details?id=com.tbleAS.spodse&gl=NO">
          <img alt="download on playstore" src={playStore} />
        </a>
      </div>
    </div>
  );
}
