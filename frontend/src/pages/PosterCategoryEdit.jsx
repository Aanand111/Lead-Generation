import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, Palette, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import CustomSelect from '../components/CustomSelect';

const STATUS_OPTIONS = [
    { value: true, label: 'ACTIVE' },
    { value: false, label: 'INACTIVE' }
];

const PosterCategoryEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        status: true,
    });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await api.get('/admin/poster-categories');
                if (res.data.success) {
                    const category = res.data.data.find(c => c.id === parseInt(id));
                    if (category) {
                        setFormData({
                            name: category.name,
                            status: category.status === true || category.status === 'Active' || category.status === 1
                        });
                    } else {
                        setError('Category not found');
                    }
                }
            } catch (err) {
                setError('Failed to fetch category details');
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === 'true' ? true : value === 'false' ? false : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const res = await api.put(`/admin/poster-categories/${id}`, formData);
            if (res.data.success) {
                navigate('/posters/category');
            } else {
                setError(res.data.message || 'Failed to update category');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page-content animate-fade-in text-[var(--text-dark)] pb-10">
            {/* Page Header */}
            <div className="pageHeader">
                <div className="pageHeaderTitle">
                    <h2 className="flex items-center gap-3">
                        Refine Category Matrix
                        <Sparkles className="text-indigo-500 animate-pulse" size={20} />
                    </h2>
                    <p>Modify classification tier #{id} parameters</p>
                </div>
                <div className="pageHeaderActions">
                    <button onClick={() => navigate('/posters/category')} className="btn bg-[var(--surface-color)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-2xl transition-all shadow-sm">
                        <ArrowLeft size={16} /> Abort Operation
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-4 text-xs font-black uppercase tracking-widest italic animate-shake">
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}

                    <div className="card shadow-2xl rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--surface-color)] overflow-hidden">
                        <div className="p-8 border-b border-[var(--border-color)] bg-[var(--bg-color)]/30">
                            <h3 className="text-base font-black uppercase tracking-tight flex items-center gap-3 text-indigo-500">
                                <div className="p-2.5 rounded-xl bg-indigo-500/10">
                                    <Palette size={18} />
                                </div>
                                Category Configuration
                            </h3>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Category Designation</label>
                                <input 
                                    type="text" name="name" value={formData.name} onChange={handleChange}
                                    placeholder="Enter unique name..."
                                    className="w-full px-6 py-4 rounded-2xl font-bold text-sm bg-[var(--bg-color)] border border-[var(--border-color)] focus:bg-[var(--surface-color)] focus:border-indigo-500 transition-all shadow-inner outline-none"
                                    required 
                                />
                            </div>

                            <CustomSelect
                                label="Operational Status"
                                name="status"
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value === 'true' }))}
                                options={STATUS_OPTIONS}
                                required
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
                                    Push Modifications
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PosterCategoryEdit;
