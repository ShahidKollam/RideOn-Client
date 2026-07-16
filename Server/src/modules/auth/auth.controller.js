import asyncHandler from '../../utils/asyncHandler.js'
import ApiResponse from '../../utils/ApiResponse.js'
import {
    signup,
    sendMagicLinkService,
    verifyMagicLinkService,
    refreshTokenService,
    completeProfile,
    adminLogin,
    logout,
    logoutAll,
} from './auth.service.js'

export const signupController = asyncHandler(async (req, res) => {
    const user = await signup(req.body)
    res.status(201).json(new ApiResponse(201, 'User registered. Magic link sent.', user))
})

export const sendMagicLinkController = asyncHandler(async (req, res) => {
    const result = await sendMagicLinkService(req.body.email)
    
    res.json(new ApiResponse(200, 'Magic link sent', result))
})

export const verifyMagicLinkController = asyncHandler(async (req, res) => {
    const { accessToken, refreshToken, user } = await verifyMagicLinkService(req.body.token)

    // Set HttpOnly Secure Refresh Cookie
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json(new ApiResponse(200, 'Login successful', { accessToken, user }))
})

export const completeProfileController = asyncHandler(async (req, res) => {
    const user = await completeProfile(req.user.id, req.body)
    res.json(new ApiResponse(200, 'Profile completed successfully', user))
})

export const refreshTokenController = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) throw new ApiError(401, 'No refresh token')

    const { accessToken, refreshToken: newRefreshToken, user } = await refreshTokenService(refreshToken)

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json(new ApiResponse(200, 'Token refreshed', { accessToken, user }))
})

export const logoutController = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (refreshToken) {
        await logout(refreshToken)
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    })

    res.json(new ApiResponse(200, 'Logged out successfully'))
})

export const logoutAllController = asyncHandler(async (req, res) => {
    await logoutAll(req.user.id)

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    })

    res.json(new ApiResponse(200, 'Logged out from all devices'))
})
