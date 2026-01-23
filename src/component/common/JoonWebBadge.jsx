import React from 'react';
import { useViewerStore } from '../../store/useViewerStore';

const JoonWebBadge = () => {
  const userPlan = useViewerStore((state) => state.userPlan);

  if (userPlan === 'pro') return null;

  return (
    <>
      <style>
        {`
          .badge-center {
            position: fixed;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 50;
          }
        `}
      </style>

      <a
        href="https://joonweb.com"
        target="_blank"
        rel="noopener noreferrer"
        className="
          badge-center
          inline-flex items-center gap-2
          bg-slate-900/90 backdrop-blur-sm
          px-3 py-1.5 rounded-full
          shadow-lg border border-white/10
          transition-transform hover:-translate-y-0.5
          no-underline
        "
      >
        <span className="text-[10px] font-medium text-slate-300 leading-none">
          Powered By{' '}
          <span className="text-sky-400 font-bold tracking-wide">
            JoonWeb
          </span>
        </span>
      </a>
    </>
  );
};

export default JoonWebBadge;
