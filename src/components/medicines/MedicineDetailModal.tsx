import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { DoseLog, Medicine, Schedule } from '../../types'
import { useMediTrack } from '../../context/MediTrackContext'
import { FoodInstructionBadge, MedicineFormIcon, StatusBadge } from '../ui/PillBadge'
import { formatTime12h } from '../../lib/notifications'
import {
  Clock,
  Package,
  Calendar,
  ShieldAlert,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

interface MedicineDetailModalProps {
  isOpen: boolean
  onClose: () => void
  medicine: Medicine | null
  onEdit: (med: Medicine) => void
}

export const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  isOpen,
  onClose,
  medicine,
  onEdit
}) => {
  const {
    schedules,
    doseLogs,
    refillMedicine,
    deleteMedicine,
    toggleMedicineActive
  } = useMediTrack()

  const [refillAmount, setRefillAmount] = useState<number>(30)
  const [showRefillInput, setShowRefillInput] = useState(false)

  if (!isOpen || !medicine) return null

  const schedule = schedules.find(s => s.medicineId === medicine.id)
  const scopedLogs = doseLogs.filter(l => l.medicineId === medicine.id).slice(0, 10)

  // Refill calculation
  const remaining = medicine.remainingQuantity ?? 0
  const total = medicine.totalQuantity ?? 30
  const threshold = medicine.lowStockThreshold ?? 7
  const refillPercent = Math.min(100, Math.round((remaining / total) * 100))
  const isLowStock = remaining <= threshold

  const handleApplyRefill = () => {
    refillMedicine(medicine.id, refillAmount)
    setShowRefillInput(false)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${medicine.name}?`)) {
      deleteMedicine(medicine.id)
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
            style={{ backgroundColor: medicine.color || '#0d9488' }}
          >
            <MedicineFormIcon form={medicine.form} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {medicine.name}
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {medicine.dosageAmount} {medicine.dosageUnit} • {medicine.category || 'Prescription'}
            </span>
          </div>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-6 text-left">
        {/* Status & Critical Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                medicine.isActive ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {medicine.isActive ? 'Active Routine' : 'Paused Routine'}
            </span>
            {medicine.isCritical && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                Critical
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleMedicineActive(medicine.id)}
              className="px-3 py-1 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
            >
              {medicine.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{medicine.isActive ? 'Pause' : 'Resume'}</span>
            </button>
            <button
              onClick={() => {
                onClose()
                onEdit(medicine)
              }}
              className="px-3 py-1 text-xs font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Prescription Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Intake Instructions */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Instructions
            </span>
            <FoodInstructionBadge instruction={medicine.instructions} />
            {medicine.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic">
                "{medicine.notes}"
              </p>
            )}
          </div>

          {/* Schedule Times */}
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Scheduled Alarm Times
            </span>
            {schedule && schedule.times.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {schedule.times.map(t => (
                  <span
                    key={t}
                    className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/25 flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatTime12h(t)}</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-500">As needed / PRN (No alarm)</span>
            )}
          </div>
        </div>

        {/* Refill Inventory Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                Refill Inventory & Stock Level
              </span>
            </div>

            <button
              onClick={() => setShowRefillInput(!showRefillInput)}
              className="px-3 py-1 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-500 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>+ Refill Pills</span>
            </button>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700 dark:text-slate-300">
                {remaining} remaining of {total} {medicine.dosageUnit}
              </span>
              <span className={isLowStock ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                {isLowStock ? '⚠️ Low Stock Alert' : `${refillPercent}% in stock`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isLowStock ? 'bg-rose-500' : 'bg-teal-500'
                }`}
                style={{ width: `${refillPercent}%` }}
              />
            </div>
          </div>

          {showRefillInput && (
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 animate-in fade-in">
              <input
                type="number"
                min="1"
                value={refillAmount}
                onChange={e => setRefillAmount(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-mono font-bold"
              />
              <button
                onClick={handleApplyRefill}
                className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 cursor-pointer"
              >
                Add {refillAmount} to inventory
              </button>
            </div>
          )}
        </div>

        {/* Scoped Dose Log History */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Recent Dose History (This Medicine)
          </span>

          <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60 max-h-48 overflow-y-auto">
            {scopedLogs.length > 0 ? (
              scopedLogs.map(log => (
                <div key={log.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {log.scheduledDate}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {formatTime12h(log.scheduledTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {log.skipReason && (
                      <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        "{log.skipReason}"
                      </span>
                    )}
                    <StatusBadge status={log.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">No logged doses recorded yet.</p>
            )}
          </div>
        </div>

        {/* Footer Delete */}
        <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Prescription</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  )
}
