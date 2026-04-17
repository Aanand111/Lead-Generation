const mailService = require('./src/services/mailService');
require('dotenv').config();

async function testMail() {
    console.log('--- Testing Mail Service ---');
    console.log('SMTP_USER:', process.env.SMTP_USER);
    
    // Replace with your actual email to test
    const testEmail = process.env.SMTP_USER; 
    
    if (!testEmail || testEmail === 'aaanandjoshiii@gmail.com') {
        console.error('Error: Please configure SMTP_USER and SMTP_PASS in .env file before testing.');
        process.exit(1);
    }

    const result = await mailService.sendWelcomeEmail(testEmail, 'Test User');
    
    if (result.success) {
        console.log('Success! Test email sent.');
    } else {
        console.log('Failed to send test email:', result.error);
    }
}

testMail();
