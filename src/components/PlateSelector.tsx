import React from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { STANDARD_PLATES, PARTIAL_PLATES } from '../constants';
import { PlateCountState, PlateDefinition } from '../types';
import { triggerHaptic } from '../utils/storage';

interface PlateSelectorProps {
  platesPerSide: PlateCountState;
  onAddPlate: (plateId: string) => void;
  onRemovePlate: (plateId: string) => void;
  onClearAll: () => void;
}

export const PlateSelector: React.FC<PlateSelectorProps> = ({
  platesPerSide,
  onAddPlate,
  onRemovePlate,
  onClearAll,
}) => {
  const [activeTab, setActiveTab] = React.useState<'standard' | 'partial' | 'all'>('all');

  const totalPlatesLoaded = Object.values(platesPerSide).reduce((sum, count) => sum + count, 0);

  const renderPlateButton = (plate: PlateDefinition) => {
    const count = platesPerSide[plate.id] || 0;
    const isPresent = count > 0;

    return (
      <div
        key={plate.id}
        className={`relative flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all ${
          isPresent
            ? 'bg-slate-800/90 border-slate-600 shadow-md ring-1 ring-slate-600/50'
            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        {/* Left: Plate Graphic & Info */}
        <div
          onClick={() => {
            triggerHaptic('light');
            onAddPlate(plate.id);
          }}
          className="flex items-center gap-3 cursor-pointer flex-1 select-none active:scale-[0.98] transition-transform"
        >
          {/* Authentic Mini Olympic Bumper Plate disc icon */}
          <div
            className="w-13 h-13 rounded-full flex items-center justify-center font-black text-xs shadow-lg shrink-0 relative border-2 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: plate.hex,
              color: plate.textHex,
              borderColor: plate.borderHex || 'rgba(0,0,0,0.3)',
              boxShadow: 'inset 0 0 6px rgba(0,0,0,0.4), 0 3px 6px rgba(0,0,0,0.5)',
            }}
          >
            {/* Outer Raised Rubber Rim ring */}
            <div className="absolute inset-1 rounded-full border border-black/20 pointer-events-none"></div>

            {/* Central Stainless Steel Olympic Bushing / Hub */}
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-400 border border-slate-500 shadow-inner flex items-center justify-center z-10">
              {/* 50mm Olympic Bar Hole */}
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-slate-500"></div>
              </div>
            </div>

            {/* Subtle Weight stamp on the disc */}
            <div
              className="absolute bottom-1 font-mono font-black text-[8px] tracking-tighter opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] pointer-events-none"
              style={{ color: plate.textHex }}
            >
              {plate.weight}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">
                {plate.weight} <span className="text-xs font-semibold text-slate-400">kg</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                {plate.colorName}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>{count > 0 ? `${count} on each side (${count * 2} total)` : 'Tap + to load'}</span>
            </div>
          </div>
        </div>

        {/* Right: Quantity Stepper Controls */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {/* Minus Button: Disabled if count === 0 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (count > 0) {
                triggerHaptic('medium');
                onRemovePlate(plate.id);
              }
            }}
            disabled={count === 0}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all active:scale-90 ${
              count > 0
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                : 'bg-slate-800/40 text-slate-600 border border-slate-800/60 cursor-not-allowed opacity-40'
            }`}
            aria-label={`Remove 1 ${plate.label} from each side`}
            title={`Remove 1 pair of ${plate.label}`}
          >
            <Minus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Current Count Badge */}
          <div
            className={`w-8 text-center font-mono font-bold text-sm ${
              count > 0 ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {count}
          </div>

          {/* Plus Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              onAddPlate(plate.id);
            }}
            className="w-9 h-9 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 flex items-center justify-center text-sm font-bold transition-all active:scale-90 shadow-sm"
            aria-label={`Add 1 ${plate.label} to each side`}
            title={`Add 1 pair of ${plate.label}`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Category filter tabs & Reset */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Plates ({STANDARD_PLATES.length + PARTIAL_PLATES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('standard')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'standard'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Standard ({STANDARD_PLATES.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('partial')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'partial'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Partial ({PARTIAL_PLATES.length})
          </button>
        </div>

        {totalPlatesLoaded > 0 && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onClearAll();
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-2.5 py-1.5 rounded-lg transition active:scale-95"
            title="Remove all plates from the bar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Bar</span>
          </button>
        )}
      </div>

      {/* Plates Display Grid */}
      <div className="space-y-4">
        {(activeTab === 'all' || activeTab === 'standard') && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Standard Olympic Plates</span>
              <span className="text-[10px] text-slate-400 font-normal">5kg to 25kg (Pairs)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {STANDARD_PLATES.map(renderPlateButton)}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'partial') && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span>Partial / Fractional Plates</span>
              <span className="text-[10px] text-slate-400 font-normal">0.5kg to 2.5kg (Pairs)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {PARTIAL_PLATES.map(renderPlateButton)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
