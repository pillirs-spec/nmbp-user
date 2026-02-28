import { environment } from "./environment";

const AUTH = {
  SECRET_KEY: environment.secretKey,
  ENFORCE_ONLY_ONE_SESSION: environment.enforceSingleSession,
  API: {
    PUBLIC: [
      "/api/v1/user/health",
      "/api/v1/user/loginOtp",
      "/api/v1/user/verifyOTP",
      "/api/v1/user/resendOTP",
    ],
  },
};

export { AUTH };
