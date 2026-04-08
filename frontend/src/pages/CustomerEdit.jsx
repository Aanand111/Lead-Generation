import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, CheckCircle, AlertCircle, ArrowLeft, RefreshCcw, Layers, Smartphone, Share2, Activity, Save, Sparkles, Building2, Globe, Briefcase } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';

const CustomerEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState({
        name: "",
        email: "",
        phone: "",
        whatsapp: "",
        referral: "",
        state: "",
        city: "",
        pincode: "",
        designation: "",
        domain: "",
        company: "",
        other_company: "",
        status: "Active"
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const citiesByState = {
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada", "Kadapa", "Anantapur"],
        "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila"],
        "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
        "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar"],
        "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Raigarh", "Jagdalpur", "Ambikapur"],
        "Goa": ["Panaji", "Vasco da Gama", "Margao", "Mapusa", "Ponda"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad"],
        "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
        "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Palampur", "Baddi", "Nahan"],
        "Jharkhand": ["Jamshedpur", "Dhanbad", "Ranchi", "Bokaro Steel City", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar"],
        "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Davangere", "Ballari", "Vijayapura", "Shivamogga"],
        "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur", "Alappuzha", "Kottayam", "Palakkad", "Manjeri"],
        "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", "Kalyan-Dombivli", "Vasai-Virar City", "Aurangabad", "Navi Mumbai"],
        "Manipur": ["Imphal", "Thoubal", "Kakching", "Ukhrul"],
        "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
        "Mizoram": ["Aizawl", "Lunglei", "Saiha"],
        "Nagaland": ["Dimapur", "Kohima", "Mokokchung"],
        "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada"],
        "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Abohar"],
        "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
        "Sikkim": ["Gangtok", "Namchi", "Gyalshing"],
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Tiruppur", "Salem", "Erode", "Tirunelveli", "Vellore", "Thoothukudi"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"],
        "Tripura": ["Agartala", "Dharmanagar", "Kailasahar", "Udaipur"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad"],
        "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh"],
        "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur"]
    };

    const indianStates = Object.keys(citiesByState);

    useEffect(() => {
        const fetchCustomer = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/admin/customers/${id}`);
                if (data && data.success && data.data) {
                    setCustomer(data.data);
                }
            } catch (err) {
                console.error("Failed to fetch customer profile:", err);
                setMessage({ type: 'error', text: 'Failed to retrieve customer data.' });
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'state') {
            setCustomer({ ...customer, state: value, city: '' });
            return;
        }
        if (['phone', 'whatsapp', 'pincode'].includes(name)) {
            const val = value.replace(/\D/g, '');
            const limit = name === 'pincode' ? 6 : 10;
            if (val.length <= limit) {
                setCustomer({ ...customer, [name]: val });
            }
        } else {
            setCustomer({ ...customer, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.put(`/admin/customers/${id}`, customer);
            if (data.success) {
                setMessage({ type: 'success', text: 'Customer profile updated successfully.' });
                setTimeout(() => navigate("/customers"), 1500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to update customer.' });
            }
        } catch (err) {
            console.error("Update failure:", err);
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error updating profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Loading Profile...</span>
            </div>
        );
    }

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            {/* Header Area */}
             <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-indigo-600 transition-colors mb-4 bg-transparent border-none cursor-pointer p-0">
                        <ArrowLeft size={14} /> Back to Customers
                    </button>
                    <h2 className="flex items-center gap-3 font-black uppercase tracking-tight">
                        Edit Customer Profile
                        <Shield size={24} className="text-indigo-600" />
                    </h2>
                    <p>Update customer information and preferences</p>
                </div>
            </div>

            {/* Performance Status */}
            {message.text && (
                <div className={`mt-8 p-6 rounded-[2rem] flex items-center gap-4 transition-all animate-slide-up border ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                    {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{message.text}</span>
                </div>
            )}

            <div className="mt-10 max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Identity Card */}
                    <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-10 ring-1 ring-black/5">
                         <div className="p-0 mb-10 border-b border-[var(--border-color)] pb-8 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
                                        <Sparkles size={24} />
                                    </div>
                                    Basic Information
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Primary account credentials and access details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Full Name *</label>
                                <div className="relative group">
                                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                                    <input type="text" name="name" value={customer.name} onChange={handleChange} required className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm uppercase tracking-tight text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="FULL NAME" />
                                </div>
                            </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Email Address</label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                                    <input type="email" name="email" value={customer.email} onChange={handleChange} className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="EMAIL ADDRESS" />
                                </div>
                            </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Phone Number *</label>
                                <div className="relative group">
                                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                                    <input type="text" name="phone" value={customer.phone} onChange={handleChange} required maxLength={10} className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="10 DIGIT PHONE" />
                                </div>
                            </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">WhatsApp Number</label>
                                <div className="relative group">
                                    <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                                    <input type="text" name="whatsapp" value={customer.whatsapp} onChange={handleChange} maxLength={10} className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="WHATSAPP NUMBER" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Network Geolocation Card */}
                    <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-10 ring-1 ring-black/5">
                         <div className="p-0 mb-10 border-b border-[var(--border-color)] pb-8">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                                    <MapPin size={24} />
                                </div>
                                Location Details
                            </h3>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Geographic distribution and address details</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Regional State</label>
                                <select name="state" value={customer.state} onChange={handleChange} className="w-full p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-emerald-600 transition-all shadow-inner outline-none cursor-pointer">
                                    <option value="">SELECT STATE</option>
                                    {indianStates.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">City Node</label>
                                <select name="city" value={customer.city} onChange={handleChange} className="w-full p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-emerald-600 transition-all shadow-inner outline-none cursor-pointer">
                                    <option value="">SELECT CITY</option>
                                    {customer.state && citiesByState[customer.state]?.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                </select>
                            </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Pincode</label>
                                <input type="text" name="pincode" value={customer.pincode} onChange={handleChange} maxLength={6} className="w-full p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-emerald-600 transition-all shadow-inner outline-none" placeholder="PINCODE" />
                            </div>
                        </div>
                    </div>

                    {/* Professional Matrix Card */}
                    <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-10 ring-1 ring-black/5">
                         <div className="p-0 mb-10 border-b border-[var(--border-color)] pb-8">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                                    <Briefcase size={24} />
                                </div>
                                Professional Details
                            </h3>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2">Professional identity and work hierarchy</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Designation</label>
                                <select name="designation" value={customer.designation} onChange={handleChange} className="w-full p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-amber-600 transition-all shadow-inner outline-none cursor-pointer">
                                    <option value="">SELECT DESIGNATION</option>
                                    <option value="Manager">MANAGER</option>
                                    <option value="Owner">OWNER</option>
                                    <option value="Director">DIRECTOR</option>
                                    <option value="Consultant">CONSULTANT</option>
                                </select>
                            </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Domain / Industry</label>
                                <div className="relative group">
                                    <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-600 transition-colors" />
                                    <input type="text" name="domain" value={customer.domain} onChange={handleChange} className="w-full pl-12 p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-amber-600 transition-all shadow-inner outline-none uppercase" placeholder="EX: TECHNOLOGY, SALES" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Company Name</label>
                                <div className="relative group">
                                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-600 transition-colors" />
                                    <input type="text" name="company" value={customer.company} onChange={handleChange} className="w-full pl-12 p-5 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm text-[var(--text-dark)] focus:bg-white focus:border-amber-600 transition-all shadow-inner outline-none uppercase" placeholder="COMPANY NAME" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Referral Source</label>
                                <div className="relative group">
                                    <Share2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-600 transition-colors" />
                                    <input type="text" name="referral" value={customer.referral} onChange={handleChange} className="w-full p-5 pl-12 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl font-black text-sm uppercase tracking-tight text-[var(--text-dark)] focus:bg-white focus:border-indigo-600 transition-all shadow-inner outline-none" placeholder="REFERRAL SOURCE" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Protocol Card */}
                    <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] overflow-hidden bg-[var(--surface-color)] p-10 ring-1 ring-black/5">
                        <div className="p-0 mb-10 border-b border-[var(--border-color)] pb-8 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
                                        <Layers size={24} />
                                    </div>
                                    Network Protocol
                                </h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic mt-2">Operational state and mission lifecycle</p>
                            </div>
                        </div>

                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 block">Account Status</label>
                            <div className="bg-[var(--bg-color)] p-1.5 rounded-2xl flex gap-1 border border-[var(--border-color)]">
                                <button type="button" onClick={() => setCustomer({ ...customer, status: 'Active' })} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${customer.status === 'Active' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-transparent text-[var(--text-muted)] hover:text-indigo-600'} border-none cursor-pointer outline-none`}>
                                    Active
                                </button>
                                <button type="button" onClick={() => setCustomer({ ...customer, status: 'Inactive' })} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${customer.status === 'Inactive' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-transparent text-[var(--text-muted)] hover:text-red-500'} border-none cursor-pointer outline-none`}>
                                    Inactive
                                </button>
                            </div>
                        </div>
                    </div>

                     <div className="pt-10 border-t border-[var(--border-color)] flex flex-col md:flex-row gap-6">
                        <button type="submit" className="flex-1 py-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[11px] tracking-[0.4em] rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer outline-none" disabled={saving}>
                            {saving ? <RefreshCcw size={20} className="animate-spin" /> : <Save size={20} />}
                            {saving ? 'UPDATING...' : 'SAVE CHANGES'}
                        </button>
                        <button type="button" onClick={() => navigate(-1)} className="px-12 py-6 bg-transparent text-[var(--text-muted)] hover:text-red-500 font-black uppercase text-[11px] tracking-[0.4em] rounded-[2.5rem] transition-all border-none cursor-pointer outline-none">
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerEdit;
