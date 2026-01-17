import React from 'react';
import { useViewerStore } from '../../store/useViewerStore';

const JoonWebBadge = () => {
  const userPlan = useViewerStore((state) => state.userPlan);
  
  if (userPlan === 'pro') return null;

  return (
    <a 
      href="https://joonweb.com" 
      target="_blank" 
      rel="noopener noreferrer"
      className="
        absolute bottom-3 right-3 z-50 
        inline-flex items-center gap-2 
        bg-slate-900/90 backdrop-blur-sm
        px-3 py-1.5 rounded-full 
        shadow-lg border border-white/10
        transition-transform hover:-translate-y-0.5
        no-underline
      "
      style={{ right: "45%", bottom: "4px"}}
    >
      {/* The JW Icon */}
      <svg width="18" height="12" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="block">
        <path d="M10.5 0H4C1.79086 0 0 1.79086 0 4V18C0 21.3137 2.68629 24 6 24H10.5V0Z" fill="#38bdf8"/>
        <path d="M18 0L22.5 15L27 0H32L25.5 24H19.5L15 9L10.5 24H4.5L11 0H18Z" fill="#ffffff"/>
      </svg>
      
      {/* The Text */}
      <span className="text-[10px] font-medium text-slate-300 leading-none">
        Powered By <span className="text-sky-400 font-bold tracking-wide">JoonWeb</span>
      </span>
    </a>
  );
};

export default JoonWebBadge;