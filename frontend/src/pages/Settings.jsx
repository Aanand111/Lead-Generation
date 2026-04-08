import React, { useState, useEffect, useCallback } from 'react';
import {
    Save,
    Settings as SettingsIcon,
    Users,
    Gift,
    CreditCard,
    MessageSquare,
    Globe,
    Shield,
    Smartphone,
    Zap,
    ToggleLeft,
    ToggleRight,
    ChevronRight,
    Activity,
    Eye,
    EyeOff,
    RefreshCcw,
    Layers,
    DollarSign,
    Bell,
    CheckCircle,
    Percent
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

// Define all settings sections based on BRD Section 1.9
const SETTINGS_CONFIG = [
    {
        id: 'referral',
        label: 'Referral Configuration',
        icon: Gift,
        color: 'emerald',
        description: 'Control referral rewards and commission structure for users and vendors',
        keys: [
            { key: 'referral_enabled', label: 'Enable Referral System', description: 'Toggle the global referral system on or off', type: 'boolean' },
            { key: 'referral_user_credit_reward', label: 'User Credit Reward', description: 'Credits awarded when a referred user purchases a package', type: 'number', suffix: 'Credits' },
            { key: 'referral_vendor_commission_rate', label: 'Vendor Commission Rate', description: 'Percentage earned by vendor on direct referral purchases', type: 'number', suffix: '%' },
        ]
    },
    {
        id: 'leads',
        label: 'Lead Management',
        icon: Layers,
        color: 'blue',
        description: 'Configure lead expiry, package limits, and acquisition parameters',
        keys: [
            { key: 'lead_expiry_days', label: 'Lead Expiry Duration', description: 'Days before unused leads or credits expire', type: 'number', suffix: 'Days' },
            { key: 'max_leads_per_package', label: 'Max Leads Per Package', description: 'Maximum number of leads allowed in a single package', type: 'number', suffix: 'Leads' },
        ]
    },
    {
        id: 'poster',
        label: 'Poster Creation',
        icon: Globe,
        color: 'violet',
        description: 'Manage poster creation limits, free allowances, and credit costs',
        keys: [
            { key: 'free_posters_per_day', label: 'Free Posters Per Day', description: 'Number of free posters each user can create daily', type: 'number', suffix: 'Posters' },
            { key: 'poster_credit_cost', label: 'Credit Cost Per Poster', description: 'Credits required to create an additional poster beyond free limit', type: 'number', suffix: 'Credits' },
        ]
    },
    {
        id: 'otp',
        label: 'OTP / SMS Gateway',
        icon: MessageSquare,
        color: 'orange',
        description: 'Configure SMS provider credentials for OTP-based authentication',
        keys: [
            { key: 'sms_provider', label: 'SMS Provider', description: 'Active SMS/OTP service provider name', type: 'text', placeholder: 'e.g., MSG91, Twilio' },
            { key: 'sms_sender_id', label: 'Sender ID', description: 'Sender ID displayed on OTP SMS messages', type: 'text', placeholder: 'e.g., LEADGN' },
            { key: 'sms_api_key', label: 'API Key', description: 'Authentication key for SMS service provider', type: 'secret', placeholder: 'Enter SMS API Key...' },
            { key: 'otp_expiry_minutes', label: 'OTP Expiry Duration', description: 'OTP validity window in minutes', type: 'number', suffix: 'Min' },
            { key: 'otp_max_attempts', label: 'Max OTP Attempts', description: 'Maximum verification attempts before user lockout', type: 'number', suffix: 'Attempts' },
        ]
    },
    {
        id: 'payment',
        label: 'Payment Gateway',
        icon: CreditCard,
        color: 'rose',
        description: 'Configure payment provider credentials and transaction settings',
        keys: [
            { key: 'payment_gateway', label: 'Payment Provider', description: 'Active payment gateway (e.g., Razorpay, Paytm)', type: 'text', placeholder: 'e.g., Razorpay' },
            { key: 'payment_currency', label: 'Currency Code', description: 'Default transaction currency', type: 'text', placeholder: 'e.g., INR' },
            { key: 'payment_test_mode', label: 'Test / Sandbox Mode', description: 'Enable to use test credentials without real charges', type: 'boolean' },
            { key: 'payment_key_id', label: 'Key ID / Merchant ID', description: 'Payment gateway API key or merchant identifier', type: 'text', placeholder: 'Enter Key ID...' },
            { key: 'payment_key_secret', label: 'Key Secret', description: 'Payment gateway secret (masked for security)', type: 'secret', placeholder: 'Enter Secret Key...' },
        ]
    },
    {
        id: 'platform',
        label: 'Platform & Support',
        icon: Shield,
        color: 'indigo',
        description: 'Global platform configuration, support contacts, and administrative settings',
        keys: [
            { key: 'platform_name', label: 'Platform Name', description: 'Application name displayed across all interfaces', type: 'text', placeholder: 'e.g., Lead Generation App' },
            { key: 'support_email', label: 'Support Email', description: 'Contact email shown to users in the app', type: 'text', placeholder: 'support@example.com' },
            { key: 'support_phone', label: 'Support Phone', description: 'Contact number displayed to users in the app', type: 'text', placeholder: '+91 XXXXX XXXXX' },
            { key: 'maintenance_mode', label: 'Maintenance Mode', description: 'Block user access during system maintenance', type: 'boolean' },
        ]
    },
    {
        id: 'commission',
        label: 'Commission & Payout',
        icon: DollarSign,
        color: 'amber',
        description: 'Define vendor payout rules, minimum withdrawal thresholds, and payout cycles',
        keys: [
            { key: 'min_withdrawal_amount', label: 'Minimum Withdrawal', description: 'Minimum payout amount vendors can request', type: 'number', suffix: '₹' },
            { key: 'commission_payout_cycle', label: 'Payout Cycle', description: 'Commission payout frequency in days', type: 'number', suffix: 'Days' },
        ]
    },
    {
        id: 'app',
        label: 'App Distribution',
        icon: Smartphone,
        color: 'cyan',
        description: 'Manage app store links, version tracking, and mobile app metadata',
        keys: [
            { key: 'app_version', label: 'App Version', description: 'Current live build version (for display purposes)', type: 'text', placeholder: 'e.g., 1.0.0' },
            { key: 'android_app_link', label: 'Android / Play Store Link', description: 'Google Play Store URL for the user application', type: 'text', placeholder: 'https://play.google.com/...' },
            { key: 'ios_app_link', label: 'iOS / App Store Link', description: 'Apple App Store URL for the user application', type: 'text', placeholder: 'https://apps.apple.com/...' },
        ]
    },
];

const colorMap = {
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', ring: 'ring-emerald-500/20', focus: 'focus:border-emerald-500' },
    blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-500',    border: 'border-blue-500/20',    ring: 'ring-blue-500/20',    focus: 'focus:border-blue-500' },
    violet:  { bg: 'bg-violet-500/10',  text: 'text-violet-500',  border: 'border-violet-500/20',  ring: 'ring-violet-500/20',  focus: 'focus:border-violet-500' },
    orange:  { bg: 'bg-orange-500/10',  text: 'text-orange-500',  border: 'border-orange-500/20',  ring: 'ring-orange-500/20',  focus: 'focus:border-orange-500' },
    rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-500',    border: 'border-rose-500/20',    ring: 'ring-rose-500/20',    focus: 'focus:border-rose-500' },
    indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-500',  border: 'border-indigo-500/20',  ring: 'ring-indigo-500/20',  focus: 'focus:border-indigo-500' },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-500',   border: 'border-amber-500/20',   ring: 'ring-amber-500/20',   focus: 'focus:border-amber-500' },
    cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-500',    border: 'border-cyan-500/20',    ring: 'ring-cyan-500/20',    focus: 'focus:border-cyan-500' },
};

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // section id being saved
    const [message, setMessage] = useState({ type: '', text: '' });
    const [revealedSecrets, setRevealedSecrets] = useState({});
    const [activeSection, setActiveSection] = useState('referral');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/settings');
            if (data.success) {
                const mapped = {};
                data.data.forEach(s => { mapped[s.setting_key] = s.setting_value; });
                setSettings(mapped);
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
            setMessage({ type: 'error', text: 'Failed to load settings from server.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = useCallback((key, value) => {
        if (key === 'support_phone') {
            const val = value.replace(/\D/g, '');
            if (val.length <= 10) setSettings(prev => ({ ...prev, [key]: val }));
        } else {
            setSettings(prev => ({ ...prev, [key]: value }));
        }
    }, []);

    const handleSaveSection = async (section) => {
        setSaving(section.id);
        setMessage({ type: '', text: '' });
        try {
            const settingsToUpdate = section.keys.map(({ key }) => ({
                setting_key: key,
                setting_value: settings[key] ?? ''
            }));

            const { data } = await api.put('/admin/settings', { settings: settingsToUpdate });
            if (data.success) {
                setMessage({ type: 'success', text: `${section.label} settings updated successfully.` });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save settings.' });
        } finally {
            setSaving(null);
        }
    };

    const toggleReveal = (key) => {
        setRevealedSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
                <div className="w-14 h-14 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)] animate-pulse">Loading settings...</span>
            </div>
        );
    }

    const activeConfig = SETTINGS_CONFIG.find(s => s.id === activeSection);

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3 font-black tracking-tight">
                        System Configuration
                        <SettingsIcon className="text-indigo-500 animate-spin animate-slow-spin" size={22} />
                    </h2>
                    <p className="text-sm opacity-60">Configure platform-wide parameters, integrations, and administrative controls based on BRD specifications</p>
                </div>
            </div>

            {/* Global Message */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-4 border animate-slide-up ${
                    message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                }`}>
                    <CheckCircle size={18} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            <div className="flex gap-8 mt-6 items-start">
                {/* Left Nav Sidebar */}
                <div className="w-64 shrink-0 space-y-1.5 sticky top-6">
                    <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-4 px-2">Configuration Modules</div>
                    {SETTINGS_CONFIG.map(section => {
                        const colors = colorMap[section.color];
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all cursor-pointer border group ${
                                    isActive
                                        ? `${colors.bg} ${colors.text} ${colors.border} shadow-sm font-black`
                                        : 'bg-transparent border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-color)] hover:text-[var(--text-dark)] font-bold'
                                }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isActive ? colors.bg : 'bg-[var(--bg-color)] group-hover:bg-[var(--surface-color)]'}`}>
                                    <Icon size={16} className={isActive ? colors.text : ''} />
                                </div>
                                <div>
                                    <div className="text-[11px] leading-none mb-0.5">{section.label}</div>
                                    <div className="text-[9px] opacity-50 uppercase tracking-widest">{section.keys.length} items</div>
                                </div>
                                {isActive && <ChevronRight size={14} className={`ml-auto ${colors.text}`} />}
                            </button>
                        );
                    })}
                </div>

                {/* Right Content Panel */}
                <div className="flex-1 min-w-0">
                    {activeConfig && (() => {
                        const colors = colorMap[activeConfig.color];
                        const Icon = activeConfig.icon;
                        return (
                            <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)]">
                                {/* Section Header */}
                                <div className="p-8 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-color)]/20">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center border ${colors.border} shadow-inner`}>
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-[var(--text-dark)] uppercase tracking-tight leading-none mb-1.5">{activeConfig.label}</h3>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60 italic max-w-[400px]">{activeConfig.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSaveSection(activeConfig)}
                                        disabled={saving === activeConfig.id}
                                        className={`flex items-center gap-3 px-7 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer text-white shadow-lg ${
                                            activeConfig.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                                            : activeConfig.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                            : activeConfig.color === 'rose' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                                            : activeConfig.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
                                            : activeConfig.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                                            : activeConfig.color === 'cyan' ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/20'
                                            : activeConfig.color === 'violet' ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20'
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                        }`}
                                    >
                                        {saving === activeConfig.id ? <RefreshCcw size={15} className="animate-spin" /> : <Save size={15} />}
                                        {saving === activeConfig.id ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>

                                {/* Settings Fields */}
                                <div className="p-8 space-y-6">
                                    {activeConfig.keys.map(fieldConfig => {
                                        const value = settings[fieldConfig.key] ?? '';
                                        const isBoolean = fieldConfig.type === 'boolean';
                                        const isSecret = fieldConfig.type === 'secret';
                                        const isNumber = fieldConfig.type === 'number';
                                        const isRevealed = revealedSecrets[fieldConfig.key];
                                        const boolValue = value === 'true' || value === true;

                                        return (
                                            <div key={fieldConfig.key} className={`p-6 rounded-3xl border ${colors.border} bg-[var(--bg-color)]/30 group hover:bg-[var(--bg-color)]/50 transition-all`}>
                                                <div className="flex items-start justify-between gap-8">
                                                    <div className="space-y-1 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <label className="text-[11px] font-black text-[var(--text-dark)] uppercase tracking-widest">{fieldConfig.label}</label>
                                                            {isBoolean && (
                                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${boolValue ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                                    {boolValue ? 'Active' : 'Inactive'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-50 italic leading-relaxed">{fieldConfig.description}</p>
                                                    </div>

                                                    {/* Input Control */}
                                                    <div className="shrink-0 min-w-[220px]">
                                                        {isBoolean ? (
                                                            <div
                                                                className="flex items-center gap-3 cursor-pointer group"
                                                                onClick={() => handleChange(fieldConfig.key, String(!boolValue))}
                                                            >
                                                                <div className={`w-14 h-7 rounded-full relative transition-all duration-300 shadow-inner ${boolValue ? 'bg-indigo-600' : 'bg-[var(--border-color)]'}`}>
                                                                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md ${boolValue ? 'translate-x-7' : ''}`}></div>
                                                                </div>
                                                                <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${boolValue ? colors.text : 'text-[var(--text-muted)] opacity-40'}`}>
                                                                    {boolValue ? 'Enabled' : 'Disabled'}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="relative flex items-center">
                                                                <input
                                                                    type={isSecret && !isRevealed ? 'password' : isNumber ? 'number' : 'text'}
                                                                    value={value}
                                                                    onChange={e => handleChange(fieldConfig.key, e.target.value)}
                                                                    placeholder={fieldConfig.placeholder || '—'}
                                                                    className={`w-full px-5 py-3.5 rounded-2xl bg-[var(--surface-color)] border border-[var(--border-color)] ${colors.focus} outline-none transition-all text-[12px] font-bold text-[var(--text-dark)] uppercase tracking-tight shadow-sm placeholder:uppercase placeholder:text-[var(--text-muted)]/30 ${isSecret ? 'pr-12' : ''} ${fieldConfig.suffix ? 'pr-16' : ''}`}
                                                                />
                                                                {isSecret && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleReveal(fieldConfig.key)}
                                                                        className="absolute right-4 text-[var(--text-muted)] hover:text-indigo-500 transition-colors cursor-pointer border-none bg-transparent"
                                                                    >
                                                                        {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                    </button>
                                                                )}
                                                                {fieldConfig.suffix && !isSecret && (
                                                                    <span className={`absolute right-4 text-[10px] font-black uppercase tracking-widest ${colors.text} opacity-60`}>
                                                                        {fieldConfig.suffix}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Footer Save / Action Bar */}
                                <div className="px-8 pb-8">
                                    <div className={`p-5 rounded-3xl ${colors.bg} border ${colors.border} flex items-center justify-between gap-6`}>
                                        <div className="flex items-center gap-3">
                                            <Activity size={16} className={`${colors.text} animate-pulse`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] italic opacity-60">
                                                {activeConfig.keys.length} parameters configured in this module
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {activeSection === 'commission' && (
                                                <button 
                                                    onClick={() => navigate('/settings/commissions')}
                                                    className="flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest text-indigo-500 hover:bg-indigo-500/10 transition-all border border-indigo-500/20"
                                                >
                                                    <Percent size={14} /> Individual Vendor Rates
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleSaveSection(activeConfig)}
                                                disabled={saving === activeConfig.id}
                                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer text-white shadow-lg ${
                                                    activeConfig.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                                                    : activeConfig.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                                                    : activeConfig.color === 'rose' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                                                    : activeConfig.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
                                                    : activeConfig.color === 'amber' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                                                    : activeConfig.color === 'cyan' ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/20'
                                                    : activeConfig.color === 'violet' ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/20'
                                                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                                                }`}
                                            >
                                                {saving === activeConfig.id ? <RefreshCcw size={13} className="animate-spin" /> : <Save size={13} />}
                                                {saving === activeConfig.id ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

export default Settings;
