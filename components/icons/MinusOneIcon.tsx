import React from 'react';

const MinusOneIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18V6" transform="rotate(90 12 12) scale(0.5) translate(12 12)" />
    </svg>
);

export default MinusOneIcon;
