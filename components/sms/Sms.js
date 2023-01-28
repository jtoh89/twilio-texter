import styles from "./Sms.module.css";
import globalstyles from "../../styles/Home.module.css";
import { transformDateTime, formatPhoneFromTwilioFormat } from "../../utils";
import { useState } from "react";

const Sms = ({ smsHistory, success, loading, smsError, sendMessage, message }) => {
  const [selectedPhoneNum, setSelectedPhoneNum] = useState(false);
  const handlePhoneNumSelect = (e) => {
    setSelectedPhoneNum(e.target.value);
  };

  return (
    <div className={styles.container}>
      <h1 className={globalstyles.title}>Sms History</h1>
      <div className={globalstyles.selectContainer}>
        <label className={globalstyles.selectLabel}>Select Phone Number</label>
        <select defaultValue="default" className={globalstyles.select} onChange={handlePhoneNumSelect}>
          <option value="default" disabled>
            Select a number
          </option>
          {Object.keys(smsHistory).map((option, i) => {
            const formatNum = formatPhoneFromTwilioFormat(option);

            return (
              <option key={i} value={option}>
                {formatNum}
              </option>
            );
          })}
        </select>
      </div>
      <div className={styles.logContainer}>
        {smsHistory[selectedPhoneNum] &&
          smsHistory[selectedPhoneNum].map((msg, i) => {
            const finalDate = transformDateTime(msg.datetime);

            return (
              <div className={`${styles.sms} ${msg.direction === "inbound" ? styles.smsLeft : styles.smsRight}`} key={i}>
                <p>{msg.body}</p>
                <p className={styles.datetime}>{finalDate}</p>
              </div>
            );
          })}
      </div>

      <form className={globalstyles.form} onSubmit={sendMessage}>
        <div className={globalstyles.formGroup}>
          <label htmlFor="message"></label>
          <textarea
            onChange={(e) => setMessage(e.target.value)}
            id="message"
            required
            placeholder="Message"
            className={globalstyles.textarea}
            value={message}
          ></textarea>
        </div>
        <button disabled={loading} type="submit" className={globalstyles.button}>
          Send Message
        </button>
        {success && <p className={globalstyles.success}>Message sent successfully.</p>}
        {smsError && <p className={globalstyles.error}>Something went wrong. Please check the number.</p>}
      </form>
    </div>
  );
};

export default Sms;
