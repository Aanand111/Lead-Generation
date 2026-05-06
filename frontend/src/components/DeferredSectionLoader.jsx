import React from 'react';

const DeferredSectionLoader = ({ label = 'Loading section...' }) => {
    return (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="spinner"></div>
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse text-indigo-500">
                {label}
            </span>
        </div>
    );
};

export default DeferredSectionLoader;
