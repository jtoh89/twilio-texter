export default async function getTwilioHistory(req, res) {
  try {
    const { twilioPhone, twilioAccountSid, twilioTokenID, userPhone } = req.body;

    const client = require("twilio")(twilioAccountSid, twilioTokenID);

    const formattedPhone = "+1" + twilioPhone.replace("(", "").replace(")", "").replace("-", "").replace(" ", "");
    const formattedUserPhone = "+1" + userPhone.replace("(", "").replace(")", "").replace("-", "").replace(" ", "");

    const callHistory = [];
    await client.calls.list().then((calls) => {
      calls.forEach((call) => {
        if (call.to !== formattedPhone && call.from !== formattedPhone) {
          return;
        }

        if (call.to === formattedUserPhone || call.from === formattedUserPhone) {
          return;
        }

        // console.log(`call. to: ${call.to}. from: ${call.from}. dateCreated: ${call.dateCreated}.`);
        // console.log("Call: ", call);

        if (call.direction === "inbound") {
          callHistory.push({
            direction: call.direction,
            callTo: call.to,
            callFrom: call.from,
            dateCreated: call.dateCreated,
          });
        } else if (call.direction === "outbound-dial") {
          callHistory.push({
            direction: call.direction,
            callTo: call.to,
            callFrom: call.from,
            dateCreated: call.dateCreated,
          });
        }
      });
    });

    const smsHistory = {};

    await client.messages.list().then((messages) =>
      messages.forEach((m) => {
        if (m.to !== formattedPhone && m.from !== formattedPhone) {
          return;
        }

        const msgBody = {
          to: m.to,
          from: m.from,
          body: m.body,
          datetime: m.dateSent,
          direction: m.direction,
          status: m.status,
        };

        if (m.to === formattedPhone) {
          if (!(m.from in smsHistory)) {
            smsHistory[m.from] = [msgBody];
          } else {
            smsHistory[m.from].push(msgBody);
          }
        }

        if (!(m.to in smsHistory)) {
          smsHistory[m.to] = [msgBody];
        } else {
          smsHistory[m.to].push(msgBody);
        }
      })
    );

    const allPhoneNums = Object.keys(smsHistory);

    if (allPhoneNums.length === 0 && callHistory.length === 0) {
      res.json({
        status: 400,
        message: `No activity found for Twilio Number: ${twilioPhone}`,
      });
    } else {
      allPhoneNums.map((phoneNum, i) => {
        let phoneHist = smsHistory[phoneNum];
        phoneHist.sort(function (a, b) {
          return new Date(a.datetime) - new Date(b.datetime);
        });
        smsHistory[phoneNum] = phoneHist;
      });

      res.json({
        smsHistory: smsHistory,
        callHistory: callHistory,
        status: 200,
        message: "Authentication successful",
      });
    }
  } catch (error) {
    console.log("Error: ", error);
    res.json({
      status: 400,
      message: "Authentication failed. Check provided SID and Token ID",
    });
  }
}
