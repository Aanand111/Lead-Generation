const logger = require('../utils/logger');
const axios = require('axios');

class SMSService {
    /**
     * Sends OTP via MSG Club SMS API.
     */
    async sendOTP(phone, otp) {
        try {
            const apiKey = process.env.MSG_CLUB_API_KEY;
            
            if (apiKey) {
                // Ensure phone has 10 digits or country code. MSG Club usually expects 10 digits or 91...
                const mobileNo = phone.toString().replace(/\D/g, '').slice(-10); 
                
                // Fetch DLT details from env
                const senderId = process.env.MSG_CLUB_SENDER_ID || 'MSGCLB';
                const routeId = process.env.MSG_CLUB_ROUTE_ID || '1'; // Defaulting to 1, but 8 or 18 is recommended for OTP
                const peId = process.env.MSG_CLUB_PE_ID;
                const templateId = process.env.MSG_CLUB_TEMPLATE_ID;

                // Message MUST match your DLT approved template exactly
                const message = process.env.MSG_CLUB_OTP_TEMPLATE 
                    ? process.env.MSG_CLUB_OTP_TEMPLATE.replace('{#var#}', otp)
                    : `Dear User, Your OTP for login/verification is ${otp}. Please do not share this with anyone.`;
                
                const url = 'http://msg.msgclub.net/rest/services/sendSMS/sendGroupSms';
                const params = {
                    AUTH_KEY: apiKey,
                    message: message,
                    senderId: senderId,
                    routeId: routeId,
                    mobileNos: mobileNo,
                    smsContentType: 'english'
                };

                // Add DLT parameters if available
                if (peId) params.entityId = peId;
                if (templateId) params.templateId = templateId;

                logger.info(`[SMS MSG_CLUB] Sending OTP ${otp} to phone ${mobileNo}`);
                const response = await axios.get(url, { params });
                
                logger.info(`[SMS MSG_CLUB SUCCESS]`, response.data);
                return { success: true, data: response.data };
            }

            // Fallback for local development if key is missing
            logger.info(`[SMS MOCK] Sending OTP ${otp} to phone ${phone}`);
            return { success: true };
        } catch (error) {
            logger.error('[SMS SERVICE ERROR]', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new SMSService();
