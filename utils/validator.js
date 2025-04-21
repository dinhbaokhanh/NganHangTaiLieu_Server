import { ErrorHandler } from './error.js'
import { body, validationResult, param } from 'express-validator'

const validateHandler = (req, res, next) => {
  const errors = validationResult(req)

  const errorMessages = errors
    .array()
    .map((error) => error.msg)
    .join(', ')

  if (errors.isEmpty()) return next()
  else next(new ErrorHandler(errorMessages, 400))
}

const registerValidator = () => [
  body('email', 'Please Enter Email').notEmpty(),
  body('username', 'Please Enter Username').notEmpty(),
  body('password', 'Please Enter Password').notEmpty(),
]

const loginValidator = () => [
  body('username', 'Please Enter Username').notEmpty(),
  body('password', 'Please Enter Password').notEmpty(),
]

export { validateHandler, registerValidator, loginValidator }
