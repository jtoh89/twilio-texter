export default async function getSmsHistory(req, res) {
  try {
    const { twilioPhone, twilioAccountSid, twilioTokenID } = req.body;
    const client = require("twilio")(twilioAccountSid, twilioTokenID);

    console.log("twilioPhone: ", twilioPhone);

    const formattedPhone = "+1" + twilioPhone.replace("(", "").replace(")", "").replace("-", "").replace(" ", "");

    console.log("formattedPhone: ", formattedPhone);

    const smsHistory = {};

    await client.messages.list().then((messages) =>
      messages.forEach((m) => {
        // console.log(m);

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

    Object.keys(smsHistory).map((phoneNum, i) => {
      let phoneHist = smsHistory[phoneNum];
      phoneHist.sort(function (a, b) {
        return new Date(a.datetime) - new Date(b.datetime);
      });
      smsHistory[phoneNum] = phoneHist;
    });

    // console.log("smsHistory: ", smsHistory);

    res.json({
      smsHistory: smsHistory,
      status: 200,
      message: "Authentication successful",
    });
  } catch (error) {
    res.json({
      status: 400,
      message: "Authentication failed.",
    });
  }
}
