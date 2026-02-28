import rateLimit from "express-rate-limit";

/**
 * PRODUCTION RATE LIMITING CONFIGURATION
 * Prevents brute force attacks and DDoS on OTP endpoints
 */

/**
 * Rate Limiter for OTP Request Endpoint
 * Prevents spam and bot abuse
 * Limit: 5 requests per 15 minutes per IP
 */
export const requestOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many OTP requests. Please try again after 15 minutes.",
  },
  standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    // Rate limit by IP address and mobile number combination for additional security
    const mobileNumber = req.body?.mobile_number || "unknown";
    return `${req.ip}-${mobileNumber}`;
  },
  skip: (req, res) => {
    // Don't count failed requests in the limit
    return false;
  },
  handler: (req, res) => {
    res.status(429).json({
      code: "RATE_LIMIT_EXCEEDED",
      message:
        "Too many OTP requests from this IP/mobile. Please try again after 15 minutes.",
    });
  },
});

/**
 * Rate Limiter for OTP Resend Endpoint
 * Stricter limit to prevent abuse
 * Limit: 3 requests per 10 minutes per txnId
 */
export const resendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // 3 resend requests per window (matches logic anyway)
  message: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many OTP resend requests. Please try again after 10 minutes.",
  },
  standardHeaders: false,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Rate limit by txnId
    const txnId = req.body?.txnId || "unknown";
    return `resend-${txnId}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      code: "RATE_LIMIT_EXCEEDED",
      message:
        "Too many OTP resend requests. Please try again after 10 minutes.",
    });
  },
});

/**
 * Rate Limiter for OTP Verification Endpoint
 * Multiple attempts are allowed (3 by logic)
 * But apply global limit to prevent brute force
 * Limit: 10 requests per 5 minutes per IP
 */
export const verifyOtpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 verification attempts per window per IP
  message: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many OTP verification attempts. Please try again later.",
  },
  standardHeaders: false,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // Rate limit by txnId for more granular control
    const txnId = req.body?.txnId || req.ip;
    return `verify-${txnId}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      code: "RATE_LIMIT_EXCEEDED",
      message:
        "Too many OTP verification attempts. Please try again after 5 minutes.",
    });
  },
});

/**
 * Global API Rate Limiter
 * Applied to all requests for general protection
 * Limit: 1000 requests per 15 minutes per IP
 */
export const apiGlobalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests, please try again later.",
  standardHeaders: false,
  legacyHeaders: false,
});
