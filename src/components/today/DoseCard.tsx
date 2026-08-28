import React, { useState } from 'react'
import { DoseLog, Medicine } from '../../types'
import { FoodInstructionBadge, MedicineFormIcon, StatusBadge } from '../ui/PillBadge'
import { formatTime12h, getTimeDifferenceDescription } from '../../lib/notifications'
import {
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  AlertCircle,
  MoreVertical,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react'
import { SkipReasonModal } from './SkipReasonModal'

interface DoseCardProps {
  doseLog: DoseLog
  medicine: Medicine
  onMarkTaken: (logId: string) => void
  onSnooze: (logId: string) => void
  onSkip: (logId: string, reason: string) => void
  onResetStatus?: (logId: string) => void
  currentTimeStr?: string
}

export const DoseCard: React.FC<DoseCardProps> = ({
  doseLog,
  medicine,
  onMarkTaken,
  onSnooze,
  onSkip,
  onResetStatus,
  currentTimeStr
}) => {
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false)
  const isTaken = doseLog.status === 'taken' || doseLog.status === 'taken_late'
  const isSkipped = doseLog.status === 'skipped'
  const isMissed = doseLog.status === 'missed'
  const isPending = doseLog.status === 'pending'

  const timeDiff = getTimeDifferenceDescription(doseLog.scheduledTime, currentTimeStr)

  return (
    <>
      <div
        className={`p-4 sm:p-5 rounded-3xl transition-all duration-200 border ${
          isTaken
            ? 'glass-card bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/25 opacity-90'
            : isMissed
            ? 'glass-card bg-rose-500/8 dark:bg-rose-500/15 border-rose-500/40 shadow-rose-500/5'
            : isSkipped
            ? 'glass-card bg-slate-500/5 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 opacity-75'
            : 'glass-card hover:border-teal-500/40 hover:bg-white/80 dark:hover:bg-slate-900/80 shadow-md'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Pill Visual, Name, Dosage, Instructions */}
          <div className="flex items-start gap-3.5">
            {/* Pill Shape Box */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md transition-transform"
              style={{ backgroundColor: medicine.color || '#0d9488' }}
            >
              <MedicineFormIcon form={medicine.form} className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            {/* Medicine Meta */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {medicine.name}
                </h4>
                {medicine.isCritical && (
                  <span
                    className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1"
                    title="Critical Routine Medication"
                  >
                    <ShieldAlert className="w-3 h-3" />
                    Critical
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 flex-wrap font-medium">
                <span className="font-bold text-slate-800 dark:text-slate-100 font-mono">
                  {medicine.dosageAmount} {medicine.dosageUnit}
                </span>
                <span>•</span>
                <span className="capitalize">{medicine.form}</span>
                <span>•</span>
                <FoodInstructionBadge instruction={medicine.instructions} />
              </div>

              {/* Status or Reason note */}
              {doseLog.skipReason && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reason: "{doseLog.skipReason}"</span>
                </p>
              )}

              {isTaken && doseLog.takenAt && (
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    Logged at{' '}
                    {formatTime12h(
                      `${new Date(doseLog.takenAt).getHours()}:${String(new Date(doseLog.takenAt).getMinutes()).padStart(2, '0')}`
                    )}
                    {doseLog.loggedVia && ` (via ${doseLog.loggedVia})`}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Right: Scheduled Time & Action Buttons */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-800/60">
            {/* Scheduled Time & Badge */}
            <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-0.5">
              <div className="flex items-center gap-1.5 font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{formatTime12h(doseLog.scheduledTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={doseLog.status} />
                {isPending && (
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    ({timeDiff.label})
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isPending && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Mark Taken Button (Large 48px tap target) */}
                <button
                  onClick={() => onMarkTaken(doseLog.id)}
                  className="py-2.5 px-4 sm:px-5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-teal-600/25 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  title="Mark Dose Taken"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Taken</span>
                </button>

                {/* Snooze Button */}
                <button
                  onClick={() => onSnooze(doseLog.id)}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  title="Snooze Reminder 15 mins"
                >
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="hidden md:inline">Snooze</span>
                </button>

                {/* Skip Button */}
                <button
                  onClick={() => setIsSkipModalOpen(true)}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Skip this dose"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Reset status if already marked */}
            {!isPending && onResetStatus && (
              <button
                onClick={() => onResetStatus(doseLog.id)}
                className="text-xs text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 font-medium flex items-center gap-1 cursor-pointer underline underline-offset-2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo / Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Skip Reason Modal */}
      <SkipReasonModal
        isOpen={isSkipModalOpen}
        onClose={() => setIsSkipModalOpen(false)}
        doseLog={doseLog}
        medicine={medicine}
        onConfirmSkip={reason => onSkip(doseLog.id, reason)}
      />
    </>
  )
}
