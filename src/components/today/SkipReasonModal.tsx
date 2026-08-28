import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { DoseLog, Medicine } from '../../types'
import { AlertCircle, Check } from 'lucide-react'

interface SkipReasonModalProps {
  isOpen: boolean
  onClose: () => void
  doseLog: DoseLog | null
  medicine: Medicine | null
  onConfirmSkip: (reason: string) => void
}

const COMMON_REASONS = [
  'Fasting for blood test / medical procedure',
  'Experiencing nausea or upset stomach',
  'Doctor or pharmacist advised temporary hold',
  'Ran out of medication / waiting for refill',
  'Already took earlier / timing adjusted',
  'Felt dizzy or drowsy'
]

export const SkipReasonModal: React.FC<SkipReasonModalProps> = ({
  isOpen,
  onClose,
  doseLog,
  medicine,
  onConfirmSkip
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [customReason, setCustomReason] = useState<string>('')

  if (!isOpen || !doseLog || !medicine) return null

  const handleSkip = () => {
    const finalReason = customReason.trim() || selectedReason || 'Skipped by patient'
    onConfirmSkip(finalReason)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Skip Dose: ${medicine.name}`}
      description="Logging a reason helps you and your caregiver understand why this dose wasn't taken."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Select a common reason:
          </label>
          <div className="grid grid-cols-1 gap-2">
            {COMMON_REASONS.map((reason, idx) => {
              const isSelected = selectedReason === reason
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedReason(reason)
                    setCustomReason('')
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 bg-teal-500/10 text-teal-900 dark:text-teal-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{reason}</span>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Or type a custom note:
          </label>
          <input
            type="text"
            placeholder="e.g. Taking it 2 hours later after dinner"
            value={customReason}
            onChange={e => {
              setCustomReason(e.target.value)
              setSelectedReason('')
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="pt-3 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold shadow-md hover:opacity-90 transition-opacity cursor-pointer"
          >
            Confirm Skip Dose
          </button>
        </div>
      </div>
    </Modal>
  )
}
