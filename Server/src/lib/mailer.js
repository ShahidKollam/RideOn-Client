import transporter from '../config/mail.js'
import { config } from '../config/env.js'

export const sendMagicLink = async (email, token) => {
    const magicLink = `${config.frontendUrl}/auth/verify-login-link?token=${token}`
    console.log("magicLink:", magicLink);
     

    await transporter.sendMail({
        from: config.mailFrom,
        to: email,
        subject: 'Login to RideOn',
        html: `
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

<table role="presentation"
       cellpadding="0"
       cellspacing="0"
       border="0"
       width="600"
       style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">

<tr>
<td align="center" style="padding:45px 30px 20px;">

<img
src="https://rideon.in/logo.png"
alt="RideOn"
width="150"
style="display:block;border:0;outline:none;text-decoration:none;">

</td>
</tr>

<tr>
<td align="center" style="padding:0 35px;">

<h1 style="
margin:0;
font-size:34px;
line-height:42px;
color:#0f172a;
font-weight:700;
">
Welcome to Ride<span style="color:#2563eb;">On</span> 👋
</h1>

</td>
</tr>

<tr>
<td align="center" style="padding:20px 40px 10px;">

<p style="
margin:0;
font-size:17px;
line-height:28px;
color:#475569;
">
Click the button below to securely sign in to your RideOn account.
</p>

</td>
</tr>

<tr>
<td align="center" style="padding:35px;">

<a href="${magicLink}"
style="
display:inline-block;
background:#2563eb;
color:#ffffff;
text-decoration:none;
font-size:18px;
font-weight:700;
padding:16px 40px;
border-radius:10px;
">
Click Here to Login →
</a>

</td>
</tr>

<tr>
<td align="center">

<p style="
margin:0;
font-size:16px;
color:#64748b;
">
This magic link expires in
<strong style="color:#22c55e;">15 minutes</strong>.
</p>

</td>
</tr>

<tr>
<td style="padding:35px;">

<table
role="presentation"
width="100%"
cellpadding="0"
cellspacing="0"
border="0"
style="
background:#f8fafc;
border-radius:12px;
">

<tr>

<td style="padding:20px;">

<p style="
margin:0;
font-size:17px;
font-weight:700;
color:#0f172a;
">
🔒 Secure Login
</p>


</td>

</tr>

</table>

<p style="font-size:14px;color:#64748b;">
If the button doesn't work, copy and paste this link into your browser:
</p>

<p style="word-break:break-all;">
<a href="${magicLink}" style="color:#2563eb;">
${magicLink}
</a>
</p>

</td>
</tr>

<tr>

<td style="padding:0 35px 20px;">

<hr style="
border:none;
border-top:1px solid #e2e8f0;
">

</td>

</tr>

<tr>

<td align="center" style="padding:0 35px;">

<p style="
margin:0;
font-size:15px;
line-height:24px;
color:#64748b;
">

If you didn't request this email, you can safely ignore it.

</p>

</td>

</tr>

<tr>

<td align="center" style="padding:25px 35px 40px;">

<p style="
margin:0;
font-size:14px;
line-height:24px;
color:#94a3b8;
">

Need help?<br>

<a
href="mailto:support@rideon.in"
style="
color:#2563eb;
text-decoration:none;
">
support@rideon.in
</a>

</p>

<p style="
margin:25px 0 0;
font-size:13px;
color:#94a3b8;
">

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
`,
    })
}
