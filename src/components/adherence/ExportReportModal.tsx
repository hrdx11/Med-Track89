import React from 'react'
import { Modal } from '../ui/Modal'
import { useMediTrack } from '../../context/MediTrackContext'
import { DoseLog, Medicine } from '../../types'
import { formatTime12h } from '../../lib/notifications'
import { Printer, Download, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'

interface ExportReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ isOpen, onClose }) => {
  const { medicalId, medicines, doseLogs, schedules } = useMediTrack()

  if (!isOpen) return null

  const totalDoses = doseLogs.length
  const takenDoses = doseLogs.filter(l => l.status === 'taken' || l.status === 'taken_late').length
  const missedDoses = doseLogs.filter(l => l.status === 'missed').length
  const skippedDoses = doseLogs.filter(l => l.status === 'skipped').length
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100

  const handlePrint = () => {
    window.print()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Doctor & Clinical Consultation Adherence Report"
      description="Formatted summary of medication adherence and schedules for your next clinical visit."
      maxWidth="4xl"
    >
      <div className="space-y-6 text-left">
        {/* Print Toolbar */}
        <div className="flex justify-end gap-2 no-print">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Printable Report Sheet */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white text-slate-900 border border-slate-300 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-300 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-teal-800 font-heading">MediTrack</span>
                <span className="px-2 py-0.5 rounded bg-teal-100 text-teal-900 text-xs font-bold uppercase">
                  Adherence Certificate
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Generated on: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Overall Adherence Score</span>
              <span className="text-3xl font-black text-emerald-600 font-mono">
                {adherenceRate}%
              </span>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Patient Name:</span>
              <span className="font-bold text-slate-900">{medicalId.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Age / Gender / Blood:</span>
              <span className="font-bold text-slate-900">
                {medicalId.age} Y / {medicalId.gender} / {medicalId.bloodGroup}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Primary Physician:</span>
              <span className="font-bold text-slate-900">{medicalId.primaryDoctorName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Report Window:</span>
              <span className="font-bold text-slate-900">Past 30 Days</span>
            </div>
          </div>

          {/* Prescriptions & Adherence Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              Active Prescriptions & Dosage Adherence
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 divide-y divide-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Medication Name</th>
                    <th className="p-2.5">Dosage & Form</th>
                    <th className="p-2.5">Frequency / Times</th>
                    <th className="p-2.5">Instructions</th>
                    <th className="p-2.5 text-right">Adherence %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {medicines.map(m => {
                    const sch = schedules.find(s => s.medicineId === m.id)
                    const mLogs = doseLogs.filter(l => l.medicineId === m.id)
                    const mTaken = mLogs.filter(l => l.status === 'taken' || l.status === 'taken_late').length
                    const mRate = mLogs.length > 0 ? Math.round((mTaken / mLogs.length) * 100) : 100

                    return (
                      <tr key={m.id}>
                        <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                        <td className="p-2.5 font-mono">
                          {m.dosageAmount} {m.dosageUnit} ({m.form})
                        </td>
                        <td className="p-2.5">
                          {sch && sch.times.length > 0
                            ? sch.times.map(t => formatTime12h(t)).join(', ')
                            : 'As needed (PRN)'}
                        </td>
                        <td className="p-2.5 capitalize">{m.instructions.replace('_', ' ')}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                          {mRate}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Adherence Summary Metric Chips */}
          <div className="grid grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Total Doses</span>
              <span className="text-base font-bold text-slate-900 font-mono">{totalDoses}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <span className="block">Taken On-Time</span>
              <span className="text-base font-bold font-mono">{takenDoses}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
              <span className="block">Missed</span>
              <span className="text-base font-bold font-mono">{missedDoses}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <span className="block">Skipped</span>
              <span className="text-base font-bold font-mono">{skippedDoses}</span>
            </div>
          </div>

          {/* Known Allergies & Clinical Notes */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="font-bold text-slate-900">Recorded Allergies: </span>
            <span className="text-rose-700 font-semibold">{medicalId.allergies.join(', ') || 'None'}</span>
            <span className="font-bold text-slate-900 ml-4">Chronic Conditions: </span>
            <span className="text-slate-700">{medicalId.chronicConditions.join(', ') || 'None'}</span>
          </div>

          {/* Doctor Signature Area */}
          <div className="pt-8 flex justify-between items-end text-xs text-slate-500 border-t border-slate-200">
            <div>
              <p>Patient Signature: _______________________</p>
            </div>
            <div className="text-right">
              <p>Doctor / Pharmacist Review Signature: _______________________</p>
              <p className="mt-1 font-mono">Date: ___ / ___ / 2026</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
