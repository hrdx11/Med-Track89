import React from 'react'
import { useNotifications } from '../../context/NotificationContext'
import { useMediTrack } from '../../context/MediTrackContext'
import {
  AlertTriangle,
  PhoneCall,
  X,
  Clock,
  ShieldAlert,
  MessageSquare
} from 'lucide-react'
import { formatTime12h } from '../../lib/notifications'

export const EscalationBanner: React.FC = () => {
  const { activeEscalation, dismissEscalation } = useNotifications()
  const { emergencyContacts, medicalId } = useMediTrack()

  if (!activeEscalation) return null

  const primaryContact = emergencyContacts.find(c => c.isPrimarySos) || emergencyContacts[0]

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 max-w-md w-[92%] animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-5 rounded-3xl bg-rose-950/90 dark:bg-rose-950/95 text-white backdrop-blur-2xl border-2 border-rose-500/50 shadow-2xl shadow-rose-900/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-extrabold text-rose-300">
                Caregiver Escalation Alert
              </span>
              <h4 className="text-base font-bold text-white">
                Missed Dose: {activeEscalation.medicine.name}
              </h4>
            </div>
          </div>
          <button
            onClick={dismissEscalation}
            className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-rose-100 mt-2 leading-relaxed">
          <strong className="text-white">{activeEscalation.patientName}</strong> has not acknowledged their{' '}
          <strong className="text-white">
            {activeEscalation.medicine.dosageAmount} {activeEscalation.medicine.dosageUnit}
          </strong>{' '}
          dose scheduled for {formatTime12h(activeEscalation.scheduledTime)} ({activeEscalation.elapsedMinutes} mins ago, beyond grace window).
        </p>

        <div className="mt-4 pt-3 border-t border-rose-800/60 flex items-center gap-2">
          {primaryContact && (
            <a
              href={`tel:${primaryContact.phoneNumber}`}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Patient ({primaryContact.phoneNumber})</span>
            </a>
          )}
          <button
            onClick={() => {
              const text = encodeURIComponent(
                `Hi ${activeEscalation.patientName}, checking in to see if you were able to take your ${activeEscalation.medicine.name} dose?`
              )
              window.open(`https://wa.me/?text=${text}`, '_blank')
            }}
            className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  )
}
