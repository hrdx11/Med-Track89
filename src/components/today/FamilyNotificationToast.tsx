import React, { useEffect } from 'react'
import { useMediTrack } from '../../context/MediTrackContext'
import { CheckCircle2, MessageSquare, X, Users, HeartHandshake } from 'lucide-react'

export const FamilyNotificationToast: React.FC = () => {
  const { lastFamilyToast, dismissFamilyToast } = useMediTrack()

  useEffect(() => {
    if (lastFamilyToast) {
      const timer = setTimeout(() => {
        dismissFamilyToast()
      }, 7000)
      return () => clearTimeout(timer)
    }
  }, [lastFamilyToast, dismissFamilyToast])

  if (!lastFamilyToast) return null

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(lastFamilyToast.message)
    const phone = lastFamilyToast.phone.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
  }

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-md w-[92%] animate-in slide-in-from-top-4 duration-300">
      <div className="p-4 rounded-3xl bg-emerald-900/95 dark:bg-emerald-950/95 text-white backdrop-blur-2xl border-2 border-emerald-400/50 shadow-2xl shadow-emerald-950/40">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500 text-slate-950 shrink-0 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Family Caregiver Auto-Notified</span>
              </span>
              <h5 className="text-xs sm:text-sm font-bold text-white leading-snug mt-0.5">
                {lastFamilyToast.message}
              </h5>
            </div>
          </div>

          <button
            onClick={dismissFamilyToast}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800/50 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 pt-2 border-t border-emerald-800/60 flex items-center justify-between text-xs">
          <span className="text-[11px] text-emerald-200">
            Sent to {lastFamilyToast.contactName} ({lastFamilyToast.phone})
          </span>
          <button
            onClick={handleOpenWhatsApp}
            className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open WhatsApp Chat</span>
          </button>
        </div>
      </div>
    </div>
  )
}
