const admin = {
  ADMIN00000: {
    errorCode: "ADMIN00000",
    errorMessage: "Internal Server Error",
  },
  ADMIN00001: {
    errorCode: "ADMIN00001",
    errorMessage: "Profile Picture Required!",
  },
  ADMIN00002: {
    errorCode: "ADMIN00002",
    errorMessage:
      "Invalid Profile Picture Format, Use File format of either JPEG or PNG!",
  },
  ADMIN00003: {
    errorCode: "ADMIN00003",
    errorMessage:
      "Maximum Upload Size Limit Exceeded for Profile Picture, Please upload it of size less than equal to 5MB!",
  },
  ADMIN00004: {
    errorCode: "ADMIN00004",
    errorMessage: "Invalid First Name length, It must be within 3 and 20",
  },
  ADMIN00005: {
    errorCode: "ADMIN00005",
    errorMessage: "Invalid Last Name length, It must be within 3 and 20",
  },
};

const user = {
  USER00000: {
    errorCode: "USER00000",
    errorMessage: "Internal Server Error",
  },
  USER00001: {
    errorCode: "USER00001",
    errorMessage: "User with this mobile number already exists",
  },
  USER00002: {
    errorCode: "USER00002",
    errorMessage: "Invalid Mobile Number",
  },
};

export { admin, user };
