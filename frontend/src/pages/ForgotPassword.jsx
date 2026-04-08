import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, Lock, CheckCircle, Eye, EyeOff, Hash } from 'lucide-react';
import axios from 'axios';
import InsureBg from '../assets/Insure.png';
import InsureeLogo from '../assets/insuree.png';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Password, 4: Done
    const [formData, setFormData] = useState({
        phone: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const { data } = await api.post('/auth/forgot-password', { phone: formData.phone });
            if (data.success) {
                setSuccess('Security code generated! Please check backend logs.');
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification signal failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (formData.otp.length === 6) {
            setStep(3);
            setError('');
            setSuccess('Identity verified. Initialize password reset.');
        } else {
            setError('Please enter the 6-digit verification signal.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Cryptographic mismatch: Passwords do not match.');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Security requirement: Password must be 6+ characters.');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/reset-password', {
                phone: formData.phone,
                otp: formData.otp,
                newPassword: formData.newPassword
            });

            if (data.success) {
                setStep(4);
                setSuccess('Security protocols updated successfully.');
                setTimeout(() => navigate('/'), 2500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Core update failed. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container auth-bg" style={{ '--auth-bg-image': `url(${InsureBg})` }}>
            <div className="auth-card">
                <div className="login-logo">
                    <div aria-hidden="true" className="auth-logo-center">
                        <img src={InsureeLogo} alt="Insuree Logo" className="auth-logo-img" />
                    </div>
                    <div className="auth-header mb-24">
                        <div className="auth-title">
                            {step === 1 && 'Account Recovery'}
                            {step === 2 && 'Signal Verification'}
                            {step === 3 && 'Core Reset'}
                            {step === 4 && 'Recovery Complete'}
                        </div>
                        <p className="auth-subtitle">
                            {step === 1 && 'Enter phone to receive verification signal.'}
                            {step === 2 && 'Enter the 6-digit cryptographic code.'}
                            {step === 3 && 'Update your system access credentials.'}
                            {step === 4 && 'Returning to login portal.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={step === 1 ? handleSendOTP : step === 2 ? handleVerifyOTP : handleResetPassword}>
                    {error && <div className="auth-alert-danger">{error}</div>}
                    {success && <div className="auth-alert-success">{success}</div>}

                    {/* Step 1: Phone */}
                    {step === 1 && (
                        <>
                            <div className="form-group text-left">
                                <label className="form-label font-bold-600">Mobile Number <span className="text-red">*</span></label>
                                <div className="password-input-wrapper">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="EX: 9876543210"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) {
                                                setFormData({ ...formData, phone: val });
                                            }
                                        }}
                                        maxLength="10"
                                        pattern="[0-9]{10}"
                                        required
                                    />
                                    <div className="password-toggle" style={{ cursor: 'default' }}>
                                        <Smartphone size={18} className="text-muted" />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block auth-btn-large" disabled={isLoading}>
                                {isLoading ? 'Transmitting...' : 'Request Code'}
                            </button>
                        </>
                    )}

                    {/* Step 2: OTP */}
                    {step === 2 && (
                        <>
                            <div className="form-group text-left mb-24">
                                <label className="form-label font-bold-600">Verification Code <span className="text-red">*</span></label>
                                <div className="password-input-wrapper">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="6-digit OTP"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                        maxLength={6}
                                        required
                                    />
                                    <div className="password-toggle" style={{ cursor: 'default' }}>
                                        <Hash size={18} className="text-muted" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex-right mb-20">
                                <button type="button" className="auth-link" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                    Back to Signal Request
                                </button>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block auth-btn-large">
                                Verify Signal
                            </button>
                        </>
                    )}

                    {/* Step 3: Password */}
                    {step === 3 && (
                        <>
                            <div className="form-group text-left">
                                <label className="form-label font-bold-600">New Access Key <span className="text-red">*</span></label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Min 6 characters"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        required
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group text-left mb-24">
                                <label className="form-label font-bold-600">Confirm Key <span className="text-red">*</span></label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Re-enter access key"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block auth-btn-large" disabled={isLoading}>
                                {isLoading ? 'Restructuring...' : 'Update Core Credentials'}
                            </button>
                        </>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <div className="text-center py-20">
                            <div className="flex-center mb-24" style={{ display: 'flex', justifyContent: 'center' }}>
                                <div style={{ background: 'rgba(5, 205, 153, 0.1)', padding: '20px', borderRadius: '50%' }}>
                                    <CheckCircle size={64} style={{ color: 'var(--success)' }} />
                                </div>
                            </div>
                            <p className="auth-subtitle mb-24">System updated. Synchronizing access...</p>
                        </div>
                    )}
                </form>

                <div className="auth-footer mt-24 text-center">
                    <Link to="/" className="auth-link flex-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <ArrowLeft size={16} /> Return to Portal
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
