import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ label, options, value, onChange, name, placeholder = "Select option...", variant = "default", className = "", required = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isCompact = variant === "compact";

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`${isCompact ? "" : "space-y-1.5"} ${className} group`} ref={dropdownRef}>
            {label && (
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-2 block italic opacity-70">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <div
                    onClick={toggleDropdown}
                    className={`w-full ${
                        isCompact ? 'px-3 py-2 rounded-xl text-[10px]' : 'px-5 py-4 rounded-2xl text-[13px]'
                    } bg-[var(--surface-color)]/60 backdrop-blur-md border border-[var(--border-color)] font-semibold tracking-tight text-[var(--text-dark)] flex items-center justify-between cursor-pointer transition-all hover:bg-[var(--surface-color)] hover:border-indigo-500/30 group-focus-within:border-indigo-500 shadow-sm ${isOpen ? 'ring-4 ring-indigo-500/5 border-indigo-500' : ''}`}
                >
                    <span className={!selectedOption ? 'text-[var(--text-muted)]/50 italic font-medium' : 'uppercase tracking-tight'}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <div className={`p-1 rounded-lg transition-colors ${isOpen ? 'bg-indigo-500/10' : 'group-hover:bg-indigo-500/5'}`}>
                        <ChevronDown size={isCompact ? 14 : 16} className={`text-indigo-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {isOpen && (
                    <div className={`absolute ${isCompact ? 'top-full left-0 w-48' : 'top-full left-0 right-0'} mt-2 bg-[var(--surface-color)] border border-[var(--border-color)] ${isCompact ? 'rounded-xl' : 'rounded-2xl'} shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] z-[9999] overflow-hidden animate-zoom-in backdrop-blur-2xl border-indigo-500/10`}>
                        <div className={`py-2 max-h-64 overflow-y-auto ${isCompact ? 'px-1' : 'px-2'} custom-scrollbar`}>
                            {options.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`flex items-center justify-between ${isCompact ? 'px-3 py-2 rounded-lg text-[9px]' : 'px-4 py-3 rounded-xl text-[11px]'} font-black uppercase tracking-widest cursor-pointer transition-all mb-1 last:mb-0 ${
                                        String(value) === String(option.value) 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                        : 'text-[var(--text-dark)] hover:bg-indigo-500/10 hover:text-indigo-500'
                                    }`}
                                >
                                    <span className="flex-1">{option.label}</span>
                                    {String(value) === String(option.value) && <Check size={14} className="shrink-0 ml-2" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomSelect;
