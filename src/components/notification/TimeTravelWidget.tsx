import React, { useState } from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  Bell,
  Clock,
  FastForward,
  RotateCcw,
  Sparkles,
  Smartphone,
  ShieldAlert,
  Volume2,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { playReminderSound } from '../../lib/audio'
import { formatTime12h } from '../../lib/notifications'

export const TimeTravelWidget: React.FC = () => {
  const { triggerTestNotification, triggerSimulatedEscalation, setIsLockScreenOpen } = useNotifications()
  const {
    simulatedTime,
    setSimulatedTime,
    resetSimulatedTime,
    settings,
    medicines
  } = useMediTrack()

  const [isExpanded, setIsExpanded] = useState(false)

  const handleFastForward = (minutes: number) => {
    const currentStr = simulatedTime.isSimulated
      ? simulatedTime.simulatedTimeStr
      : `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`
    
    const [h, m] = currentStr.split(':').map(Number)
    const totalMinutes = (h * 60 + m + minutes) % (24 * 60)
    const newH = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
    const newM = String(totalMinutes % 60).padStart(2, '0')

    setSimulatedTime({
      isSimulated: true,
      simulatedTimeStr: `${newH}:${newM}`,
      simulatedDateStr: simulatedTime.simulatedDateStr
    })
  }

  const handleTestChime = () => {
    playReminderSound(settings.soundTheme)
  }

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-4 z-40 max-w-sm sm:max-w-md no-print">
      <div className="rounded-2xl bg-slate-900/90 dark:bg-slate-900/95 text-white backdrop-blur-xl border border-teal-500/40 shadow-xl shadow-slate-950/40 overflow-hidden text-xs">
        {/* Header Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3.5 py-2 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span className="font-bold text-teal-400 tracking-wide uppercase text-[11px]">
              Live Simulator Controls
            </span>
            {simulatedTime.isSimulated && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                Clock: {formatTime12h(simulatedTime.simulatedTimeStr)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>{isExpanded ? 'Hide' : 'Test Tools'}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="p-3 pt-1 border-t border-white/10 space-y-2.5 animate-in slide-in-from-bottom-2">
            <div className="grid grid-cols-2 gap-1.5">
              {/* Trigger Notification Now */}
              <button
                onClick={() => triggerTestNotification()}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Trigger Alarm Now</span>
              </button>

              {/* Lockscreen Mode */}
              <button
                onClick={() => setIsLockScreenOpen(true)}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Simulate Lockscreen</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* Fast Forward 30m */}
              <button
                onClick={() => handleFastForward(30)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-300" />
                <span>Clock +30 Mins</span>
              </button>

              {/* Reset to Real Clock */}
              <button
                onClick={resetSimulatedTime}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-teal-300" />
                <span>Reset Real Time</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* Trigger Caregiver Escalation */}
              <button
                onClick={triggerSimulatedEscalation}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Simulate Escalation</span>
              </button>

              {/* Play Audio Chime */}
              <button
                onClick={handleTestChime}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Preview Chime</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
