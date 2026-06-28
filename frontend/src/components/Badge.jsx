import React from 'react';

const Badge = ({ status }) => {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      // Invoice Statuses
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'partially_paid':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'sent':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'draft':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      case 'overdue':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';

      // Project Statuses
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'on_hold':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'not_started':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';

      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const formatText = () => {
    if (!status) return '';
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider ${getStyles()}`}>
      {formatText()}
    </span>
  );
};

export default Badge;
