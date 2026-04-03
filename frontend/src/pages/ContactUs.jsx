import React, { useState } from 'react';
import { Phone, Mail, MapPin, Linkedin, Twitter, Instagram, Send, CheckCircle, AlertCircle } from 'lucide-react';

const ContactUs = () => {
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            const res = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setForm({ full_name: '', email: '', subject: '', message: '' });
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
            }
        } catch (err) {
            setError('Failed to send message. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-10 animate-fade-in text-[var(--text-dark)]">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-[#556ee6] to-[#6f42c1] rounded-2xl p-8 mb-7 flex items-center justify-between shadow-lg shadow-indigo-500/20">
                <div>
                    <h1 className="m-0 text-2xl font-bold text-white">
                        Contact Us
                    </h1>
                    <p className="mt-1.5 text-white/75 text-sm">
                        Have a question or need help? We'd love to hear from you.
                    </p>
                </div>
                <div className="w-15 h-15 rounded-full bg-white/15 flex items-center justify-center">
                    <Mail size={28} className="text-white" />
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

                {/* LEFT — Send Message Form */}
                <div className="bg-[var(--surface-color)] rounded-2xl shadow-sm border border-[var(--border-color)] p-8">
                    <h2 className="m-0 mb-6 text-lg font-bold text-[var(--text-dark)]">
                        Send us a message
                    </h2>

                    {/* Success Alert */}
                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-2.5 mb-5 text-emerald-500 text-sm animate-fade-in">
                            <CheckCircle size={18} />
                            <span><strong>Message sent!</strong> We'll get back to you within 24 hours.</span>
                        </div>
                    )}

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-2.5 mb-5 text-red-500 text-sm animate-shake">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name + Email Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">Full Name</label>
                                <input
                                    id="contact_full_name"
                                    type="text"
                                    name="full_name"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)]  text-sm bg-[var(--bg-color)]/50 text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] outline-none transition-all placeholder:text-[var(--text-muted)]/40"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">Email Address</label>
                                <input
                                    id="contact_email"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-sm bg-[var(--bg-color)]/50 text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] outline-none transition-all placeholder:text-[var(--text-muted)]/40"
                                />
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">Subject</label>
                            <input
                                id="contact_subject"
                                type="text"
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                placeholder="How can we help you?"
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-sm bg-[var(--bg-color)]/50 text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] outline-none transition-all placeholder:text-[var(--text-muted)]/40"
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-1.5">
                            <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1">Message</label>
                            <textarea
                                id="contact_message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Tell us more about your inquiry..."
                                required
                                rows={5}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-color)] text-sm bg-[var(--bg-color)]/50 text-[var(--text-dark)] focus:border-indigo-500 focus:bg-[var(--surface-color)] outline-none transition-all placeholder:text-[var(--text-muted)]/40 resize-none min-h-[120px]"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            id="contact_submit"
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all shadow-lg border-none cursor-pointer active:scale-95 ${
                                loading ? 'bg-indigo-400 cursor-not-allowed opacity-70' : 'bg-gradient-to-r from-[#556ee6] to-[#6f42c1] shadow-indigo-500/30'
                            }`}
                        >
                            <Send size={16} />
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>

                {/* RIGHT — Contact Info Card */}
                <div className="bg-[var(--surface-color)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                    {/* Info Header */}
                    <div className="bg-gradient-to-br from-[#556ee6] to-[#6f42c1] p-6">
                        <h3 className="m-0 text-white text-base font-bold uppercase tracking-tight">
                            Contact Information
                        </h3>
                        <p className="mt-1.5 text-white/70 text-xs">
                            Reach us through any of these channels
                        </p>
                    </div>

                    {/* Info Items */}
                    <div className="p-5 space-y-5">
                        {/* Phone */}
                        <div className="flex items-start gap-3.5 pb-5 border-b border-[var(--border-color)]/50">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0 text-indigo-500 border border-indigo-500/20">
                                <Phone size={18} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">PHONE</div>
                                <div className="text-sm text-[var(--text-dark)] font-bold">+91 1800-456-7890</div>
                                <div className="text-[11px] text-[var(--text-muted)] font-medium">Mon–Fri, 9am–6pm</div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-start gap-3.5 pb-5 border-b border-[var(--border-color)]/50">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0 text-sky-500 border border-sky-500/20">
                                <Mail size={18} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">EMAIL</div>
                                <div className="text-sm text-[var(--text-dark)] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px]">contact@leadgen.com</div>
                                <div className="text-[11px] text-[var(--text-muted)] font-medium">Reply within 24 hours</div>
                            </div>
                        </div>

                        {/* Office */}
                        <div className="flex items-start gap-3.5 pb-5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 text-emerald-500 border border-emerald-500/20">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">OFFICE</div>
                                <div className="text-sm text-[var(--text-dark)] font-bold">123 Innovation Drive</div>
                                <div className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed">Suite 400, Silicon Valley, CA 94103</div>
                            </div>
                        </div>

                        {/* Divider + Socials */}
                        <div className="pt-2 border-t border-[var(--border-color)]/50">
                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Follow Us</div>
                            <div className="flex gap-2.5">
                                {[
                                    { icon: <Linkedin size={16} />, color: "text-[#0077b5]", bg: "bg-[#0077b5]/10", border: "border-[#0077b5]/20", label: 'LinkedIn' },
                                    { icon: <Twitter size={16} />, color: "text-[#1da1f2]", bg: "bg-[#1da1f2]/10", border: "border-[#1da1f2]/20", label: 'Twitter' },
                                    { icon: <Instagram size={16} />, color: "text-[#e1306c]", bg: "bg-[#e1306c]/10", border: "border-[#e1306c]/20", label: 'Instagram' },
                                ].map((s, i) => (
                                    <button key={i} title={s.label} className={`w-9 h-9 rounded-lg flex items-center justify-center border-none cursor-pointer transition-transform hover:scale-110 ${s.bg} ${s.color} ${s.border}`}>
                                        {s.icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
