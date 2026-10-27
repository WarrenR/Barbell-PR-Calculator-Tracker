import React from 'react';
import { Trophy, ArrowUpRight, Dumbbell, Trash2, Calendar, Award, History } from 'lucide-react';
import { LiftType, PRRecord } from '../types';
import { calculateBodyweightRatio, triggerHaptic } from '../utils/storage';

interface PRTableProps {
  prs: {
    Squat?: PRRecord;
    'Bench Press'?: PRRecord;
    Deadlift?: PRRecord;
  };
  bodyWeight: number | null;
  onLoadPRToBar: (record: PRRecord) => void;
  onDeletePR: (lift: LiftType) => void;
  onOpenSaveModalForLift?: (lift: LiftType) => void;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export const PRTable: React.FC<PRTableProps> = ({
  prs,
  bodyWeight,
  onLoadPRToBar,
  onDeletePR,
  onOpenSaveModalForLift,
  onOpenHistory,
  historyCount,
}) => {
  const lifts: { lift: LiftType; badgeColor: string; iconBg: string }[] = [
    { lift: 'Squat', badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', iconBg: 'bg-emerald-500/20' },
    { lift: 'Bench Press', badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20', iconBg: 'bg-blue-500/20' },
    { lift: 'Deadlift', badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20', iconBg: 'bg-amber-500/20' },
  ];

  // Calculate 3-lift Powerlifting Total if any exist
  const prList = Object.values(prs).filter((p): p is PRRecord => Boolean(p));
  const totalKg = prList.reduce((sum, item) => sum + item.weight, 0);
  const totalRatio = bodyWeight && totalKg > 0 ? (totalKg / bodyWeight).toFixed(2) : null;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl backdrop-blur-sm space-y-4">
      {/* Title & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Personal Records (PR)
            </h3>
            <p className="text-[11px] text-slate-400">Current best lifts & bodyweight strength ratios</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {totalKg > 0 && (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-amber-400" />
              <div className="text-xs">
                <span className="text-slate-400 mr-1.5">Total:</span>
                <span className="font-black text-white font-mono">{totalKg} kg</span>
                {totalRatio && (
                  <span className="text-amber-300 ml-1.5 font-semibold text-[11px]">
                    ({totalRatio}x BW)
                  </span>
                )}
              </div>
            </div>
          )}

          {onOpenHistory && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onOpenHistory();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition active:scale-95"
              title="View Lift History Log"
            >
              <History className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>History</span>
              {historyCount !== undefined && historyCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold leading-none">
                  {historyCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Lift</th>
              <th className="py-3 px-3">PR Weight</th>
              <th className="py-3 px-3">
                <span className="flex items-center gap-1">
                  % of Body Weight
                  {!bodyWeight && (
                    <span className="text-[9px] lowercase font-normal text-amber-400">(set BW above)</span>
                  )}
                </span>
              </th>
              <th className="py-3 px-3 hidden sm:table-cell">Date</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-medium">
            {lifts.map(({ lift, badgeColor }) => {
              const record = prs[lift];
              const ratio = record ? calculateBodyweightRatio(record.weight, bodyWeight) : null;

              return (
                <tr
                  key={lift}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Lift Name */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${badgeColor}`}>
                        {lift}
                      </span>
                    </div>
                  </td>

                  {/* PR Weight */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {record ? (
                      <span className="font-extrabold text-white text-sm font-mono tracking-tight">
                        {record.weight} <span className="text-[11px] font-normal text-slate-400">kg</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">No PR yet</span>
                    )}
                  </td>

                  {/* % of Body Weight */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {record ? (
                      ratio ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-mono font-bold text-amber-300 text-sm">
                            {ratio.percentage}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold font-mono">
                            ({ratio.multiplier} BW)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">
                          Enter BW above
                        </span>
                      )
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-400 text-[11px] hidden sm:table-cell font-mono">
                    {record ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(record.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-right">
                    {record ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            onLoadPRToBar(record);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition active:scale-95"
                          title="Load this PR's weight & plates directly onto the barbell"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          <span>Load Bar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete your ${lift} PR of ${record.weight}kg?`)) {
                              triggerHaptic('medium');
                              onDeletePR(lift);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete PR"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          onOpenSaveModalForLift?.(lift);
                        }}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 font-medium underline underline-offset-2"
                      >
                        Set PR
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
