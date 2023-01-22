import twilio from "twilio";

export default function sendMessage(req, res) {
  const { twilioAccountSid, twilioTokenID, twilioPhone, toPhoneNum, message } = req.body;
  const client = twilio(twilioAccountSid, twilioTokenID);

  client.messages
    .create({
      body: message,
      from: twilioPhone,
      to: toPhoneNum,
    })
    .then(async () => {
      const newSmsHistory = await getHistory(client, twilioPhone);

      console.log("newSmsHistory: ", newSmsHistory);

      res.json({
        success: true,
        newSmsHistory: newSmsHistory,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        success: false,
      });
    });
}

const getHistory = async (client, twilioPhone) => {
  const formattedPhone = "+1" + twilioPhone.replace("(", "").replace(")", "").replace("-", "").replace(" ", "");

  const smsHistory = {};
  await client.messages.list().then((messages) =>
    messages.forEach((m) => {
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
  return smsHistory;
};
