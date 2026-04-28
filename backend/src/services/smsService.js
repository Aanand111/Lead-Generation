const logger = require('../utils/logger');

class SMSService {
    /**
     * Sends OTP via SMS.
     * In a production environment, this would call MSG91 or Twilio APIs.
     * For now, it logs to a dedicated secure log file.
     */
    async sendOTP(phone, otp) {
        try {
            // Production: 
            // if (process.env.MSG91_API_KEY) {
            //    return await this._sendViaMSG91(phone, otp);
            // }

            // Development/Mock:
            logger.info(`[SMS MOCK] Sending OTP ${otp} to phone ${phone}`);
            
            // In a real project, we would hit an external API here.
            return { success: true };
        } catch (error) {
            logger.error('[SMS SERVICE ERROR]', error.message);
            return { success: false, error: error.message };
        }
    }

    async _sendViaMSG91(phone, otp) {
        // Implementation for MSG91
        // const response = await axios.post('https://api.msg91.com/api/v5/otp', { ... });
    }
}

module.exports = new SMSService();
