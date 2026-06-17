import { body } from "express-validator";

export const registerValidator = [
  body("name").isString().trim().isLength({ min: 2, max: 120 }),
  body("email").isEmail().normalizeEmail(),
  body("password")
    .isString()
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage("Password must include a letter and a number.")
];

export const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 8, max: 128 })
];
