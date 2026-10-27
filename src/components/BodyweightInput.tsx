import React, { useState, useEffect } from 'react';
import { Scale, Plus, Minus, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/storage';

interface BodyweightInputProps {
  bodyWeight: number | null;
  onUpdateBodyweight: (newWeight: number | null) => void;
}

export const BodyweightInput: React.FC<BodyweightInputProps> = ({
  bodyWeight,
  onUpdateBodyweight,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    bodyWeight !== null && bodyWeight !== undefined ? String(bodyWeight) : ''
  );
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  useEffect(() => {
    setInputValue(bodyWeight !== null && bodyWeight !== undefined ? String(bodyWeight) : '');
  }, [bodyWeight]);

  const handleApply = (val: number | null) => {
    triggerHaptic('light');
    onUpdateBodyweight(val);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) {
      onUpdateBodyweight(Math.round(num * 10) / 10);
    } else if (raw === '') {
      onUpdateBodyweight(null);
    }
  };

  const adjustWeight = (delta: number) => {
    triggerHaptic('light');
    const current = bodyWeight || 75;
    const next = Math.max(20, Math.min(300, Math.round((current + delta) * 10) / 10));
    setInputValue(String(next));
    handleApply(next);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3.5 sm:p-4 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        {/* Label & Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/25 shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Current Body Weight</span>
              {isSavedRecently && (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 animate-in fade-in">
                  <Check className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {bodyWeight ? `Active: ${bodyWeight} kg` : 'Input to see % of bodyweight in PRs'}
            </div>
          </div>
        </div>

        {/* Stepper & Input Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => adjustWeight(-0.5)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center active:scale-95 transition"
            title="Decrease 0.5kg"
            aria-label="Decrease bodyweight by 0.5kg"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="20"
              max="350"
              placeholder="75.0"
              value={inputValue}
              onChange={handleInputChange}
              className="w-20 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-2 py-1 text-center font-mono font-bold text-sm text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-2 top-1.5 text-[10px] font-semibold text-slate-400 pointer-events-none">
              kg
            </span>
          </div>

          <button
            type="button"
            onClick={() => adjustWeight(0.5)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center active:scale-95 transition"
            title="Increase 0.5kg"
            aria-label="Increase bodyweight by 0.5kg"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
