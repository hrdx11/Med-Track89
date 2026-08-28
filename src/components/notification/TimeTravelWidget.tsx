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
  Maximize2,
  CornerDownLeft,
  CornerDownRight,
  CornerUpRight,
  CornerUpLeft,
  Settings2,
  Sliders
} from 'lucide-react'
import { playReminderSound } from '../../lib/audio'
import { formatTime12h } from '../../lib/notifications'

const STORAGE_KEY_POS = 'meditrack_sim_widget_coords'

export const TimeTravelWidget: React.FC = () => {
  const { triggerTestNotification, triggerSimulatedEscalation, setIsLockScreenOpen } = useNotifications()
  const {
    simulatedTime,
    setSimulatedTime,
    resetSimulatedTime,
    settings
  } = useMediTrack()

  const [isExpanded, setIsExpanded] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showAdjustBar, setShowAdjustBar] = useState(false)

  // Default initial position
  const [coords, setCoords] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed
        }
      }
    } catch (_) {}
    return { x: 16, y: 380 }
  })

  const widgetRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStartInfo = useRef({ startClientX: 0, startClientY: 0, startElemLeft: 0, startElemTop: 0 })

  // Position adjustment on mount to ensure it's safely inside the viewport
  useEffect(() => {
    const handleInitialBound = () => {
      const maxX = Math.max(10, window.innerWidth - 340)
      const maxY = Math.max(10, window.innerHeight - 280)
      setCoords(prev => ({
        x: Math.max(10, Math.min(maxX, prev.x)),
        y: Math.max(10, Math.min(maxY, prev.y))
      }))
    }
    handleInitialBound()
    window.addEventListener('resize', handleInitialBound)
    return () => window.removeEventListener('resize', handleInitialBound)
  }, [])

  // ── Drag & Move Logic ──
  const startDrag = (clientX: number, clientY: number) => {
    if (!widgetRef.current) return
    isDragging.current = true

    const rect = widgetRef.current.getBoundingClientRect()
    dragStartInfo.current = {
      startClientX: clientX,
      startClientY: clientY,
      startElemLeft: rect.left,
      startElemTop: rect.top
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current || !widgetRef.current) return
      
      const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY

      const deltaX = currentX - dragStartInfo.current.startClientX
      const deltaY = currentY - dragStartInfo.current.startClientY

      const elemWidth = widgetRef.current.offsetWidth || 320
      const elemHeight = widgetRef.current.offsetHeight || 200

      const maxAllowedX = Math.max(10, window.innerWidth - elemWidth - 10)
      const maxAllowedY = Math.max(10, window.innerHeight - elemHeight - 10)

      const targetX = Math.max(10, Math.min(maxAllowedX, dragStartInfo.current.startElemLeft + deltaX))
      const targetY = Math.max(10, Math.min(maxAllowedY, dragStartInfo.current.startElemTop + deltaY))

      widgetRef.current.style.left = `${targetX}px`
      widgetRef.current.style.top = `${targetY}px`
    }

    const onPointerUp = () => {
      if (!isDragging.current) return
      isDragging.current = false

      document.removeEventListener('mousemove', onPointerMove)
      document.removeEventListener('mouseup', onPointerUp)
      document.removeEventListener('touchmove', onPointerMove)
      document.removeEventListener('touchend', onPointerUp)

      if (widgetRef.current) {
        const rectAfter = widgetRef.current.getBoundingClientRect()
        const finalCoords = { x: Math.round(rectAfter.left), y: Math.round(rectAfter.top) }
        setCoords(finalCoords)
        try {
          localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(finalCoords))
        } catch (_) {}
      }
    }

    document.addEventListener('mousemove', onPointerMove, { passive: false })
    document.addEventListener('mouseup', onPointerUp)
    document.addEventListener('touchmove', onPointerMove, { passive: false })
    document.addEventListener('touchend', onPointerUp)
  }

  // ── Corner Quick-Snap Adjustment ──
  const snapToCorner = (corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    if (!widgetRef.current) return
    const width = widgetRef.current.offsetWidth || 320
    const height = widgetRef.current.offsetHeight || 250

    let newX = 16
    let newY = 80

    if (corner === 'bottom-left') {
      newX = 16
      newY = Math.max(80, window.innerHeight - height - 20)
    } else if (corner === 'bottom-right') {
      newX = Math.max(16, window.innerWidth - width - 20)
      newY = Math.max(80, window.innerHeight - height - 20)
    } else if (corner === 'top-left') {
      newX = 16
      newY = 80
    } else if (corner === 'top-right') {
      newX = Math.max(16, window.innerWidth - width - 20)
      newY = 80
    }

    const target = { x: newX, y: newY }
    setCoords(target)
    widgetRef.current.style.left = `${newX}px`
    widgetRef.current.style.top = `${newY}px`
    try {
      localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(target))
    } catch (_) {}
    setShowAdjustBar(false)
  }

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

  // ── Render Minimized Mode ──
  if (isMinimized) {
    return (
      <div
        ref={widgetRef}
        style={{
          position: 'fixed',
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          zIndex: 9999
        }}
        className="no-print select-none"
      >
        <div
          onMouseDown={e => {
            if ((e.target as HTMLElement).closest('button')) return
            e.preventDefault()
            startDrag(e.clientX, e.clientY)
          }}
          onTouchStart={e => {
            if ((e.target as HTMLElement).closest('button')) return
            startDrag(e.touches[0].clientX, e.touches[0].clientY)
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/95 text-white backdrop-blur-2xl border-2 border-teal-400 shadow-2xl cursor-move active:cursor-grabbing hover:scale-105 transition-transform"
        >
          <GripVertical className="w-4 h-4 text-teal-400" />
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span className="text-[11px] font-extrabold text-teal-400 uppercase tracking-wider">
            Simulator
          </span>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-full bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 cursor-pointer ml-1"
            title="Expand Controls"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // ── Render Full Movable & Adjustable Widget ──
  return (
    <div
      ref={widgetRef}
      style={{
        position: 'fixed',
        left: `${coords.x}px`,
        top: `${coords.y}px`,
        zIndex: 9999
      }}
      className="no-print select-none max-w-sm w-[320px] transition-shadow"
    >
      <div className="rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-2xl border-2 border-teal-500/70 shadow-2xl shadow-slate-950/80 overflow-hidden text-xs">
        
        {/* ═══ Header Bar (Drag Handle) ═══ */}
        <div
          onMouseDown={e => {
            if ((e.target as HTMLElement).closest('button')) return
            e.preventDefault()
            startDrag(e.clientX, e.clientY)
          }}
          onTouchStart={e => {
            if ((e.target as HTMLElement).closest('button')) return
            startDrag(e.touches[0].clientX, e.touches[0].clientY)
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between gap-2 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/10 cursor-move active:cursor-grabbing"
          title="Click and drag to move anywhere on screen"
        >
          {/* Drag Handle Label */}
          <div className="flex items-center gap-1.5 pointer-events-none min-w-0">
            <GripVertical className="w-4 h-4 text-teal-400 shrink-0 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
            <span className="font-extrabold text-teal-400 tracking-wide uppercase text-[11px] truncate">
              Live Simulator
            </span>
            {simulatedTime.isSimulated && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 font-mono text-[10px] shrink-0 font-bold">
                {formatTime12h(simulatedTime.simulatedTimeStr)}
              </span>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Position Adjustment / Corner Quick-Snap */}
            <button
              onClick={() => setShowAdjustBar(!showAdjustBar)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                showAdjustBar
                  ? 'bg-teal-500/30 border-teal-400 text-white'
                  : 'bg-white/5 border-white/10 hover:bg-white/15 text-teal-300'
              }`}
              title="Adjust position: Snap to corners"
            >
              <Move className="w-3.5 h-3.5" />
            </button>

            {/* Expand / Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
              title="Expand or collapse tool buttons"
            >
              <span>{isExpanded ? 'Hide' : 'Tools'}</span>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {/* Minimize to Pill */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 cursor-pointer"
              title="Minimize to floating bubble"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ═══ Corner Snap Adjustment Bar ═══ */}
        {showAdjustBar && (
          <div className="p-2.5 bg-slate-800/95 border-b border-white/10 space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Quick Snap Position:</span>
              <span className="text-teal-400">or Drag header ✥</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => snapToCorner('top-left')}
                className="p-2 rounded-xl bg-white/10 hover:bg-teal-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer text-slate-200"
              >
                <CornerUpLeft className="w-3.5 h-3.5 text-teal-400" />
                <span>Top Left</span>
              </button>
              <button
                onClick={() => snapToCorner('top-right')}
                className="p-2 rounded-xl bg-white/10 hover:bg-teal-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer text-slate-200"
              >
                <CornerUpRight className="w-3.5 h-3.5 text-teal-400" />
                <span>Top Right</span>
              </button>
              <button
                onClick={() => snapToCorner('bottom-left')}
                className="p-2 rounded-xl bg-white/10 hover:bg-teal-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer text-slate-200"
              >
                <CornerDownLeft className="w-3.5 h-3.5 text-teal-400" />
                <span>Bottom Left</span>
              </button>
              <button
                onClick={() => snapToCorner('bottom-right')}
                className="p-2 rounded-xl bg-white/10 hover:bg-teal-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer text-slate-200"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-teal-400" />
                <span>Bottom Right</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══ Simulation Controls ═══ */}
        {isExpanded && (
          <div className="p-3 space-y-2 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => triggerTestNotification()}
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer text-xs"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Trigger Alarm</span>
              </button>
              <button
                onClick={() => setIsLockScreenOpen(true)}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer text-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Lockscreen</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleFastForward(30)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-300" />
                <span>Clock +30m</span>
              </button>
              <button
                onClick={resetSimulatedTime}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-teal-300" />
                <span>Real Clock</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={triggerSimulatedEscalation}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Escalation</span>
              </button>
              <button
                onClick={() => playReminderSound(settings.soundTheme)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Chime Alert</span>
              </button>
            </div>

            {/* Footer drag instruction */}
            <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10">
              <span className="flex items-center gap-1 text-teal-300 font-medium">
                <Move className="w-3 h-3" />
                <span>Click & drag top bar anywhere</span>
              </span>
              <button
                onClick={() => snapToCorner('bottom-left')}
                className="text-teal-400 hover:underline cursor-pointer font-bold"
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
