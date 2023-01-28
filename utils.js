export const phoneFormat = (input) => {
  // Strip all characters from the input except digits
  input = input.replace(/\D/g, "");

  // Trim the remaining input to ten characters, to preserve phone number format
  input = input.substring(0, 10);

  // Based upon the length of the string, we add formatting as necessary
  var size = input.length;
  if (size == 0) {
    input = "" + input;
  } else if (size < 4) {
    input = "(" + input;
  } else if (size < 7) {
    input = "(" + input.substring(0, 3) + ") " + input.substring(3, 6);
  } else {
    input = "(" + input.substring(0, 3) + ") " + input.substring(3, 6) + "-" + input.substring(6, 10);
  }
  return input;
};

export const formatPhoneFromTwilioFormat = (phone) => {
  phone = phone.replace("+", "");
  const size = phone.length;

  if (size === 10) {
    phone = "(" + phone.substring(0, 3) + ") " + phone.substring(3, 6) + "-" + phone.substring(6, 10);
  } else if (size === 11) {
    phone = "(" + phone.substring(1, 4) + ") " + phone.substring(4, 7) + "-" + phone.substring(7, 11);
  }

  return phone;
};

export const transformDateTime = (datetime) => {
  const event = new Date(datetime);
  const formatDate = event.toString();

  const tz = formatDate.split("(")[1].replace(")", "");

  const dateTimeComponents = formatDate.split(" ");

  const day = dateTimeComponents[0];
  const month = dateTimeComponents[1];
  const dayNum = dateTimeComponents[2];
  const year = dateTimeComponents[3];
  const time = dateTimeComponents[4];

  const timeComponents = time.split(":");

  var hour = parseInt(timeComponents[0]); // gives the value in 24 hours format
  var AmOrPm = hour >= 12 ? "pm" : "am";
  hour = hour % 12 || 12;

  const finalDateTime = day + " " + month + " " + dayNum + " " + year + " " + hour + ":" + timeComponents[1] + " " + AmOrPm + " (" + tz + ")";

  return finalDateTime;
};
