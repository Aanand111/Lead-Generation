const logger = require('../utils/logger');
const axios = require('axios');

class WhatsAppService {
    /**
     * Sends OTP via WhatsApp API.
     * Supports Meta Cloud API and MSG Club.
     */
    async sendOTP(phone, otp) {
        try {
            const provider = process.env.WHATSAPP_PROVIDER || 'MSG_CLUB';
            
            // Basic cleanup: remove non-digits
            const mobileNo = phone.toString().replace(/\D/g, ''); 
            // Most APIs expect country code. Default to 91 for India if not present.
            const formattedMobile = (mobileNo.length === 10) ? `91${mobileNo}` : mobileNo;

            if (provider === 'META') {
                return await this.sendMetaWhatsApp(formattedMobile, otp);
            } else {
                return await this.sendMsgClubWhatsApp(formattedMobile, otp);
            }
        } catch (error) {
            logger.error('[WHATSAPP SERVICE ERROR]', error.message);
            return { success: false, error: error.message };
        }
    }

    async sendMetaWhatsApp(to, otp) {
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME || 'otp_verification';

        if (!accessToken || !phoneId) {
            logger.warn('[WHATSAPP META] Configuration missing. Falling back to Mock.');
            return { success: true, mock: true };
        }

        const url = `https://graph.facebook.com/v17.0/${phoneId}/messages`;
        const payload = {
            messaging_product: "whatsapp",
            to: to,
            type: "template",
            template: {
                name: templateName,
                language: { code: "en_US" },
                components: [
                    {
                        type: "body",
                        parameters: [
                            { type: "text", text: otp }
                        ]
                    }
                ]
            }
        };

        logger.info(`[WHATSAPP META] Sending OTP ${otp} to ${to}`);
        const response = await axios.post(url, payload, {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
        });

        return { success: true, data: response.data };
    }

    async sendMsgClubWhatsApp(to, otp) {
        const apiKey = process.env.WHATSAPP_API_KEY || process.env.MSG_CLUB_API_KEY;
        if (!apiKey) {
            logger.info(`[WHATSAPP MOCK] No API Key. OTP: ${otp} to ${to}`);
            return { success: true, mock: true };
        }

        const senderId = process.env.WHATSAPP_SENDER_ID || process.env.MSG_CLUB_SENDER_ID;
        const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME;
        const url = process.env.WHATSAPP_API_URL || 'http://msg.msgclub.net/rest/services/sendWhatsApp/sendGroupWhatsApp';

        const payload = {
            AUTH_KEY: apiKey,
            phone: to,
            senderId: senderId,
            templateName: templateName,
            bodyVariables: [otp],
            message: `Your OTP for verification is ${otp}`
        };

        logger.info(`[WHATSAPP MSGCLUB] Sending OTP to ${to}`);
        const response = await axios.post(url, payload);
        return { success: true, data: response.data };
    }
}

module.exports = new WhatsAppService();
