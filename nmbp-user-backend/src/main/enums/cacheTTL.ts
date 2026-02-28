export enum CacheTTL {
  OTP_EXPIRY = 3 * 60, // 3 minutes for OTP as per industry standard
  SHORT = 15 * 60,
  MID = 60 * 60,
  LONG = 24 * 60 * 60,
}
