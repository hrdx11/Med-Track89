import React, { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  Bell,
  Clock,
  FastForward,
  RotateCcw,
  Smartphone,
  ShieldAlert,
  Volume2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Move
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
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const dragRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const widgetStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Initialize position to bottom left
  useEffect(() => {
    const defaultX = 16
    const defaultY = window.innerHeight - 110
    setPosition({ x: defaultX, y: defaultY })
  }, [])

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag when clicking header or grip handle
    setIsDragging(true)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    widgetStartPos.current = position || { x: 16, y: window.innerHeight - 110 }
  }

  // Touch Drag Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      widgetStartPos.current = position || { x: 16, y: window.innerHeight - 110 }
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - dragStartPos.current.x
      const deltaY = e.clientY - dragStartPos.current.y
      
      const newX = Math.max(10, Math.min(window.innerWidth - 300, widgetStartPos.current.x + deltaX))
      const newY = Math.max(10, Math.min(window.innerHeight - 80, widgetStartPos.current.y + deltaY))

      setPosition({ x: newX, y: newY })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return
      const deltaX = e.touches[0].clientX - dragStartPos.current.x
      const deltaY = e.touches[0].clientY - dragStartPos.current.y

      const newX = Math.max(10, Math.min(window.innerWidth - 300, widgetStartPos.current.x + deltaX))
      const newY = Math.max(10, Math.min(window.innerHeight - 80, widgetStartPos.current.y + deltaY))

      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => setIsDragging(false)
    const handleTouchEnd = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging])

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
    setPosition({ x: 16, y: window.innerHeight - (isExpanded ? 240 : 100) })
  }

  if (!position) return null

  return (
    <div
      ref={dragRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999
      }}
      className="max-w-sm sm:max-w-md no-print touch-none select-none transition-shadow"
    >
      <div
        className={`rounded-2xl bg-slate-900/92 dark:bg-slate-950/95 text-white backdrop-blur-2xl border border-teal-500/50 shadow-2xl ${
          isDragging ? 'shadow-teal-500/30 scale-102 ring-2 ring-teal-500' : ''
        } overflow-hidden text-xs transition-all`}
      >
        {/* Movable Drag Handle & Header */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="w-full px-3 py-2 flex items-center justify-between gap-2 bg-slate-800/80 hover:bg-slate-800 border-b border-white/10 cursor-grab active:cursor-grabbing"
          title="Click and drag anywhere on screen to move simulator controls"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <GripVertical className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
            <span className="font-extrabold text-teal-400 tracking-wide uppercase text-[11px] truncate">
              Movable Simulator
            </span>
            {simulatedTime.isSimulated && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] shrink-0">
                Clock: {formatTime12h(simulatedTime.simulatedTimeStr)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={e => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="p-1 rounded hover:bg-white/10 text-slate-300 flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <span>{isExpanded ? 'Hide' : 'Test Tools'}</span>
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="p-3 space-y-2.5 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-1.5">
              {/* Trigger Notification Now */}
              <button
                onClick={() => triggerTestNotification()}
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Trigger Alarm</span>
              </button>

              {/* Lockscreen Mode */}
              <button
                onClick={() => setIsLockScreenOpen(true)}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Lockscreen</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* Fast Forward 30m */}
              <button
                onClick={() => handleFastForward(30)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-300" />
                <span>Clock +30m</span>
              </button>

              {/* Reset to Real Clock */}
              <button
                onClick={resetSimulatedTime}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-teal-300" />
                <span>Real Clock</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* Trigger Caregiver Escalation */}
              <button
                onClick={triggerSimulatedEscalation}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Escalation</span>
              </button>

              {/* Play Audio Chime */}
              <button
                onClick={handleTestChime}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Chime Alert</span>
              </button>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10">
              <span className="flex items-center gap-1">
                <Move className="w-3 h-3 text-teal-400" />
                Drag handle to reposition toolbar
              </span>
              <button
                onClick={resetWidgetPos}
                className="text-teal-400 hover:underline cursor-pointer"
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
