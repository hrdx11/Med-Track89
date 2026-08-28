import React from 'react'
import { DoseStatus, FoodInstruction, MedicineForm } from '../../types'
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Pill,
  Droplets,
  Syringe,
  Wind,
  ShieldAlert,
  Utensils,
  Coffee,
  Sun
} from 'lucide-react'

export const MedicineFormIcon: React.FC<{ form: MedicineForm; className?: string }> = ({
  form,
  className = 'w-4 h-4'
}) => {
  switch (form) {
    case 'capsule':
      return <Pill className={`${className} rotate-45`} />
    case 'liquid':
      return <Droplets className={className} />
    case 'injection':
      return <Syringe className={className} />
    case 'inhaler':
      return <Wind className={className} />
    case 'drops':
      return <Droplets className={className} />
    case 'patch':
      return <ShieldAlert className={className} />
    case 'tablet':
    default:
      return <Pill className={className} />
  }
}

export const FoodInstructionBadge: React.FC<{ instruction: FoodInstruction; className?: string }> = ({
  instruction,
  className = ''
}) => {
  const configs: Record<FoodInstruction, { label: string; icon: React.ReactNode; color: string }> = {
    with_food: {
      label: 'With Food',
      icon: <Utensils className="w-3 h-3" />,
      color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
    },
    before_food: {
      label: 'Before Food (Empty Stomach)',
      icon: <Coffee className="w-3 h-3" />,
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
    },
    after_food: {
      label: 'After Food',
      icon: <Utensils className="w-3 h-3" />,
      color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20'
    },
    empty_stomach: {
      label: 'Empty Stomach',
      icon: <Sun className="w-3 h-3" />,
      color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20'
    },
    anytime: {
      label: 'Anytime',
      icon: <Sparkles className="w-3 h-3" />,
      color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20'
    }
  }

  const config = configs[instruction] || configs.anytime

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${config.color} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  )
}

export const StatusBadge: React.FC<{ status: DoseStatus; className?: string }> = ({
  status,
  className = ''
}) => {
  switch (status) {
    case 'taken':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Taken</span>
        </span>
      )
    case 'taken_late':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/30 ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Taken Late</span>
        </span>
      )
    case 'missed':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/30 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Missed</span>
        </span>
      )
    case 'skipped':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30 ${className}`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Skipped</span>
        </span>
      )
    case 'pending':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 ${className}`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Due</span>
        </span>
      )
  }
}
