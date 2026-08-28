import React, { useState } from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { useMediTrack } from '../../context/MediTrackContext'
import { FoodInstructionBadge, MedicineFormIcon } from '../ui/PillBadge'
import {
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Volume2,
  Lock,
  Smartphone,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react'
import { formatTime12h } from '../../lib/notifications'

export const NotificationSimulator: React.FC = () => {
  const {
    activeAlert,
    dismissAlert,
    handleNotificationAction,
    isLockScreenOpen,
    setIsLockScreenOpen
  } = useNotifications()
  const { settings, simulatedTime, accessibilityMode } = useMediTrack()

  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState(false)

  if (!activeAlert && !isLockScreenOpen) return null

  const currentTimeDisplay = simulatedTime.isSimulated
    ? formatTime12h(simulatedTime.simulatedTimeStr)
    : formatTime12h(`${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`)

  const currentDateDisplay = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  })

  return (
    <>
      {/* 1. FLOATING PUSH NOTIFICATION BANNER (Always visible when alert triggers) */}
      {activeAlert && !isLockScreenOpen && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg animate-in slide-in-from-top-6 duration-300">
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/92 dark:bg-slate-950/95 text-white backdrop-blur-2xl border border-white/20 shadow-2xl shadow-slate-900/40 transition-all">
            {/* App Header & Time */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-500 text-white">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold tracking-wide uppercase text-teal-400">
                  MediTrack Reminder
                </span>
                <span className="text-slate-400">• Now</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLockScreenOpen(true)}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  title="View on simulated device lock screen"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Lock Screen</span>
                </button>
                <button
                  onClick={dismissAlert}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dose Information */}
            <div className="mt-3 flex items-start gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{ backgroundColor: activeAlert.medicine.color || '#0d9488' }}
              >
                <MedicineFormIcon form={activeAlert.medicine.form} className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1">
                  <h4 className="text-base sm:text-lg font-bold text-white truncate">
                    {activeAlert.medicine.name}
                  </h4>
                  <span className="text-xs font-mono font-bold text-teal-300 shrink-0">
                    {formatTime12h(activeAlert.scheduledTime)}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  {activeAlert.medicine.dosageAmount} {activeAlert.medicine.dosageUnit} •{' '}
                  <span className="text-amber-300">{activeAlert.instructions}</span>
                </p>
                {activeAlert.medicine.isCritical && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 mt-1">
                    <ShieldAlert className="w-3 h-3" />
                    Critical Routine Medication
                  </span>
                )}
              </div>
            </div>

            {/* Direct Action Buttons - The User Doesn't Need to Enter App! */}
            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2">
              {/* Mark Taken Button */}
              <button
                onClick={() => handleNotificationAction('taken', activeAlert.doseLogId)}
                className="py-2.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Taken</span>
              </button>

              {/* Snooze Button */}
              <div className="relative">
                <button
                  onClick={() => handleNotificationAction('snooze', activeAlert.doseLogId, settings.snoozeMinutes)}
                  className="w-full py-2.5 px-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Snooze {settings.snoozeMinutes}m</span>
                </button>
              </div>

              {/* Skip Button */}
              <button
                onClick={() => handleNotificationAction('skip', activeAlert.doseLogId)}
                className="py-2.5 px-2 rounded-xl bg-white/10 hover:bg-rose-500/30 hover:text-rose-200 text-slate-300 font-medium text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. FULL DEVICE LOCKSCREEN SIMULATOR (Demonstrating true out-of-app notification experience) */}
      {isLockScreenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm sm:max-w-md h-[90vh] max-h-[780px] rounded-[42px] border-4 border-slate-700 bg-gradient-to-b from-slate-900 via-indigo-950/80 to-slate-950 p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 mr-2" />
              <div className="w-10 h-1 rounded-full bg-slate-800" />
            </div>

            {/* Lock Screen Header: Clock & Date */}
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                <Lock className="w-3 h-3" />
                <span>MediTrack Secured Device</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight font-heading">
                {currentTimeDisplay}
              </h1>
              <p className="text-sm font-medium text-slate-300 mt-1">{currentDateDisplay}</p>
            </div>

            {/* Lock Screen Notification Card */}
            <div className="my-auto space-y-3">
              {activeAlert ? (
                <div className="p-5 rounded-3xl bg-white/12 backdrop-blur-2xl border border-white/20 shadow-xl animate-in zoom-in-95">
                  <div className="flex items-center justify-between text-xs text-teal-400 font-bold mb-2">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" />
                      <span>DOSE REMINDER DUE NOW</span>
                    </div>
                    <span className="text-slate-400">{formatTime12h(activeAlert.scheduledTime)}</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: activeAlert.medicine.color || '#0d9488' }}
                    >
                      <MedicineFormIcon form={activeAlert.medicine.form} className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{activeAlert.medicine.name}</h4>
                      <p className="text-xs text-slate-300">
                        {activeAlert.medicine.dosageAmount} {activeAlert.medicine.dosageUnit} •{' '}
                        {activeAlert.instructions}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2.5">
                    Actions available directly on lockscreen:
                  </p>

                  {/* 1-Tap Actions */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleNotificationAction('taken', activeAlert.doseLogId)}
                      className="py-3 px-2 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs flex flex-col items-center justify-center gap-1 shadow-md active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Taken</span>
                    </button>
                    <button
                      onClick={() => handleNotificationAction('snooze', activeAlert.doseLogId, settings.snoozeMinutes)}
                      className="py-3 px-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <Clock className="w-4 h-4 text-amber-300" />
                      <span>Snooze {settings.snoozeMinutes}m</span>
                    </button>
                    <button
                      onClick={() => handleNotificationAction('skip', activeAlert.doseLogId)}
                      className="py-3 px-2 rounded-2xl bg-white/10 hover:bg-rose-500/20 text-slate-300 font-medium text-xs flex flex-col items-center justify-center gap-1 active:scale-95 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Skip</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center text-slate-400 text-xs">
                  <Bell className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                  <span>No active dose alert right now.</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Use the Demo Toolbar below to trigger a test reminder.
                  </p>
                </div>
              )}
            </div>

            {/* Lock Screen Bottom Bar */}
            <div className="text-center space-y-3">
              <button
                onClick={() => setIsLockScreenOpen(false)}
                className="w-full py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Swipe up or tap to Return to Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
