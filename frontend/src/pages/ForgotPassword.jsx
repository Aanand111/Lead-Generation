import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, Smartphone, Lock } from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Phone, 2: OTP & Password
    const [formData, setFormData] = useState({
        phone: '',
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            if (formData.phone.length >= 10) {
                setSuccess('OTP sent successfully to your phone number.');
                setStep(2);
            } else {
                setError('Please enter a valid phone number.');
            }
        }, 1500);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setSuccess('Password reset successfully. Redirecting to login...');
            setTimeout(() => navigate('/'), 2000);
        }, 1500);
    };

    return (
        <div className="login-container">
            <div className="login-left">
                 <div className="auth-illustration-wrapper">
                    <img
                        src="https://api.dicebear.com/7.x/shapes/svg?seed=forgot&backgroundColor=f7f9fc"
                        alt="Forgot Password"
                        className="auth-illustration-img"
                    />
                </div>
            </div>
            <div className="login-right">
                <div className="auth-form-wrapper-noscroll">
                    <div className="login-logo">
                        <div className="auth-brand-ring">
                            <KeyRound size={32} color="#556ee6" />
                        </div>
                        <div className="login-header mb-20">
                            <h2>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h2>
                            <p>{step === 1 ? 'Enter your phone number to receive OTP.' : 'Enter OTP and new password.'}</p>
                        </div>
                    </div>
                    {error && <div className="auth-alert-danger">{error}</div>}
                    {success && <div className="auth-alert-success">{success}</div>}

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP}>
                            <div className="form-group mb-20">
                                <label className="form-label">Phone Number <span>*</span></label>
                                <div className="password-input-wrapper">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                    <span className="auth-input-icon">
                                        <Smartphone size={18} />
                                    </span>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <div className="form-group mb-15">
                                <label className="form-label">OTP <span>*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter OTP"
                                    value={formData.otp}
                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group mb-15">
                                <label className="form-label">New Password <span>*</span></label>
                                <div className="password-input-wrapper">
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="New Password"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        required
                                    />
                                    <span className="auth-input-icon">
                                        <Lock size={18} />
                                    </span>
                                </div>
                            </div>
                            <div className="form-group mb-20">
                                <label className="form-label">Confirm Password <span>*</span></label>
                                <div className="password-input-wrapper">
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                    <span className="auth-input-icon">
                                        <Lock size={18} />
                                    </span>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-20">
                        <Link to="/" className="auth-back-link">
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
