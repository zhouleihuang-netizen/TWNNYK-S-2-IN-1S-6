
import React from 'react';

interface ModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
    footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, footer }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="relative bg-slate-800 rounded-lg shadow-2xl w-full max-w-md border border-slate-600">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
                    aria-label="Close modal"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-cyan-300 mb-4 pr-8">{title}</h2>
                    <div className="text-lg">{children}</div>
                </div>
                <div className="px-6 py-4 bg-slate-700/50 rounded-b-lg flex justify-end space-x-3">
                     {footer ?? (
                        <button
                            onClick={onClose}
                            className="bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-500 transition-colors"
                        >
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;