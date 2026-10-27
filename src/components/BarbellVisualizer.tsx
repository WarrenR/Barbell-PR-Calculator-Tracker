import React, { useState } from 'react';
import { ALL_PLATES_MAP, BAR_OPTIONS } from '../constants';
import { PlateCountState, PlateDefinition } from '../types';
import { Layers, Eye } from 'lucide-react';

interface BarbellVisualizerProps {
  barWeight: number;
  platesPerSide: PlateCountState;
  onRemovePlate?: (plateId: string) => void;
}

export const BarbellVisualizer: React.FC<BarbellVisualizerProps> = ({
  barWeight,
  platesPerSide,
  onRemovePlate,
}) => {
  const [viewMode, setViewMode] = useState<'sleeve' | 'stack'>('sleeve');

  // Sort plates on the barbell from inside (closest to collar) to outside (outer sleeve)
  // Standard rule: heaviest plates inside, lightest outside
  const loadedPlates: PlateDefinition[] = [];

  for (const [id, count] of Object.entries(platesPerSide)) {
    const def = ALL_PLATES_MAP.get(id);
    if (def && count > 0) {
      for (let i = 0; i < count; i++) {
        loadedPlates.push(def);
      }
    }
  }

  // Heaviest to lightest
  loadedPlates.sort((a, b) => b.weight - a.weight);

  const totalPlateCountPerSide = loadedPlates.length;
  const totalPlateWeightPerSide = loadedPlates.reduce((sum, p) => sum + p.weight, 0);
  const barInfo = BAR_OPTIONS.find((b) => b.weight === barWeight);

  // Render an authentic Olympic Plate in side profile (elevation on barbell)
  const renderOlympicPlateProfile = (plate: PlateDefinition, index: number, side: 'left' | 'right') => {
    // Standard Olympic 450mm diameter is base 100% height
    // 5kg is ~68%, 2.5kg is ~52%, etc.
    const heightPercent = Math.round(Math.max(34, plate.diameterRatio * 100));
    // Plate width in pixels based on real bumper plate thickness:
    // 25kg = ~36px, 20kg = ~30px, 15kg = ~24px, 10kg = ~18px, 5kg = ~14px, fractionals = 10-12px
    const widthPx = Math.round(plate.widthPx * 1.35);

    return (
      <div
        key={`${side}-${plate.id}-${index}`}
        onClick={() => onRemovePlate?.(plate.id)}
        title={`Remove ${plate.label} (${plate.colorName}) - Tap to remove`}
        className="group relative cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0 select-none"
        style={{
          height: `${heightPercent}%`,
          minHeight: '44px',
          width: `${widthPx}px`,
        }}
      >
        {/* Authentic Olympic Bumper Plate Body */}
        <div
          className="w-full h-full rounded-[4px] relative flex flex-col justify-between overflow-hidden shadow-lg transition-all group-hover:brightness-110 group-hover:ring-2 group-hover:ring-white/70"
          style={{
            backgroundColor: plate.hex,
            boxShadow: `inset 2px 0 3px rgba(255,255,255,0.25), inset -2px 0 3px rgba(0,0,0,0.4), 0 4px 6px -1px rgba(0,0,0,0.5)`,
            borderLeft: `1px solid rgba(255,255,255,0.3)`,
            borderRight: `1px solid rgba(0,0,0,0.4)`,
          }}
        >
          {/* Top Raised Rim / Flange */}
          <div
            className="w-full h-2.5 shrink-0 border-b border-black/25 flex items-center justify-center"
            style={{
              background: `linear-gradient(to bottom, rgba(255,255,255,0.35), rgba(0,0,0,0.2))`,
            }}
          >
            <div className="w-2/3 h-[1px] bg-white/40"></div>
          </div>

          {/* Central Plate Recess & Embossed Weight Label */}
          <div className="flex-1 flex flex-col items-center justify-center relative py-1 px-0.5">
            {/* Center Barbell Collar Hub cutout representation */}
            <div className="w-full h-4 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 border-y border-slate-600/70 shadow-inner flex items-center justify-center">
              <div className="w-full h-[1px] bg-black/30"></div>
            </div>

            {/* Embossed Vertical Weight Number */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ color: plate.textHex }}
            >
              <span
                className="font-black text-[10px] sm:text-[11px] font-mono tracking-tighter leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                style={{
                  writingMode: widthPx < 20 ? 'vertical-rl' : 'horizontal-tb',
                  transform: widthPx < 20 ? 'rotate(180deg)' : 'none',
                }}
              >
                {plate.weight}
              </span>
              {widthPx >= 22 && heightPercent > 70 && (
                <span className="text-[7px] font-bold uppercase tracking-tighter opacity-80 leading-none">
                  kg
                </span>
              )}
            </div>
          </div>

          {/* Bottom Raised Rim / Flange */}
          <div
            className="w-full h-2.5 shrink-0 border-t border-black/25 flex items-center justify-center"
            style={{
              background: `linear-gradient(to top, rgba(0,0,0,0.4), rgba(255,255,255,0.15))`,
            }}
          >
            <div className="w-2/3 h-[1px] bg-black/40"></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
      {/* Header with Title and View Switcher */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold uppercase tracking-wider text-white text-xs">
            Loaded Barbell
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            ({barInfo ? barInfo.label : `${barWeight}kg Bar`} + {totalPlateWeightPerSide * 2}kg Plates)
          </span>
        </div>

        {/* View Mode Toggle: Sleeve View vs Plate Stack */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode('sleeve')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              viewMode === 'sleeve'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Bar View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('stack')}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
              viewMode === 'stack'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Plate Stack ({totalPlateCountPerSide})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: AUTHENTIC OLYMPIC BARBELL ELEVATION */}
      {viewMode === 'sleeve' && (
        <div className="relative w-full h-44 flex items-center justify-center overflow-x-auto py-2 select-none scrollbar-thin">
          <div className="flex items-center justify-center min-w-full px-2 relative h-full">
            {/* Left Sleeve Plates (Mirrored) */}
            <div className="flex items-center justify-end flex-row-reverse gap-1 h-full">
              {loadedPlates.map((plate, index) =>
                renderOlympicPlateProfile(plate, index, 'left')
              )}
            </div>

            {/* Left Outer Collar / Clip */}
            {loadedPlates.length > 0 && (
              <div
                className="w-2.5 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-sm shadow-md shrink-0 mx-0.5 border border-amber-300/60"
                title="Spring / Lock-Jaw Collar"
              ></div>
            )}

            {/* Left Barbell Sleeve Bar Extension */}
            <div className="w-3.5 h-6 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 border-y border-slate-500 shrink-0"></div>

            {/* Left Inner Shoulder / Flange */}
            <div className="w-3 h-24 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-sm shadow-lg z-10 shrink-0 border border-slate-500"></div>

            {/* Main Bar Shaft (Middle Knurled Section, SSB Pad, or Deadlift Frame) */}
            <div
              className={`relative ${
                barWeight === 24 ? 'h-7 w-28 sm:w-40 rounded-sm' : 'h-5'
              } ${
                barWeight === 12.5 ? 'w-20 sm:w-28' : barWeight !== 24 ? 'w-24 sm:w-36' : ''
              } ${
                barWeight === 24
                  ? 'bg-gradient-to-b from-stone-800 via-stone-900 to-black border-y-2 border-stone-600 shadow-md ring-1 ring-stone-700/60'
                  : barWeight === 23
                  ? 'bg-gradient-to-b from-zinc-700 via-zinc-900 to-zinc-950 border-y border-zinc-600 shadow-inner'
                  : barWeight === 25
                  ? 'bg-gradient-to-b from-slate-100 via-slate-300 to-slate-200 border-y border-slate-400 shadow-inner'
                  : 'bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 border-y border-slate-500 shadow-inner'
              } flex items-center justify-center shrink-0`}
            >
              {/* Knurling Grid Pattern or SSB Pad Texture */}
              <div
                className={`absolute inset-0 opacity-45 ${
                  barWeight === 24
                    ? 'bg-[radial-gradient(#44403c_1px,transparent_1px)]'
                    : barWeight === 23
                    ? 'bg-[radial-gradient(#52525b_1px,transparent_1px)]'
                    : 'bg-[radial-gradient(#1e293b_1px,transparent_1px)]'
                } [background-size:3px_3px]`}
              ></div>
              {/* Center Ring or SSB Pad Seam */}
              <div
                className={`w-[1px] h-full absolute ${
                  barWeight === 24 ? 'bg-stone-500' : barWeight === 23 ? 'bg-zinc-600' : 'bg-slate-600'
                }`}
              ></div>
              {/* Bar Weight Stamp */}
              <span
                className={`relative z-10 text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded shadow-xs ${
                  barWeight === 24
                    ? 'bg-stone-900 text-emerald-400 border border-stone-700 font-mono'
                    : barWeight === 23
                    ? 'bg-zinc-800 text-amber-300 border border-zinc-700 font-mono'
                    : 'bg-white/80 text-slate-800 font-mono'
                }`}
              >
                {barWeight === 24 ? 'SSB • 24kg' : `${barWeight}kg`}
              </span>
            </div>

            {/* Right Inner Shoulder / Flange */}
            <div className="w-3 h-24 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-sm shadow-lg z-10 shrink-0 border border-slate-500"></div>

            {/* Right Barbell Sleeve Bar Extension */}
            <div className="w-3.5 h-6 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 border-y border-slate-500 shrink-0"></div>

            {/* Right Outer Collar / Clip */}
            {loadedPlates.length > 0 && (
              <div
                className="w-2.5 h-16 bg-gradient-to-r from-amber-400 to-amber-600 rounded-sm shadow-md shrink-0 mx-0.5 border border-amber-300/60"
                title="Spring / Lock-Jaw Collar"
              ></div>
            )}

            {/* Right Sleeve Plates */}
            <div className="flex items-center justify-start gap-1 h-full">
              {loadedPlates.map((plate, index) =>
                renderOlympicPlateProfile(plate, index, 'right')
              )}
            </div>

            {/* Remaining empty sleeve bar */}
            {totalPlateCountPerSide < 3 && (
              <div className="w-16 h-6 bg-gradient-to-b from-slate-400 via-slate-200 to-slate-400 border-y border-slate-500 rounded-r shadow-inner shrink-0">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-full h-[1px] bg-slate-400/50"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: 3D ANGLED CIRCULAR OLYMPIC BUMPER PLATE STACK */}
      {viewMode === 'stack' && (
        <div className="w-full py-4 flex flex-col items-center justify-center select-none animate-in fade-in duration-200">
          {totalPlateCountPerSide === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No plates currently on the bar. Tap plates below to load!
            </div>
          ) : (
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {/* Stack visual: Front Plate Face */}
              <div className="relative flex items-center justify-center">
                {/* Layered plate rims behind */}
                {loadedPlates.slice(1).map((plate, i) => (
                  <div
                    key={`depth-${i}`}
                    className="absolute rounded-full border border-black/40 shadow-xl"
                    style={{
                      width: `${Math.round(140 * plate.diameterRatio)}px`,
                      height: `${Math.round(140 * plate.diameterRatio)}px`,
                      backgroundColor: plate.hex,
                      transform: `translateX(${(i + 1) * -8}px) scale(${0.96 - i * 0.02})`,
                      zIndex: 10 - i,
                      opacity: 0.9,
                    }}
                  />
                ))}

                {/* Primary Front Facing Olympic Bumper Plate */}
                {loadedPlates[0] && (
                  <div
                    className="relative rounded-full shadow-2xl flex items-center justify-center border-4 z-20 transition-transform hover:scale-105"
                    style={{
                      width: '144px',
                      height: '144px',
                      backgroundColor: loadedPlates[0].hex,
                      borderColor: loadedPlates[0].borderHex || 'rgba(0,0,0,0.3)',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(0,0,0,0.35)',
                    }}
                  >
                    {/* Outer Raised Rubber Rim */}
                    <div className="absolute inset-1.5 rounded-full border-2 border-black/20 pointer-events-none"></div>

                    {/* Top IWF / Olympic Arch Text */}
                    <div
                      className="absolute top-2.5 text-[8px] font-black tracking-widest uppercase"
                      style={{ color: loadedPlates[0].textHex }}
                    >
                      OLYMPIC
                    </div>

                    {/* Center Steel Hub (50mm Barbell Bushing) */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-400 via-slate-100 to-slate-400 border-2 border-slate-600 shadow-inner flex items-center justify-center">
                      {/* Bar Hole */}
                      <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                      </div>
                    </div>

                    {/* Left & Right Weight Labels */}
                    <div
                      className="absolute left-3 text-xs font-black font-mono"
                      style={{ color: loadedPlates[0].textHex }}
                    >
                      {loadedPlates[0].weight}
                    </div>
                    <div
                      className="absolute right-3 text-xs font-black font-mono"
                      style={{ color: loadedPlates[0].textHex }}
                    >
                      {loadedPlates[0].weight}
                    </div>

                    {/* Bottom KG Text */}
                    <div
                      className="absolute bottom-2.5 text-[9px] font-black tracking-widest"
                      style={{ color: loadedPlates[0].textHex }}
                    >
                      KG
                    </div>
                  </div>
                )}
              </div>

              {/* Sleeve Plate Breakdown List */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 min-w-[200px] text-xs space-y-1.5">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider pb-1 border-b border-slate-800 flex justify-between">
                  <span>Each Sleeve:</span>
                  <span className="text-emerald-400 font-mono">{totalPlateWeightPerSide} kg</span>
                </div>
                {loadedPlates.map((plate, idx) => (
                  <div
                    key={`list-${plate.id}-${idx}`}
                    className="flex items-center justify-between py-0.5 text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-black/30 shrink-0"
                        style={{ backgroundColor: plate.hex }}
                      />
                      <span>{plate.label} ({plate.colorName})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemovePlate?.(plate.id)}
                      className="text-rose-400 hover:text-rose-300 text-[10px] underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info & Instructions */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5 mt-2 gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 font-semibold">Load per sleeve:</span>
          <span className="text-emerald-400 font-mono font-bold">
            {totalPlateWeightPerSide} kg
          </span>
          <span className="text-slate-500">•</span>
          <span>{totalPlateCountPerSide} plates each side</span>
        </div>
        {totalPlateCountPerSide > 0 && (
          <span className="text-slate-400 text-[10px] bg-slate-800/60 px-2 py-0.5 rounded-full">
            💡 Tap any plate on the bar to remove it
          </span>
        )}
      </div>
    </div>
  );
};
