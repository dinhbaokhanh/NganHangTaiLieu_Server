import jwt from 'jsonwebtoken'

const createAccessToken = (user) => {
  console.log(user)

  return jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  })
}

const createRefreshToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role },
    process.env.REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

const sendToken = (res, user, code, message) => {
  const accessToken = createAccessToken(user)
  const refreshToken = createRefreshToken(user)

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  res.status(code).json({
    success: true,
    message,
    accessToken,
    user,
  })
}

export { sendToken, createAccessToken, createRefreshToken }
