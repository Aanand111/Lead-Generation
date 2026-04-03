import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, BadgeInfo, Building, Shield, CheckCircle, AlertCircle, ArrowLeft, RefreshCcw, Layers, Globe, Zap, Save, UserPlus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

const VendorEdit = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        phone: '',
        email: '',
        password: '',
        referral_code: '',
        referred_by_vendor_id: '',
        status: 'Active'
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchVendor = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/admin/vendors`);
                const vendor = data.data.find(v => v.id === id);
                if (vendor) {
                    setFormData({
                        name: vendor.name || '',
                        gender: vendor.gender || '',
                        phone: vendor.phone || '',
                        email: vendor.email || '',
                        password: '', // Don't pre-fill password
                        referral_code: vendor.referral_code || '',
                        referred_by_vendor_id: vendor.referred_by_vendor_id || '',
                        status: vendor.status || 'Active'
                    });
                }
            } catch (error) {
                console.error("Error fetching vendor:", error);
                setMessage({ type: 'error', text: 'Identity retrieval failure.' });
            } finally {
                setLoading(false);
            }
        };
        fetchVendor();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            if (value === '' || /^[0-9]+$/.test(value)) {
                setFormData({ ...formData, [name]: value });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                gender: formData.gender,
                email: formData.email,
                phone: formData.phone,
                referral_code: formData.referral_code || null,
                referred_by_vendor_id: formData.referred_by_vendor_id || null,
                status: formData.status
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            const { data } = await api.put(`/admin/vendors/${id}`, payload);
            if (data.success) {
                setMessage({ type: 'success', text: 'Entity spectrum synchronized successfully.' });
                setTimeout(() => navigate('/vendors'), 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Error updating vendor' });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Synchronization failure detected.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing Entity...</span>
            </div>
        );
    }

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            {/* Header Area */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-indigo-600 transition-colors mb-4 bg-transparent border-none cursor-pointer p-0">
                        <ArrowLeft size={14} /> Back to Authority Registry
                    </button>
                    <h2 className="flex items-center gap-3 italic font-black uppercase tracking-tight">
                        Entity Refinement
                        <Shield size={24} className="text-indigo-600 animate-pulse" />
                    </h2>
                    <p>Reconfigure authority parameters and distribution protocols for Entity ID: {id}</p>
                </div>
            </div>

            {/* Performance Status */}
            {message.text && (
                <div className={`mt-8 p-6 rounded-[2rem] flex items-center gap-4 transition-all animate-slide-up border ${
                    message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                }`}>
                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{message.text}</span>
                </div>
            )}

            <div className="mt-10 max-w-5xl mx-auto">
                <div className="card shadow-2xl rounded-[3.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-10 ring-1 ring-black/5">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Primary Identity Node */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[.4em] text-[var(--text-dark)]">Core Identity Matrix</h3>
                                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest italic mt-1 leading-none opacity-60">Primary biometric and handle parameters</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Full Entity Name *</label>
                                    <div className="relative group">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm uppercase tracking-tight text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="DESIGNATION_ALPHA" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Verification Sequence *</label>
                                        <div className="relative group">
                                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                                            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required maxLength={15} className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="10-15_DIGIT_TEL" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Encryption Key (Password)</label>
                                        <div className="relative group">
                                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="LEAVE_BLANK_TO_RETAIN" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Digital Protocol (Email) *</label>
                                    <div className="relative group">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="PROTOCOL_SIGNAL@ENTITY.SYS" />
                                    </div>
                                </div>
                            </div>

                            {/* Network & Authority Attributes */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-600">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[.4em] text-[var(--text-dark)]">Authority Hierarchy</h3>
                                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest italic mt-1 leading-none opacity-60">Network routing and entitlement definitions</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Entity ID Tag</label>
                                        <div className="relative group">
                                            <BadgeInfo size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" />
                                            <input type="text" name="referral_code" value={formData.referral_code} onChange={handleChange} className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm uppercase tracking-tight text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="REF_CODE_AUTO" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Parent Node ID</label>
                                        <div className="relative group">
                                            <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" />
                                            <input type="text" name="referred_by_vendor_id" value={formData.referred_by_vendor_id} onChange={handleChange} className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm uppercase tracking-tight text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="PARENT_INDEX" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Operational Lifecycle State</label>
                                    <div className="bg-[var(--bg-color)] p-1.5 rounded-2xl flex gap-1 border border-[var(--border-color)]">
                                        <button type="button" onClick={() => setFormData({ ...formData, status: 'Active' })} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === 'Active' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-transparent text-[var(--text-muted)] hover:text-indigo-600'} border-none cursor-pointer`}>
                                            Authorized_Live
                                        </button>
                                        <button type="button" onClick={() => setFormData({ ...formData, status: 'Inactive' })} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.status === 'Inactive' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-transparent text-[var(--text-muted)] hover:text-red-500'} border-none cursor-pointer`}>
                                            Protocol_Suspend
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-indigo-600/[0.03] p-6 rounded-[2rem] border border-indigo-600/5 mt-4">
                                    <div className="flex items-center gap-3 text-indigo-600 mb-2">
                                        <Zap size={16} />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Global Entitlement</h4>
                                    </div>
                                    <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest leading-relaxed italic opacity-70">
                                        Syncing this entity will propagate authority across all sub-nodes and associated community sectors. 
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-[var(--border-color)] flex flex-col md:flex-row gap-6">
                            <button type="submit" className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[11px] tracking-[0.4em] rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer" disabled={saving}>
                                {saving ? <RefreshCcw size={20} className="animate-spin" /> : <Save size={20} />}
                                {saving ? 'TRANSMITTING CHANGESETS...' : 'COMMIT ENTITY SYNCHRONIZATION'}
                            </button>
                            <button type="button" onClick={() => navigate(-1)} className="px-12 py-6 bg-transparent text-[var(--text-muted)] hover:text-red-500 font-black uppercase text-[11px] tracking-[0.4em] rounded-[2.5rem] transition-all border-none cursor-pointer">
                                ABORT_OPERATION
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VendorEdit;
