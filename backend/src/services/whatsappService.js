const logger = require('../utils/logger');
const axios = require('axios');

class WhatsAppService {
    /**
     * Sends OTP via WhatsApp API.
     * Note: WhatsApp usually requires pre-approved templates.
     */
    async sendOTP(phone, otp) {
        try {
            const apiKey = process.env.WHATSAPP_API_KEY || process.env.MSG_CLUB_API_KEY;
            
            if (apiKey) {
                // Ensure phone has 10 digits or country code.
                const mobileNo = phone.toString().replace(/\D/g, ''); 
                const formattedMobile = mobileNo.length === 10 ? `91${mobileNo}` : mobileNo;
                
                // Fetch WhatsApp details from env
                const senderId = process.env.WHATSAPP_SENDER_ID || process.env.MSG_CLUB_SENDER_ID;
                const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME; // Approved template name
                
                // MSG Club WhatsApp Endpoint (Change if using different provider)
                const url = process.env.WHATSAPP_API_URL || 'http://msg.msgclub.net/rest/services/sendWhatsApp/sendGroupWhatsApp';
                
                const payload = {
                    AUTH_KEY: apiKey,
                    phone: formattedMobile,
                    senderId: senderId,
                    templateName: templateName,
                    // If using variables in template:
                    bodyVariables: [otp],
                    // Some APIs expect message string directly:
                    message: `Your OTP for verification is ${otp}`
                };

                logger.info(`[WHATSAPP] Sending OTP ${otp} to phone ${formattedMobile}`);
                
                // For most providers, this is a POST request
                const response = await axios.post(url, payload);
                
                logger.info(`[WHATSAPP SUCCESS]`, response.data);
                return { success: true, data: response.data };
            }

            // Fallback for local development
            logger.info(`[WHATSAPP MOCK] Sending OTP ${otp} to phone ${phone}`);
            return { success: true };
        } catch (error) {
            logger.error('[WHATSAPP SERVICE ERROR]', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new WhatsAppService();
