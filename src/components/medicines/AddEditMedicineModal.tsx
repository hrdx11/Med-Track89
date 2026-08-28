import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  DosageUnit,
  FoodInstruction,
  FrequencyType,
  Medicine,
  MedicineForm,
  Schedule
} from '../../types'
import {
  Pill,
  Plus,
  Trash2,
  Clock,
  Utensils,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Package,
  Droplets,
  Syringe,
  Wind
} from 'lucide-react'
import { MedicineFormIcon } from '../ui/PillBadge'

interface AddEditMedicineModalProps {
  isOpen: boolean
  onClose: () => void
  medicineToEdit?: Medicine | null
  scheduleToEdit?: Schedule | null
}

const COMMON_MEDS = [
  { name: 'Metformin HCl', dose: '500', unit: 'mg', form: 'tablet' as MedicineForm, instr: 'with_food' as FoodInstruction, cat: 'Diabetes', color: '#0d9488' },
  { name: 'Lisinopril', dose: '10', unit: 'mg', form: 'tablet' as MedicineForm, instr: 'before_food' as FoodInstruction, cat: 'Blood Pressure', color: '#f97316' },
  { name: 'Atorvastatin', dose: '20', unit: 'mg', form: 'tablet' as MedicineForm, instr: 'after_food' as FoodInstruction, cat: 'Cholesterol', color: '#8b5cf6' },
  { name: 'Levothyroxine', dose: '50', unit: 'mcg', form: 'tablet' as MedicineForm, instr: 'empty_stomach' as FoodInstruction, cat: 'Thyroid', color: '#0284c7' },
  { name: 'Omeprazole', dose: '20', unit: 'mg', form: 'capsule' as MedicineForm, instr: 'before_food' as FoodInstruction, cat: 'Gastro', color: '#ec4899' },
  { name: 'Amlodipine', dose: '5', unit: 'mg', form: 'tablet' as MedicineForm, instr: 'anytime' as FoodInstruction, cat: 'Blood Pressure', color: '#10b981' },
  { name: 'Vitamin D3', dose: '2000', unit: 'units', form: 'capsule' as MedicineForm, instr: 'with_food' as FoodInstruction, cat: 'Supplements', color: '#eab308' },
  { name: 'Salbutamol Inhaler', dose: '100', unit: 'mcg', form: 'inhaler' as MedicineForm, instr: 'anytime' as FoodInstruction, cat: 'Asthma', color: '#06b6d4' }
]

const COLOR_PALETTE = ['#0d9488', '#0284c7', '#8b5cf6', '#f97316', '#eab308', '#10b981', '#ec4899', '#64748b']

