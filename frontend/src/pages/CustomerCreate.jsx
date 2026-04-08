import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, BadgeInfo, Building2, Building, ToggleLeft, ArrowLeft, Save, Sparkles, Globe, Briefcase, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';


const CustomerCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        referral: '',
        state: '',
        city: '',
        pincode: '',
        designation: '',
        domain: '',
        company: '',
        other_company: '',
        status: 'Active'
    });

    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState('No file chosen');
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
        if (['phone', 'whatsapp', 'pincode'].includes(name)) {
            const val = value.replace(/\D/g, '');
            const limit = name === 'pincode' ? 6 : 10;
            if (val.length <= limit) {
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
            const res = await api.post('/admin/customers', formData);
            if (res.data.success) {
                navigate('/customers');
            } else {
                setError(res.data.message || 'Error creating customer');
            }
        } catch (err) {
            console.error("Error submitting form:", err);
            setError(err.response?.data?.message || 'Failed to connect to backend. Data not saved.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleFileClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)]">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                         Mint New Customer
                        <Sparkles className="text-amber-500 animate-pulse" size={24} />
                    </h2>
                    <p>Initialize a new customer profile and allocate engagement parameters</p>
                </div>
                <div className="pageHeaderActions">
                    <button onClick={() => navigate('/customers')} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={16} /> Abort Operation
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-4 text-xs font-black uppercase tracking-widest italic animate-shake">
                            <BadgeInfo size={20} /> {error}
                        </div>
                    )}

                    {/* Section 1: Basic Identity */}
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)]">
                        <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                    <User size={20} />
                                </div>
                                Identity Verification
                            </h3>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Profile Dropzone (Simulation) */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Profile Manifest</label>
                                <div 
                                    onClick={handleFileClick}
                                    className="relative h-40 rounded-[2rem] bg-[var(--bg-color)] border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group overflow-hidden"
                                >
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--surface-color)] shadow-sm border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                                        <Camera size={24} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">{fileName}</span>
                                    <span className="text-[9px] font-bold text-[var(--text-muted)]/50 uppercase italic">PNG, JPG up to 10MB</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Full Legal Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input 
                                        type="text" name="name" value={formData.name} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none"
                                        placeholder="EX: ALEPH NULL" required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Primary Email Protocol</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input 
                                        type="email" name="email" value={formData.email} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none"
                                        placeholder="EX: USER@PROTOCOL.COM" required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Voice Frequency (Phone)</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-indigo-500 transition-colors" size={18} />
                                     <input 
                                         type="text" name="phone" value={formData.phone} onChange={handleChange} 
                                         className="w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none"
                                         placeholder="10 DIGITS" maxLength={10} required 
                                     />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">WhatsApp Interface</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Phone className="text-emerald-500" size={10} />
                                    </div>
                                     <input 
                                         type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} 
                                         className="w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-emerald-500 transition-all shadow-inner outline-none"
                                         placeholder="OPTIONAL (10 DIGITS)" maxLength={10} 
                                     />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Proximity Data */}
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)]">
                        <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                    <MapPin size={20} />
                                </div>
                                Geolocation Nodes
                            </h3>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <CustomSelect
                                label="Regional State"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                options={stateOptions}
                                placeholder="SELECT NODE"
                            />

                            <CustomSelect
                                label="City Hub"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                options={cityOptions}
                                placeholder="SELECT HUB"
                                required
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Postal Protocol (PIN)</label>
                                <input 
                                    type="text" name="pincode" value={formData.pincode} onChange={handleChange} 
                                    className="w-full p-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none"
                                    placeholder="6 DIGITS" maxLength={6} required 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Professional Matrix */}
                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)]">
                        <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                    <Briefcase size={20} />
                                </div>
                                Occupational Matrix
                            </h3>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <CustomSelect
                                label="Designation Tier"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                placeholder="SELECT TIER"
                                options={[
                                    { value: 'Manager', label: 'MANAGER' },
                                    { value: 'Owner', label: 'OWNER' },
                                    { value: 'Director', label: 'DIRECTOR' },
                                    { value: 'Consultant', label: 'CONSULTANT' }
                                ]}
                                required
                            />

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Domain Expertise</label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-500 transition-colors" size={18} />
                                    <input 
                                        type="text" name="domain" value={formData.domain} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-amber-500 transition-all shadow-inner outline-none"
                                        placeholder="EX: FINTECH, HEALTHCARE..." required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Corporate Entity</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-amber-500 transition-colors" size={18} />
                                    <input 
                                        type="text" name="company" value={formData.company} onChange={handleChange} 
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-amber-500 transition-all shadow-inner outline-none"
                                        placeholder="ENTITY NAME" required 
                                    />
                                </div>
                            </div>

                            <CustomSelect
                                label="Status Protocol"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={[
                                    { value: 'Active', label: 'ACTIVE PROTOCOL' },
                                    { value: 'Inactive', label: 'INACTIVE PROTOCOL' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex flex-col md:flex-row gap-4 pt-6">
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Commit Customer Data
                                </>
                            )}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => navigate('/customers')}
                            className="px-10 py-5 bg-[var(--bg-color)] text-[var(--text-muted)] font-black uppercase text-xs tracking-[0.2em] rounded-[2rem] hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                        >
                            Abort
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerCreate;
