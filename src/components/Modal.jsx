import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md w-full',
        md: 'max-w-xl w-full',
        lg: 'max-w-3xl w-full',
        xl: 'max-w-5xl w-full',
        full: 'max-w-[96vw] w-full h-[94vh]',
        screen: 'w-screen h-screen max-w-none rounded-none'
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 ${sizeClasses[size] || sizeClasses.md}`}>
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold uppercase tracking-tight italic">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default Modal;