export const AddEditMedicineModal: React.FC<AddEditMedicineModalProps> = ({
  isOpen,
  onClose,
  medicineToEdit,
  scheduleToEdit
}) => {
  const { addMedicine, updateMedicine, schedules } = useMediTrack()

  const existingSchedule = scheduleToEdit || (medicineToEdit ? schedules.find(s => s.medicineId === medicineToEdit.id) : null)

  // Form states
  const [name, setName] = useState(medicineToEdit?.name || '')
  const [dosageAmount, setDosageAmount] = useState(medicineToEdit?.dosageAmount || '500')
  const [dosageUnit, setDosageUnit] = useState<DosageUnit>(medicineToEdit?.dosageUnit || 'mg')
  const [form, setForm] = useState<MedicineForm>(medicineToEdit?.form || 'tablet')
  const [color, setColor] = useState(medicineToEdit?.color || '#0d9488')
  const [instructions, setInstructions] = useState<FoodInstruction>(medicineToEdit?.instructions || 'with_food')
  const [notes, setNotes] = useState(medicineToEdit?.notes || '')
  const [isCritical, setIsCritical] = useState(medicineToEdit?.isCritical || false)
  const [category, setCategory] = useState(medicineToEdit?.category || '')

  // Refill Inventory states
  const [remainingQuantity, setRemainingQuantity] = useState<number>(medicineToEdit?.remainingQuantity ?? 30)
  const [totalQuantity, setTotalQuantity] = useState<number>(medicineToEdit?.totalQuantity ?? 30)
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(medicineToEdit?.lowStockThreshold ?? 7)

  // Schedule states
  const [frequency, setFrequency] = useState<FrequencyType>(existingSchedule?.frequency || 'daily')
  const [times, setTimes] = useState<string[]>(existingSchedule?.times || ['08:00', '20:00'])
  const [newTimeInput, setNewTimeInput] = useState('13:00')

  // Progressive Disclosure
  const [showAdvanced, setShowAdvanced] = useState(false)

  if (!isOpen) return null

  const handleSelectPreset = (preset: typeof COMMON_MEDS[0]) => {
    setName(preset.name)
    setDosageAmount(preset.dose)
    setDosageUnit(preset.unit as DosageUnit)
    setForm(preset.form)
    setInstructions(preset.instr)
    setColor(preset.color)
    setCategory(preset.cat)
  }

  const handleAddTime = () => {
    if (newTimeInput && !times.includes(newTimeInput)) {
      setTimes([...times, newTimeInput].sort())
    }
  }

  const handleRemoveTime = (timeToRemove: string) => {
    setTimes(times.filter(t => t !== timeToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (medicineToEdit) {
      updateMedicine(medicineToEdit.id, {
        name,
        dosageAmount,
        dosageUnit,
        form,
        color,
        instructions,
        notes,
        isCritical,
        category,
        remainingQuantity,
        totalQuantity,
        lowStockThreshold
      })
    } else {
      addMedicine(
        {
          name,
          dosageAmount,
          dosageUnit,
          form,
          color,
          shape: 'round',
          instructions,
          notes,
          remainingQuantity,
          totalQuantity,
          lowStockThreshold,
          isCritical,
          isActive: true,
          category
        },
        {
          frequency,
          times: frequency === 'as_needed' ? [] : times,
          startDate: new Date().toISOString().split('T')[0]
        }
      )
    }

    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicineToEdit ? 'Edit Medication' : 'Add New Prescription'}
      description="Set dosage, visual pill cues, intake instructions, and refill inventory."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {/* Quick Autofill Presets (only on add) */}
        {!medicineToEdit && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Quick Select Common Prescriptions:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MEDS.map((med, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectPreset(med)}
                  className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-400 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {med.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Medicine Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Medicine / Drug Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Metformin, Lisinopril, Aspirin"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Health Category
            </label>
            <input
              type="text"
              placeholder="e.g. Diabetes, Blood Pressure"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm"
            />
          </div>
        </div>

        {/* Dosage Amount & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Dosage Strength / Amount *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 500, 10, 20"
              value={dosageAmount}
              onChange={e => setDosageAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Dosage Unit
            </label>
            <select
              value={dosageUnit}
              onChange={e => setDosageUnit(e.target.value as DosageUnit)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm font-semibold"
            >
              <option value="mg">mg (Milligrams)</option>
              <option value="mcg">mcg (Micrograms)</option>
              <option value="ml">ml (Milliliters)</option>
              <option value="drops">drops</option>
              <option value="puffs">puffs</option>
              <option value="units">units (IU)</option>
              <option value="tablets">tablets</option>
              <option value="capsules">capsules</option>
              <option value="g">g (Grams)</option>
            </select>
          </div>
        </div>

        {/* Form Selector & Pill Color */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Medication Form
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'tablet', label: 'Tablet' },
                { id: 'capsule', label: 'Capsule' },
                { id: 'liquid', label: 'Liquid' },
                { id: 'inhaler', label: 'Inhaler' },
                { id: 'injection', label: 'Injection' },
                { id: 'drops', label: 'Drops' },
                { id: 'patch', label: 'Patch' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setForm(item.id as MedicineForm)}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    form === item.id
                      ? 'border-teal-500 bg-teal-500/15 text-teal-900 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <MedicineFormIcon form={item.id as MedicineForm} className="w-4 h-4" />
                  <span className="text-[11px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
              Pill Color (Visual Cue)
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PALETTE.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: color }}
              >
                <MedicineFormIcon form={form} className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Pill badge preview on dashboard
              </span>
            </div>
          </div>
        </div>

        {/* Food Instructions */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
            Food & Meal Instructions
          </label>
          <select
            value={instructions}
            onChange={e => setInstructions(e.target.value as FoodInstruction)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm font-semibold"
          >
            <option value="with_food">With Food / After Meal (Reduces stomach upset)</option>
            <option value="before_food">Before Food (30 mins before breakfast/meal)</option>
            <option value="after_food">After Eating (Post-meal)</option>
            <option value="empty_stomach">Strict Empty Stomach (With water only)</option>
            <option value="anytime">Anytime (With or without food)</option>
          </select>
        </div>

        {/* Schedule & Reminder Times */}
        <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Schedule Frequency & Dose Times</span>
            </label>

            <select
              value={frequency}
              onChange={e => setFrequency(e.target.value as FrequencyType)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
            >
              <option value="daily">Everyday (Daily)</option>
              <option value="as_needed">As Needed / PRN (No alarm)</option>
            </select>
          </div>

          {frequency !== 'as_needed' && (
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {times.map(t => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-teal-500/40 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(t)}
                      className="text-slate-400 hover:text-rose-500 ml-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={newTimeInput}
                  onChange={e => setNewTimeInput(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddTime}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Time</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Refill Inventory Tracking */}
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
            <Package className="w-4 h-4 text-amber-600" />
            <span>Refill & Inventory Tracker</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Total Bottle Qty
              </label>
              <input
                type="number"
                min="0"
                value={totalQuantity}
                onChange={e => setTotalQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Current Remaining
              </label>
              <input
                type="number"
                min="0"
                value={remainingQuantity}
                onChange={e => setRemainingQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-teal-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Low Stock Alert At
              </label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Progressive Disclosure: Advanced Options */}
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>{showAdvanced ? 'Hide Advanced Options' : 'Show Doctor Notes & Critical Override'}</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Doctor / Prescription Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prescribed by Dr. Menon for glycemic control. Take with plenty of water."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <input
                  type="checkbox"
                  id="criticalCheckbox"
                  checked={isCritical}
                  onChange={e => setIsCritical(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="criticalCheckbox" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Critical Routine Medication (Overrides quiet hours & alerts caregivers if missed)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-200/60 dark:border-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-md cursor-pointer transition-transform active:scale-95"
          >
            {medicineToEdit ? 'Save Changes' : 'Save Prescription'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
