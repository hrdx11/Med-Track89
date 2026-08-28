import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  HeartHandshake,
  User,
  Droplet,
  AlertTriangle,
  Activity,
  Stethoscope,
  Home,
  FileEdit,
  Printer
} from 'lucide-react'
import { Modal } from '../ui/Modal'

export const MedicalIdCard: React.FC = () => {
  const { medicalId, updateMedicalId, medicines } = useMediTrack()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [formData, setFormData] = useState(medicalId)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMedicalId(formData)
    setIsEditModalOpen(false)
  }

  const criticalMeds = medicines.filter(m => m.isCritical && m.isActive)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span>Emergency Medical ID & Paramedic Card</span>
          </h3>
          <p className="text-xs text-slate-500">
            Vital health summary displayed on lock-screen and during emergency SOS response.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ID Card</span>
          </button>
          <button
            onClick={() => {
              setFormData(medicalId)
              setIsEditModalOpen(true)
            }}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Edit Medical ID</span>
          </button>
        </div>
      </div>

      <GlassCard className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-white/40 to-teal-500/5 dark:from-rose-950/20 dark:via-slate-900/60 dark:to-teal-950/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Patient Overview */}
          <div className="space-y-3 md:border-r border-slate-200/60 dark:border-slate-800/60 md:pr-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                {medicalId.patientName.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  {medicalId.patientName}
                </h4>
                <p className="text-xs text-slate-500">
                  {medicalId.age} Years • {medicalId.gender}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-rose-600 fill-rose-600" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Blood Group</span>
              </div>
              <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                {medicalId.bloodGroup}
              </span>
            </div>

            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-1.5">
                <Home className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>{medicalId.homeAddress}</span>
              </div>
            </div>
          </div>

          {/* Allergies & Conditions */}
          <div className="space-y-3 md:border-r border-slate-200/60 dark:border-slate-800/60 md:pr-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Known Allergies & Adverse Reactions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {medicalId.allergies.map((allergy, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-500/25"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Chronic Conditions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {medicalId.chronicConditions.map((cond, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-teal-500/15 text-teal-800 dark:text-teal-300 border border-teal-500/25"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Doctor & Critical Meds */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>Primary Doctor & Preferred Hospital</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {medicalId.primaryDoctorName}
              </p>
              <a
                href={`tel:${medicalId.primaryDoctorPhone}`}
                className="text-xs font-mono text-teal-600 dark:text-teal-400 hover:underline font-semibold block"
              >
                {medicalId.primaryDoctorPhone}
              </a>
              <p className="text-xs text-slate-500 mt-1">
                Hospital: {medicalId.preferredHospital}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Active Critical Medications
              </span>
              <div className="space-y-1">
                {criticalMeds.map(m => (
                  <div key={m.id} className="text-xs flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span>{m.name}</span>
                    <span className="font-mono font-semibold">{m.dosageAmount} {m.dosageUnit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency instructions */}
        {medicalId.emergencyNote && (
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 bg-slate-500/5 p-2.5 rounded-xl">
            <span className="font-bold text-slate-900 dark:text-slate-200">First Responder Note: </span>
            {medicalId.emergencyNote}
          </div>
        )}
      </GlassCard>

      {/* Edit Medical ID Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Medical ID Profile"
        description="Keep this information accurate for emergency situations and paramedics."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Patient Full Name
              </label>
              <input
                type="text"
                value={formData.patientName}
                onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Blood Group
              </label>
              <input
                type="text"
                value={formData.bloodGroup}
                onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm font-bold text-rose-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Allergies (comma separated)
              </label>
              <input
                type="text"
                value={formData.allergies.join(', ')}
                onChange={e =>
                  setFormData({
                    ...formData,
                    allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Chronic Conditions (comma separated)
              </label>
              <input
                type="text"
                value={formData.chronicConditions.join(', ')}
                onChange={e =>
                  setFormData({
                    ...formData,
                    chronicConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Primary Doctor Name
              </label>
              <input
                type="text"
                value={formData.primaryDoctorName}
                onChange={e => setFormData({ ...formData, primaryDoctorName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Doctor Phone
              </label>
              <input
                type="tel"
                value={formData.primaryDoctorPhone}
                onChange={e => setFormData({ ...formData, primaryDoctorPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Registered Residential Address
            </label>
            <input
              type="text"
              value={formData.homeAddress}
              onChange={e => setFormData({ ...formData, homeAddress: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Emergency Instructions / Notes for Paramedics
            </label>
            <textarea
              rows={2}
              value={formData.emergencyNote}
              onChange={e => setFormData({ ...formData, emergencyNote: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md cursor-pointer"
            >
              Save Medical ID
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
