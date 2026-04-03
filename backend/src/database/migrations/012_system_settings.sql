-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'text', -- text, number, boolean, json
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings based on BRD Section 1.9
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
    -- Referral Settings
    ('referral_user_credit_reward', '100', 'number', 'Credits awarded to a user when their referred user purchases a package'),
    ('referral_vendor_commission_rate', '5', 'number', 'Commission percentage (%) earned by vendor on direct referral purchases'),
    ('referral_enabled', 'true', 'boolean', 'Enable or disable the referral system globally'),
    
    -- Lead Settings  
    ('lead_expiry_days', '30', 'number', 'Number of days before unused leads or credits expire'),
    ('max_leads_per_package', '500', 'number', 'Maximum number of leads that can be included in a single package'),
    
    -- Poster Settings
    ('free_posters_per_day', '1', 'number', 'Number of free posters a user can create per day'),
    ('poster_credit_cost', '10', 'number', 'Credits required to create an additional poster beyond free limit'),
    
    -- OTP / SMS Settings
    ('otp_expiry_minutes', '5', 'number', 'OTP validity duration in minutes'),
    ('otp_max_attempts', '3', 'number', 'Maximum OTP verification attempts before lockout'),
    ('sms_provider', 'MSG91', 'text', 'SMS service provider name (e.g. MSG91, Twilio)'),
    ('sms_api_key', '', 'text', 'API key for SMS/OTP service provider'),
    ('sms_sender_id', '', 'text', 'Sender ID displayed on OTP SMS messages'),
    
    -- Payment Settings
    ('payment_gateway', 'Razorpay', 'text', 'Active payment gateway provider'),
    ('payment_key_id', '', 'text', 'Payment gateway Key ID / Merchant ID'),
    ('payment_key_secret', '', 'text', 'Payment gateway Key Secret (stored masked)'),
    ('payment_currency', 'INR', 'text', 'Default transaction currency code'),
    ('payment_test_mode', 'true', 'boolean', 'Enable test/sandbox mode for payment gateway'),
    
    -- Platform Settings
    ('platform_name', 'Lead Generation App', 'text', 'Name of the platform displayed across the app'),
    ('support_email', '', 'text', 'Admin support email address shown to users'),
    ('support_phone', '', 'text', 'Support contact number displayed in app'),
    ('min_withdrawal_amount', '500', 'number', 'Minimum payout amount vendors can request (in INR)'),
    ('commission_payout_cycle', '30', 'number', 'Commission payout cycle in days'),

    -- App Store Settings
    ('android_app_link', '', 'text', 'Google Play Store link for the user app'),
    ('ios_app_link', '', 'text', 'Apple App Store link for the user app'),
    ('app_version', '1.0.0', 'text', 'Current live app version number'),
    ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode to restrict user access')
ON CONFLICT (setting_key) DO NOTHING;
