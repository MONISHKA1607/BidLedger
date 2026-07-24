import { body, param, validationResult } from "express-validator";

/**
 * Runs after a chain of express-validator checks. Collects every failed
 * rule into a single 400 response instead of letting bad input reach a
 * controller. Kept as one shared gate so every route reports errors the
 * same shape: { message, errors: [{ field, message }] }.
 */
export const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  const err = new Error(errors[0]?.message || "Invalid request");
  err.statusCode = 400;
  err.errors = errors;
  return next(err);
};

const objectIdParam = (name = "id") =>
  param(name).isMongoId().withMessage(`${name} must be a valid id`);

export const registerValidation = [
  body("userName")
    .trim()
    .isLength({ min: 3, max: 40 })
    .withMessage("Username must be 3-40 characters"),
  body("email").trim().isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),
  body("role")
    .isIn(["Auctioneer", "Bidder"])
    .withMessage("Role must be Auctioneer or Bidder"),
  validateRequest,
];

export const loginValidation = [
  body("email").trim().isEmail().withMessage("Enter a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validateRequest,
];

export const createAuctionValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("Title must be 3-120 characters"),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Description is too long"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("condition")
    .isIn(["New", "Used"])
    .withMessage("Condition must be New or Used"),
  body("startingBid")
    .isFloat({ gt: 0 })
    .withMessage("Starting bid must be a positive number"),
  body("minimumBidIncrement")
    .optional({ checkFalsy: true })
    .isFloat({ gt: 0 })
    .withMessage("Minimum bid increment must be a positive number"),
  body("startTime").isISO8601().withMessage("Start time must be a valid date"),
  body("endTime")
    .isISO8601()
    .withMessage("End time must be a valid date")
    .custom((endTime, { req }) => {
      if (req.body.startTime && new Date(endTime) <= new Date(req.body.startTime)) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),
  validateRequest,
];

export const placeBidValidation = [
  objectIdParam("id"),
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Bid amount must be a positive number"),
  validateRequest,
];

export const autoBidValidation = [
  objectIdParam("id"),
  body("maxAmount")
    .isFloat({ gt: 0 })
    .withMessage("Max auto-bid amount must be a positive number"),
  validateRequest,
];
