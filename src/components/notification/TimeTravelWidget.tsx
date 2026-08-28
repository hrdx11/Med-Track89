import React, { useState, useRef, useCallback } from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  Bell,
  FastForward,
  RotateCcw,
  Smartphone,
  ShieldAlert,
  Volume2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Move,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { playReminderSound } from '../../lib/audio'
import { formatTime12h } from '../../lib/notifications'

export const TimeTravelWidget: React.FC = () => {
  const { triggerTestNotification, triggerSimulatedEscalation, setIsLockScreenOpen } = useNotifications()
  const {
    simulatedTime,
    setSimulatedTime,
    resetSimulatedTime,
    settings
  } = useMediTrack()

  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [pos, setPos] = useState({ x: 16, y: 500 })

  // Use refs for drag state to avoid re-render during drag
  const dragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // ── Drag Start ──
  const startDrag = useCallback((clientX: number, clientY: number) => {
    dragging.current = true
    offset.current = { x: clientX - pos.x, y: clientY - pos.y }

    const onMove = (mx: number, my: number) => {
      if (!dragging.current) return
      const newX = Math.max(0, Math.min(window.innerWidth - 100, mx - offset.current.x))
      const newY = Math.max(0, Math.min(window.innerHeight - 50, my - offset.current.y))
      if (containerRef.current) {
        containerRef.current.style.left = newX + 'px'
        containerRef.current.style.top = newY + 'px'
      }
      // Save final position
      setPos({ x: newX, y: newY })
    }

    const onMouseMove = (e: MouseEvent) => { e.preventDefault(); onMove(e.clientX, e.clientY) }
    const onTouchMove = (e: TouchEvent) => { onMove(e.touches[0].clientX, e.touches[0].clientY) }
    const onEnd = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onEnd)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onEnd)
  }, [pos])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    startDrag(e.clientX, e.clientY)
  }, [startDrag])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    startDrag(e.touches[0].clientX, e.touches[0].clientY)
  }, [startDrag])

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

  // ── Minimized tiny pill ──
  if (isMinimized) {
    return (
      <div
        ref={containerRef}
        style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999 }}
        className="no-print"
      >
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/95 text-white backdrop-blur-xl border border-teal-500/50 shadow-xl cursor-grab active:cursor-grabbing select-none"
        >
          <GripVertical className="w-3.5 h-3.5 text-teal-400" />
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span className="text-[10px] font-bold text-teal-400 uppercase">Sim</span>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-0.5 rounded hover:bg-white/15 text-slate-300 cursor-pointer ml-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // ── Full widget ──
  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999 }}
      className="no-print"
    >
      <div
        className="rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-2xl border border-teal-500/50 shadow-2xl overflow-hidden text-xs"
        style={{ width: '320px' }}
      >
        {/* ═══ Drag Header Bar — grab this to move ═══ */}
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          className="w-full px-3 py-2.5 flex items-center justify-between gap-2 bg-slate-800/90 hover:bg-slate-700/90 border-b border-white/10 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex items-center gap-1.5 pointer-events-none">
            <GripVertical className="w-4 h-4 text-teal-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <span className="font-extrabold text-teal-400 tracking-wide uppercase text-[11px]">
              Live Simulator
            </span>
            {simulatedTime.isSimulated && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                {formatTime12h(simulatedTime.simulatedTimeStr)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <span>{isExpanded ? 'Hide' : 'Tools'}</span>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer"
              title="Minimize"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ═══ Expanded Controls ═══ */}
        {isExpanded && (
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => triggerTestNotification()}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Trigger Alarm</span>
              </button>
              <button
                onClick={() => setIsLockScreenOpen(true)}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Lockscreen</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleFastForward(30)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-300" />
                <span>Clock +30m</span>
              </button>
              <button
                onClick={resetSimulatedTime}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-teal-300" />
                <span>Real Clock</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={triggerSimulatedEscalation}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Escalation</span>
              </button>
              <button
                onClick={() => playReminderSound(settings.soundTheme)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Chime Alert</span>
              </button>
            </div>

            <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10">
              <span className="flex items-center gap-1">
                <Move className="w-3 h-3 text-teal-400" />
                Drag bar to reposition
              </span>
              <button
                onClick={() => setPos({ x: 16, y: 500 })}
                className="text-teal-400 hover:underline cursor-pointer font-semibold"
              >
                Reset Position
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
