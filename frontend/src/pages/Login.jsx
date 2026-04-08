import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';
import InsureBg from '../assets/Insure.png';
import InsureeLogo from '../assets/insuree.png';

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                email: formData.email.trim().toLowerCase()
            };
            const { data } = await api.post('/auth/login', submitData);
            if (data.success) {
                localStorage.setItem('token', data.token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.dispatchEvent(new Event('userProfileUpdated'));
                }
                // Role-based routing for a seamless user experience
                if (data.user && data.user.role === 'vendor') {
                    navigate('/vendor/dashboard');
                } else if (data.user && data.user.role === 'user') {
                    navigate('/user/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Connection error');
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
                        <div className="auth-title">Welcome back</div>
                        <p className="auth-subtitle">Sign in to continue.</p>
                    </div>
                </div>

                <form onSubmit={handleLogin}>
                    {error && (
                        <div className="auth-alert-danger">
                            {error}
                        </div>
                    )}

                    <div className="form-group text-left">
                        <label className="form-label font-bold-600">Mobile Number or Email Address <span className="text-red">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="EX: 9876543210 or user@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group text-left mb-8">
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

                    <div className="flex-right mb-20">
                        <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
                    </div>

                    <div className="login-actions mb-24">
                        <label className="checkbox-group auth-checkbox-group">
                            <input type="checkbox" className="auth-checkbox" />
                            <span>Remember this Device</span>
                        </label>
                        <Link to="/register" className="auth-create-link">Create A New Account</Link>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block auth-btn-large">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
