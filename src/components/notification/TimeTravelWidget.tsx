/**
 * TimeTravelWidget — Fully draggable & adjustable Live Simulator Control
 *
 * How to move: Click & drag the dark header bar (⠿ grip area).
 * How to snap: Click the ⤢ icon → pick a corner.
 * Minimize: Click ⊟ to shrink to a floating pill.
 */
import React, { useEffect, useRef, useState } from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  Bell, FastForward, RotateCcw, Smartphone, ShieldAlert,
  Volume2, ChevronUp, ChevronDown, GripVertical, Move,
  Minimize2, Maximize2, CornerDownLeft, CornerDownRight,
  CornerUpLeft, CornerUpRight
} from 'lucide-react'
import { playReminderSound } from '../../lib/audio'
import { formatTime12h } from '../../lib/notifications'

const STORAGE_KEY = 'mt_sim_pos'

const loadSavedPos = (): { x: number; y: number } | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (typeof p.x === 'number' && typeof p.y === 'number') return p
    }
  } catch {}
  return null
}

const savePos = (x: number, y: number) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y })) } catch {}
}

export const TimeTravelWidget: React.FC = () => {
  const { triggerTestNotification, triggerSimulatedEscalation, setIsLockScreenOpen } = useNotifications()
  const { simulatedTime, setSimulatedTime, resetSimulatedTime, settings } = useMediTrack()

  const [isExpanded, setIsExpanded] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showSnap, setShowSnap] = useState(false)

  // All position tracking via refs — no state updates during drag for zero jank
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const origin = useRef({ mouseX: 0, mouseY: 0, elemX: 0, elemY: 0 })

  // Initialise position once
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const saved = loadSavedPos()
    const defX = 16
    const defY = Math.max(90, window.innerHeight - 360)
    const x = saved ? Math.min(saved.x, window.innerWidth - 340) : defX
    const y = saved ? Math.min(saved.y, window.innerHeight - 100) : defY
    el.style.left = `${x}px`
    el.style.top = `${y}px`
  }, [])

  // ── Core drag logic (attached to document, not the element) ──
  const beginDrag = (startX: number, startY: number) => {
    const el = wrapRef.current
    if (!el) return
    dragging.current = true
    const rect = el.getBoundingClientRect()
    origin.current = { mouseX: startX, mouseY: startY, elemX: rect.left, elemY: rect.top }

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

    const onMove = (cx: number, cy: number) => {
      if (!dragging.current || !wrapRef.current) return
      const dx = cx - origin.current.mouseX
      const dy = cy - origin.current.mouseY
      const w = wrapRef.current.offsetWidth
      const h = wrapRef.current.offsetHeight
      const newX = clamp(origin.current.elemX + dx, 8, window.innerWidth - w - 8)
      const newY = clamp(origin.current.elemY + dy, 8, window.innerHeight - h - 8)
      wrapRef.current.style.left = `${newX}px`
      wrapRef.current.style.top = `${newY}px`
    }

    const onMouseMove = (e: MouseEvent) => { e.preventDefault(); onMove(e.clientX, e.clientY) }
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY) }

    const onEnd = () => {
      dragging.current = false
      if (wrapRef.current) {
        const r = wrapRef.current.getBoundingClientRect()
        savePos(Math.round(r.left), Math.round(r.top))
      }
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onEnd)
    }

    document.addEventListener('mousemove', onMouseMove, { passive: false })
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onEnd)
  }

  const onHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    beginDrag(e.clientX, e.clientY)
  }

  const onHeaderTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    beginDrag(e.touches[0].clientX, e.touches[0].clientY)
  }

  // ── Corner snap ──
  const snapTo = (corner: 'tl' | 'tr' | 'bl' | 'br') => {
    const el = wrapRef.current
    if (!el) return
    const w = el.offsetWidth, h = el.offsetHeight
    const pad = 12
    const positions = {
      tl: { x: pad,                          y: 90 },
      tr: { x: window.innerWidth - w - pad,  y: 90 },
      bl: { x: pad,                          y: window.innerHeight - h - pad },
      br: { x: window.innerWidth - w - pad,  y: window.innerHeight - h - pad },
    }
    const { x, y } = positions[corner]
    el.style.left = `${x}px`
    el.style.top = `${y}px`
    savePos(x, y)
    setShowSnap(false)
  }

  const handleFastForward = (minutes: number) => {
    const cur = simulatedTime.isSimulated
      ? simulatedTime.simulatedTimeStr
      : `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`
    const [h, m] = cur.split(':').map(Number)
    const total = (h * 60 + m + minutes) % 1440
    setSimulatedTime({
      isSimulated: true,
      simulatedTimeStr: `${String(Math.floor(total / 60)).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`,
      simulatedDateStr: simulatedTime.simulatedDateStr
    })
  }

  // ── Minimised pill ──
  if (isMinimized) {
    return (
      <div ref={wrapRef} style={{ position: 'fixed', zIndex: 9999 }} className="no-print">
        <div
          onMouseDown={onHeaderMouseDown}
          onTouchStart={onHeaderTouchStart}
          className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-full bg-slate-900/95 text-white border-2 border-teal-400 shadow-2xl cursor-move select-none"
        >
          <GripVertical className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
          <span className="text-[11px] font-extrabold text-teal-400 uppercase tracking-wider">Sim</span>
          {simulatedTime.isSimulated && (
            <span className="text-[10px] font-mono text-amber-300 font-bold">
              {formatTime12h(simulatedTime.simulatedTimeStr)}
            </span>
          )}
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-full bg-white/10 hover:bg-white/25 cursor-pointer ml-1"
            title="Expand"
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
      ref={wrapRef}
      style={{ position: 'fixed', zIndex: 9999, width: 308 }}
      className="no-print"
    >
      <div className="rounded-2xl bg-slate-900/95 text-white border-2 border-teal-500/70 shadow-2xl overflow-visible text-xs">

        {/* ── Drag Header ─────────────────────────────────────────── */}
        <div
          onMouseDown={onHeaderMouseDown}
          onTouchStart={onHeaderTouchStart}
          className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 rounded-t-2xl cursor-move select-none border-b border-white/10"
          title="Drag to move • Click ⤢ to snap to corner"
        >
          <div className="flex items-center gap-1.5 pointer-events-none min-w-0">
            <GripVertical className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping shrink-0" />
            <span className="font-extrabold text-teal-400 tracking-wide uppercase text-[11px] truncate">
              Live Simulator
            </span>
            {simulatedTime.isSimulated && (
              <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 font-mono text-[10px] shrink-0 font-bold">
                {formatTime12h(simulatedTime.simulatedTimeStr)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Snap */}
            <button
              onClick={() => setShowSnap(s => !s)}
              className={`p-1.5 rounded-lg text-[11px] cursor-pointer border transition-colors ${showSnap ? 'bg-teal-500/30 border-teal-400 text-white' : 'bg-white/5 border-white/10 hover:bg-white/15 text-teal-300'}`}
              title="Snap to corner"
            >
              <Move className="w-3.5 h-3.5" />
            </button>

            {/* Expand */}
            <button
              onClick={() => setIsExpanded(e => !e)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/35 text-teal-300 text-[11px] font-bold cursor-pointer"
            >
              {isExpanded ? 'Hide' : 'Tools'}
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 cursor-pointer"
              title="Minimize"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Corner Snap Panel ───────────────────────────────────── */}
        {showSnap && (
          <div className="px-3 pt-2.5 pb-2 bg-slate-800/95 border-b border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Snap position</span>
              <span className="text-teal-400">or drag header ↑</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {([['tl','↖','Top Left'],['tr','↗','Top Right'],['bl','↙','Bot Left'],['br','↘','Bot Right']] as const).map(([c, arrow, label]) => (
                <button
                  key={c}
                  onClick={() => snapTo(c)}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white/10 hover:bg-teal-500/30 text-[11px] font-bold cursor-pointer text-slate-200 transition-colors"
                >
                  <span className="text-teal-400">{arrow}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Simulation Controls ─────────────────────────────────── */}
        {isExpanded && (
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => triggerTestNotification()}
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-md">
                <Bell className="w-3.5 h-3.5" /> Trigger Alarm
              </button>
              <button onClick={() => setIsLockScreenOpen(true)}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-md">
                <Smartphone className="w-3.5 h-3.5" /> Lockscreen
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => handleFastForward(30)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                <FastForward className="w-3.5 h-3.5 text-amber-300" /> Clock +30m
              </button>
              <button onClick={resetSimulatedTime}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5 text-teal-300" /> Real Clock
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={triggerSimulatedEscalation}
                className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                <ShieldAlert className="w-3.5 h-3.5" /> Escalation
              </button>
              <button onClick={() => playReminderSound(settings.soundTheme)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 font-semibold flex items-center justify-center gap-1.5 cursor-pointer">
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" /> Chime
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-teal-300">
                <GripVertical className="w-3 h-3" />
                Drag dark bar to move
              </span>
              <button onClick={() => snapTo('bl')} className="text-teal-400 hover:underline cursor-pointer font-bold">
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
