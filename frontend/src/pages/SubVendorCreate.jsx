import React, { useState } from 'react';
import { User, Mail, Phone, Lock, BadgeInfo, Building, ArrowLeft, Save, Sparkles, UserPlus, ShieldCheck, Zap, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';
const SubVendorCreate = () => {
    const navigate = useNavigate();
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
    const [vendors, setVendors] = useState([]);
    const [loadingVendors, setLoadingVendors] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await api.get('/admin/vendors?limit=1000');
                if (res.data.success) {
                    setVendors(res.data.data);
                }
            } catch (err) {
                console.error("Fetch vendors failure");
            } finally {
                setLoadingVendors(false);
            }
        };
        fetchVendors();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const val = value.replace(/\D/g, '');
            if (val.length <= 10) {
                setFormData({ ...formData, [name]: val });
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
            const res = await api.post('/admin/subvendors', formData);
            if (res.data.success) {
                navigate('/sub-vendors');
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            setError(err.response?.data?.message || 'Failed to create sub-vendor. Please check your details.');
        } finally {
            setSubmitting(false);
        }
    };

    const vendorOptions = vendors.map(v => ({
        value: v.id,
        label: `${v.name.toUpperCase()} (${v.phone})`
    }));

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3 italic">
                        Mint Sub-Vendor
                        <UserPlus className="text-indigo-500 animate-pulse" size={24} />
                    </h2>
                    <p>Initialize a secondary vendor node and register as a child element in the network</p>
                </div>
                <div className="pageHeaderActions">
                    <button onClick={() => navigate('/sub-vendors')} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={16} /> Abort Operation
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mt-10">
                <form onSubmit={handleSubmit} className="space-y-10">
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-4 text-xs font-black uppercase tracking-widest italic animate-shake">
                            <Activity size={20} /> {error}
                        </div>
                    )}

                    {/* Principal Node Data */}
                    <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                        <div className="p-10 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
                                        <ShieldCheck size={24} />
                                    </div>
                                    Sub-Vendor Information Matrix
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic mt-2 ml-14">Configure secondary authentication and identity parameters</p>
                            </div>
                            <Sparkles className="text-indigo-500/20" size={48} />
                        </div>

                        <div className="p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Primary Frequency (Phone)</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="text" name="phone" value={formData.phone} onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                            placeholder="10 DIGITS" maxLength={10} required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Account Interface Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="email" name="email" value={formData.email} onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                            placeholder="EX: NODE@ENTITY.COM" required
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
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Referral Seed Code</label>
                                    <div className="relative group">
                                        <BadgeInfo className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                        <input
                                            type="text" name="referral_code" value={formData.referral_code} onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                            placeholder="PERSONAL SEED"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Principal Parent Node (Vendor)</label>
                                    <CustomSelect 
                                        name="referred_by_vendor_id" value={formData.referred_by_vendor_id} onChange={handleChange} 
                                        options={vendorOptions}
                                        placeholder="SELECT PARENT VENDOR"
                                        required
                                    />
                                    {loadingVendors && <div className="text-[10px] animate-pulse text-indigo-500 ml-1 uppercase font-black tracking-widest leading-none mt-2">Hydrating network nodes...</div>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Gender Identity</label>
                                    <CustomSelect
                                        name="gender" value={formData.gender} onChange={handleChange}
                                        options={[
                                            { value: 'Male', label: 'MALE' },
                                            { value: 'Female', label: 'FEMALE' },
                                            { value: 'Other', label: 'OTHER' }
                                        ]}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic font-bold">Status Profile</label>
                                    <CustomSelect
                                        name="status" value={formData.status} onChange={handleChange}
                                        className="bg-[var(--surface-color)] text-[var(--text-dark)]"
                                        options={[
                                            { value: 'Active', label: 'ACTIVE' },
                                            { value: 'Inactive', label: 'INACTIVE' },                                           
                                        ]}
                                        required
                                    /> 
                                      
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Center */}
                    <div className="flex flex-col md:flex-row gap-6">
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
                                    Forge Sub-Vendor
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/sub-vendors')}
                            className="px-12 py-6 bg-[var(--bg-color)] text-[var(--text-muted)] font-black uppercase text-xs tracking-[0.2em] rounded-[1.5rem] hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                        >
                            Abort
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubVendorCreate;
