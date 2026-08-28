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
  CornerUpLeft
} from 'lucide-react'
import { playReminderSound } from '../../lib/audio'
import { formatTime12h } from '../../lib/notifications'

const STORAGE_KEY_POS = 'meditrack_simulator_pos'

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
  const [showPresets, setShowPresets] = useState(false)

  // Load saved position or default to bottom-left
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed
        }
      }
    } catch (_) {}
    return { x: 16, y: 480 }
  })

  // Adjust default Y on initial mount if too low
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialY = Math.max(80, window.innerHeight - 220)
      setPos(prev => {
        if (prev.y === 480) {
          return { x: 16, y: initialY }
        }
        return prev
      })
    }
  }, [])

  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 })

  // Synchronize DOM position
  const updateDomPosition = (x: number, y: number) => {
    if (containerRef.current) {
      containerRef.current.style.left = `${x}px`
      containerRef.current.style.top = `${y}px`
    }
  }

  // Mouse / Touch Drag Handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    isDragging.current = true
    dragStart.current = {
      mouseX: clientX,
      mouseY: clientY,
      posX: pos.x,
      posY: pos.y
    }

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return
      
      const clientXNow = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientYNow = 'touches' in e ? e.touches[0].clientY : e.clientY

      const deltaX = clientXNow - dragStart.current.mouseX
      const deltaY = clientYNow - dragStart.current.mouseY

      const width = isMinimized ? 130 : 320
      const height = isMinimized ? 44 : (isExpanded ? 340 : 50)

      const maxX = Math.max(10, window.innerWidth - width - 10)
      const maxY = Math.max(10, window.innerHeight - height - 10)

      const newX = Math.max(10, Math.min(maxX, dragStart.current.posX + deltaX))
      const newY = Math.max(10, Math.min(maxY, dragStart.current.posY + deltaY))

      updateDomPosition(newX, newY)
    }

    const handlePointerEnd = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return
      isDragging.current = false

      document.removeEventListener('mousemove', handlePointerMove)
      document.removeEventListener('mouseup', handlePointerEnd)
      document.removeEventListener('touchmove', handlePointerMove)
      document.removeEventListener('touchend', handlePointerEnd)

      if (containerRef.current) {
        const finalLeft = parseInt(containerRef.current.style.left, 10) || pos.x
        const finalTop = parseInt(containerRef.current.style.top, 10) || pos.y
        const finalPos = { x: finalLeft, y: finalTop }
        setPos(finalPos)
        try {
          localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(finalPos))
        } catch (_) {}
      }
    }

    document.addEventListener('mousemove', handlePointerMove, { passive: false })
    document.addEventListener('mouseup', handlePointerEnd)
    document.addEventListener('touchmove', handlePointerMove, { passive: false })
    document.addEventListener('touchend', handlePointerEnd)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    handleDragStart(e.clientX, e.clientY)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
  }

  // Preset Position Snapping
  const snapTo = (corner: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right') => {
    const width = isMinimized ? 130 : 320
    const height = isMinimized ? 44 : (isExpanded ? 340 : 50)
    let newX = 16
    let newY = 80

    if (corner === 'bottom-left') {
      newX = 16
      newY = window.innerHeight - height - 20
    } else if (corner === 'bottom-right') {
      newX = window.innerWidth - width - 16
      newY = window.innerHeight - height - 20
    } else if (corner === 'top-left') {
      newX = 16
      newY = 80
    } else if (corner === 'top-right') {
      newX = window.innerWidth - width - 16
      newY = 80
    }

    const snapped = { x: newX, y: newY }
    setPos(snapped)
    updateDomPosition(newX, newY)
    try {
      localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(snapped))
    } catch (_) {}
    setShowPresets(false)
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
        ref={containerRef}
        style={{
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          zIndex: 9999
        }}
        className="no-print select-none touch-none"
      >
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/95 text-white backdrop-blur-xl border border-teal-400 shadow-2xl cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
        >
          <GripVertical className="w-4 h-4 text-teal-400" />
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
          <span className="text-[11px] font-extrabold text-teal-400 uppercase tracking-wider">
            Simulator
          </span>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-full bg-white/10 hover:bg-white/25 text-white cursor-pointer ml-1"
            title="Expand Controls"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  // ── Render Full Movable & Adjustable Simulator Widget ──
  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        zIndex: 9999
      }}
      className="no-print select-none max-w-sm w-[320px]"
    >
      <div className="rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-2xl border-2 border-teal-500/60 shadow-2xl shadow-slate-950/60 overflow-hidden text-xs transition-all">
        {/* ═══ Drag Header Bar — Drag anywhere here ═══ */}
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          className="w-full px-3 py-2.5 flex items-center justify-between gap-2 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/10 cursor-grab active:cursor-grabbing touch-none"
          title="Drag and move anywhere on screen"
        >
          <div className="flex items-center gap-1.5 pointer-events-none min-w-0">
            <GripVertical className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
            <span className="font-extrabold text-teal-400 tracking-wide uppercase text-[11px] truncate">
              Live Simulator
            </span>
            {simulatedTime.isSimulated && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] shrink-0">
                {formatTime12h(simulatedTime.simulatedTimeStr)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Corner Snap Preset Toggle */}
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="p-1 rounded-lg hover:bg-white/10 text-teal-300 cursor-pointer"
              title="Snap to corner (Adjust position)"
            >
              <Move className="w-3.5 h-3.5" />
            </button>

            {/* Expand / Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <span>{isExpanded ? 'Hide' : 'Tools'}</span>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 cursor-pointer"
              title="Minimize to floating bubble"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ═══ Corner Preset Selector (When Adjust icon is clicked) ═══ */}
        {showPresets && (
          <div className="p-2.5 bg-slate-800/95 border-b border-white/10 space-y-1.5 animate-in fade-in">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block text-center">
              Quick Snap Position:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => snapTo('top-left')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-teal-500/30 text-[11px] flex items-center justify-center gap-1 cursor-pointer font-medium"
              >
                <CornerUpLeft className="w-3 h-3" />
                <span>Top Left</span>
              </button>
              <button
                onClick={() => snapTo('top-right')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-teal-500/30 text-[11px] flex items-center justify-center gap-1 cursor-pointer font-medium"
              >
                <CornerUpRight className="w-3 h-3" />
                <span>Top Right</span>
              </button>
              <button
                onClick={() => snapTo('bottom-left')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-teal-500/30 text-[11px] flex items-center justify-center gap-1 cursor-pointer font-medium"
              >
                <CornerDownLeft className="w-3 h-3" />
                <span>Bottom Left</span>
              </button>
              <button
                onClick={() => snapTo('bottom-right')}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-teal-500/30 text-[11px] flex items-center justify-center gap-1 cursor-pointer font-medium"
              >
                <CornerDownRight className="w-3 h-3" />
                <span>Bottom Right</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══ Expanded Simulation Controls ═══ */}
        {isExpanded && (
          <div className="p-3 space-y-2 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => triggerTestNotification()}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Trigger Alarm</span>
              </button>
              <button
                onClick={() => setIsLockScreenOpen(true)}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
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
              <span className="flex items-center gap-1 text-teal-300">
                <Move className="w-3 h-3" />
                <span>Hold & drag header to move</span>
              </span>
              <button
                onClick={() => snapTo('bottom-left')}
                className="text-teal-400 hover:underline cursor-pointer font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
