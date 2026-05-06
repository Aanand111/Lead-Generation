import React, { useState, useEffect } from 'react';
import { X, User, Smartphone, Mail, MapPin, Target, Send, Activity, CheckCircle, Sparkles } from 'lucide-react';
import api from '../utils/api';

const LeadAdModal = ({ isOpen, onClose, banner }) => {
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        category: '',
        city: '',
        state: '',
        pincode: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            // If banner has category in metadata or title, pre-set it
            if (banner?.title?.toLowerCase().includes('insurance')) {
                setFormData(prev => ({ ...prev, category: 'INSURANCE' }));
            }
        }
    }, [isOpen, banner]);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/user/profile');
            if (data.success) {
                setProfile(data.data);
                setFormData(prev => ({
                    ...prev,
                    customer_name: data.data.name || '',
                    customer_phone: data.data.phone || '',
                    customer_email: data.data.email || '',
                    city: data.data.city || '',
                    state: data.data.state || '',
                    pincode: data.data.pincode || ''
                }));
            }
        } catch (err) {
            console.error("Failed to fetch profile for lead ad", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/leads/submit', formData);
            if (response.data.success) {
                setSubmitted(true);
                setTimeout(() => {
                    onClose();
                    setSubmitted(false);
                }, 3000);
            }
        } catch (err) {
            console.error("Lead submission failed", err);
            alert("Failed to submit inquiry. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[var(--surface-color)] w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-[var(--border-color)] animate-slide-up relative">
                
                {/* Header */}
                <div className="p-8 border-b border-[var(--border-color)] bg-indigo-600 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none mb-1">Exclusive Inquiry</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none italic">Tell us what you're looking for</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 rounded-2xl hover:bg-white/20 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10">
                    {submitted ? (
                        <div className="py-20 text-center animate-fade-in">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-3xl font-black italic tracking-tighter uppercase text-[var(--text-dark)] mb-4">Inquiry Received!</h2>
                            <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest italic max-w-sm mx-auto">
                                Thank you for your interest. Our experts will contact you shortly with the best options.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-2 italic">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><User size={16} /></div>
                                        <input 
                                            type="text" required value={formData.customer_name}
                                            onChange={e => setFormData({...formData, customer_name: e.target.value})}
                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase tracking-widest italic outline-none focus:border-indigo-500 transition-all"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-2 italic">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Smartphone size={16} /></div>
                                        <input 
                                            type="text" required value={formData.customer_phone}
                                            onChange={e => setFormData({...formData, customer_phone: e.target.value})}
                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase tracking-widest italic outline-none focus:border-indigo-500 transition-all tabular-nums"
                                            placeholder="Enter phone"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-2 italic">Interest Category</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><Sparkles size={16} /></div>
                                        <select 
                                            required value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value})}
                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase tracking-widest italic outline-none focus:border-indigo-500 transition-all appearance-none"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="INSURANCE">Insurance</option>
                                            <option value="LOANS">Loans</option>
                                            <option value="REAL_ESTATE">Real Estate</option>
                                            <option value="FINANCE">Finance</option>
                                            <option value="GENERAL">General</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-2 italic">City</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><MapPin size={16} /></div>
                                        <input 
                                            type="text" required value={formData.city}
                                            onChange={e => setFormData({...formData, city: e.target.value})}
                                            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl pl-12 pr-6 py-4 text-xs font-black uppercase tracking-widest italic outline-none focus:border-indigo-500 transition-all"
                                            placeholder="Enter city"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 ml-2 italic">Additional Requirements</label>
                                <textarea 
                                    rows="3" value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl px-6 py-4 text-xs font-medium italic outline-none focus:border-indigo-500 transition-all resize-none"
                                    placeholder="Tell us more about your requirement..."
                                ></textarea>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button 
                                    type="button" onClick={onClose}
                                    className="flex-1 py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] bg-[var(--bg-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--border-color)] transition-all italic"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" disabled={loading}
                                    className="flex-[2] py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    {loading ? <Activity size={18} className="animate-spin" /> : <Send size={18} />} 
                                    Submit Inquiry
                                </button>
                            </div>
                            
                            <div className="text-center">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] italic opacity-50">
                                    Your data is secure and will only be shared with verified partners.
                                </span>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadAdModal;
