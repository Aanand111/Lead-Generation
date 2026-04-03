import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Activity, Type, DollarSign, CalendarDays, KeySquare, FileText, ArrowLeft, Save, Sparkles, TrendingUp, Zap, Briefcase, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const LeadCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        lead_id: '', // New field required by validator
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        category: '',
        city: '',
        state: '',
        pincode: '',
        lead_value: '',
        expiry_date: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

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
        "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantipur"],
        "Andaman and Nicobar Islands": ["Port Blair"],
        "Chandigarh": ["Chandigarh"],
        "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
        "Delhi": ["New Delhi", "Delhi"],
        "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag"],
        "Ladakh": ["Leh", "Kargil"],
        "Lakshadweep": ["Kavaratti"],
        "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"]
    };

    const indianStates = Object.keys(citiesByState);
    const stateOptions = indianStates.map(state => ({ value: state, label: state.toUpperCase() }));
    const cityOptions = formData.state ? citiesByState[formData.state].map(city => ({ value: city, label: city.toUpperCase() })) : [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'state') {
            setFormData({ ...formData, state: value, city: '' });
            return;
        }
        if (['customer_phone', 'pincode', 'lead_value'].includes(name)) {
            if (value === '' || /^[0-9]+(\.[0-9]{1,2})?$/.test(value)) {
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
                lead_id: formData.lead_id || `LEAD-${Date.now()}`,
                customer_name: formData.customer_name,
                customer_phone: formData.customer_phone,
                customer_email: formData.customer_email || undefined,
                category: formData.category,
                city: formData.city,
                state: formData.state || undefined,
                pincode: formData.pincode || undefined,
                lead_value: Number(formData.lead_value) || 0,
                expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : undefined
            };

            const res = await api.post('/admin/leads', payload);
            if (res.data.success) {
                navigate('/dashboard');
            } else {
                setError(res.data.message || 'Error creating lead');
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            setError(err.response?.data?.message || 'Failed to connect to backend. Data not saved.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        Forge New Lead
                        <div className="p-2.5 rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                    </h2>
                    <p>Allocate a fresh business opportunity to the distribution network</p>
                </div>
                <div className="pageHeaderActions">
                    <button onClick={() => navigate('/leads')} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={16} /> Abort Operation
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-10">
                <form onSubmit={handleSubmit} className="space-y-10">
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-4 text-xs font-black uppercase tracking-widest italic animate-shake">
                            <Activity size={20} /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Primary Metadata */}
                        <div className="lg:col-span-2 space-y-10">
                            <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                                <div className="p-10 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shadow-inner">
                                                <Type size={24} />
                                            </div>
                                            Primary Parameters
                                        </h3>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic mt-2 ml-14">Configure lead core identity and category nodes</p>
                                    </div>
                                    <Sparkles className="text-amber-500/20" size={48} />
                                </div>

                                <div className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 font-bold">Forge Lead ID (Unique)</label>
                                            <input
                                                type="text" name="lead_id" value={formData.lead_id} onChange={handleChange}
                                                className="w-full p-5 rounded-[1.5rem] font-black text-sm uppercase bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-indigo-500 tracking-wider"
                                                placeholder="AUTO-GENERATED IF BLANK"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 font-bold">Category Protocol</label>
                                            <input
                                                type="text" name="category" value={formData.category} onChange={handleChange}
                                                className="w-full p-5 rounded-[1.5rem] font-bold text-sm uppercase bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                                placeholder="EX: IT-HARDWARE, INSURANCE..." required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 font-bold">Business Opportunity Meta</label>
                                        <textarea
                                            name="description"
                                            className="w-full p-6 rounded-[2rem] min-h-[120px] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                            placeholder="Forge the opportunity logic... Briefly describe the problem and solution."
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Customer Node Information */}
                            <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                                <div className="p-10 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 italic">
                                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                                                <User size={24} />
                                            </div>
                                            Customer Node Data
                                        </h3>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic mt-2 ml-14">Initialize customer endpoints for communication protocol</p>
                                    </div>
                                </div>

                                <div className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 font-bold">Customer Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-500 transition-colors" size={18} />
                                                <input
                                                    type="text" name="customer_name" value={formData.customer_name} onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-amber-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                                    placeholder="NAME" required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 font-bold">Customer Contact Node</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-500 transition-colors" size={18} />
                                                <input
                                                    type="text" name="customer_phone" value={formData.customer_phone} onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-amber-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                                    placeholder="10 DIGITS" maxLength={15} required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 font-bold">Customer Interface Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-500 transition-colors" size={18} />
                                            <input
                                                type="email" name="customer_email" value={formData.customer_email} onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-amber-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                                placeholder="EMAIL@PROTOCOL.COM"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Value & Locality (Side Panel) */}
                        <div className="space-y-10">
                            {/* Proximity Matrix */}
                            <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                                <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                                    <h3 className="text-md font-black uppercase tracking-tight flex items-center gap-3 italic">
                                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                                            <MapPin size={20} />
                                        </div>
                                        Locality
                                    </h3>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <CustomSelect
                                            label="State Node"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            options={stateOptions}
                                            placeholder="SELECT NODE"
                                            variant="compact"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <CustomSelect
                                            label="City Hub"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            options={cityOptions}
                                            placeholder="SELECT HUB"
                                            required
                                            variant="compact"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">Postal Sync (PIN)</label>
                                        <input
                                            type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                                            className="w-full p-4 rounded-xl font-bold text-xs uppercase bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-emerald-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                            placeholder="6 DIGITS" maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Monetary Parameters */}
                            <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] bg-indigo-600 overflow-hidden text-[var(--text-dark)] relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                    <DollarSign size={120} />
                                </div>

                                <div className="p-8 relative z-10">
                                    <h3 className="text-md font-black uppercase tracking-tight flex items-center gap-3 mb-8">
                                        <div className="p-2.5 rounded-xl bg-[var(--surface-color)] shadow-backdrop-blur-md text-[var(--text-dark)] border border-[var(--border-color)] shadow-inner">
                                            <Zap size={20} />
                                        </div>
                                        Valuation
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-[var(--text-dark)] uppercase tracking-widest ml-1 italic">Estimated Lead Value (₹)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dark)]" size={16} />
                                                <input
                                                    type="text" name="lead_value" value={formData.lead_value} onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-4 rounded-2xl font-black text-lg bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-dark)] focus:bg-[var(--surface-color)] transition-all shadow-xl outline-none placeholder:text-[var(--text-muted)]"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-white/60 uppercase tracking-widest ml-1 italic">Node Auto-Expiration</label>
                                            <div className="relative">
                                                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dark)]" size={16} />
                                                <input
                                                    type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-4 rounded-2xl font-black text-xs uppercase bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-dark)] focus:bg-[var(--surface-color)] transition-all shadow-xl outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Execution Hub */}
                            <div className="pt-4 flex flex-col gap-4">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[11px] tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Forge Prospect Node
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/leads')}
                                    className="w-full py-5 bg-[var(--surface-color)] text-[var(--text-muted)] font-black uppercase text-[10px] tracking-[0.2em] rounded-[1.5rem] hover:bg-red-500/10 hover:text-red-500 transition-all border border-[var(--border-color)] hover:border-red-500/20"
                                >
                                    Abort Operation
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeadCreate;
