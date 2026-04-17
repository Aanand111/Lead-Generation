const nodemailer = require('nodemailer');
require('dotenv').config();

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER, // your email username
                pass: process.env.SMTP_PASS, // your email password or app-specific password
            },
            tls: {
                rejectUnauthorized: false // Helps in local development environments
            }



        });
    }

    /**
     * sendEmail: Generic function to send an email
     * @param {string} to - Recipient email address
     * @param {string} subject - Email subject
     * @param {string} text - Plain text body
     * @param {string} html - HTML body (optional)
     */
    async sendEmail(to, subject, text, html = null) {
        try {
            const mailOptions = {
                from: `"Lead Generation App" <${process.env.SMTP_USER}>`,
                to,
                subject,
                text,
                html: html || text,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('[MAIL SERVICE] Message sent: %s', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('[MAIL SERVICE ERROR]', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * sendWelcomeEmail: Example usage
     */
    async sendWelcomeEmail(to, name) {
        const subject = 'Welcome to Lead Generation App!';
        const text = `Hi ${name},\n\nWelcome to our platform. We are excited to have you on board.`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4A90E2;">Welcome to Lead Generation App!</h2>
                <p>Hi <strong>${name}</strong>,</p>
                <p>Welcome to our platform. We are excited to have you on board.</p>
                <p>Start managing your leads efficiently with our state-of-the-art tools.</p>
                <br>
                <p>Best Regards,<br>The LeadGen Team</p>
            </div>
        `;
        return this.sendEmail(to, subject, text, html);
    }
}

module.exports = new MailService();
