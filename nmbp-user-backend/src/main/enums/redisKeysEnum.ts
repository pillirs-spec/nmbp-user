export enum RedisKeys {
  ADMIN_USER_BY_USER_ID = "admin|user:${userId}",
  ADMIN_LOGIN_OTP_BY_MOBILE = "admin|login_otp|mobileNumber:${mobileNumber}",
  ADMIN_LOGIN_OTP_BY_TXNID = "admin|login_otp|txnId:${txnId}",
  USER_REGISTRATION_OTP_BY_TXNID = "user|registration_otp|txnId:${txnId}",
  USER_REGISTRATION_DATA_BY_TXNID = "user|registration_data|txnId:${txnId}",
  PLEDGES_LIST = "pledges",
}
