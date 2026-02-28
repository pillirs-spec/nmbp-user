import { envUtils } from "ts-commons";

const environment = {
  moduleName: envUtils.getStringEnvVariableOrDefault(
    "MODULE",
    "nmbp-user-backend",
  ),
  port: envUtils.getNumberEnvVariableOrDefault("PORT", 7004),
  apiBaseUrl: envUtils.getStringEnvVariableOrDefault(
    "TS_APIS_BASE_URL",
    `localhost:${envUtils.getNumberEnvVariableOrDefault("PORT", 7004)}`,
  ),
  bodyParserLimit: envUtils.getStringEnvVariableOrDefault(
    "TS_BODY_PARSER_LIMIT",
    "5mb",
  ),
  allowedMethods: envUtils.getStringEnvVariableOrDefault(
    "TS_ALLOWED_METHODS",
    "GET,OPTIONS,PUT,PATCH,POST,DELETE",
  ),
  allowedOrigins: envUtils.getStringEnvVariableOrDefault(
    "TS_ALLOWED_ORIGINS",
    "*",
  ),
  allowedHeaders: envUtils.getStringEnvVariableOrDefault(
    "TS_ALLOWED_HEADERS",
    "Content-Type, Authorization, offline_mode, uo-device-type, uo-os, uo-os-version, uo-is-mobile, uo-is-tablet, uo-is-desktop, uo-browser-version, uo-browser, uo-client-id, uo-client-ip",
  ),
  xFrameOptions: envUtils.getStringEnvVariableOrDefault(
    "TS_X_FRAME_OPTIONS",
    "DENY",
  ),
  riskyCharacters: envUtils.getStringEnvVariableOrDefault(
    "RISKY_CHARS",
    "=,-,@,|",
  ),
  enforceSingleSession: envUtils.getBooleanEnvVariableOrDefault(
    "INIT_COMMON_ENFORCE_ONLY_ONE_SESSION",
    false,
  ),
  secretKey: envUtils.getStringEnvVariableOrDefault("TS_SECRET_KEY", "TS_2024"),
  rateLimit: envUtils.getNumberEnvVariableOrDefault("TS_RATE_LIMIT", 100),
  defaultPassword: envUtils.getStringEnvVariableOrDefault(
    "DEFAULT_PASSWORD",
    "TS123!@#",
  ),
  redisExpireTimePwd: envUtils.getNumberEnvVariableOrDefault(
    "REDIS_EXPIRE_TIME_PWD",
    28800,
  ),
  sha256PvtKey: envUtils.getStringEnvVariableOrDefault(
    "SHA256_PVT_KEY",
    "TS_2024",
  ),
  cryptoEncryptionKey: envUtils.getStringEnvVariableOrDefault(
    "CRYPTO_ENCRYPTION_KEY",
    "TS@$#&*(!@%^&",
  ),
  objectStorageBucket: envUtils.getStringEnvVariableOrDefault(
    "TS_OBJECT_STORAGE_BUCKET",
    "temple-seva",
  ),

  /**
   * SMS Service Configuration
   * Configure these environment variables for production SMS sending
   * Supported Providers: Twilio, AWS SNS, MSG91, Gupshup, TextLocal, etc.
   */
  smsProvider: envUtils.getStringEnvVariableOrDefault("SMS_PROVIDER", "mock"), // "twilio", "msg91", "aws-sns", etc.
  smsGatewayUrl: envUtils.getStringEnvVariableOrDefault(
    "INIT_COMMON_SMS_GATEWAY_BASE_URL",
    "https://api.sms-provider.com/send",
  ),
  smsApiKey: envUtils.getStringEnvVariableOrDefault(
    "INIT_COMMON_SMS_GATEWAY_PASSWORD",
    "",
  ),
  smsSenderId: envUtils.getStringEnvVariableOrDefault(
    "INIT_COMMON_SMS_GATEWAY_USER_ID",
    "NMBP",
  ),
  smsTemplateId: envUtils.getStringEnvVariableOrDefault("SMS_TEMPLATE_ID", ""), // DLT Template ID for India
  smsPrincipalEntityId: envUtils.getStringEnvVariableOrDefault(
    "INIT_COMMON_DLT_ENTITY_ID",
    "",
  ), // DLT Principal Entity ID for India
  smsTimeout: envUtils.getNumberEnvVariableOrDefault("SMS_TIMEOUT", 10000), // 10 seconds
  smsRetryAttempts: envUtils.getNumberEnvVariableOrDefault(
    "SMS_RETRY_ATTEMPTS",
    3,
  ),
};

export { environment };
