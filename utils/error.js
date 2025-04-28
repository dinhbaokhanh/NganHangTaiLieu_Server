class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

const TryCatch = (passedFunc) => async (req, res, next) => {
  try {
    await passedFunc(req, res, next)
  } catch (error) {
    next(error)
  }
}

export { ErrorHandler, TryCatch }
