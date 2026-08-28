import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { DoseCard } from './DoseCard'
import { useMediTrack } from '../../context/MediTrackContext'
import { useNotifications } from '../../context/NotificationContext'
import { DoseLog, Medicine } from '../../types'
import { getTimeOfDayGroup, formatTime12h } from '../../lib/notifications'
import {
  Calendar,
  Sparkles,
  Flame,
  Plus,
  AlertTriangle,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Droplets,
  Pill,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Bell
} from 'lucide-react'
import { MedicineFormIcon } from '../ui/PillBadge'
import { AddEditMedicineModal } from '../medicines/AddEditMedicineModal'

export const TodayDashboard: React.FC = () => {
  const {
    medicines,
    doseLogs,
    markDose,
    logAsNeededDose,
    simulatedTime,
    setActiveTab,
    refillMedicine
  } = useMediTrack()

  const { triggerTestNotification } = useNotifications()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const todayStr = simulatedTime.isSimulated
    ? simulatedTime.simulatedDateStr
    : new Date().toISOString().split('T')[0]

  const currentHHMM = simulatedTime.isSimulated
    ? simulatedTime.simulatedTimeStr
    : `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`

  // Filter logs for today
  const todayLogs = doseLogs.filter(l => l.scheduledDate === todayStr)
  
  // Calculate adherence for today
  const totalScheduled = todayLogs.length
  const takenCount = todayLogs.filter(l => l.status === 'taken' || l.status === 'taken_late').length
  const adherencePercent = totalScheduled > 0 ? Math.round((takenCount / totalScheduled) * 100) : 100

  // Low stock medicines
  const lowStockMeds = medicines.filter(
    m => m.remainingQuantity !== undefined && m.lowStockThreshold !== undefined && m.remainingQuantity <= m.lowStockThreshold
  )

  // As-Needed (PRN) medicines
  const prnMeds = medicines.filter(m => {
    // Has no scheduled times or frequency is as_needed
    return m.isActive
  })

  // Group today's scheduled doses by time of day
  const morningLogs = todayLogs.filter(l => getTimeOfDayGroup(l.scheduledTime) === 'morning')
  const afternoonLogs = todayLogs.filter(l => getTimeOfDayGroup(l.scheduledTime) === 'afternoon')
  const eveningLogs = todayLogs.filter(l => getTimeOfDayGroup(l.scheduledTime) === 'evening')
  const nightLogs = todayLogs.filter(l => getTimeOfDayGroup(l.scheduledTime) === 'night')

  const timeSections = [
    { title: 'Morning Doses', subtitle: '5:00 AM – 12:00 PM', icon: <Sunrise className="w-5 h-5 text-amber-500" />, logs: morningLogs },
    { title: 'Afternoon Doses', subtitle: '12:00 PM – 5:00 PM', icon: <Sun className="w-5 h-5 text-orange-500" />, logs: afternoonLogs },
    { title: 'Evening Doses', subtitle: '5:00 PM – 9:00 PM', icon: <Sunset className="w-5 h-5 text-indigo-500" />, logs: eveningLogs },
    { title: 'Night Doses', subtitle: '9:00 PM – 5:00 AM', icon: <Moon className="w-5 h-5 text-blue-500" />, logs: nightLogs }
  ]

  const getMedicineForLog = (log: DoseLog): Medicine => {
    return (
      medicines.find(m => m.id === log.medicineId) || {
        id: log.medicineId,
        name: 'Prescription Medication',
        dosageAmount: '1',
        dosageUnit: 'tablets',
        form: 'tablet',
        color: '#0d9488',
        shape: 'round',
        instructions: 'anytime',
        isCritical: false,
        isActive: true,
        createdAt: '2026-08-01'
      }
    )
  }

  const handleMarkTaken = (logId: string) => {
    markDose(logId, 'taken', undefined, 'app')
  }

  const handleSnooze = (logId: string) => {
    const targetLog = todayLogs.find(l => l.id === logId)
    if (targetLog) {
      const med = getMedicineForLog(targetLog)
      triggerTestNotification(med, targetLog.scheduledTime)
    }
  }

  const handleSkip = (logId: string, reason: string) => {
    markDose(logId, 'skipped', reason, 'app')
  }

  const handleReset = (logId: string) => {
    markDose(logId, 'pending', undefined, 'app')
  }

  return (
    <div className="space-y-6">
      {/* Top Hero Banner with Adherence Ring */}
      <GlassCard className="border-teal-500/25 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-sky-500/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Greeting, Date, Streak */}
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-800 dark:text-teal-200 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {new Date(todayStr).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Today's Schedule & Routine
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-lg">
              {takenCount === totalScheduled && totalScheduled > 0
                ? '🎉 All doses taken for today! Excellent routine consistency.'
                : `You have completed ${takenCount} of ${totalScheduled} scheduled doses today.`}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-500/30">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>14-Day Streak</span>
              </span>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>
          </div>

          {/* Right: Radial Progress Ring */}
          <div className="flex items-center gap-5 bg-white/50 dark:bg-slate-900/60 p-4 sm:p-5 rounded-3xl border border-white/60 dark:border-slate-800/80 shadow-md shrink-0">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Circle */}
                <path
                  className="text-slate-200 dark:text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Progress Circle */}
                <path
                  className="text-teal-500 transition-all duration-700 ease-out"
                  strokeDasharray={`${adherencePercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono leading-none">
                  {adherencePercent}%
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Adherence</span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {takenCount} Taken
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {totalScheduled - takenCount} Remaining
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Low Stock Warning Alert if any */}
      {lowStockMeds.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                Refill Reminder: {lowStockMeds.length} Medication(s) Running Low
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                {lowStockMeds.map(m => `${m.name} (${m.remainingQuantity} left)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('medicines')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Manage Refills</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Time-of-Day Doses */}
      <div className="space-y-6">
        {timeSections.map((section, idx) => {
          if (section.logs.length === 0) return null

          return (
            <div key={idx} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 shadow-sm">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-xs text-slate-500">{section.subtitle}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {section.logs.filter(l => l.status === 'taken' || l.status === 'taken_late').length} / {section.logs.length} Done
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {section.logs.map(log => {
                  const medicine = getMedicineForLog(log)
                  return (
                    <DoseCard
                      key={log.id}
                      doseLog={log}
                      medicine={medicine}
                      onMarkTaken={handleMarkTaken}
                      onSnooze={handleSnooze}
                      onSkip={handleSkip}
                      onResetStatus={handleReset}
                      currentTimeStr={currentHHMM}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* As-Needed (PRN) Quick Log Bar */}
      <div className="mt-8 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Take As-Needed (PRN) Medications</span>
            </h3>
            <p className="text-xs text-slate-500">Log immediate dose for rescue inhalers, pain, or allergy meds.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {prnMeds.map(med => (
            <GlassCard key={med.id} className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: med.color || '#0d9488' }}
                >
                  <MedicineFormIcon form={med.form} className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {med.name}
                  </h5>
                  <p className="text-xs text-slate-500 font-mono">
                    {med.dosageAmount} {med.dosageUnit}
                  </p>
                </div>
              </div>

              <button
                onClick={() => logAsNeededDose(med.id)}
                className="py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Dose</span>
              </button>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Add Medicine Modal */}
      <AddEditMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
