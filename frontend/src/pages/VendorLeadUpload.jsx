import React, { useState } from 'react';
import { 
    User, Mail, Phone, MapPin, Building, Activity, Type, 
    DollarSign, CalendarDays, KeySquare, FileText, ArrowLeft, 
    Save, Sparkles, TrendingUp, Zap, Briefcase, Globe, Plus 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';
import { toast } from 'react-hot-toast';

const VendorLeadUpload = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        lead_id: '',
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
        if (name === 'customer_phone') {
            const val = value.replace(/\D/g, '');
            if (val.length <= 10) {
                setFormData({ ...formData, [name]: val });
            }
        } else if (name === 'pincode') {
            const val = value.replace(/\D/g, '');
            if (val.length <= 6) {
                setFormData({ ...formData, [name]: val });
            }
        } else if (name === 'lead_value') {
            if (value === '' || /^[0-9]*\.?[0-9]{0,2}$/.test(value)) {
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
                lead_id: formData.lead_id || `VND-LEAD-${Date.now()}`,
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

            const res = await api.post('/vendor/leads', payload);
            if (res.data.success) {
                toast.success('Lead injected into the grid successfully.');
                navigate('/vendor/dashboard');
            } else {
                setError(res.data.message || 'Node Injection Rejected.');
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            setError(err.response?.data?.message || 'Synchronization failure. Data not synced.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-20">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 mb-10">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 italic">
                        Production Protocol <ChevronRight size={10} /> Lead Injection
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-dark)] uppercase tracking-tighter leading-none mb-2">Forge New Prospect</h1>
                    <p className="text-xs font-bold text-[var(--text-muted)] italic leading-none">Initialize a new business data node for synchronization and validation.</p>
                </div>
                <button onClick={() => navigate('/vendor/dashboard')} className="p-4 bg-[var(--surface-color)] border border-[var(--border-color)] rounded-2xl text-[var(--text-muted)] hover:text-red-500 transition-all shadow-sm active:scale-95 flex items-center gap-2 uppercase text-[10px] font-black tracking-widest">
                    <ArrowLeft size={16} /> Abort Operation
                </button>
            </header>

            <div className="max-w-6xl mx-auto">
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
                                            Node Metadata
                                        </h3>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic mt-2 ml-14">Define the core identity of the prospect node</p>
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
                                                placeholder="VND-LEAD-XXXX"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 font-bold">Category Sector</label>
                                            <input
                                                type="text" name="category" value={formData.category} onChange={handleChange}
                                                className="w-full p-5 rounded-[1.5rem] font-bold text-sm uppercase bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                                placeholder="EX: REAL ESTATE, FINANCE..." required
                                            />
                                        </div>
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
                                            Identity Matrix
                                        </h3>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic mt-2 ml-14">Customer endpoints for validation protocol</p>
                                    </div>
                                </div>

                                <div className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 font-bold">Full Name</label>
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
                                            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 font-bold">Contact Node (Phone)</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-500 transition-colors" size={18} />
                                                <input
                                                    type="text" name="customer_phone" value={formData.customer_phone} onChange={handleChange}
                                                    className="w-full pl-12 pr-4 py-5 rounded-[1.5rem] font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-amber-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                                    placeholder="10 DIGITS" maxLength={10} required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 font-bold">Email Interface</label>
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

                        {/* Side Controls */}
                        <div className="space-y-10">
                            {/* Proximity Matrix */}
                            <div className="card shadow-2xl rounded-[3rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                                <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                                    <h3 className="text-md font-black uppercase tracking-tight flex items-center gap-3 italic">
                                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-inner">
                                            <MapPin size={20} />
                                        </div>
                                        Locality Sync
                                    </h3>
                                </div>

                                <div className="p-8 space-y-6">
                                    <CustomSelect
                                        label="State Cluster"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        options={stateOptions}
                                        placeholder="SELECT STATE"
                                        variant="compact"
                                    />
                                    <CustomSelect
                                        label="City Hub"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        options={cityOptions}
                                        placeholder="SELECT CITY"
                                        required
                                        variant="compact"
                                    />
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1 italic">PIN Code</label>
                                        <input
                                            type="text" name="pincode" value={formData.pincode} onChange={handleChange}
                                            className="w-full p-4 rounded-xl font-bold text-xs bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-emerald-500 transition-all shadow-inner outline-none text-[var(--text-dark)]"
                                            placeholder="6 DIGITS" maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Execution Hub */}
                            <div className="card p-8 bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-200">
                                <div className="flex items-center gap-3 mb-8">
                                    <Zap className="text-white" size={24} />
                                    <h3 className="text-white text-md font-black uppercase tracking-tight italic">Injection Hub</h3>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 bg-white text-indigo-600 font-black uppercase text-[11px] tracking-[0.2em] rounded-2xl shadow-xl hover:bg-indigo-50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {submitting ? <Activity size={20} className="animate-spin" /> : <Save size={20} />}
                                    {submitting ? 'Processing Node...' : 'Inject into Grid'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorLeadUpload;

const ChevronRight = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
