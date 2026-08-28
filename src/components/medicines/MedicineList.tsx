import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useMediTrack } from '../../context/MediTrackContext'
import { Medicine } from '../../types'
import { FoodInstructionBadge, MedicineFormIcon } from '../ui/PillBadge'
import { formatTime12h } from '../../lib/notifications'
import {
  Plus,
  Clock,
  Package,
  ShieldAlert,
  Search,
  Filter,
  Layers,
  ChevronRight,
  AlertTriangle
} from 'lucide-react'
import { AddEditMedicineModal } from './AddEditMedicineModal'
import { MedicineDetailModal } from './MedicineDetailModal'

export const MedicineList: React.FC = () => {
  const { medicines, schedules } = useMediTrack()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedMedForDetail, setSelectedMedForDetail] = useState<Medicine | null>(null)
  const [medToEdit, setMedToEdit] = useState<Medicine | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categories = Array.from(new Set(medicines.map(m => m.category).filter(Boolean)))

  const filteredMedicines = medicines.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCat = categoryFilter === 'all' || m.category === categoryFilter
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-600" />
            <span>Prescription Medications & Cabinets</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active medications, dosage instructions, and refill inventory tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setMedToEdit(null)
            setIsAddModalOpen(true)
          }}
          className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-teal-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Medicine</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medications or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Prescriptions ({medicines.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat!)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                categoryFilter === cat
                  ? 'bg-teal-600 text-white'
                  : 'bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedicines.map(med => {
          const sch = schedules.find(s => s.medicineId === med.id)
          const remaining = med.remainingQuantity ?? 0
          const threshold = med.lowStockThreshold ?? 7
          const isLow = remaining <= threshold

          return (
            <GlassCard
              key={med.id}
              onClick={() => setSelectedMedForDetail(med)}
              className="flex flex-col justify-between cursor-pointer hover:border-teal-500/50 hover:bg-white/85 dark:hover:bg-slate-850 transition-all shadow-md group relative"
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {med.category || 'General'}
                    </span>
                    {med.isCritical && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Critical
                      </span>
                    )}
                  </div>

                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      med.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                    title={med.isActive ? 'Active' : 'Paused'}
                  />
                </div>

                {/* Pill Icon + Name */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: med.color || '#0d9488' }}
                  >
                    <MedicineFormIcon form={med.form} className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {med.name}
                    </h4>
                    <p className="text-xs font-mono font-semibold text-teal-700 dark:text-teal-400 mt-0.5">
                      {med.dosageAmount} {med.dosageUnit} • <span className="capitalize">{med.form}</span>
                    </p>
                  </div>
                </div>

                {/* Food Instructions */}
                <div className="mb-3">
                  <FoodInstructionBadge instruction={med.instructions} />
                </div>

                {/* Scheduled Times */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4 flex-wrap">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {sch && sch.times.length > 0 ? (
                    sch.times.map(t => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono font-semibold text-slate-800 dark:text-slate-200 text-[11px]"
                      >
                        {formatTime12h(t)}
                      </span>
                    ))
                  ) : (
                    <span>As needed (PRN)</span>
                  )}
                </div>
              </div>

              {/* Bottom Inventory Bar */}
              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                    {med.remainingQuantity ?? '—'} left
                  </span>
                  {isLow && (
                    <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      Low
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Modals */}
      <AddEditMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setMedToEdit(null)
        }}
        medicineToEdit={medToEdit}
      />

      <MedicineDetailModal
        isOpen={!!selectedMedForDetail}
        onClose={() => setSelectedMedForDetail(null)}
        medicine={selectedMedForDetail}
        onEdit={med => {
          setSelectedMedForDetail(null)
          setMedToEdit(med)
          setIsAddModalOpen(true)
        }}
      />
    </div>
  )
}
