import styles from "./CallHistory.module.css";
import globalstyles from "../../styles/Home.module.css";
import { transformDateTime, formatPhoneFromTwilioFormat } from "../../utils";
import { useState } from "react";

const CallHistory = ({ callHistory, selectedPhoneNum }) => {
  const [direction, setDirection] = useState("all");

  const handleDirectionChange = (e) => {
    // console.log("direction e: ", e.target.value);
    setDirection(e.target.value);
  };

  console.log("direction: ", direction);
  return (
    <div className={styles.container}>
      <h1 className={globalstyles.title}>Call History</h1>

      <div className={globalstyles.selectContainer}>
        <label className={globalstyles.selectLabel}>Select Call Direction</label>
        <select className={globalstyles.select} onChange={handleDirectionChange}>
          <option value="all">All</option>
          <option value="inbound">Inbound</option>
          <option value="outbound-dial">Outbound</option>
        </select>
      </div>

      <table className={styles.table}>
        <tr>
          {direction !== "inbound" && <th>To</th>}
          {direction !== "outbound-dial" && <th>From</th>}

          <th>Date of Call</th>
        </tr>
        {callHistory.map((call, i) => {
          if (direction === "inbound" && call.direction !== direction) {
            return;
          } else if (direction === "outbound-dial" && call.direction !== direction) {
            return;
          }

          // console.log("call: ", call);
          const date = transformDateTime(call.dateCreated);
          const formatCallTo = formatPhoneFromTwilioFormat(call.callTo);
          const formatCallFrom = formatPhoneFromTwilioFormat(call.callFrom);

          return (
            <tr key={i}>
              {direction !== "inbound" && <td>{formatCallTo}</td>}
              {direction !== "outbound-dial" && <td>{formatCallFrom}</td>}

              <td>{date}</td>
            </tr>
          );
        })}
      </table>
    </div>
  );
};

export default CallHistory;
