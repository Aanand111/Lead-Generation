import React from 'react';
import { X, AlertCircle, CheckCircle, Info, HelpCircle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
    if (!isOpen) return null;

    const styles = {
        danger: {
            icon: <AlertCircle className="text-red-500" size={48} />,
            button: 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
        },
        warning: {
            icon: <HelpCircle className="text-amber-500" size={48} />,
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
        },
        success: {
            icon: <CheckCircle className="text-emerald-500" size={48} />,
            button: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
        },
        info: {
            icon: <Info className="text-indigo-500" size={48} />,
            button: 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'
        }
    };

    const currentStyle = styles[type] || styles.danger;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" 
                onClick={onCancel}
            />
            
            <div className="relative w-full max-w-md bg-[var(--surface-color)] rounded-[2.5rem] border border-[var(--border-color)] shadow-2xl animate-zoom-in overflow-hidden">
                <div className="absolute top-0 right-0 p-6">
                    <button 
                        onClick={onCancel}
                        className="w-10 h-10 rounded-xl bg-[var(--bg-color)]/50 flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 transition-all border-none cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 pt-16 flex flex-col items-center text-center">
                    <div className="mb-6 p-4 rounded-3xl bg-black/5 dark:bg-white/5 shadow-inner">
                        {currentStyle.icon}
                    </div>
                    
                    <h3 className="text-2xl font-black text-[var(--text-dark)] uppercase tracking-tight mb-3">
                        {title}
                    </h3>
                    
                    <p className="text-sm font-medium text-[var(--text-muted)] leading-relaxed mb-10 max-w-[280px]">
                        {message}
                    </p>

                    <div className="flex gap-4 w-full">
                        <button 
                            onClick={onCancel}
                            className="flex-1 py-4 px-6 bg-[var(--bg-color)] text-[var(--text-muted)] font-black uppercase text-[11px] tracking-widest rounded-2xl border border-[var(--border-color)] hover:border-indigo-500/30 hover:text-indigo-500 transition-all cursor-pointer"
                        >
                            Abort
                        </button>
                        <button 
                            onClick={onConfirm}
                            className={`flex-1 py-4 px-6 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer border-none ${currentStyle.button}`}
                        >
                            Sync Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
