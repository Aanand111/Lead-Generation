import React, { useState, useEffect } from 'react';
import { Mail, Trash2, Eye, RefreshCw, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useConfirm } from '../context/ConfirmContext';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const ContactMessages = () => {
    const { confirm } = useConfirm();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/contact-messages');
            if (data.success) setMessages(data.data || []);
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMessages(); }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            const { data } = await api.put(`/admin/contact-messages/${id}/status`, { status });
            if (data.success) {
                setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
                if (selectedMsg?.id === id) setSelectedMsg(prev => ({ ...prev, status }));
            }
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm(
            'This action will permanently purge this inquiry from the digital archives.',
            'Purge Inquiry'
        );
        if (!confirmed) return;
        try {
            const { data } = await api.delete(`/admin/contact-messages/${id}`);
            if (data.success) {
                setMessages(prev => prev.filter(m => m.id !== id));
                if (selectedMsg?.id === id) setSelectedMsg(null);
                toast.success('Inquiry purged.');
            } else {
                toast.error(data.message || 'Purge protocol failure.');
            }
        } catch (err) {
            toast.error('System synchronization failure.');
        }
    };

    const handleView = (msg) => {
        setSelectedMsg(msg);
        if (msg.status === 'Unread') handleStatusUpdate(msg.id, 'Read');
    };

    const formatDate = (d) => {
        if (!d) return 'N/A';
        return new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const statusBadge = (status) => {
        const map = {
            'Unread': { bg: 'bg-amber-500/10', color: 'text-amber-500', icon: <Clock size={11} />, border: 'border-amber-500/20' },
            'Read': { bg: 'bg-indigo-500/10', color: 'text-indigo-500', icon: <Eye size={11} />, border: 'border-indigo-500/20' },
            'Resolved': { bg: 'bg-emerald-500/10', color: 'text-emerald-500', icon: <CheckCircle size={11} />, border: 'border-emerald-500/20' },
        };
        const s = map[status] || map['Unread'];
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border transition-all ${s.bg} ${s.color} ${s.border}`}>
                {s.icon} {status}
            </span>
        );
    };

    const filteredMessages = messages.filter(m => {
        const matchStatus = filterStatus === 'All' || m.status === filterStatus;
        const matchSearch = searchTerm === '' ||
            m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    const unreadCount = messages.filter(m => m.status === 'Unread').length;

    return (
        <div className="pb-10 animate-fade-in text-[var(--text-dark)]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#556ee6] to-[#6f42c1] rounded-2xl p-8 mb-7 flex items-center justify-between shadow-lg shadow-indigo-500/20">
                <div>
                    <h1 className="m-0 text-2xl font-bold text-white flex items-center gap-3">
                        Contact Messages
                        {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] font-black px-2.5 py-0.5 animate-pulse uppercase tracking-widest">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="mt-1.5 text-white/75 text-sm">
                        Manage all inquiries submitted from the Contact Us page
                    </p>
                </div>
                <button
                    id="refresh_messages"
                    onClick={fetchMessages}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/15 text-white border border-white/30 rounded-xl cursor-pointer text-sm font-bold transition-all hover:bg-white/25 active:scale-95"
                >
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">

                {/* LEFT — Messages Table */}
                <div className="bg-[var(--surface-color)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 bg-[var(--bg-color)]/30 border-b border-[var(--border-color)] flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-2">
                            {['All', 'Unread', 'Read', 'Resolved'].map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => setFilterStatus(s)} 
                                    className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
                                        filterStatus === s 
                                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                                        : 'bg-[var(--bg-color)] text-[var(--text-muted)] hover:bg-[var(--border-color)]'
                                    }`}
                                >
                                    {s}
                                    {s !== 'All' && (
                                        <span className="ml-1.5 opacity-60">
                                            ({messages.filter(m => m.status === s).length})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search queries..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-64 pl-4 pr-4 py-2 bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-dark)] placeholder:text-[var(--text-muted)] focus:border-indigo-500 focus:bg-[var(--surface-color)] outline-none transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="bg-[var(--bg-color)]/50">
                                <tr>
                                    {['#', 'Name', 'Email', 'Subject', 'Status', 'Date', 'Actions'].map(h => (
                                        <th key={h} className="text-[10px] uppercase font-black text-[var(--text-muted)] tracking-widest px-4 py-3">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="spinner"></div>
                                                <span className="text-[10px] font-black uppercase text-[var(--text-muted)] animate-pulse tracking-widest leading-none">Retrieving Encrypted Logs...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredMessages.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-20 text-[var(--text-muted)]">
                                            <div className="flex flex-col items-center gap-4 opacity-30">
                                                <Mail size={48} strokeWidth={1} />
                                                <p className="font-black uppercase tracking-widest text-[10px]">No Encrypted Logs Detected</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredMessages.map((msg) => (
                                    <tr 
                                        key={msg.id} 
                                        className={`transition-all hover:bg-indigo-500/[0.02] border-b border-[var(--border-color)]/50 last:border-0 cursor-pointer ${
                                            selectedMsg?.id === msg.id ? 'bg-indigo-500/[0.05]' : msg.status === 'Unread' ? 'bg-amber-500/5' : ''
                                        }`} 
                                        onClick={() => handleView(msg)}
                                    >
                                        <td className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)]/30">#{msg.id}</td>
                                        <td className={`px-4 py-3 text-xs ${msg.status === 'Unread' ? 'font-black text-indigo-500' : 'font-bold text-[var(--text-dark)]'}`}>
                                            {msg.full_name}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-indigo-400 font-bold">{msg.email}</td>
                                        <td className="px-4 py-3 text-xs text-[var(--text-dark)] font-bold max-w-[200px] truncate">
                                            {msg.subject}
                                        </td>
                                        <td className="px-4 py-3">{statusBadge(msg.status)}</td>
                                        <td className="px-4 py-3 text-[10px] font-black text-[var(--text-muted)] uppercase italic">{formatDate(msg.created_at)}</td>
                                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                            <div className="flex gap-2">
                                                <button
                                                    title="View"
                                                    onClick={() => handleView(msg)}
                                                    className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    title="Delete"
                                                    onClick={() => handleDelete(msg.id)}
                                                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-[var(--border-color)]/50 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">
                        Node Stream: {filteredMessages.length} of {messages.length} inquiries active
                    </div>
                </div>

                {/* RIGHT — Message Detail Panel */}
                <div className="bg-[var(--surface-color)] rounded-2xl shadow-sm border border-[var(--border-color)] overflow-hidden min-h-[400px] flex flex-col items-center">
                    {!selectedMsg ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-[var(--text-muted)]/30 text-center">
                            <Mail size={80} strokeWidth={1} className="mb-6 opacity-30" />
                            <p className="font-black uppercase tracking-widest text-[10px]">Select Inquiry for decryption</p>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col">
                            {/* Detail Header */}
                            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="m-0 text-base font-black text-[var(--text-dark)] uppercase tracking-tight leading-tight max-w-[70%]">
                                        {selectedMsg.subject}
                                    </h3>
                                    {statusBadge(selectedMsg.status)}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="text-xs text-[var(--text-dark)] font-bold">
                                        Author: <span className="text-indigo-500 font-black">{selectedMsg.full_name}</span>
                                    </div>
                                    <div className="text-[11px] text-[var(--text-muted)] font-black uppercase tracking-wider overflow-hidden text-ellipsis">{selectedMsg.email}</div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase italic">
                                    <Clock size={12} className="text-amber-500" /> Decryption Lead-time: {formatDate(selectedMsg.created_at)}
                                </div>
                            </div>

                            {/* Message Body */}
                            <div className="flex-1 p-6">
                                <div className="bg-[var(--bg-color)]/50 border border-[var(--border-color)] rounded-2xl p-5 text-sm text-[var(--text-dark)] font-medium leading-relaxed min-h-[150px] whitespace-pre-wrap shadow-inner italic">
                                    "{selectedMsg.message}"
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-6 pt-0 mt-auto">
                                <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4 text-center">Protocol Management</div>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Unread', 'Read', 'Resolved'].map(s => (
                                        <button 
                                            key={s} 
                                            onClick={() => handleStatusUpdate(selectedMsg.id, s)} 
                                            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all cursor-pointer border-none shadow-sm ${
                                                selectedMsg.status === s 
                                                ? 'bg-indigo-500 text-white shadow-indigo-500/20' 
                                                : 'bg-[var(--bg-color)] text-[var(--text-muted)] hover:bg-[var(--border-color)]'
                                            }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleDelete(selectedMsg.id)}
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl cursor-pointer text-xs font-black uppercase tracking-widest transition-all hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 active:scale-95"
                                >
                                    <Trash2 size={14} /> Purge Inquiry
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactMessages;
