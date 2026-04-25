import { constants } from "../constants.js";

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  if (err.name === "CastError") {
    return res.status(400).json({ title: "Invalid Id", message: "The requested resource id is invalid" });
  }

  if (err.code === 11000) {
    return res.status(400).json({ title: "Duplicate Value", message: "E-mail already registered" });
  }

  const payload = {
    message: err.message || "Something went wrong",
  };

  if (process.env.NODE_ENV !== "production") {
    payload.stackTrace = err.stack;
  }

  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.status(statusCode).json({ title: "Validation Failed", ...payload });
      break;
    case constants.NOT_FOUND:
      res.status(statusCode).json({ title: "Not Found", ...payload });
      break;
    case constants.FORBIDDEN:
      res.status(statusCode).json({ title: "Forbidden", ...payload });
      break;
    case constants.UNAUTHORIZED:
      res.status(statusCode).json({ title: "Not Authorised", ...payload });
      break;
    default:
      res.status(500).json({ title: "Server Error", ...payload });
      break;
  }
};

export default errorHandler; 
