const SMS = {
  USER_CREATION: {
    body: `Dear <name>, Your login has been created successfully and the password is <password>. To login, click <url> - Ministry of Social Justice and Empowerment, Government of India`,
    template_id: "1207171682233422309",
  },
  RESET_PASSWORD: {
    body: `Dear <name>, Your password has been reset successfully. Kindly login with password: <password>. - Ministry of Social Justice and Empowerment, Government of India`,
    template_id: "1207171682234517804",
  },
  USER_LOGIN_WITH_OTP: {
    body: `<otp> is the OTP for <module>. This is valid for <time>. Do not share this OTP with anyone. - Ministry of Social Justice and Empowerment, Government of India`,
    template_id: "1207171664715742137",
  },
};

const WHATSAPP = {
  USER_CREATION: {
    template_id: "261829",
  },
  RESET_PASSWORD: {
    template_id: "261831",
  },
  USER_LOGIN_WITH_OTP: {
    template_id: "261807",
  },
};

export { SMS, WHATSAPP };
