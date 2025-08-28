import React from 'react';

const ArrowIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className} 
        fill="currentColor"
        viewBox="0 0 24 24" 
    >
        <path d="M12 4l1.41 1.41L7.83 11H20v2H7.83l5.58 5.59L12 20l-8-8 8-8z" transform="rotate(180 12 12)"/>
    </svg>
);

export default ArrowIcon;
