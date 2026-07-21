import BrevoPkg from '@getbrevo/brevo'
import { config } from './env.js'

const { TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } = BrevoPkg

const apiInstance = new TransactionalEmailsApi()
apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)

export const sendEmail = async ({ to, subject, html }) => {
    const emailData = new SendSmtpEmail()

    emailData.sender = {
        name: config.mailFromName,
        email: config.mailFromEmail,
    }
    emailData.to = [{ email: to }]
    emailData.subject = subject
    emailData.htmlContent = html

    const response = await apiInstance.sendTransacEmail(emailData)
    return response.body
}
 