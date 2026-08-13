import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export const SkeletonCard = () => (
  <div className="bg-[#FFFFFF] dark:bg-[#11161F] border border-gray-100 dark:border-white/10 rounded-[2rem] flex flex-col overflow-hidden animate-pulse">
    <div className="h-56 bg-gray-200 dark:bg-white/5 w-full" />
    <div className="p-8 flex flex-col flex-1 space-y-6">
      <div className="h-6 bg-gray-200 dark:bg-white/5 rounded-md w-3/4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-5/6" />
      </div>
      <div className="mt-auto pt-6 flex justify-between">
        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-1/4" />
        <div className="h-12 bg-gray-200 dark:bg-white/5 rounded-xl w-1/3" />
      </div>
    </div>
  </div>
);

export const CustomSelect = ({ value, onChange, options, placeholder, isOpen, onToggle }) => {
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="relative" onClick={e => e.stopPropagation()}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full md:w-auto gap-3 bg-transparent border-none text-gray-500 hover:text-foreground dark:text-slate-400 dark:hover:text-slate-50 px-6 py-3 focus:outline-none cursor-pointer font-medium whitespace-nowrap transition-colors"
      >
        {selectedLabel}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 min-w-[220px] bg-[#FFFFFF] dark:bg-[#151B26] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); onToggle(); }}
                className={`w-full text-left px-5 py-3 text-sm transition-colors ${value === opt.value
                    ? 'bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border-l-4 border-indigo-500'
                    : 'text-gray-500 dark:text-slate-400 hover:bg-[#F6F8FD] dark:hover:bg-white/5 hover:text-foreground dark:hover:text-slate-50 border-l-4 border-transparent'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};