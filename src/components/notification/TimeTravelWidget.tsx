import React, { useState, useRef, useEffect, useCallback } from 'react'
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

  // Position state — default bottom-left
  const [pos, setPos] = useState({ x: 16, y: -1 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const posStartRef = useRef({ x: 0, y: 0 })
  const widgetRef = useRef<HTMLDivElement>(null)
  const hasDraggedRef = useRef(false)

  // Set initial Y after mount
  useEffect(() => {
    setPos({ x: 16, y: window.innerHeight - 120 })
  }, [])

  // Clamp helper
  const clamp = useCallback((val: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, val))
  }, [])

  // --- Pointer-based drag (works for both mouse & touch) ---
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only start drag from the grip area, not from buttons
    const target = e.target as HTMLElement
    if (target.closest('button')) return

    isDraggingRef.current = true
    hasDraggedRef.current = false
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    posStartRef.current = { x: pos.x, y: pos.y }

    // Capture pointer so drag continues even outside the element
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    e.preventDefault()
  }, [pos])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return

    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y

    // Mark as real drag if moved more than 4px (avoids accidental drags)
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDraggedRef.current = true
    }

    const newX = clamp(posStartRef.current.x + dx, 0, window.innerWidth - 280)
    const newY = clamp(posStartRef.current.y + dy, 0, window.innerHeight - 50)

    setPos({ x: newX, y: newY })
  }, [clamp])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = false
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
  }, [])

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

  const resetWidgetPos = () => {
    setPos({ x: 16, y: window.innerHeight - (isExpanded ? 300 : 120) })
  }

  if (pos.y < 0) return null

  // Minimized pill mode — just a tiny floating dot
  if (isMinimized) {
    return (
      <div
        ref={widgetRef}
        style={{ position: 'fixed', left: `${pos.x}px`, top: `${pos.y}px`, zIndex: 9999 }}
        className="no-print select-none"
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 text-white backdrop-blur-xl border border-teal-500/50 shadow-xl cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-3.5 h-3.5 text-teal-400" />
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Sim</span>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-0.5 rounded hover:bg-white/10 text-slate-300 cursor-pointer ml-1"
            title="Expand simulator"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={widgetRef}
      style={{ position: 'fixed', left: `${pos.x}px`, top: `${pos.y}px`, zIndex: 9999 }}
      className="no-print select-none"
    >
      <div
        className={`rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-2xl border shadow-2xl overflow-hidden text-xs transition-all ${
          isDraggingRef.current
            ? 'border-teal-400 shadow-teal-500/40 ring-2 ring-teal-400/60'
            : 'border-teal-500/50'
        }`}
        style={{ maxWidth: '380px', minWidth: '260px' }}
      >
        {/* ═══ Drag Handle Bar ═══ */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="w-full px-3 py-2 flex items-center justify-between gap-2 bg-slate-800/80 hover:bg-slate-700/80 border-b border-white/10 cursor-grab active:cursor-grabbing touch-none"
        >
          {/* Left: Grip + Label */}
          <div className="flex items-center gap-1.5 min-w-0 pointer-events-none">
            <GripVertical className="w-4 h-4 text-teal-400 shrink-0" />
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping shrink-0" />
            <span className="font-extrabold text-teal-400 tracking-wide uppercase text-[11px] truncate">
              Live Simulator
            </span>
            {simulatedTime.isSimulated && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] shrink-0">
                {formatTime12h(simulatedTime.simulatedTimeStr)}
              </span>
            )}
          </div>

          {/* Right: Expand / Minimize buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
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
              title="Minimize to floating pill"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ═══ Expanded Control Panel ═══ */}
        {isExpanded && (
          <div className="p-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => triggerTestNotification()}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Trigger Alarm</span>
              </button>

              <button
                onClick={() => setIsLockScreenOpen(true)}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
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
                onClick={handleTestChime}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Chime Alert</span>
              </button>
            </div>

            {/* Footer hint */}
            <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10">
              <span className="flex items-center gap-1">
                <Move className="w-3 h-3 text-teal-400" />
                Drag the bar ↑ to reposition
              </span>
              <button
                onClick={resetWidgetPos}
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
