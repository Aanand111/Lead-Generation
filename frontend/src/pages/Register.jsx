import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Tag, User, Mail, Phone, Lock, UserPlus, Briefcase, Users, Zap, ShieldCheck, Activity } from 'lucide-react';
import InsureBg from '../assets/Insure.png';
import InsureeLogo from '../assets/insuree.png';

const Register = () => {
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        referral_code: searchParams.get('ref') || ''
    });

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            const isVendorRef = ref.endsWith('-V');
            setFormData(prev => ({ 
                ...prev, 
                referral_code: ref,
                role: isVendorRef ? 'vendor' : 'user'
            }));
        }
    }, [searchParams]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsSubmitting(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsSubmitting(false);
            return;
        }

        try {
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok || data.success) {
                setSuccess('Account created successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container auth-bg" style={{ '--auth-bg-image': `url(${InsureBg})` }}>
            <div className="auth-card" style={{ maxWidth: '640px', marginTop: '30px', marginBottom: '30px', width: '95%' }}>
                <div className="login-logo">
                    <div aria-hidden="true" className="auth-logo-center">
                        <img src={InsureeLogo} alt="Insuree Logo" className="auth-logo-img" />
                    </div>
                    <div className="auth-header mb-24">
                        <div className="auth-title">Create New Account</div>
                        <p className="auth-subtitle">Join the elite Insure network today.</p>
                    </div>
                </div>

                <form onSubmit={handleRegister} className="animate-fade-in">
                    {error && (
                        <div className="auth-alert-danger mb-20 flex items-center gap-2">
                           <Activity size={16} /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="auth-alert-success mb-20 flex items-center gap-2">
                           <ShieldCheck size={16} /> {error}
                        </div>
                    )}

                    {/* Personal Information Group */}
                    <div className="mb-24">
                        <div className="flex items-center gap-2 mb-12 border-b border-indigo-500/10 pb-2">
                            <User size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60">Primary Identity</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            <div className="form-group text-left mb-0">
                                <label className="form-label font-bold-600">Full Name <span className="text-red">*</span></label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="EX: JOHN SMITH"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group text-left mb-0">
                                <label className="form-label font-bold-600">Email Address <span className="text-red">*</span></label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="EX: user@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Meta Group */}
                    <div className="mb-24">
                        <div className="flex items-center gap-2 mb-12 border-b border-indigo-500/10 pb-2">
                            <Activity size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60">Node Parameters</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            <div className="form-group text-left mb-0">
                                <label className="form-label font-bold-600">Phone Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="EX: 9876543210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="form-group text-left mb-0">
                                <label className="form-label font-bold-600">Referral Code</label>
                                <div className="relative">
                                    <Tag className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500/30" size={14} />
                                    <input
                                        type="text"
                                        className="form-control font-black italic tracking-widest text-indigo-500"
                                        placeholder="SEED CODE"
                                        value={formData.referral_code}
                                        onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Selection Group - Premium Style */}
                    <div className="form-group text-left mb-24">
                        <div className="flex items-center gap-2 mb-12 border-b border-indigo-500/10 pb-2">
                             <Zap size={14} className="text-indigo-500" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60">Operational Designation</span>
                        </div>
                        <div className="role-selection-grid" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '8px', 
                            background: 'rgba(99, 102, 241, 0.05)', 
                            padding: '6px', 
                            borderRadius: '14px',
                            border: '1px solid rgba(99, 102, 241, 0.1)'
                        }}>
                            <label className={`role-option ${formData.role === 'user' ? 'active' : ''}`} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                background: formData.role === 'user' ? 'var(--primary)' : 'transparent',
                                color: formData.role === 'user' ? 'white' : 'var(--text-muted)',
                                fontWeight: '700',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                boxShadow: formData.role === 'user' ? '0 4px 15px rgba(99,102,241,0.3)' : 'none'
                            }}>
                                <input 
                                    type="radio" name="role" value="user" 
                                    checked={formData.role === 'user'} 
                                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                                    className="hidden"
                                />
                                <Users size={14} /> Customer
                            </label>
                            <label className={`role-option ${formData.role === 'vendor' ? 'active' : ''}`} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                background: formData.role === 'vendor' ? 'var(--primary)' : 'transparent',
                                color: formData.role === 'vendor' ? 'white' : 'var(--text-muted)',
                                fontWeight: '700',
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                boxShadow: formData.role === 'vendor' ? '0 4px 15px rgba(99,102,241,0.3)' : 'none'
                            }}>
                                <input 
                                    type="radio" name="role" value="vendor" 
                                    checked={formData.role === 'vendor'} 
                                    onChange={(e) => setFormData({...formData, role: e.target.value})} 
                                    className="hidden"
                                />
                                <Briefcase size={14} /> Vendor
                            </label>
                        </div>
                    </div>

                    {/* Security Group */}
                    <div className="mb-32">
                        <div className="flex items-center gap-2 mb-12 border-b border-indigo-500/10 pb-2">
                             <Lock size={14} className="text-indigo-500" />
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60">Access Keys</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                            <div className="form-group text-left mb-0">
                                <label className="form-label font-bold-600">Password <span className="text-red">*</span></label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group text-left mb-0">
                                <label className="form-label font-bold-600">Verify Key <span className="text-red">*</span></label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block auth-btn-large" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <Activity size={18} className="animate-spin" /> Finalizing Matrix...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} /> Forge Account
                            </div>
                        )}
                    </button>

                    <div className="auth-bottom-text mt-24 text-center">
                        Already have an operational node? <Link to="/" className="auth-link">Sign In to Continue</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
