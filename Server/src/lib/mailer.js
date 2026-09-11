import { sendEmail } from '../config/brevo.js'
import { config } from '../config/env.js'
import ApiError from '../utils/ApiError.js'

const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

const formatDateTime = (value) =>
    new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'long',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata',
    }).format(new Date(value))

const currency = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const sendBookingConfirmationEmail = async ({ booking, payment }) => {
    const user = booking?.user
    if (!user?.email) return { skipped: true, reason: 'Booking customer has no email' }

    const bookingNumber = escapeHtml(booking.bookingNumber)
    const bikeName = escapeHtml(booking.bike?.name || 'Campus bike')
    const registrationNumber = escapeHtml(booking.bike?.registrationNumber || '—')
    const campusName = escapeHtml(booking.campus?.name || '—')
    const packageName = escapeHtml(booking.pricing?.packageName || `${booking.durationHours} Hour Ride`)
    const customerName = escapeHtml(user.name || 'there')
    const pickup = formatDateTime(booking.pickupAt)
    const returnTime = formatDateTime(booking.returnAt)
    const includedKm = booking.includedKm ?? 0
    const amount = currency(payment?.amount ?? booking.totalAmount)

    const row = (label, value) =>
        `<tr><td style="padding:11px 0;border-bottom:1px solid #e8eef8;color:#667085;font-size:14px;">${label}</td><td align="right" style="padding:11px 0;border-bottom:1px solid #e8eef8;color:#14213d;font-size:14px;font-weight:600;">${value}</td></tr>`
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Booking confirmed</title></head><body style="margin:0;background:#f4f7fc;font-family:Arial,Helvetica,sans-serif;color:#14213d;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px;"><tr><td align="center"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e3eaf6;"><tr><td style="padding:32px 36px;background:linear-gradient(135deg,#0a2b67,#1677d2);color:#ffffff;"><p style="margin:0 0 10px;font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#bfe0ff;">RideOn</p><h1 style="margin:0;font-size:28px;line-height:36px;">Your booking is confirmed</h1><p style="margin:12px 0 0;font-size:15px;line-height:23px;color:#e6f2ff;">Booking ${bookingNumber} · Payment received</p></td></tr><tr><td style="padding:32px 36px;"><p style="margin:0;font-size:16px;line-height:25px;">Hi ${customerName},</p><p style="margin:12px 0 24px;font-size:15px;line-height:24px;color:#5b6982;">Your RideOn booking has been confirmed successfully. Please arrive at the pickup location at the scheduled time.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dce7f8;border-radius:12px;padding:0 16px;"><tr><td colspan="2" style="padding:16px 0 7px;font-size:17px;font-weight:700;color:#14213d;">Booking details</td></tr>${row('Bike', bikeName)}${row('Registration no.', registrationNumber)}${row('Campus', campusName)}</table><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border:1px solid #dce7f8;border-radius:12px;padding:0 16px;"><tr><td colspan="2" style="padding:16px 0 7px;font-size:17px;font-weight:700;color:#14213d;">Pickup &amp; return</td></tr>${row('Pickup', escapeHtml(pickup))}${row('Return', escapeHtml(returnTime))}</table><div style="margin-top:20px;padding:16px;border-radius:10px;background:#fff8e9;border:1px solid #f8dfac;font-size:14px;line-height:22px;color:#7a5200;"><strong>Heads up:</strong> Returning the bike after the scheduled return time may result in applicable late charges.</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border:1px solid #dce7f8;border-radius:12px;padding:0 16px;"><tr><td colspan="2" style="padding:16px 0 7px;font-size:17px;font-weight:700;color:#14213d;">Included usage</td></tr>${row('Package', packageName)}${row('Included distance', `${includedKm} km`)}</table><p style="margin:18px 0 0;font-size:14px;line-height:22px;color:#5b6982;">Distance beyond the included kilometres is charged at the applicable extra KM rate.</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:#effaf3;border:1px solid #bce7c8;border-radius:12px;padding:0 16px;"><tr><td colspan="2" style="padding:16px 0 7px;font-size:17px;font-weight:700;color:#14213d;">Payment</td></tr>${row('Booking amount', amount)}${row('Payment status', '<span style="color:#16803a;">PAID</span>')}</table><p style="margin:24px 0 0;font-size:14px;line-height:22px;color:#5b6982;">Please carry your required driving licence or ID when collecting the bike. Extra KM charges and any applicable late charges are calculated when the bike is returned.</p><p style="margin:24px 0 0;font-size:15px;font-weight:700;">Thank you for choosing RideOn 🏍️<br><span style="font-size:13px;font-weight:400;color:#667085;">RideOn Team</span></p></td></tr><tr><td align="center" style="padding:20px 36px;background:#f8faff;color:#98a2b3;font-size:12px;">© ${new Date().getFullYear()} RideOn. All rights reserved.</td></tr></table></td></tr></table></body></html>`
    await sendEmail({ to: user.email, subject: `RideOn Booking Confirmed — ${booking.bookingNumber}`, html })
    return { success: true }
}

export const sendMagicLink = async (email, token) => {
    try {
        const magicLink = `${config.clientUrl}/auth/verify-login-link?token=${token}`
        console.log('magicLink:', magicLink)

        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RideOn Login</title>
</head>
<body style="margin:0;padding:0;background:#f5f8fc;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f8fc;padding:40px 15px;">
<tr>
<td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
<tr>
<td align="center" style="padding:45px 30px 20px;">
<img src="https://rideon.in/logo.png" alt="RideOn" width="150" style="display:block;border:0;outline:none;text-decoration:none;">
</td>
</tr>
<tr>
<td align="center" style="padding:0 35px;">
<h1 style="margin:0;font-size:34px;line-height:42px;color:#0f172a;font-weight:700;">
Welcome to Ride<span style="color:#2563eb;">On</span> 👋
</h1>
</td>
</tr>
<tr>
<td align="center" style="padding:20px 40px 10px;">
<p style="margin:0;font-size:17px;line-height:28px;color:#475569;">
Click the button below to securely sign in to your RideOn account.
</p>
</td>
</tr>
<tr>
<td align="center" style="padding:35px;">
<a href="${magicLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:18px;font-weight:700;padding:16px 40px;border-radius:10px;">
Click Here to Login →
</a>
</td>
</tr>
<tr>
<td align="center">
<p style="margin:0;font-size:16px;color:#64748b;">
This magic link expires in <strong style="color:#22c55e;">15 minutes</strong>.
</p>
</td>
</tr>
<tr>
<td style="padding:35px;">
<p style="font-size:14px;color:#64748b;">
If the button doesn't work, copy and paste this link into your browser:
</p>
<p style="word-break:break-all;">
<a href="${magicLink}" style="color:#2563eb;">${magicLink}</a>
</p>
</td>
</tr>
<tr>
<td align="center" style="padding:25px 35px 40px;">
<p style="margin:0;font-size:14px;line-height:24px;color:#94a3b8;">
Need help?<br>
<a href="mailto:support@rideon.in" style="color:#2563eb;text-decoration:none;">support@rideon.in</a>
</p>
<p style="margin:25px 0 0;font-size:13px;color:#94a3b8;">
© ${new Date().getFullYear()} RideOn. All rights reserved.
</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`

        await sendEmail({ to: email, subject: 'Login to RideOn', html })

        return { success: true, message: 'Email sent' }
    } catch (error) {
        console.error('Error sending magic link:', error.message)
        throw new ApiError(500, `Failed to send magic link to ${email}: ${error.message}`)
    }
}
