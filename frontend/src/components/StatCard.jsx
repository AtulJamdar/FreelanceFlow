import React from 'react';

const StatCard = ({ title, value, icon, description, trend, trendType }) => {
  return (
    <div className="p-6 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/50 rounded-2xl transition-all duration-300 group shadow-lg relative overflow-hidden">
      {/* Light glow reflection on hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            {title}
          </span>
          <span className="text-3xl font-extrabold text-white tracking-tight block">
            {value}
          </span>
        </div>
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-400 group-hover:text-indigo-400 transition-colors duration-300">
          {icon}
        </div>
      </div>

      {description && (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          {trend && (
            <span className={`font-semibold ${trendType === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend}
            </span>
          )}
          <span>{description}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
