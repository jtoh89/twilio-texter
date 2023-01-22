import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import { phoneFormat, transformDateTime } from "../utils";

const Home = () => {
  const [twilioPhone, setTwilioPhone] = useState("");
  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioTokenID, setTwilioTokenID] = useState("");
  const [smsHistory, setSmsHistory] = useState({});
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");

  const getTwilioSmsHistory = async (e) => {
    e.preventDefault();
    setAuthSuccess(false);
    setAuthError(false);

    const res = await fetch("/api/getSmsHistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ twilioPhone: twilioPhone, twilioAccountSid: twilioAccountSid, twilioTokenID: twilioTokenID }),
    });

    const apiResponse = await res.json();

    if (apiResponse.status !== 200) {
      setAuthError(true);
      setAuthErrorMsg(apiResponse.message);
    } else {
      setAuthSuccess(true);
      setSmsHistory(apiResponse.smsHistory);
    }
  };

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [smsError, setSmsError] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSmsError(false);
    setSuccess(false);

    const res = await fetch("/api/sendMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        twilioAccountSid: twilioAccountSid,
        twilioTokenID: twilioTokenID,
        twilioPhone: twilioPhone,
        toPhoneNum: selectedPhoneNum,
        message: message,
      }),
    });
    const apiResponse = await res.json();

    if (apiResponse.success) {
      setSuccess(true);
      setMessage("");
      setSmsHistory(apiResponse.newSmsHistory);
    } else {
      setSmsError(true);
    }
    setLoading(false);
  };

  const [selectedPhoneNum, setSelectedPhoneNum] = useState(false);
  const handleSelect = (e) => {
    setSelectedPhoneNum(e.target.value);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Twilio Texter</title>
      </Head>

      <form className={styles.form} onSubmit={getTwilioSmsHistory}>
        <h1 className={styles.title}>Twilio Account</h1>
        <div className={styles.formGroup}>
          <label>Twilio Account SID</label>
          <input onChange={(e) => setTwilioAccountSid(e.target.value)} placeholder="Twilio Account SID" className={styles.input} required />
        </div>
        <div className={styles.formGroup}>
          <label>Twilio Token ID</label>
          <input onChange={(e) => setTwilioTokenID(e.target.value)} placeholder="Twilio Token ID" className={styles.input} required />
        </div>
        <div className={styles.formGroup}>
          <label>Twilio Phone Number</label>
          <input
            onChange={(e) => {
              setTwilioPhone(phoneFormat(e.target.value));
            }}
            placeholder="Twilio Phone Number"
            className={styles.input}
            value={twilioPhone}
            required
          />
        </div>
        <button disabled={loading} type="submit" className={styles.button}>
          Authenticate
        </button>
        {authSuccess && <p className={styles.success}>Twilio authentication successful!</p>}
        {authError && <p className={styles.error}>{authErrorMsg}</p>}
      </form>

      {authSuccess && (
        <>
          <div className={styles.smsContainer}>
            <div className={styles.smsSelectContainer}>
              <label className={styles.smsSelectLabel}>Select Phone Number</label>
              <select value="" className={styles.smsSelect} onChange={handleSelect}>
                <option value="" disabled>
                  Select a number
                </option>
                {Object.keys(smsHistory).map((option, i) => {
                  return (
                    <option key={i} value={option}>
                      {option}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={styles.smsLogContainer}>
              {smsHistory[selectedPhoneNum] &&
                smsHistory[selectedPhoneNum].map((msg, i) => {
                  const finalDate = transformDateTime(msg.datetime);

                  return (
                    <div className={`${styles.sms} ${msg.direction === "inbound" ? styles.smsLeft : styles.smsRight}`} key={i}>
                      <p>{msg.body}</p>
                      <p className={styles.smsDatetime}>{finalDate}</p>
                    </div>
                  );
                })}
            </div>

            <form className={styles.smsForm} onSubmit={sendMessage}>
              <div className={styles.formGroup}>
                <label htmlFor="message"></label>
                <textarea
                  onChange={(e) => setMessage(e.target.value)}
                  id="message"
                  required
                  placeholder="Message"
                  className={styles.textarea}
                  value={message}
                ></textarea>
              </div>
              <button disabled={loading} type="submit" className={styles.button}>
                Send Message
              </button>
              {success && <p className={styles.success}>Message sent successfully.</p>}
              {smsError && <p className={styles.error}>Something went wrong. Please check the number.</p>}
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
