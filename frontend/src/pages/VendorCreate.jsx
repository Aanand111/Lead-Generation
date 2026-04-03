import React, { useState } from 'react';
import { User, Mail, Phone, Lock, BadgeInfo, Building, ArrowLeft, Save, Sparkles, UserPlus, ShieldCheck, Zap, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const VendorCreate = () => {
    const navigate = useNavigate();
    const generateReferralCode = () => {
        const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `VND-${randomStr}`;
    };

    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        phone: '',
        email: '',
        password: '',
        referral_code: generateReferralCode(),
        referred_by_vendor_id: '',
        status: 'Active'
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

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
        setSubmitting(true);
        setError('');
        try {
            const payload = {
                name: formData.name,
                gender: formData.gender,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                referral_code: formData.referral_code,
                referred_by_vendor_id: formData.referred_by_vendor_id || null,
                status: formData.status
            };

            const { data } = await api.post('/admin/vendors', payload);

            if (data.success) {
                navigate('/vendors');
            } else {
                setError(data.message || 'Error creating vendor');
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            setError(err.response?.data?.message || 'Failed to connect to backend. Data not saved.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3 italic">
                        Mint New Vendor
                        <UserPlus className="text-indigo-500 animate-pulse" size={24} />
                    </h2>
                    <p>Initialize a new vendor entity and establish distribution protocols</p>
                </div>
                <div className="pageHeaderActions">
                    <button onClick={() => navigate('/vendors')} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={16} /> Abort Operation
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-10">
                <form onSubmit={handleSubmit} className="space-y-10">
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-4 text-xs font-black uppercase tracking-widest italic animate-shake">
                            <BadgeInfo size={20} /> {error}
                        </div>
                    )}

                    {/* Identity Matrix */}
                    <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                        <div className="p-10 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
                                            <ShieldCheck size={24} />
                                        </div>
                                        Vendor Identity Matrix
                                    </h3>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic mt-2 ml-14">Configure primary authentication and identity parameters</p>
                                </div>
                                <Zap className="text-amber-500/30" size={40} />
                            </div>
                        </div>

                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Full Legal Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input 
                                        type="text" name="name" value={formData.name} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                        placeholder="EX: ALEPH NULL" required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2"> 
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Gender</label>
                                <CustomSelect
                                    name="gender" value={formData.gender} onChange={handleChange} 
                                        
                                    options={[
                                    {value: 'Male', label: 'MALE'},
                                    {value: 'Female', label: 'FEMALE'},
                                    {value: 'Other', label: 'OTHER PROTOCOL'}
                                ]}
                                required 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Primary Email Node</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input 
                                        type="email" name="email" value={formData.email} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                        placeholder="EX: VENDOR@ENTITY.COM" required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Voice Frequency (Phone)</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input 
                                        type="text" name="phone" value={formData.phone} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                        placeholder="10-15 DIGITS" maxLength={15} required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Auth Password (Min 6 chars)</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input 
                                        type="password" name="password" value={formData.password} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                        placeholder="Min 6 characters" required minLength={6} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Status Protocol</label>
                                <CustomSelect 
                                    name="status" value={formData.status} onChange={handleChange}                                    
                                      options={[
                                    {value: 'Active', label: 'ACTIVE PROTOCOL'},
                                    {value: 'Inactive', label: 'INACTIVE PROTOCOL'}
                                ]}
                                required 
                                />
                                
                            </div>
                        </div>
                    </div>

                    {/* Network Referral Matrix */}
                    <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] bg-[var(--surface-color)]">
                        <div className="p-10 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                                    <Building size={24} />
                                </div>
                                Network Linkage Matrix
                            </h3>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic mt-2 ml-14">Define parent nodes and referral inheritance parameters</p>
                        </div>

                        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Personal Referral Code</label>
                                <div className="relative group">
                                    <BadgeInfo className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-500 transition-colors" size={18} />
                                    <input 
                                        type="text" name="referral_code" value={formData.referral_code} onChange={handleChange} 
                                        className="w-full pl-12 pr-16 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-amber-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                        placeholder="EX: REF-001" maxLength={20} required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({ ...formData, referral_code: generateReferralCode() })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all active:scale-90"
                                        title="Regenerate unguessable link protocol"
                                    >
                                        <RefreshCcw size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Parent Node ID (Optional)</label>
                                <div className="relative group">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-500 transition-colors" size={18} />
                                    <input 
                                        type="text" name="referred_by_vendor_id" value={formData.referred_by_vendor_id} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-amber-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                        placeholder="EX: VEND-001" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-col md:flex-row gap-6 pt-10">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Initialize Vendor Protocol
                                </>
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/vendors')}
                            className="px-12 py-6 bg-[var(--bg-color)] text-[var(--text-muted)] font-black uppercase text-xs tracking-[0.2em] rounded-[1.5rem] hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                        >
                            Abort
                        </button>
                    </div>
                </form>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            ` }} />
        </div>
    );
};

export default VendorCreate;
