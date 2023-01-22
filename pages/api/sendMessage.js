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
    .then(() =>
      res.json({
        success: true,
      })
    )
    .catch((error) => {
      console.log(error);
      res.json({
        success: false,
      });
    });
}
