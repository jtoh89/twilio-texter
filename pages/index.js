import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import { phoneFormat, transformDateTime } from "../utils";
import Sms from "../components/sms/Sms";
import CallHistory from "../components/callHistory/CallHistory";

const Home = () => {
  const [twilioPhone, setTwilioPhone] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [twilioAccountSid, setTwilioAccountSid] = useState("");
  const [twilioTokenID, setTwilioTokenID] = useState("");
  const [smsHistory, setSmsHistory] = useState({});
  const [callHistory, setCallHistory] = useState([]);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  const getTwilioHistory = async (e) => {
    e.preventDefault();
    setAuthSuccess(false);
    setAuthError(false);
    setAuthenticating(true);

    const res = await fetch("/api/getTwilioHistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ twilioPhone: twilioPhone, twilioAccountSid: twilioAccountSid, twilioTokenID: twilioTokenID, userPhone: userPhone }),
    });

    const apiResponse = await res.json();

    if (apiResponse.status !== 200) {
      setAuthError(true);
      setAuthenticating(false);
      setAuthErrorMsg(apiResponse.message);
    } else {
      setAuthSuccess(true);
      setAuthenticating(false);
      setSmsHistory(apiResponse.smsHistory);
      setCallHistory(apiResponse.callHistory);
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

  const [view, setView] = useState("smshistory");
  const handleView = (e) => {
    setView(e.target.value);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Twilio Texter</title>
      </Head>

      <form className={styles.form} onSubmit={getTwilioHistory}>
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
        <div className={styles.formGroup}>
          <label>User Phone Number (number that calls are forward to/from)</label>
          <input
            onChange={(e) => {
              setUserPhone(phoneFormat(e.target.value));
            }}
            placeholder="User Phone Number"
            className={styles.input}
            value={userPhone}
            required
          />
        </div>
        <button disabled={authenticating} type="submit" className={styles.button}>
          {authenticating ? "please wait.." : "Authenticate"}
        </button>
        {authSuccess && <p className={styles.success}>Twilio authentication successful!</p>}
        {authError && <p className={styles.error}>{authErrorMsg}</p>}
      </form>

      {authSuccess && (
        <>
          <div className={styles.selectContainer}>
            <label className={styles.selectLabel}>Select View</label>
            <select className={styles.select} onChange={handleView}>
              <option value="smshistory">SMS History</option>
              <option value="callhistory">Call History</option>
            </select>
          </div>

          {view === "smshistory" ? (
            <Sms smsHistory={smsHistory} success={success} loading={loading} smsError={smsError} sendMessage={sendMessage} message={message} />
          ) : (
            <CallHistory callHistory={callHistory} />
          )}
        </>
      )}
    </div>
  );
};

export default Home;
