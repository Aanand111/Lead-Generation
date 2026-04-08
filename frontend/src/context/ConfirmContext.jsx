import React, { createContext, useContext, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
    const [config, setConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'danger',
        onConfirm: () => {},
        resolve: null
    });

    const confirm = (message, title = 'System Protocol Check', type = 'danger') => {
        return new Promise((resolve) => {
            setConfig({
                isOpen: true,
                title,
                message,
                type,
                resolve
            });
        });
    };

    const handleConfirm = () => {
        if (config.resolve) config.resolve(true);
        setConfig(prev => ({ ...prev, isOpen: false }));
    };

    const handleCancel = () => {
        if (config.resolve) config.resolve(false);
        setConfig(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog 
                isOpen={config.isOpen}
                title={config.title}
                message={config.message}
                type={config.type}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
};
