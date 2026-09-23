import asyncHandler from '../../../utils/asyncHandler.js'
import ApiResponse from '../../../utils/ApiResponse.js'
import {
  adminLogin,
  getAdminMe,
  adminRefresh,
  adminLogout,
} from './auth.admin.service.js'

const REFRESH_COOKIE = 'adminRefreshToken'

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
})

const clearCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
})

export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const result = await adminLogin(email, password, {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions())

  // Do not send refreshToken in JSON body
  res.status(200).json(
    new ApiResponse(200, 'Login successful', {
      accessToken: result.accessToken,
      admin: result.admin,
    })
  )
})

export const refreshController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE]
  const result = await adminRefresh(refreshToken, {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.cookie(REFRESH_COOKIE, result.refreshToken, cookieOptions())

  res.status(200).json(
    new ApiResponse(200, 'Token refreshed', {
      accessToken: result.accessToken,
      admin: result.admin,
    })
  )
})

export const meController = asyncHandler(async (req, res) => {
  const admin = await getAdminMe(req.admin.id)
  res.status(200).json(new ApiResponse(200, 'Admin profile retrieved', admin))
})

export const logoutController = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE]
  await adminLogout(refreshToken, req.admin?.id, {
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.clearCookie(REFRESH_COOKIE, clearCookieOptions())
  res.status(200).json(new ApiResponse(200, 'Logged out successfully', null))
})
