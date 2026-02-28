import swaggerAutogen from "swagger-autogen";

const moduleName = process.env.MODULE || "nmbp-user-backend";
const port = process.env.PORT || 7004;
const apiBaseUrl = process.env.TS_APIS_BASE_URL || `localhost:${port}`;
const scheme = apiBaseUrl.includes("localhost") ? "http" : "https";
const doc = {
  info: {
    title: moduleName,
    description:
      "User service for NMBP application. Handles user registration, login OTP generation and verification. Integrates with SMS gateway for OTP delivery. Uses Redis for OTP storage and management. Designed for high performance and security.",
    version: "1.0.0",
  },
  basePath: "/",
  host: apiBaseUrl,
  schemes: [scheme],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [{ name: "Users", description: "User service health check" }],
  securityDefinitions: {
    Bearer: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "JWT token obtained from the Auth service login endpoint",
    },
  },
};

const outputFile = "./swagger.json";
const endpointsFiles = ["../startup/routes.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
