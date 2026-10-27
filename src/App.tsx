import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Dumbbell,
  RotateCcw,
  Sparkles,
  History,
  Info,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { BAR_WEIGHT_OPTIONS, BAR_OPTIONS, BarWeightOption } from './constants';
import { GymUserData, LiftType, PlateCountState, PRRecord } from './types';
import {
  calculateTotalWeight,
  calculateWeightPerSide,
  calculateBodyweightRatio,
  loadUserData,
  saveUserData,
  triggerHaptic,
} from './utils/storage';
import { getOrCreateDeviceId } from './utils/deviceIdentity';
import { BarbellVisualizer } from './components/BarbellVisualizer';
import { PlateSelector } from './components/PlateSelector';
import { SavePRModal } from './components/SavePRModal';
import { BodyweightInput } from './components/BodyweightInput';
import { PRTable } from './components/PRTable';
import { LiftHistoryModal } from './components/LiftHistoryModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [userData, setUserData] = useState<GymUserData>(() => loadUserData());
  const [barWeight, setBarWeight] = useState<BarWeightOption>(
    (userData.barWeightKg as BarWeightOption) || 20
  );
  const [platesPerSide, setPlatesPerSide] = useState<PlateCountState>(
    userData.platesPerSide || {}
  );
  const [bodyWeight, setBodyWeight] = useState<number | null>(userData.bodyWeightKg);
  const [prs, setPRs] = useState<GymUserData['prs']>(userData.prs || {});
  const [history, setHistory] = useState<PRRecord[]>(userData.history || []);
  const [deviceId, setDeviceId] = useState<string>('');

  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [showQuickInfo, setShowQuickInfo] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Initialize device ID cookie & sync
  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  // Sync state changes to localStorage
  useEffect(() => {
    saveUserData({
      deviceId,
      bodyWeightKg: bodyWeight,
      barWeightKg: barWeight,
      platesPerSide,
      prs,
      history,
    });
  }, [deviceId, bodyWeight, barWeight, platesPerSide, prs, history]);

  // Derived load calculations
  const totalWeight = useMemo(
    () => calculateTotalWeight(barWeight, platesPerSide),
    [barWeight, platesPerSide]
  );

  const weightPerSide = useMemo(
    () => calculateWeightPerSide(platesPerSide),
    [platesPerSide]
  );

  const bwRatio = useMemo(
    () => calculateBodyweightRatio(totalWeight, bodyWeight),
    [totalWeight, bodyWeight]
  );

  // Show temporary toast message
  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 2800);
  };

  // Plate management
  const handleAddPlate = (plateId: string) => {
    setPlatesPerSide((prev) => ({
      ...prev,
      [plateId]: (prev[plateId] || 0) + 1,
    }));
  };

  const handleRemovePlate = (plateId: string) => {
    setPlatesPerSide((prev) => {
      const current = prev[plateId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[plateId];
        return next;
      }
      return {
        ...prev,
        [plateId]: current - 1,
      };
    });
  };

  const handleClearAllPlates = () => {
    setPlatesPerSide({});
    showToast('Barbell unloaded to bar weight');
  };

  // Save PR handler
  const handleSavePR = (newRecord: PRRecord) => {
    const lift = newRecord.lift;
    const currentPR = prs[lift];

    // Determine if this is a new PR
    const isNewPR = !currentPR || newRecord.weight > currentPR.weight;

    setHistory((prev) => [newRecord, ...prev]);

    if (isNewPR) {
      setPRs((prev) => ({
        ...prev,
        [lift]: newRecord,
      }));
      showToast(`🔥 New PR saved for ${lift}: ${newRecord.weight} kg!`);
    } else {
      showToast(`Lift logged: ${newRecord.weight} kg ${lift}`);
    }
  };

  const handleDeletePR = (lift: LiftType) => {
    setPRs((prev) => {
      const next = { ...prev };
      delete next[lift];
      return next;
    });
    showToast(`Deleted ${lift} PR`);
  };

  const handleDeleteHistoryEntry = (entryId: string) => {
    const entryToDelete = history.find((h) => h.id === entryId);
    const updatedHistory = history.filter((h) => h.id !== entryId);
    setHistory(updatedHistory);

    // If the deleted entry was the current PR for its lift, re-evaluate the PR from remaining history
    if (entryToDelete) {
      const lift = entryToDelete.lift;
      const remainingForLift = updatedHistory.filter((h) => h.lift === lift);
      if (remainingForLift.length > 0) {
        const bestRemaining = remainingForLift.reduce(
          (best, curr) => (curr.weight > best.weight ? curr : best),
          remainingForLift[0]
        );
        setPRs((prev) => ({
          ...prev,
          [lift]: bestRemaining,
        }));
      } else {
        setPRs((prev) => {
          const next = { ...prev };
          delete next[lift];
          return next;
        });
      }
    }

    showToast('Entry removed from history');
  };

  // Load a PR's bar & plates directly onto current barbell
  const handleLoadPRToBar = (record: PRRecord) => {
    if (BAR_WEIGHT_OPTIONS.includes(record.barWeight as BarWeightOption)) {
      setBarWeight(record.barWeight as BarWeightOption);
    }
    setPlatesPerSide({ ...record.platesPerSide });
    showToast(`Loaded ${record.lift} PR (${record.weight}kg) onto bar`);
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-28 md:pb-16">
      <OfflineIndicator />

      {/* Floating Notification Toast */}
      {notificationToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* App Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950 border border-emerald-400/30">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white leading-none">
                BARBELL PR
              </h1>
              <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
                Plate & PR Calculator
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition relative text-xs font-semibold active:scale-95"
              title="View Lift History Log"
            >
              <History className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="hidden min-[380px]:inline">History</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold leading-none">
                  {history.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowQuickInfo(!showQuickInfo)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition"
              title="App Info & Device Cookie"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info expandable card */}
        {showQuickInfo && (
          <div className="max-w-2xl mx-auto mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Device & Storage Info</span>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Cookie: {deviceId || 'Syncing...'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Your lifts and settings are securely preserved locally on this device using local storage and cookies without requiring an account. Works completely offline.
            </p>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 space-y-4">
        {/* TOTAL LOAD & BAR SELECTION HERO CARD */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Bar Config Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
            {/* Bar Weight Dropdown */}
            <div className="flex-1">
              <label
                htmlFor="bar-select"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1"
              >
                1. Select Barbell Weight
              </label>
              <div className="relative">
                <select
                  id="bar-select"
                  value={barWeight}
                  onChange={(e) => {
                    triggerHaptic('light');
                    setBarWeight(Number(e.target.value) as BarWeightOption);
                  }}
                  className="w-full appearance-none bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition cursor-pointer pr-10"
                >
                  {BAR_OPTIONS.map((option) => (
                    <option key={option.weight} value={option.weight}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Quick Reset Button */}
            {Object.keys(platesPerSide).length > 0 && (
              <button
                type="button"
                onClick={handleClearAllPlates}
                className="self-end sm:self-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-2.5 rounded-xl transition active:scale-95"
                title="Unload all plates"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Bar</span>
              </button>
            )}
          </div>

          {/* Big Digital Total Load Display */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>Total Loaded Weight</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-mono font-normal">
                  Live
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow-md">
                  {totalWeight}
                </span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  KG
                </span>
              </div>

              {/* Breakdown detail */}
              <div className="text-xs text-slate-400 font-medium mt-1 flex flex-wrap items-center gap-2">
                <span>{barWeight}kg bar</span>
                <span>+</span>
                <span className="text-slate-200">
                  {weightPerSide}kg on each side ({weightPerSide * 2}kg plates total)
                </span>
              </div>
            </div>

            {/* Bodyweight Ratio Badge if set */}
            {bwRatio && (
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-center sm:text-right shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Lift Strength Ratio
                </span>
                <span className="text-2xl font-black font-mono text-amber-400 leading-tight">
                  {bwRatio.percentage}
                </span>
                <span className="text-[11px] font-semibold text-slate-300 font-mono">
                  {bwRatio.multiplier} of your {bodyWeight}kg BW
                </span>
              </div>
            )}
          </div>

          {/* Prominent "Save PR" Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                setIsSaveModalOpen(true);
              }}
              className="w-full group relative overflow-hidden py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm tracking-wide uppercase shadow-xl shadow-emerald-950/60 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5 text-amber-300 transition-transform group-hover:scale-110" />
              <span>Save PR for this Weight ({totalWeight} kg)</span>
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            </button>
          </div>
        </div>

        {/* 2. BARBELL VISUALIZER */}
        <BarbellVisualizer
          barWeight={barWeight}
          platesPerSide={platesPerSide}
          onRemovePlate={handleRemovePlate}
        />

        {/* 3. CURRENT BODY WEIGHT INPUT */}
        <BodyweightInput
          bodyWeight={bodyWeight}
          onUpdateBodyweight={setBodyWeight}
        />

        {/* 4. PLATE SELECTOR (Standard & Partial Olympic Plates) */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                Load Plates On Each Side
              </h2>
              <p className="text-[11px] text-slate-400">
                Tap + to add a plate pair (one to each sleeve). Tap − to remove.
              </p>
            </div>
          </div>

          <PlateSelector
            platesPerSide={platesPerSide}
            onAddPlate={handleAddPlate}
            onRemovePlate={handleRemovePlate}
            onClearAll={handleClearAllPlates}
          />
        </div>

        {/* 5. PR TABLE WITH % OF BODYWEIGHT */}
        <PRTable
          prs={prs}
          bodyWeight={bodyWeight}
          onLoadPRToBar={handleLoadPRToBar}
          onDeletePR={handleDeletePR}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
          historyCount={history.length}
          onOpenSaveModalForLift={(lift) => {
            setIsSaveModalOpen(true);
          }}
        />
      </main>

      {/* STICKY BOTTOM BAR FOR MOBILE GYM CONVENIENCE */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-4 py-2.5 sm:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Barbell Load</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-white">{totalWeight}</span>
              <span className="text-xs font-bold text-emerald-400">kg</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              setIsSaveModalOpen(true);
            }}
            className="flex-1 max-w-[200px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition"
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>Save PR</span>
          </button>
        </div>
      </div>

      {/* SAVE PR MODAL */}
      <SavePRModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentWeight={totalWeight}
        barWeight={barWeight}
        platesPerSide={platesPerSide}
        bodyWeight={bodyWeight}
        existingPRs={prs}
        onSavePR={handleSavePR}
      />

      {/* LIFT HISTORY MODAL */}
      <LiftHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onLoadRecordToBar={handleLoadPRToBar}
        onDeleteEntry={handleDeleteHistoryEntry}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
}
