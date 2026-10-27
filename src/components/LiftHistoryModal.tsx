import React, { useState, useMemo } from 'react';
import {
  History,
  X,
  Dumbbell,
  Calendar,
  Trash2,
  ArrowUpRight,
  TrendingUp,
  ListFilter,
  Award,
  Sparkles,
  Download,
  Check,
} from 'lucide-react';
import { LiftType, PRRecord } from '../types';
import { triggerHaptic } from '../utils/storage';
import { exportHistoryToCSV } from '../utils/exportCSV';

interface LiftHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PRRecord[];
  onLoadRecordToBar: (record: PRRecord) => void;
  onDeleteEntry: (entryId: string) => void;
  onClearHistory: () => void;
}

export const LiftHistoryModal: React.FC<LiftHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadRecordToBar,
  onDeleteEntry,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'chart'>('log');
  const [chartLiftFilter, setChartLiftFilter] = useState<LiftType | 'All'>('All');
  const [selectedPoint, setSelectedPoint] = useState<PRRecord | null>(null);
  const [exportedRecently, setExportedRecently] = useState(false);

  const handleExport = () => {
    triggerHaptic('success');
    const success = exportHistoryToCSV(history);
    if (success) {
      setExportedRecently(true);
      setTimeout(() => setExportedRecently(false), 2500);
    }
  };

  // Newest first for log list
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [history]
  );

  // Chronological (oldest first) for charting
  const chronologicalHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [history]
  );

  // Filtered for chart
  const chartFilteredHistory = useMemo(() => {
    if (chartLiftFilter === 'All') return chronologicalHistory;
    return chronologicalHistory.filter((item) => item.lift === chartLiftFilter);
  }, [chronologicalHistory, chartLiftFilter]);

  // Group by lift for individual lines
  const liftsData = useMemo(() => {
    const squatLifts = chronologicalHistory.filter((h) => h.lift === 'Squat');
    const benchLifts = chronologicalHistory.filter((h) => h.lift === 'Bench Press');
    const deadliftLifts = chronologicalHistory.filter((h) => h.lift === 'Deadlift');
    return {
      Squat: squatLifts,
      'Bench Press': benchLifts,
      Deadlift: deadliftLifts,
    };
  }, [chronologicalHistory]);

  // Chart bounds & scales
  const chartBounds = useMemo(() => {
    const points = chartLiftFilter === 'All' ? chronologicalHistory : chartFilteredHistory;
    if (points.length === 0) return null;

    const weights = points.map((p) => p.weight);
    const minRaw = Math.min(...weights);
    const maxRaw = Math.max(...weights);

    // Give nice margins to Y axis
    const minWeight = Math.max(0, Math.floor((minRaw - 10) / 10) * 10);
    const maxWeight = Math.ceil((maxRaw + 15) / 10) * 10;
    const range = maxWeight - minWeight || 20;

    return { minWeight, maxWeight, range };
  }, [chronologicalHistory, chartFilteredHistory, chartLiftFilter]);

  // SVG Chart Layout Metrics
  const svgWidth = 460;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const getCoordinates = (
    item: PRRecord,
    index: number,
    totalPoints: number,
    bounds: { minWeight: number; maxWeight: number; range: number }
  ) => {
    const x =
      totalPoints <= 1
        ? padLeft + plotWidth / 2
        : padLeft + (index / (totalPoints - 1)) * plotWidth;
    const yRatio = (item.weight - bounds.minWeight) / bounds.range;
    const y = padTop + plotHeight - yRatio * plotHeight;
    return { x, y };
  };

  const getLiftColor = (lift: LiftType) => {
    switch (lift) {
      case 'Squat':
        return { stroke: '#10B981', fill: '#059669', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'Bench Press':
        return { stroke: '#3B82F6', fill: '#2563EB', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'Deadlift':
        return { stroke: '#F59E0B', fill: '#D97706', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' };
    }
  };

  // Calculate improvement statistics
  const stats = useMemo(() => {
    const getStatsForLift = (lift: LiftType) => {
      const records = liftsData[lift];
      if (records.length === 0) return null;
      const initial = records[0].weight;
      const best = Math.max(...records.map((r) => r.weight));
      const diff = Math.round((best - initial) * 100) / 100;
      return { initial, best, diff, count: records.length };
    };

    return {
      Squat: getStatsForLift('Squat'),
      'Bench Press': getStatsForLift('Bench Press'),
      Deadlift: getStatsForLift('Deadlift'),
    };
  }, [liftsData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-700/80 text-white shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Lift History & PR Progress</h2>
              <p className="text-xs text-slate-400">View logged lifts and track your strength gains</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition active:scale-95"
                title="Export all logs to a .CSV spreadsheet file"
              >
                {exportedRecently ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden min-[380px]:inline">Export CSV</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector: Log Entries vs Progress Chart */}
        <div className="px-4 sm:px-5 pt-3 pb-2 flex items-center justify-between bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('log');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'log'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Log Entries</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">
                {history.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('chart');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'chart'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Progress Chart</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>
          </div>

          {activeTab === 'chart' && (
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Interactive timeline
            </div>
          )}
        </div>

        {/* TAB 1: LOG ENTRIES LIST */}
        {activeTab === 'log' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 scrollbar-thin">
            {sortedHistory.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-sm">
                <Dumbbell className="w-12 h-12 mx-auto mb-2 text-slate-500 opacity-60" />
                <p className="font-semibold text-slate-300">No lifts saved yet.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Load up your barbell and tap "Save PR" to record your progress!
                </p>
              </div>
            ) : (
              sortedHistory.map((item) => {
                const color = getLiftColor(item.lift);
                return (
                  <div
                    key={item.id}
                    className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${color.bg} ${color.text} ${color.border}`}>
                          {item.lift}
                        </span>
                        <span className="text-base font-black text-white font-mono">
                          {item.weight} <span className="text-xs font-normal text-slate-400">kg</span>
                        </span>
                        {item.percentageOfBW && (
                          <span className="text-xs font-semibold text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {item.percentageOfBW}% BW
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(item.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{item.barWeight}kg bar</span>
                        {item.notes && (
                          <>
                            <span>•</span>
                            <span className="text-slate-300 italic truncate max-w-[200px]" title={item.notes}>
                              "{item.notes}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions: Load Bar + Remove Entry */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          onLoadRecordToBar(item);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition active:scale-95"
                        title="Load these plates onto barbell"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span className="hidden min-[400px]:inline">Load</span>
                      </button>

                      {/* Remove single entry button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete this ${item.lift} log of ${item.weight}kg recorded on ${new Date(item.date).toLocaleDateString()}?`
                            )
                          ) {
                            triggerHaptic('medium');
                            onDeleteEntry(item.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition active:scale-95"
                        title="Remove this entry from log history"
                        aria-label="Remove entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: VISUAL PROGRESS CHART */}
        {activeTab === 'chart' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
            {chronologicalHistory.length < 1 ? (
              <div className="py-14 text-center text-slate-400 text-sm">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-slate-500 opacity-60" />
                <p className="font-semibold text-slate-300">No chart data yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Save your PR lifts to see your strength progression curve over time!
                </p>
              </div>
            ) : (
              <>
                {/* Lift Filter Pills */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['All', 'Squat', 'Bench Press', 'Deadlift'] as const).map((filter) => {
                      const isSelected = chartLiftFilter === filter;
                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setChartLiftFilter(filter);
                            setSelectedPoint(null);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                            isSelected
                              ? 'bg-slate-700 text-white shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {filter}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Squat</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span>Bench</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>Deadlift</span>
                    </span>
                  </div>
                </div>

                {/* SVG Visual Progress Chart */}
                {chartBounds && chartFilteredHistory.length > 0 ? (
                  <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-3 relative shadow-inner select-none">
                    <svg
                      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                      className="w-full h-auto overflow-visible"
                    >
                      {/* Y-axis grid lines and labels */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = padTop + plotHeight - ratio * plotHeight;
                        const weightVal = Math.round(chartBounds.minWeight + ratio * chartBounds.range);
                        return (
                          <g key={`grid-${i}`}>
                            <line
                              x1={padLeft}
                              y1={y}
                              x2={padLeft + plotWidth}
                              y2={y}
                              stroke="#334155"
                              strokeWidth="1"
                              strokeDasharray={ratio === 0 ? 'none' : '3 3'}
                              opacity={0.4}
                            />
                            <text
                              x={padLeft - 8}
                              y={y + 3.5}
                              textAnchor="end"
                              fill="#64748B"
                              fontSize="10"
                              fontFamily="monospace"
                              fontWeight="600"
                            >
                              {weightVal}kg
                            </text>
                          </g>
                        );
                      })}

                      {/* Render Lines for each Lift */}
                      {(['Squat', 'Bench Press', 'Deadlift'] as LiftType[]).map((lift) => {
                        if (chartLiftFilter !== 'All' && chartLiftFilter !== lift) return null;
                        const series = liftsData[lift];
                        if (series.length === 0) return null;

                        const color = getLiftColor(lift);

                        // Build polyline points
                        const pointsStr = series
                          .map((item) => {
                            // Find position in chronological timeline
                            const idx = chronologicalHistory.findIndex((h) => h.id === item.id);
                            const { x, y } = getCoordinates(
                              item,
                              idx,
                              chronologicalHistory.length,
                              chartBounds
                            );
                            return `${x},${y}`;
                          })
                          .join(' ');

                        return (
                          <g key={`series-${lift}`}>
                            {series.length > 1 && (
                              <polyline
                                fill="none"
                                stroke={color.stroke}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={pointsStr}
                                opacity={0.85}
                              />
                            )}

                            {/* Data Points */}
                            {series.map((item) => {
                              const idx = chronologicalHistory.findIndex((h) => h.id === item.id);
                              const { x, y } = getCoordinates(
                                item,
                                idx,
                                chronologicalHistory.length,
                                chartBounds
                              );
                              const isSelected = selectedPoint?.id === item.id;

                              return (
                                <g
                                  key={`point-${item.id}`}
                                  onClick={() => {
                                    triggerHaptic('light');
                                    setSelectedPoint(item);
                                  }}
                                  className="cursor-pointer group"
                                >
                                  {/* Outer pulse when selected */}
                                  {isSelected && (
                                    <circle
                                      cx={x}
                                      cy={y}
                                      r="10"
                                      fill="none"
                                      stroke={color.stroke}
                                      strokeWidth="2"
                                      opacity="0.6"
                                      className="animate-ping"
                                    />
                                  )}
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r={isSelected ? 6 : 4.5}
                                    fill={color.stroke}
                                    stroke="#0f172a"
                                    strokeWidth="2"
                                    className="transition-transform group-hover:scale-125"
                                  />
                                </g>
                              );
                            })}
                          </g>
                        );
                      })}

                      {/* X-axis first and last date labels */}
                      {chronologicalHistory.length > 0 && (
                        <>
                          <text
                            x={padLeft}
                            y={svgHeight - 10}
                            textAnchor="start"
                            fill="#64748B"
                            fontSize="10"
                            fontFamily="monospace"
                          >
                            {new Date(chronologicalHistory[0].date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </text>

                          {chronologicalHistory.length > 1 && (
                            <text
                              x={padLeft + plotWidth}
                              y={svgHeight - 10}
                              textAnchor="end"
                              fill="#64748B"
                              fontSize="10"
                              fontFamily="monospace"
                            >
                              {new Date(
                                chronologicalHistory[chronologicalHistory.length - 1].date
                              ).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </text>
                          )}
                        </>
                      )}
                    </svg>

                    <div className="text-[10px] text-center text-slate-400 mt-1">
                      Tap any data point on the chart to inspect entry details
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No entries found for {chartLiftFilter}.
                  </div>
                )}

                {/* Selected Point Pop-out Card */}
                {selectedPoint && (
                  <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3.5 animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center justify-between gap-3 shadow-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">
                          {selectedPoint.lift}: {selectedPoint.weight} kg
                        </span>
                        {selectedPoint.percentageOfBW && (
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            ({selectedPoint.percentageOfBW}% BW)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(selectedPoint.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                        {selectedPoint.notes ? ` • "${selectedPoint.notes}"` : ''}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          onLoadRecordToBar(selectedPoint);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition active:scale-95"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Load Bar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPoint(null)}
                        className="text-slate-400 hover:text-white p-1"
                        aria-label="Dismiss details"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress Gain Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {(['Squat', 'Bench Press', 'Deadlift'] as LiftType[]).map((lift) => {
                    const st = stats[lift];
                    const color = getLiftColor(lift);
                    return (
                      <div
                        key={`stat-${lift}`}
                        className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className={`font-bold ${color.text}`}>{lift}</span>
                          <Award className="w-3.5 h-3.5 text-slate-400" />
                        </div>

                        {st ? (
                          <div className="mt-2">
                            <div className="text-lg font-black text-white font-mono leading-none">
                              {st.best} <span className="text-xs font-normal text-slate-400">kg</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                              <span>
                                {st.diff >= 0 ? `+${st.diff} kg gain` : `${st.diff} kg`}
                              </span>
                              <span className="font-mono text-slate-400">
                                {st.count} log{st.count > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-xs text-slate-400 italic">
                            No logs yet
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        {sortedHistory.length > 0 && (
          <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs flex-wrap gap-2">
            <span className="text-slate-400 font-mono">
              {sortedHistory.length} recorded lift{sortedHistory.length > 1 ? 's' : ''}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold transition active:scale-95 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30"
                title="Download CSV spreadsheet"
              >
                {exportedRecently ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Exported!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export to .CSV</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all lift history entries? (Your Current PRs will be kept)')) {
                    triggerHaptic('medium');
                    onClearHistory();
                  }
                }}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-semibold transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
