import React, { useState } from 'react';
import { Trophy, X, Flame, Check, Dumbbell, Calendar } from 'lucide-react';
import { LiftType, PlateCountState, PRRecord } from '../types';
import { triggerHaptic } from '../utils/storage';

interface SavePRModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number;
  barWeight: number;
  platesPerSide: PlateCountState;
  bodyWeight: number | null;
  existingPRs: {
    Squat?: PRRecord;
    'Bench Press'?: PRRecord;
    Deadlift?: PRRecord;
  };
  onSavePR: (record: PRRecord) => void;
}

export const SavePRModal: React.FC<SavePRModalProps> = ({
  isOpen,
  onClose,
  currentWeight,
  barWeight,
  platesPerSide,
  bodyWeight,
  existingPRs,
  onSavePR,
}) => {
  const [selectedLift, setSelectedLift] = useState<LiftType>('Squat');
  const [notes, setNotes] = useState('');
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const currentExistingPR = existingPRs[selectedLift]?.weight;
  const isNewPR = !currentExistingPR || currentWeight > currentExistingPR;
  const diff = currentExistingPR ? Math.round((currentWeight - currentExistingPR) * 100) / 100 : null;

  const handleConfirm = () => {
    triggerHaptic('success');
    const newRecord: PRRecord = {
      id: `pr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      lift: selectedLift,
      weight: currentWeight,
      barWeight,
      platesPerSide: { ...platesPerSide },
      bodyWeight: bodyWeight || undefined,
      percentageOfBW: bodyWeight ? Math.round((currentWeight / bodyWeight) * 1000) / 10 : undefined,
      date: new Date(dateStr + 'T12:00:00').toISOString(),
      notes: notes.trim() || undefined,
    };
    onSavePR(newRecord);
    onClose();
  };

  const liftOptions: { lift: LiftType; label: string; desc: string }[] = [
    { lift: 'Squat', label: 'Squat', desc: 'Back Squat / Front Squat' },
    { lift: 'Deadlift', label: 'Deadlift', desc: 'Conventional / Sumo' },
    { lift: 'Bench Press', label: 'Bench Press', desc: 'Barbell Flat Bench' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-5 sm:p-6 text-white shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Save Personal Record</h2>
            <p className="text-xs text-slate-400">Record this lift weight to your PR history</p>
          </div>
        </div>

        {/* Current Total Load Banner */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-800 rounded-xl p-4 border border-slate-700 mb-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Load to Save</div>
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {currentWeight} <span className="text-sm font-semibold text-slate-300">kg</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {barWeight}kg bar + {Math.round((currentWeight - barWeight) * 100) / 100}kg plates
            </div>
          </div>

          {bodyWeight && bodyWeight > 0 && (
            <div className="text-right border-l border-slate-700/80 pl-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">% Bodyweight</div>
              <div className="text-lg font-bold text-amber-300 font-mono">
                {((currentWeight / bodyWeight) * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400">BW: {bodyWeight}kg</div>
            </div>
          )}
        </div>

        {/* Lift Selector Choice: "Squat", "Deadlift", "Bench Press" */}
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Select Lift
          </label>
          <div className="grid grid-cols-3 gap-2">
            {liftOptions.map((opt) => {
              const isSelected = selectedLift === opt.lift;
              const prevPR = existingPRs[opt.lift]?.weight;

              return (
                <button
                  key={opt.lift}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedLift(opt.lift);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[92px] ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg ring-1 ring-emerald-500/50'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <Dumbbell className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div className="font-extrabold text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    {prevPR ? `${prevPR}kg PR` : 'No PR yet'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PR Comparison Status */}
        <div className="mb-4">
          {isNewPR ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs">
              <Flame className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300">New Personal Record!</span>
                <span className="block text-amber-200/90 text-[11px]">
                  {currentExistingPR
                    ? `This beats your previous ${selectedLift} PR of ${currentExistingPR}kg by +${diff}kg!`
                    : `First recorded PR for ${selectedLift}!`}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Current PR: {currentExistingPR} kg</span>
                <span className="block text-slate-400 text-[11px]">
                  This lift ({currentWeight}kg) is {Math.abs(diff || 0)}kg below your best. It will still be logged to your history!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Optional Notes & Date */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date Achieved
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Optional Note (reps, RPE, form)
            </label>
            <input
              type="text"
              placeholder="e.g. 1RM paused at bottom, felt solid"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-[2] py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30 transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Save {selectedLift} PR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
