import { BrevoClient } from '@getbrevo/brevo'
import { config } from './env.js'

const brevo = new BrevoClient({
    apiKey: config.brevoApiKey,
})

export const sendEmail = async ({ to, subject, html }) => {
    const response = await brevo.transactionalEmails.sendTransacEmail({
        sender: {
            name: config.mailFromName,
            email: config.mailFromEmail,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
    })

    return response
}
