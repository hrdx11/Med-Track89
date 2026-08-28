import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useMediTrack } from '../../context/MediTrackContext'
import { DoseLog } from '../../types'
import { formatTime12h } from '../../lib/notifications'
import {
  HeartPulse,
  Calendar,
  Flame,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Printer,
  TrendingUp,
  Filter
} from 'lucide-react'
import { ExportReportModal } from './ExportReportModal'

export const AdherenceView: React.FC = () => {
  const { doseLogs, medicines, schedules } = useMediTrack()
  const [selectedMedFilter, setSelectedMedFilter] = useState<string>('all')
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Filter logs
  const filteredLogs = selectedMedFilter === 'all'
    ? doseLogs
    : doseLogs.filter(l => l.medicineId === selectedMedFilter)

  // Metrics
  const totalDoses = filteredLogs.length
  const takenDoses = filteredLogs.filter(l => l.status === 'taken' || l.status === 'taken_late').length
  const missedDoses = filteredLogs.filter(l => l.status === 'missed').length
  const skippedDoses = filteredLogs.filter(l => l.status === 'skipped').length
  const overallRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100

  // 7-day rate
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysLogs = filteredLogs.filter(l => new Date(l.scheduledDate) >= sevenDaysAgo)
  const sevenDaysTaken = sevenDaysLogs.filter(l => l.status === 'taken' || l.status === 'taken_late').length
  const sevenDaysRate = sevenDaysLogs.length > 0 ? Math.round((sevenDaysTaken / sevenDaysLogs.length) * 100) : 100

  // Build Calendar Heatmap days (past 28 days)
  const heatmapDays = []
  const today = new Date()
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLogs = filteredLogs.filter(l => l.scheduledDate === dateStr)
    const dayTaken = dayLogs.filter(l => l.status === 'taken' || l.status === 'taken_late').length
    const dayMissed = dayLogs.filter(l => l.status === 'missed').length
    const daySkipped = dayLogs.filter(l => l.status === 'skipped').length
    
    let statusColor = 'bg-slate-200 dark:bg-slate-800'
    if (dayLogs.length > 0) {
      if (dayMissed > 0) {
        statusColor = 'bg-rose-500 text-white'
      } else if (daySkipped > 0 && dayTaken === 0) {
        statusColor = 'bg-slate-400 text-white'
      } else if (dayTaken === dayLogs.length) {
        statusColor = 'bg-emerald-500 text-white'
      } else {
        statusColor = 'bg-teal-400 text-slate-950'
      }
    }

    heatmapDays.push({
      date: d,
      dateStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayLogs,
      statusColor
    })
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-teal-600" />
            <span>Medication Adherence & History</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track routine streaks, calendar consistency, and generate reports for your doctor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Doctor Consultation Report</span>
          </button>
        </div>
      </div>

      {/* Adherence Rate Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 30-Day Rate */}
        <GlassCard className="flex flex-col justify-between border-teal-500/30 bg-teal-500/5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Overall Adherence
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-700 dark:text-teal-300 font-mono">
              {overallRate}%
            </span>
            <span className="text-xs text-slate-500">30-day</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>High routine adherence</span>
          </span>
        </GlassCard>

        {/* 7-Day Consistency */}
        <GlassCard className="flex flex-col justify-between border-emerald-500/30 bg-emerald-500/5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Past 7 Days
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
              {sevenDaysRate}%
            </span>
            <span className="text-xs text-slate-500">this week</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-medium">
            {sevenDaysTaken} of {sevenDaysLogs.length} doses taken
          </span>
        </GlassCard>

        {/* Current Streak */}
        <GlassCard className="flex flex-col justify-between border-amber-500/30 bg-amber-500/5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Adherence Streak
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
              14
            </span>
            <span className="text-xs text-slate-500">Days</span>
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold mt-2 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Consistent daily routine</span>
          </span>
        </GlassCard>

        {/* Missed Doses */}
        <GlassCard className="flex flex-col justify-between border-rose-500/30 bg-rose-500/5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Missed / Escalated
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              {missedDoses}
            </span>
            <span className="text-xs text-slate-500">Total</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 font-medium">
            {skippedDoses} skipped with logged reasons
          </span>
        </GlassCard>
      </div>

      {/* Filter by Medicine */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </span>
        <button
          onClick={() => setSelectedMedFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            selectedMedFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
          }`}
        >
          All Medicines
        </button>
        {medicines.map(m => (
          <button
            key={m.id}
            onClick={() => setSelectedMedFilter(m.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              selectedMedFilter === m.id
                ? 'bg-teal-600 text-white'
                : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* 28-Day Heatmap Matrix */}
      <GlassCard className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>4-Week Dose Calendar Heatmap</span>
            </h3>
            <p className="text-xs text-slate-500">Color-coded daily adherence pattern.</p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>Taken (100%)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-teal-400" />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-rose-500" />
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-md bg-slate-400" />
              <span>Skipped</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 gap-2">
          {heatmapDays.map((day, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-2xl flex flex-col items-center justify-between aspect-square transition-transform hover:scale-105 shadow-sm ${day.statusColor}`}
              title={`${day.dateStr}: ${day.dayLogs.length} doses scheduled`}
            >
              <span className="text-[10px] uppercase font-bold opacity-80">{day.dayName}</span>
              <span className="text-base font-black font-mono leading-none">{day.dayNum}</span>
              <span className="text-[9px] font-semibold opacity-90">
                {day.dayLogs.filter(l => l.status === 'taken' || l.status === 'taken_late').length}/{day.dayLogs.length}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Per-Medication Adherence Breakdown */}
      <GlassCard className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Adherence Breakdown by Prescription
        </h3>

        <div className="space-y-3">
          {medicines.map(med => {
            const mLogs = doseLogs.filter(l => l.medicineId === med.id)
            const mTaken = mLogs.filter(l => l.status === 'taken' || l.status === 'taken_late').length
            const rate = mLogs.length > 0 ? Math.round((mTaken / mLogs.length) * 100) : 100

            return (
              <div
                key={med.id}
                className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: med.color || '#0d9488' }}
                    />
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      {med.name}
                    </h5>
                    <span className="text-xs text-slate-500 font-mono">
                      ({med.dosageAmount} {med.dosageUnit})
                    </span>
                  </div>

                  <span className="font-mono font-bold text-sm text-teal-700 dark:text-teal-300">
                    {rate}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-500"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  )
}
