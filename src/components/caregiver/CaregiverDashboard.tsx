import React, { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { useMediTrack } from '../../context/MediTrackContext'
import { useNotifications } from '../../context/NotificationContext'
import { DoseLog } from '../../types'
import { formatTime12h } from '../../lib/notifications'
import {
  Users,
  HeartPulse,
  PhoneCall,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  User
} from 'lucide-react'
import { ShareInviteModal } from './ShareInviteModal'

export const CaregiverDashboard: React.FC = () => {
  const {
    medicalId,
    medicines,
    doseLogs,
    caregivers,
    simulatedTime,
    emergencyContacts
  } = useMediTrack()

  const { triggerSimulatedEscalation } = useNotifications()
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState('hrdx')

  const todayStr = simulatedTime.isSimulated
    ? simulatedTime.simulatedDateStr
    : new Date().toISOString().split('T')[0]

  const todayLogs = doseLogs.filter(l => l.scheduledDate === todayStr)
  const takenCount = todayLogs.filter(l => l.status === 'taken' || l.status === 'taken_late').length
  const totalCount = todayLogs.length
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100

  const primaryContact = emergencyContacts.find(c => c.isPrimarySos) || emergencyContacts[0]

  const handleSendNudge = () => {
    const text = encodeURIComponent(
      `Hi Dad, checking in on your health routine today! Hope you took your morning medication.`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="space-y-6 text-left">
      {/* Caregiver Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-500/30">
              Caregiver Mode (Read-Only)
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <span>Family & Caregiver Adherence Portal</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time adherence monitoring, missed-dose grace alerts, and direct contact tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Share / Invite Code</span>
          </button>
        </div>
      </div>

      {/* Patient Switcher & Overview Bar */}
      <GlassCard className="border-indigo-500/25 bg-gradient-to-r from-indigo-500/10 via-teal-500/5 to-white/40 dark:to-slate-900/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg">
              {medicalId.patientName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {medicalId.patientName} (Father)
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">
                  LIVE SYNC
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {medicalId.age} Years • Blood {medicalId.bloodGroup} • Doctor: {medicalId.primaryDoctorName}
              </p>
            </div>
          </div>

          {/* Quick Caregiver Actions */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {primaryContact && (
              <a
                href={`tel:${primaryContact.phoneNumber}`}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Patient</span>
              </a>
            )}
            <button
              onClick={handleSendNudge}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Check-In</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Real-Time Adherence Status for Caregiver */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Score */}
        <GlassCard className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Today's Adherence
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-teal-700 dark:text-teal-300 font-mono">
              {adherencePercent}%
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              ({takenCount}/{totalCount} Taken)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Last dose logged today at 8:05 AM
          </p>
        </GlassCard>

        {/* 30-Day Long Term Health */}
        <GlassCard className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            30-Day Routine Consistency
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-emerald-600 font-mono">
              94%
            </span>
            <span className="text-xs font-semibold text-emerald-600">Excellent</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            14 consecutive days without a missed routine dose.
          </p>
        </GlassCard>

        {/* Missed Escalation Status */}
        <GlassCard className="space-y-2 border-rose-500/20 bg-rose-500/5">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
            Grace Window Escalations
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-rose-600 font-mono">0</span>
            <span className="text-xs text-slate-500">Active alerts</span>
          </div>
          <button
            onClick={triggerSimulatedEscalation}
            className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Test Caregiver Escalation Alert</span>
          </button>
        </GlassCard>
      </div>

      {/* Today's Dose Log Status Stream */}
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>Today's Real-Time Dose Log</span>
          </h3>
          <span className="text-xs text-slate-500">Auto-refreshes on patient log</span>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
          {todayLogs.map(log => {
            const med = medicines.find(m => m.id === log.medicineId)
            if (!med) return null

            return (
              <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: med.color || '#0d9488' }}
                  />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">{med.name}</h5>
                    <p className="text-slate-500 font-mono">
                      {med.dosageAmount} {med.dosageUnit} • Scheduled {formatTime12h(log.scheduledTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {log.takenAt && (
                    <span className="text-slate-500 text-[11px] hidden sm:inline">
                      Taken at {formatTime12h(`${new Date(log.takenAt).getHours()}:${new Date(log.takenAt).getMinutes()}`)}
                    </span>
                  )}
                  {log.status === 'taken' || log.status === 'taken_late' ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Taken</span>
                    </span>
                  ) : log.status === 'skipped' ? (
                    <span className="px-2.5 py-1 rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300 font-bold">
                      Skipped ({log.skipReason || 'Hold'})
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Upcoming</span>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Share Modal */}
      <ShareInviteModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}
