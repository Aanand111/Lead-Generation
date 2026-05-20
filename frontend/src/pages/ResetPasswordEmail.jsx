import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import InsureBg from '../assets/Insure.png';
import InsureeLogo from '../assets/insuree.png';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ResetPasswordEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Form, 2: Done
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!token) {
            setError('Cryptographic signature missing: Token is invalid or expired.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Cryptographic mismatch: Passwords do not match.');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Security requirement: Password must be at least 6 characters.');
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await api.post('/auth/reset-password-confirm', {
                token,
                newPassword: formData.newPassword
            });

            if (data.success) {
                setStep(2);
                setSuccess('Security protocols successfully updated.');
                toast.success('Password reset successfully!');
                setTimeout(() => navigate('/'), 2500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Access reset rejected. Token may be expired.');
            toast.error(err.response?.data?.message || 'Password reset failed.');
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
                            {step === 1 ? 'Credential Structure' : 'Reset Complete'}
                        </div>
                        <p className="auth-subtitle">
                            {step === 1 
                                ? 'Update your secure key parameters.' 
                                : 'Access parameters restored. Directing to portal.'}
                        </p>
                    </div>
                </div>

                {!token && step === 1 ? (
                    <div className="auth-alert-danger mb-20 text-center uppercase tracking-widest text-[10px] font-black p-4">
                        Critical Error: Secure signature token is missing. Please initiate a new password reset from your profile settings.
                    </div>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        {error && <div className="auth-alert-danger">{error}</div>}
                        {success && <div className="auth-alert-success">{success}</div>}

                        {/* Step 1: Password inputs */}
                        {step === 1 && (
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
                                    <label className="form-label font-bold-600">Confirm Access Key <span className="text-red">*</span></label>
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
                                    {isLoading ? 'Updating Key...' : 'Commit New Credentials'}
                                </button>
                            </>
                        )}

                        {/* Step 2: Success state */}
                        {step === 2 && (
                            <div className="text-center py-20">
                                <div className="flex-center mb-24" style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ background: 'rgba(5, 205, 153, 0.1)', padding: '20px', borderRadius: '50%' }}>
                                        <CheckCircle size={64} style={{ color: 'var(--success)' }} />
                                    </div>
                                </div>
                                <p className="auth-subtitle mb-24">Security profiles updated. Synchronizing access...</p>
                            </div>
                        )}
                    </form>
                )}

                <div className="auth-footer mt-24 text-center">
                    <Link to="/" className="auth-link flex-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <ArrowLeft size={16} /> Return to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordEmail;
